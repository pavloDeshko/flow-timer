import easyTimer from 'easytimer.js'

import actions from './modules/actions'
import {MIN_REST, DEFAULT_RATIO, getRestTime, secondsToObject} from './modules/utils'

//ICONS
const defaultIcon = 'icons/timer_32.png'
const workIcon = 'icons/timer_work_32.png'
const restIcon = 'icons/timer_rest_32.png'

// LOGICAL ACTIONS
const startWork = toggl => {
  state.resting = null
  state.working = Date.now()
  changeIcon(workIcon)
  timerInstance.stop()
  timerInstance.start()
  _toZero()
  if (toggl && state.token) {
    state.toggling = true
    togglStart(toggl.togglDesc)
  }
}

const stopWork = () => {
  state.working = null
  changeIcon(defaultIcon)
  timerInstance.stop()
  _toZero()
  _stopToggl()
}

const startRest = () => {
  state.working = null
  _stopToggl()
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
  _toZero()
}

const _toZero = () => {
  state.timer = {}
  dispatch()
}

const _stopToggl = () => {
  if(state.toggling){
    state.toggling = false
    togglStop()
  }
}

const updateToken = (token) => {
  state.token = token
  state.token ? togglConnect() : togglDisconnect()
}

//TIMER CBs
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

//IO
const react = action => {
  if (action.type == WORK){
    state.working ? stopWork() : startWork(action.toggl)
  } else if (action.type == REST){
    state.resting ? stopRest() : startRest()
  } else if (action.type == CONFIG) {
    state.config = {...state.config, ...action.config}
  } else if (action.type == TOKEN_INPUT) {
    updateToken(action.token)
  }
}

const dispatch = (action) => {
  port && port.postMessage(action || {type: STATE, state})
}

const changeIcon = path => {
  browser.browserAction.setIcon({path})
}

const togglConnect = () => {
  dispatch({type: TOKEN_CHANGED, token: state.token})
}

const togglDisconnect = () => {
  dispatch({type: TOKEN_CHANGED, token: state.token})
}

const togglStart = desc => {
  console.log('TOGGLE STARTED ', desc)
}

const togglStop = () => {
  console.log('TOGGLE STOPPED ')
}
//SETUP
const state = {
  working: null,
  resting: null,
  timer: secondsToObject(0),
  nextRest: secondsToObject(MIN_REST),
  config: {ratio: DEFAULT_RATIO},
  token: null
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