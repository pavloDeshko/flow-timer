//ACTION TYPES
const WORK = 'WORK'
const REST = 'REST'
const STATE = 'STATE'

//DOM 
let workButton = document.querySelector('.workButton')
let restButton = document.querySelector('.restButton')
let legendCount = document.querySelector('.legendCount')

let timeCount = {
  h : document.querySelector('.hCount'),
  m : document.querySelector('.mCount'),
  s : document.querySelector('.sCount'),
}

//HANDLERS
const updateCount = ({hours,minutes,seconds}) => {
  timeCount.h.innerText = hours + ''
  timeCount.m.innerText = minutes + ''
  timeCount.s.innerText = seconds + ''
}

const updateLegend = ({working, resting}) => {
  legendCount.innerText = working ? 'working..' : resting ? 'resting..' : '...'
}

const react = action => {
  if (action.type == STATE){
    updateCount(action.state.timer)
    updateLegend(action.state)
  }
}

const dispatch = action => {
  port.postMessage(action)
  //browser.runtime.sendMessage(action)
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
