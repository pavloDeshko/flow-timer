import easyTimer from 'easytimer.js'

import actions, {actionTypes} from './modules/actions'
import {MIN_REST, DEFAULT_RATIO, getRestTime, secondsToObject} from './modules/utils'
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
  state.timer = {}
  dispatch()
}

const stopWork = () => {
  _togglStop()
  state.working = null
  changeIcon(defaultIcon)
  timerInstance.stop()
  state.timer = {}
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
  state.timer = {}
  dispatch()
}

const _togglStart = async () => {
  if(state.toggl.form.active){
    try{
      await togglApiStart(state.toggl.form.desc)
    }catch(e){
      state.toggl.error = e.message
      dispatch()
    }
  }
}

const _togglStop = async () => {
  let call = null
  try{
    if(state.toggl.toggling){
      if(state.toggl.form.active){
        await togglApiStop(state.toggl.toggling)
      } else {
        await togglApiCancel(state.toggl.toggling)
      }
    } else if(state.toggl.form.active){
      await togglApiAdd(state.working, Date.now() ,state.toggl.form.desc)
    }
  }catch(e){
      state.toggl.error = e.message
      dispatch()
  }
  
}

const connectToggl = async token => {
  try{
    state.toggl.loading = true
    dispatch()
    await togglApiConnect(token)
    state.toggl.token = token
    state.toggl.error = null
    dispatch()
  }catch (error){
    state.toggl.error = error.message
  }finally{
    state.toggl.loading = false
    dispatch()
  }
}

const disconnectToggl = async () => {
  state.toggl.token = null
  state.toggl.error = null
  dispatch()
  try{
    await togglApiDisconnect(state.toggl.token)
  }catch(e){
    state.toggl.error = e.message
    dispatch()
  }
}

//IO
const react = action => {
  if (action.type == actionTypes.WORK){
    state.working ? stopWork() : startWork()
  } else if (action.type == actionTypes.REST){
    state.resting ? stopRest() : startRest()
  } else if (action.type == actionTypes.CONFIG) {
    state.config = {...state.config, ...action.config}
  } else if (action.type == actionTypes.TOKEN) {
    connectToggl(action.token)
  } else if (action.type == actionTypes.TOKEN_OUT){
    disconnectToggl()
  } else if (action.type == actionTypes.TOGGL_CONFIG){
    state.toggl.form = {...state.toggl.form, ...action.config}
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
  if (state.working){
    state.nextRest = getRestTime(timeObject)
  }
  dispatch()
}

const dispatch = (action) => {
  port && port.postMessage(action || actions.STATE(state))
}

const changeIcon = path => {
  browser.browserAction.setIcon({path})
}

//SETUP

const state = {
  timer: secondsToObject(0),
  nextRest:  secondsToObject(MIN_REST),
  working: null, 
  resting: null,
  config: {ratio: DEFAULT_RATIO},
  toggl: {
    token: null,
    error: null,
    loading: false,
    form: {active: false, desc: ''},
    toggling: null
  }
}

const timerInstance = new easyTimer()
timerInstance.on('secondsUpdated', update)
timerInstance.on('targetAchieved', notify)

let port = null
browser.runtime.onConnect.addListener(p => {
  port = p
  port.onMessage.addListener(react)
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