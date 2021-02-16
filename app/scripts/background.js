import easyTimer from 'easytimer.js'

// UTILS
const MIN_REST = 10
const MAX_REST = 3600

const getRestTime = workTime => {
  const rest = Math.floor(workTime / 6)
  return rest < MIN_REST ? 
    MIN_REST : 
    rest > MAX_REST ? 
      MAX_REST : 
      rest
}

const dummyTimer = new easyTimer
const convert = s => {
  dummyTimer.start({ startValues: s, target: s})
  return dummyTimer.getTimeValues()
}

// ACTION TYPES
const WORK = 'WORK'
const REST = 'REST'
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
}

const stopWork = () => {
  state.working = null
  changeIcon(defaultIcon)
  timerInstance.stop()
}

const startRest = () => {
  const rest = state.nextRest
  state.nextRest = convert(MIN_REST)
  state.working = null
  state.resting = Date.now()
  changeIcon(restIcon)
  timerInstance.start({countdown: true, startValues: {seconds: Math.floor(rest / 1000)}, target: {seconds: 0}})
}

const stopRest = () => {
  state.resting = null
  changeIcon(defaultIcon)
  timerInstance.stop()
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
  state.timer = timerInstance.getTimeValues()
  if (state.working){
    state.nextRest = convert(getRestTime(timerInstance.getTotalTimeValues().seconds))
  }
  dispatch()
}

//IO
const react = action => {
  if (action.type == WORK){
    state.working ? stopWork() : startWork()
  } else if (action.type == REST){
    state.resting ? stopRest() : startRest()
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
  timer: { hours:0, minutes:0, seconds:0 },
  nextRest: convert(MIN_REST)
}

const timerInstance = new easyTimer({callback: update})
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