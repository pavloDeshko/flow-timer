// HANDLERS
const notify = () => {
    console.log('Rest time is up')
    if (browser){
      browser.notifications.create({
        type: 'basic',
        title: 'Time to work!',
        message: 'your rest time is up'
      })
    }
}

const update = ({h,m,s}) => {
  timeCount.h.innerText = h + ''
  timeCount.m.innerText = m + ''
  timeCount.s.innerText = s + ''
}

const timer = new Timer(update, notify)
const startWork = () => {
  stopRest()
  state.working = Date.now()
  timer.countUp()
}

const stopWork = () => {
  state.working = null
  timer.reset()
}

const startRest = () => {
  const rest = getRestTime(Date.now() - (state.working || Date.now()))
  stopWork()
  state.resting = Date.now()
  timer.countDown(rest)
}

const stopRest = () => {
  state.resting = null
  timer.reset()
}

//INITIAL STATE
const state = {
  working: null,
  resting: null
}

//DOM 
let workButton = document.querySelector('.workButton')
let restButton = document.querySelector('.restButton')

let timeCount = {
  hCount : document.querySelector('.hCount'),
  mCount : document.querySelector('.mCount'),
  sCount : document.querySelector('.sCount'),
}

workButton.addEventListener('click', e => {
  state.working ? stopWork() : startWork()
})
restButton.addEventListener('click', e => {
  state.resting ? stopRest() : startRest()
})

// UTILS
const MIN_REST = 5 * 60e3
const MAX_REST = 60 * 60e3
const TICK = 1000
const INITIAL_STATE = { current: 0 }

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
    this.state = INITIAL_STATE
    this.onChange = onChange
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
    this.reset()
    this.state.goal = 0
    this.state.current = value

    this.state.interval = setInterval(this._handleTick.bind(this), TICK, false)
    this.onChange(this.format(this.state.current))
  }

  countUp(value = Number.MAX_SAFE_INTEGER, offset = 0){
    this.reset()
    this.state.goal = value
    this.state.current = offset
    
    this.state.interval = setInterval(this._handleTick.bind(this), TICK, true)
    this.onChange(this.format(this.state.current))
  }
  
  freeze(){
    //TODO
  }
  
  reset(){
    this.state.interval && clearInterval(this.state.interval)
    this.state = INITIAL_STATE
    this.onChange(this.format(this.state.current))
  }

  _handleTick(up){
    this.state.current = up ? this.state.current + TICK : this.state.current - TICK
    this.onChange(this.format(this.state.current))

    if (up && this.state.current >= this.state.goal || !up && this.state.current <= this.state.goal){
      this.onEnd(this.format(this.state.current))
      this.reset()
    }
  }
}

if(module){
  module.exports = Timer
}