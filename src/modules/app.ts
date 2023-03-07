import Timer from './timer'
import {Action, Config, State, Time, Mode, NotifyType, IconObject} from './types'
import {ZERO_TIMER, getRestTime, log} from './utils'
import {togglApiAdd, togglApiConnect, togglApiDisconnect, storageGet, storageSave, notify, iconChange} from './service'
import {onConnectBack as onConnect, Connector} from './connector'
import * as settings from '../settings'
import {ICONS} from './assets'

export class App{
  timer :Timer
  pomTimer :Timer
  state = new State()
  port :(null | Connector) = null
  
  //LISTENERS AND SETUP
  on_Connection = (p :Connector) => {
    p.onMessage(this.on_Action) 
    p.onDisconnect(() => {
      this.port = null
    })
    this.port = p
    console.debug('connection in background')
    this.out_Dispatch()
    console.debug('dispatched state on connection')
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

  on_PomodoroEnd = () => {
    this.state.config.pomActive && this.out_Notify(true)
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
        this.out_Dispatch()
        break
      case 'TOGGL_SAVE_LAST':
        this.toggl_RetroSave()
        break
      case 'NOTIFY':
      case 'STATE':
        log.bug('FrontEnd action recieved in background', action)
        break
      default:
        let _check :never = action
        log.bug('Unknown object at background port', action)
    }
  }

  constructor(){
    //throw new Error('sync test background error')
    //Promise.reject('test async promise error in background')

    this.timer = new Timer(this.on_TimerUpdate, this.on_RestEnd)
    this.pomTimer = new Timer(()=>{},this.on_PomodoroEnd)
    log.debug('onConnect added')
    onConnect(this.on_Connection)
    this.restoreFromStorage() 
  }
  
  //APP ACTIONS
  startWork = () => {
    this.state.toggl.form.unsaved = null

    this.state.resting = null
    this.state.working = Date.now()
    this.state.time = this.timer.up()
    this.pomTimer.down({...ZERO_TIMER,...{minutes:this.state.config.pomTime}})

    iconChange(ICONS.WORK)
    this.out_SaveStorage() 
    this.out_Dispatch()
  }
  
  stopWork = () => {
    this.toggl_Save()

    this.state.working = null
    this.state.time = this.timer.reset()
    this.pomTimer.reset()
    
    iconChange(ICONS.DEFAULT)
    this.out_Dispatch()
  }
  
  startRest = () => {
    this.state.working && this.toggl_Save()

    this.state.working = null
    this.state.resting = Date.now()
    this.state.time = this.timer.down(this.state.nextRest)
    this.pomTimer.reset()
    if(this.state.config.mode){
      this.state.config.mode = Mode.ON
      this._recalculateRest()
    }

    iconChange(ICONS.REST)
    this.out_SaveStorage() //to save ratio and mode
    this.out_Dispatch()
  }
  
  stopRest = () => {
    this.state.resting = null
    this.state.time = this.timer.reset()
    
    iconChange(ICONS.DEFAULT)
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
      if(!data.config && window.matchMedia('(prefers-color-scheme: dark)').matches){
        this.state.config.dark = true
      }
/*       if(!data.toggl && settings.TOGGL_DEBUG){
        await this.toggl_Connect(settings.TOGGL_DEBUG)
      } */
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
      }catch(e:any){
        this.out_Toggl_Error(e)
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
      }catch(e:any){
        this.out_Toggl_Error(e)
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
    }catch (e :any){
      this.out_Toggl_Error(e)
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
    }catch(e :any){
      this.out_Toggl_Error(e)
    }finally{
      this.out_Dispatch()
    }
  }
  
  //OUTPUT METHODS
  out_Dispatch = (action :Action = {type: 'STATE', state: this.state}) => {
    this.port && this.port.postMessage(action)
  }

  out_Notify = (pomodoro = false) => {
    this.out_Dispatch({type:"NOTIFY", subType: pomodoro ? NotifyType.POM : NotifyType.WORK})
    notify(pomodoro ? NotifyType.POM : NotifyType.WORK)
  }

/*   out_ChangeIcon = (path : string | IconObject)=> {
    browser.browserAction.setIcon({path})
  } */
  
  out_Toggl_Error = (e:any) => {
    const message :string = typeof e.message == 'string' ? e.message : settings.ERROR_MESSAGE
    this.state.toggl.login.error = message
    log.error("Toggl network error",e,this.state)
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