// UTILS
const MIN_REST = 10e3//5 * 60e3
const MAX_REST = 60 * 60e3
const TICK = 1000
const INITIAL_STATE = () => ({ current: 0 })

const getRestTime = (workTime) => {
  const rest = workTime / 6
  return rest < MIN_REST ? 
    MIN_REST : 
    rest > MAX_REST ? 
      MAX_REST : 
      rest
}

const padZero = (number, length = 2) => {
  return number.toString().padStart(2,'0')
}

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
}


const WORK = 'WORK'
const REST = 'REST'
const STATE = 'STATE'
const POKE = 'POKE'

//STATE
const state = {
  working: null,
  resting: null,
  timer: {h:0, m:0, s:0}
}
const timerInstance = new Timer(
  timer => {
    state.timer = timer
    dispatch()
  }, () => {
    browser.notifications.create({
      type: 'basic',
      title: 'Time to work!',
      message: 'your rest time is up'
  })
})

browser.runtime.onMessage.addListener(action => {
  if (action.type == WORK){
    state.working ? stopWork() : startWork()
  } else if (action.type == REST){
    state.resting ? stopRest() : startRest()
  } else if (action.type == POKE){
    dispatch()
  }
})

// HANDLERS
const startWork = () => {
  state.resting = null
  state.working = Date.now()
  timerInstance.countUp()
}

const stopWork = () => {
  state.working = null
  timerInstance.reset()
}

const startRest = () => {
  const rest = getRestTime(Date.now() - (state.working || Date.now()))
  state.working = null
  state.resting = Date.now()
  timerInstance.countDown(rest)
}

const stopRest = () => {
  state.resting = null
  timerInstance.reset()
}

const dispatch = () => {
  browser.runtime.sendMessage({type: STATE, state})
}
