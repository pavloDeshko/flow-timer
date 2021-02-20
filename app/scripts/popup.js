//ACTION TYPES
const WORK = 'WORK'
const REST = 'REST'
const CONFIG = 'CONFIG'
const STATE = 'STATE'

//DOM 
let workButton = document.querySelector('.workButton')
let restButton = document.querySelector('.restButton')
let legendCount = document.querySelector('.legendCount')
let ratioInput = document.querySelector('.ratioInput')

let timeCount = {
  h : document.querySelector('.timeCount .hCount'),
  m : document.querySelector('.timeCount .mCount'),
  s : document.querySelector('.timeCount .sCount'),
}

let nextRestCount = {
  h : document.querySelector('.nextRestCount .hCount'),
  m : document.querySelector('.nextRestCount .mCount'),
  s : document.querySelector('.nextRestCount .sCount'),
}

//HANDLERS
const padTwoZeros = number => {
  return ('00' + number).slice(-2)
}

const updateCount = ({hours,minutes,seconds}) => {
  timeCount.h.innerText = hours || '0'
  timeCount.m.innerText = padTwoZeros(minutes || '0')
  timeCount.s.innerText = padTwoZeros(seconds || '0')
}

const updateNextRest = ({hours,minutes,seconds}) => {
  nextRestCount.h.innerText = hours || '0'
  nextRestCount.m.innerText = padTwoZeros(minutes)
  nextRestCount.s.innerText = padTwoZeros(seconds)
}

const updateLegend = ({working, resting}) => {
  legendCount.innerText = working ? 'working..' : resting ? 'resting..' : '...'
}

const react = action => {
  if (action.type == STATE){
    updateCount(action.state.timer)
    updateNextRest(action.state.nextRest)
    updateLegend(action.state)
  }
}

const dispatch = action => {
  port.postMessage(action)
}

//SETUP
const port = browser.runtime.connect()
port.onMessage.addListener(react)

workButton.addEventListener('click', e => {
  dispatch({type: WORK})
})
restButton.addEventListener('click', e => {
  dispatch({type: REST})
})
ratioInput.addEventListener('change', e => {
  dispatch({
    type: CONFIG,
    config: {ratio: Number(e.target.value)}
  })
})
