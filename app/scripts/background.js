import easyTimer from 'easytimer.js'

// UTILS
const MIN_REST = 4
const MAX_REST = 3600
const DEFAULT_RATIO = 2

const getRestTime = workTimeObj => {
  const restSeconds = Math.floor(objectToSeconds(workTimeObj) / state.config.ratio)
  return restSeconds < MIN_REST ? 
    secondsToObject(MIN_REST) : 
    restSeconds > MAX_REST ? 
      secondsToObject(MAX_REST) : 
      secondsToObject(restSeconds) 
}

const secondsToObject = totalSeconds => {
  const values = {}

  values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400
  values.hours = Math.floor(totalSeconds / 3600), totalSeconds %= 3600
  values.minutes = Math.floor(totalSeconds / 60), totalSeconds %= 60
  values.seconds = Math.floor(totalSeconds / 1), totalSeconds %= 1
  values.secondTenths = Math.floor(totalSeconds / 0.1)
  
  return values
}
const objectToSeconds = obj => {
  let seconds = 0
  seconds += (obj.days || 0) * 86400
  seconds += (obj.hours || 0) * 3600
  seconds += (obj.minutes || 0) * 60
  seconds += (obj.seconds || 0) * 1
  seconds += (obj.secondTenths || 0) * 0.1

  return seconds
}

// ACTION TYPES
const WORK = 'WORK'
const REST = 'REST'
const CONFIG = 'CONFIG'
const STATE = 'STATE'

//ICONS
const defaultIcon = 'icons/timer_32.png'
const workIcon = 'icons/timer_work_32.png'
const restIcon = 'icons/timer_rest_32.png'

// LOGICAL ACTIONS
const startWork = () => {
  state.resting = null
  state.working = Date.now()
  changeIcon(workIcon)
  timerInstance.start()
  _toZero()
}

const stopWork = () => {
  state.working = null
  changeIcon(defaultIcon)
  timerInstance.stop()
  _toZero()
}

const startRest = () => {
  state.working = null
  state.resting = Date.now()
  changeIcon(restIcon)
  console.log('start values: ', state.nextRest)
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
    state.working ? stopWork() : startWork()
  } else if (action.type == REST){
    state.resting ? stopRest() : startRest()
  } else if (action.type == CONFIG) {
    state.config = {...state.config, ...action.config}
  }
}

const dispatch = () => {
  port && port.postMessage({type: STATE, state})
}

const changeIcon = path => {
  browser.browserAction.setIcon({path})
}

//SETUP
const state = {
  working: null,
  resting: null,
  timer: secondsToObject(0),
  nextRest: secondsToObject(MIN_REST),
  config: {ratio: DEFAULT_RATIO}
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