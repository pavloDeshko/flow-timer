const WORK = 'WORK'
const REST = 'REST'
const STATE = 'STATE'
const POKE = 'POKE'

//DOM 
let workButton = document.querySelector('.workButton')
let restButton = document.querySelector('.restButton')

let timeCount = {
  h : document.querySelector('.hCount'),
  m : document.querySelector('.mCount'),
  s : document.querySelector('.sCount'),
}

workButton.addEventListener('click', e => {
  dispatch({type: WORK})
})
restButton.addEventListener('click', e => {
  dispatch({type: REST})
})

browser.runtime.onMessage.addListener(action => {
  if (action.type == STATE){
    updateCount(action.state.timer)
  }
})

//HANDLERS
const updateCount = ({h,m,s}) => {
  timeCount.h.innerText = h + ''
  timeCount.m.innerText = m + ''
  timeCount.s.innerText = s + ''
}

const dispatch = action => {
  browser.runtime.sendMessage(action)
}

//STATE
dispatch({type: POKE})