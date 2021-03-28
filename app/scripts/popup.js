import {render, createContext, useContext, useState, useRef, useEffect} from 'preact'
import {html as _} from 'htm/preact'

import actions from './modules/actions'
import {padTwoZeros} from './modules/utils'

const context = { Dispatch: createContext(null) }

const Counter = ({hours: h, minutes: m, seconds: s}) => {
  return _`
    <div className="counterContainer">
      <div className="timeCounter">
        <span className="hCount">${h}</span>:<span className="mCount">${m}</span>:<span className="sCount">${s}</span>
      </div>
    </div>
  `
}

const Controls = () => {
  const dispatch = useContext(context.Dispatch)

  const work = e => dispatch(actions.WORK())
  const rest = e => dispatch(actions.REST())

  return _`
    <div className="controlsContainer">
      <input className="workButton" type="button" value="work" onClick=${work}>
      <input className="restButton" type="button" value="rest" onClick=${rest}>
    </div>
  `
}

const TogglForm = ({token: logged, active, desc}) => {
  const dispatch = useContext(context.Dispatch)
  
  const setActive = e => dispatch(actions.TOGGL_CONFIG({
    active: e.target.checked
  }))
  const setDesc = e => dispatch(actions.TOGGL_CONFIG({
    desc: e.target.value
  }))

  return logged ? _`
    Start Toggle: 
    <input className="ifToggl" type="checkbox" checked=${active} onChange=${setActive}>
    <input className="togglDesc" type="text" placeholder="description.." value=${desc} onChange=${setDesc}>
  ` : null
}

const Options = ({ratio}) => {
  const dispatch = useContext(context.Dispatch)

  const setRatio = e => dispatch(actions.CONFIG({
    ratio: e.target.value
  }))

  return _`
    <div className="optionsContainer">
      <label>
        Rest ratio:
        <input 
          className="ratioInput" 
          type="range" 
          defaultValue=${ratio}
          min="1"
          max="10"
          step="1"
          onChange=${setRatio}
        >
      </label> 
    </div>
  `
}

const Legend = ({working, resting}) => {
  const message = working ? 'working..' : resting ? 'resting..' : ''
  return _`
    <div className="legendContainer">
      <span>${working ? 'working..' : resting ? 'resting..' : ''}</span>
      <span className="legendMessage">${message}</span>
    </div>
  `
}

const TogglProfile = ({logged, error, loading}) => {
  const dispatch = useContext(context.Dispatch)
  const tokenRef = useRef(null)

  const logIn = e => {
    dispatch(actions.TOKEN(tokenRef.current.value))
  }
  const logOut = e => dispatch(actions.TOKEN_OUT())

  const content = logged ? _` 
    <div className="togglPromt">
      Enter your toggl token to connect:
      <input className="tokenInput" type="text" maxlength="100" ref=${tokenRef}>
      <input className="connectInput" type="button" value="connect" onClick=${logIn}>
    </div>
  ` : _`
    <div className="togglLogged">
      <input className="logoutInput" type="button" value="logout" onClick=${logOut} active=${!loading}>
    </div>
  `

  const error = error ? _`
    <div className="togglError">
      Error! ${error}
    </div>
  `: null
  return  _`
    <div className="togglContainer">
      ${content}
    </div>
  `
}

const App = () => {
  const initial = null

  [dispatch, setDispatch] = useState(()=>{})
  [state, setState] = useState(initial)

  useEffect(() => {
    const port = browser.runtime.connect()
    port.onMessage.addListener( action => action.type == 'STATE' && setState(action.state))
    setDispatch(action => {
      port.postMessage(action)
    })
  }, [])
  
  return state &&  _`
    <${context.Dispatch}.Provider value=${dispatch}>
      <div className="counterBlock">
        <${Counter}  ...${state.timer}/>
      </div>
      <div className="controlsBlock">
        <${Controls} />
        <${TogglForm} logged=${state.toggl.token} ...${state.toggl.form} />
      </div>
      <div className="legendBlock">
        <${Legend} working=${state.working} resting=${state.resting} />
      </div>
      <div className="optionsBlock">
        <${Options} ...${state.config} />
      </div>
      <div className="togglBlock">
        <${TogglProfile} logged=${!!state.toggl.token} error=${state.toggle.error} loading=${state.toggle.loading} />
      </div>
    <//>
  `
}

render(App,document.getElementById('appContainer'))

//SETUP

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
