import {render} from 'preact'
import {html as _} from 'htm/preact'

import actions from './modules/actions'

const Counter = ({h, m, s}) => {
  return _`
    <div className="counterBlock">
      <div className="timeCounter">
        <span className="hCount">${h}</span>:<span className="mCount">${m}</span>:<span className="sCount">${s}</span>
      </div>
    </div>
  `
}
const Controls = () => {
  return _`
    <div className="buttonsBlock">
      <input className="workButton" type="button" value="work">
      <input className="restButton" type="button" value="rest">
    </div>
  `
}
const Options = () => {
  return _`
    <div className="configBlock">
      <label>
        Rest ratio:
        <input 
          className="ratioInput" 
          type="range" 
          value="2"
          min="1"
          max="10"
          step="1"
        >
      </label> 
    </div>
  `
}
const Legend = ({message}) => {
  return _`
    <div className="legendBlock">
      <span className="legendMessage">${message}</span>
    </div>
  `
}
const Toggl = ({connected}) => {
  const content = connected ? _` 
    <div className="togglPromt">
      Enter your toggl token to connect:
      <input className="tokenInput" type="text" maxlength="100">
      <input className="connectInput" type="button" value="connect">
    </div>
  ` : _`
    <div className="togglLogged">
      Start Toggle: <input className="ifToggl" type="checkbox">
      <input className="togglDesc" type="text" placeholder="description..">
      <input className="logoutInput" type="button" value="logout">
    </div>
  `
  return  _`
    <div className="togglBlock">
      ${content}
    </div>
  `
}

const App = () => {

  return _`
    <${Counter}  ...${null}/>
    <${Controls} />
    <${Legend} message=${null} />
    <${Options} />
    <${Toggl} connected=${null} />
  `
}

render(App,document.body)
//DOM 
/* let workButton = document.querySelector('.workButton')
let restButton = document.querySelector('.restButton')

let legendCount = document.querySelector('.legendCount')

let ratioInput = document.querySelector('.ratioInput')

let promtToggl = document.querySelector('.promtToggl')
let loggedToggl = document.querySelector('.loggedToggl')
let tokenInput = document.querySelector('.tokenInput')
let connectInput = document.querySelector('.connectInput')
let ifToggl = document.querySelector('.ifToggl')
let togglDesc = document.querySelector('.togglDesc')
let logoutInput = document.querySelector('.logoutInput')

let timeCount = {
  h : document.querySelector('.timeCount .hCount'),
  m : document.querySelector('.timeCount .mCount'),
  s : document.querySelector('.timeCount .sCount'),
}

let nextRestCount = {
  h : document.querySelector('.nextRestCount .hCount'),
  m : document.querySelector('.nextRestCount .mCount'),
  s : document.querySelector('.nextRestCount .sCount'),
} */

//HANDLERS
/* const updateCount = ({hours,minutes,seconds}) => {
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

const updateToggl = token => {
  if (token){
    promtToggl.replaceWith(loggedToggl)
  }else{
    loggedToggl.replaceWith(promtToggl)
  }
}

const react = action => {
  if (action.type == STATE){
    updateCount(action.state.timer)
    updateNextRest(action.state.nextRest)
    updateLegend(action.state)
    updateToggl(action.state.token)
  }
  if (action.type == TOKEN_CHANGED){
    updateToggl(action.token)
  }
} */

const padTwoZeros = number => {
  return ('00' + number).slice(-2)
}

const dispatch = action => {
  port.postMessage(action)
}

//SETUP
const port = browser.runtime.connect()
port.onMessage.addListener(react)

/* workButton.addEventListener('click', e => {
  dispatch({
    type: WORK,
    toggl: ifToggl.checked ? { togglDesc: togglDesc.value} : undefined
  })
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
connectInput.addEventListener('click', e => {
  dispatch({
    type: TOKEN_INPUT,
    token: tokenInput.value
  })
  tokenInput.value = ''
})
logoutInput.addEventListener('click', e => {
  dispatch({
    type: TOKEN_INPUT,
    token: null
  })
  ifToggl.checked = false
  togglDesc.value = ''
})
loggedToggl.remove() */
