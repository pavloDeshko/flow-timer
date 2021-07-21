import easyTimer from 'easytimer.js'

import {Actions, Action} from './modules/actions'
import {Config, State, TogglForm, ExtStorage, Time, Mode} from './modules/types'
import {MIN_REST, DEFAULT_RATIO, ZERO_TIMER, getRestTime, secondsToObject, logUnexpected} from './modules/utils'
import { togglApiAdd, togglApiConnect, togglApiDisconnect} from './modules/service'

//ICONS
const DEFAULT_ICON = 'icons/timer_32.png'
const WORK_ICON = 'icons/timer_work_32.png'
const REST_ICON = 'icons/timer_rest_32.png'

class App{
  eTimer = new easyTimer()
  state = new State()
  port :(null | browser.runtime.Port) = null

  constructor(){
    this.eTimer.on('secondsUpdated', this.on_TimerUpdate)
    this.eTimer.on('targetAchieved', this.on_RestEnd)
    browser.runtime.onConnect.addListener(this.in_Connection)
    this.in_Storage()
    //browser.windows.onRemoved.addListener(()=>this.out_Storage) //TODO whate about multiple windows
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

  out_Dispatch = (action :Action = {type: Actions.STATE, state: this.state}) => {
    this.port && this.port.postMessage(action)
  }

  out_Storage = async () => {
    const storage = browser.storage.local

    const data :ExtStorage = {
      config : this.state.config,
      toggle : this.state.toggl.login.token ? {
        auth : this.state.toggl.login.token,
        form : this.state.toggl.form
      } : undefined
    }
    try {
      await storage.set(data)
      console.log('storage saved!')
    } catch (e){
      console.log('error saving!', e.message)
    } //TODO error
  }

  in_Storage = async () => {
    const storage = browser.storage.local
    try {
      const data :ExtStorage = await storage.get(['config', 'toggle']) as ExtStorage //TODO error
      console.log('storage retrieved ', data)
      if(data.config){
        this.state.config = data.config
      }
      if(data.toggle){
        await this.toggl_Connect(data.toggle.auth)
        this.state.toggl.form = data.toggle.form
      }
    } catch (e){
      console.log('error retrieving!', e.message)
    }
    this.out_Dispatch()
  }

  in_Connection = (p :browser.runtime.Port) => {
    p.onMessage.addListener(this.in_Action as ({})=>void) // logs error if not Action object
    p.onDisconnect.addListener(() => {
      this.port = null
    })
    this.port = p
    this.out_Dispatch()
  }

  in_Action = (action: Action) => {
    switch (action.type){
      case Actions.WORK:
        this.state.working != null ? this.stopWork() : this.startWork()
        break
      case Actions.REST:
        this.state.resting != null ? this.stopRest() : this.startRest()
        break
      case Actions.ADJUST:
        this.adjustRest(action.time)
        break
      case Actions.CONFIG:
        this.state.config = {...this.state.config, ...action.config}
        this._recalculateRest()
        this.out_Dispatch()
        break
      case Actions.TOGGL_IN:
        this.toggl_Connect(action.token)
        break
      case Actions.TOGGL_OUT:
        this.toggl_Disconnect()
        break
      case Actions.TOGGL_FORM:
        this.state.toggl.form = {...this.state.toggl.form, ...action.form}
        break
      case Actions.TOGGL_SAVE_LAST:
        this.toggl_Save(true)
        break
      case Actions.STATE:
        break
      default:
        let _check :never = action
        logUnexpected(new Error('Unknown object at background port: ' + JSON.stringify(action)))
    }
  }

  on_TimerUpdate = () => {
    const timeObject = {...this.eTimer.getTimeValues()}
    this.state.timer = timeObject
    this._recalculateRest()
    this.out_Dispatch()
  }

  on_RestEnd = () => {
    this.stopRest()
    this.out_Notify()
  }

  startWork = () => {
    this.eTimer.stop(), this.eTimer.start()

    this.state.resting = null
    this.state.working = Date.now()
    this.state.timer = ZERO_TIMER

    this.out_ChangeIcon(WORK_ICON)
    this.out_Dispatch()
  }
  
  stopWork = () => {
    this.eTimer.stop()
    this.toggl_Save()

    this.state.working = null
    this.state.timer = ZERO_TIMER
    
    this.out_ChangeIcon(DEFAULT_ICON)
    this.out_Dispatch()
  }
  
  startRest = () => {
    this.eTimer.stop(), this.eTimer.start({countdown: true, startValues: this.state.nextRest})
    this.toggl_Save()

    this.state.working = null
    this.state.resting = Date.now()
    this.state.timer = this.state.nextRest
    if(this.state.config.mode){
      this.state.config.mode = Mode.ON
      this._recalculateRest()
    }

    this.out_ChangeIcon(REST_ICON)
    this.out_Dispatch()
    this.out_Storage() //to save ratio and mode
  }
  
  stopRest = () => {
    this.eTimer.stop()

    this.state.resting = null
    this.state.timer = ZERO_TIMER
    
    this.out_ChangeIcon(DEFAULT_ICON)
    this.out_Dispatch()
  }

  adjustRest = (value :Time | null) => {
    if(!value){
      this.state.config.mode = Mode.ON
      this._recalculateRest()
    }else{
      this.state.config.mode = this.state.config.mode && Mode.PAUSED
      this.state.nextRest = value
    }
    this.out_Dispatch()
  }

  _recalculateRest = () => {
    if(this.state.config.mode === Mode.ON){
      this.state.nextRest = getRestTime(this.state.working ? this.state.timer : ZERO_TIMER, this.state.config.ratio)
    }
  }

  toggl_Save = async (retroSave = false)=> {
    const form = this.state.toggl.form, login = this.state.toggl.login // TODO move loading
    if(!login.token || !form.shouldSave) return// TODO handle errors
    
    let start, end
    if(this.state.working && !retroSave){
      start = this.state.working
      end = Date.now()
    }else if(retroSave && form.unsaved){
      start = form.unsaved.start
      end = form.unsaved.end
    }else{
      logUnexpected(new Error(`Wrong toogle save action. Retrosave: ${retroSave}.  Working: ${this.state.working}.  Unsaved: ${form.unsaved}.`))
      return 
    }
    
    try{
      login.loading = true
      this.out_Dispatch()
      await togglApiAdd( login.token, start, end, form.desc, form.projectId)
    }catch(e){
      login.error = e.message
    }finally{
      login.loading = false
      this.out_Dispatch()
      this.out_Storage()//to save form
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
      this.out_Dispatch()
      this.out_Storage()
    }
  }
  
  toggl_Disconnect = async () => {
    const t = this.state.toggl.login
    const token = t.token

    t.token = null
    t.projects = []

    t.error = null
    this.out_Dispatch()
    try{
      if(token){
        await togglApiDisconnect(`token`)
      }
    }catch(e){
      t.error = e.message
      this.out_Dispatch()
    }
  }
}

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