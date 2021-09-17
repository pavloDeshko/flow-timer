import easyTimer from 'easytimer.js'

import Timer from './modules/timer'
import {Action, Config, State, Time, Mode} from './modules/types'
import {ZERO_TIMER, getRestTime, log} from './modules/utils'
import { togglApiAdd, togglApiConnect, togglApiDisconnect, storageGet, storageSave} from './modules/service'

//ICONS
const DEFAULT_ICON = 'icons/timer_32.png'
const WORK_ICON = 'icons/timer_work_32.png'
const REST_ICON = 'icons/timer_rest_32.png'

class App{
  timer :Timer
  state = new State()
  port :(null | browser.runtime.Port) = null
  
  //LISTENERS AND SETUP
  on_Connection = (p :browser.runtime.Port) => {
    p.onMessage.addListener(this.on_Action) 
    p.onDisconnect.addListener(() => {
      this.port = null
    })
    this.port = p
    this.out_Dispatch()
  }

  on_TimerUpdate = (t :Time) => {
    this.state.time = t
    this._recalculateRest()
    this.out_Dispatch()
  }

  on_RestEnd = () => {
    this.stopRest()
    this.out_Notify()
  }
  
  on_Action = (action: Action | {}) => {
    if(!('type' in action)) return //TODO log bug

    switch (action.type){
      case 'WORK':
        this.state.working != null ? this.stopWork() : this.startWork()
        break
      case 'REST':
        this.state.resting != null ? this.stopRest() : this.startRest()
        break
      case 'ADJUST':
        this.adjustRest(action.time)
        break
      case 'CONFIG':
        this.reconfig(action.config)
        break
      case 'TOGGL_IN':
        this.toggl_Connect(action.token)
        break
      case 'TOGGL_OUT':
        this.toggl_Disconnect()
        break
      case 'TOGGL_FORM':
        this.state.toggl.form = {...this.state.toggl.form, ...action.form}
        break
      case 'TOGGL_SAVE_LAST':
        this.toggl_RetroSave()
        break
      case 'STATE':
        log.bug('State action recieved in background', action)
        break
      default:
        let _check :never = action
        log.bug('Unknown object at background port', action)
    }
  }

  constructor(){
    this.timer = new Timer(this.on_TimerUpdate, this.on_RestEnd)
    browser.runtime.onConnect.addListener(this.on_Connection)
    this.restoreFromStorage()
  }
  
  //APP ACTIONS
  startWork = () => {
    this.state.resting = null
    this.state.working = Date.now()
    this.state.time = this.timer.up()

    this.out_ChangeIcon(WORK_ICON)
    this.out_Dispatch()
  }
  
  stopWork = () => {
    this.toggl_Save()

    this.state.working = null
    this.state.time = this.timer.reset()
    
    this.out_ChangeIcon(DEFAULT_ICON)
    this.out_Dispatch()
  }
  
  startRest = () => {
    this.toggl_Save()

    this.state.working = null
    this.state.resting = Date.now()
    this.state.time = this.timer.down(this.state.nextRest)
    if(this.state.config.mode){
      this.state.config.mode = Mode.ON
      this._recalculateRest()
    }

    this.out_ChangeIcon(REST_ICON)
    this.out_SaveStorage() //to save ratio and mode
    this.out_Dispatch()
  }
  
  stopRest = () => {
    this.state.resting = null
    this.state.time = this.timer.reset()
    
    this.out_ChangeIcon(DEFAULT_ICON)
    this.out_Dispatch()
  }
  
  reconfig = (config :Partial<Config>) => {
    this.state.config = {...this.state.config, ...config}
    this._recalculateRest()

    this.out_Dispatch()
  }

  adjustRest = (value :Time | null) => {
    if(!value){
      this.state.config.mode = Mode.ON //TODO recalculation is dependent on this change
      this._recalculateRest()
    }else{
      this.state.config.mode = this.state.config.mode && Mode.PAUSED
      this.state.nextRest = value
    }
    
    this.out_Dispatch()
  }

  restoreFromStorage = async () => {
    try {
      const data = await storageGet()
      if(data.config){
        this.state.config = {...this.state.config, ...data.config}
      } 
      if(data.toggl){
        this.state.toggl.form.shouldSave = data.toggl.shouldSave
        await this.toggl_Connect(data.toggl.auth)
      }
    } catch (err){
      // TODO error display?
    }
    this.out_Dispatch()
  }
  
  _recalculateRest = () => {
    if(this.state.config.mode === Mode.ON){
      this.state.nextRest = getRestTime(this.state.working ? this.state.time : ZERO_TIMER, this.state.config.ratio)
    }
  }
  
