import easyTimer from 'easytimer.js'

import {Actions, Action} from './modules/actions'
import {State} from './modules/types'
import {MIN_REST, DEFAULT_RATIO, ZERO_TIMER, getRestTime, secondsToObject} from './modules/utils'
import {togglApiStart, togglApiStop, togglApiAdd, togglApiCancel, togglApiConnect, togglApiDisconnect} from './modules/service'

//ICONS
const defaultIcon = 'icons/timer_32.png'
const workIcon = 'icons/timer_work_32.png'
const restIcon = 'icons/timer_rest_32.png'

// LOGICAL ACTIONS
const startWork = () => {
  state.resting = null
  state.working = Date.now()
  changeIcon(workIcon)
  timerInstance.stop()
  timerInstance.start()
  _togglStart()
  state.timer = ZERO_TIMER
}

const stopWork = () => {
  _togglStop()
  state.working = null
  changeIcon(defaultIcon)
  timerInstance.stop()
  state.timer = ZERO_TIMER
  dispatch()
}

const startRest = () => {
  _togglStop()
  state.working = null
  state.resting = Date.now()
  changeIcon(restIcon)
  timerInstance.stop()
  timerInstance.start({countdown: true, startValues: state.nextRest})
  state.timer = state.nextRest
  state.nextRest = secondsToObject(MIN_REST)
  dispatch()
}

const stopRest = () => {
  state.resting = null
  changeIcon(defaultIcon)
  timerInstance.stop()
  state.timer = ZERO_TIMER
  dispatch()
}

const _togglStart = async () => {
  if(state.toggl.form.active){
    try{
      await togglApiStart(state.toggl.form.desc)
    }catch(e){
      state.toggl.login.error = e.message
      dispatch()
    }
  }
}

const _togglStop = async () => {
  const f = state.toggl.form
  try{
    if(f.toggling){
      if(state.toggl.form.active){
        await togglApiStop(f.toggling, f.desc)
      } else {
        await togglApiCancel(f.toggling)
      }
    } else if(f.active && state.working != null){
      await togglApiAdd(state.working, Date.now(), f.desc)
    }
  }catch(e){
      state.toggl.login.error = e.message
      dispatch()
  }
  
}

const connectToggl = async (token :string) => {
  const t = state.toggl.login
  try{
    t.loading = true
    dispatch()
    await togglApiConnect(token)
    t.token = token
    t.error = null
    dispatch()
  }catch (error){
    t.error = error.message
  }finally{
    t.loading = false
    dispatch()
  }
}

const disconnectToggl = async () => {
  const t = state.toggl.login

  const token = t.token
  t.token = null
  t.error = null
  dispatch()
  try{
    if(token){
      await togglApiDisconnect(token)
    }
  }catch(e){
    t.error = e.message
    dispatch()
  }
}

//IO
const react = (action: Action) => {
  switch (action.type){
    case Actions.WORK:
      state.working != null ? stopWork() : startWork()
      break
    case Actions.REST:
      state.resting != null ? stopRest() : startRest()
      break
    case Actions.CONFIG:
      state.config = {...state.config, ...action.config}
      break
    case Actions.TOGGL_IN:
      connectToggl(action.token)
      break
    case Actions.TOGGL_OUT:
      disconnectToggl()
      break
    case Actions.TOGGL_FORM:
      state.toggl.form = {...state.toggl.form, ...action.form}
      break
    case Actions.STATE:
      break
    default:
      let _check :never = action 
  }
}

const notify = () => {
  browser.notifications.create({
    type: 'basic',
    title: 'Time to work!',
    message: 'your rest time is up'
  })
}

const update = () => {
  const timeObject = {...timerInstance.getTimeValues()}
  state.timer = timeObject
  if (state.working != null){
    state.nextRest = getRestTime(timeObject)
  }
  dispatch()
}

const dispatch = (action :Action = {type: Actions.STATE, state}) => {
  port && port.postMessage(action)
}

const changeIcon = (path : string)=> {
  browser.browserAction.setIcon({path})
}

//SETUP

const state = new State()

const timerInstance = new easyTimer()
timerInstance.on('secondsUpdated', update)
timerInstance.on('targetAchieved', notify)

let port :(null | browser.runtime.Port) = null
browser.runtime.onConnect.addListener(p => {
  port = p
  port.onMessage.addListener(react as ({})=>void) //TODO
  port.onDisconnect.addListener(() => {
    port = null
  })
  dispatch()
})

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