  //TOGGL APP ACTIONS
  toggl_Save = async ()=> {
    const form = this.state.toggl.form, login = this.state.toggl.login
    if(!this.state.working){
      log.bug('invalid toggle save',this.state)
      return
    }

    if(form.shouldSave && login.token){
      try{
        login.loading = true
        this.out_Dispatch()
        await togglApiAdd( login.token, this.state.working, Date.now(), form.desc, form.projectId)
        login.error = null
      }catch(e){
        login.error = e.message
      }finally{
        login.loading = false
        form.unsaved = null
        this.out_SaveStorage()//to save form
        this.out_Dispatch()
      }
    }else{
      form.unsaved = {start: this.state.working, end: Date.now()}
    }
  }
  
  toggl_RetroSave = async ()=> {
    const form = this.state.toggl.form, login = this.state.toggl.login 
    if(login.token && form.unsaved){
      try{
        login.loading = true
        this.out_Dispatch()
        await togglApiAdd( login.token, form.unsaved.start, form.unsaved.end, form.desc, form.projectId)
        login.error = null
      }catch(e){
        login.error = e.message
      }finally{
        login.loading = false
        form.unsaved = null
        this.out_SaveStorage()//to save form
        this.out_Dispatch()
      }
    }else{
      log.bug('Inavild retrosaved action recieved',{token:login.token, unsaved:form.unsaved})
    }
  }

  toggl_Connect = async (token :string) => {
    const t = this.state.toggl.login
    try{
      t.loading = true
      this.out_Dispatch()

      const data = await togglApiConnect(token)
      t.projects = data.projects
      t.token = token
      this.state.toggl.form.projectId= data.last || null

      t.error = null
    }catch (error){
      t.error = error.message
    }finally{
      t.loading = false
      this.out_SaveStorage()
      this.out_Dispatch()
    }
  }
  
  toggl_Disconnect = async () => {
    const t = this.state.toggl.login

    t.token = null
    t.projects = []
    t.error = null

    try{
      if(t.token){
        await togglApiDisconnect(t.token)
      }
    }catch(e){
      t.error = e.message
    }finally{
      this.out_Dispatch()
    }
  }
  
  //OUTPUT METHODS
  out_Dispatch = (action :Action = {type: 'STATE', state: this.state}) => {
    this.port && this.port.postMessage(action)
  }

  out_Notify = () => {
    browser.notifications.create({
      type: 'basic',
      title: 'Time to work!',
      message: 'your rest time is up'
    })
  }

  out_ChangeIcon = (path : string)=> {
    browser.browserAction.setIcon({path})
  }

  out_SaveStorage = async() => {
    try{
      await storageSave({
        config : this.state.config,
        toggl : this.state.toggl.login.token ? {
          auth: this.state.toggl.login.token,
          shouldSave: this.state.toggl.form.shouldSave
        } : undefined
      })
    }catch(e){
      //TODO error display?
    } 
  }
}

//GLOBAL ERROR CATCHERS
const handleError = (err :Error)=>{
  log.error('Error caught in background script', err)
  browser.storage.local.set({lastError: `${err.name}: ${err.message} ${err.stack ? `Stack: \n  ${err.stack}`:''}`})
}
addEventListener('error', (e:ErrorEvent)=>{handleError(e.error)})//TODO not working in firefox
addEventListener('unhandledrejection', (e:PromiseRejectionEvent)=>{handleError(e.reason)})

//LAUNCH
new App()

/*
class Timer{
  constructor(onChange = () => {}, onEnd = () => {} ) {
    this.state = INITIAL_STATE()
    this.onChange = (...args) => {
      onChange(...args)
    }
    this.onEnd = onEnd

    this.format = (ms) => {
      if (ms <= 0){
        return {h: 0, m: 0, s: 0}
      }
      return {
        h: Math.floor(ms / 3600e3),
        m: Math.floor(ms / 60e3) % 60,
        s: Math.floor(ms / 1e3) % 60
      }
    }
  }
  
  countDown(value){
    this.reset(false)
    this.state.goal = 0
    this.state.current = value

    this.state.interval = setInterval(this._handleTick.bind(this), TICK, false)
    this.onChange(this.format(this.state.current))
  }

  countUp(value = Number.MAX_SAFE_INTEGER, offset = 0){
    this.reset(false)
    this.state.goal = value
    this.state.current = offset
    
    this.state.interval = setInterval(this._handleTick.bind(this), TICK, true)
    this.onChange(this.format(this.state.current))
  }
  
  freeze(){
    //TODO
  }
  
  reset(call = true){
    this.state.interval && clearInterval(this.state.interval)
    this.state = INITIAL_STATE()
    call ? this.onChange(this.format(this.state.current)) : null
  }

  _handleTick(up){
    this.state.current = up ? this.state.current + TICK : this.state.current - TICK
    this.onChange(this.format(this.state.current))

    if (up && this.state.current >= this.state.goal || !up && this.state.current <= this.state.goal){
      this.onEnd(this.format(this.state.current))
      this.reset(false)
    }
  }
} */