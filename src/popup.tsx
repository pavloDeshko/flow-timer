import { h, render, createContext} from 'preact'
import {useContext, useState, useRef, useEffect} from 'preact/hooks'

import {State, Time, Config, TogglLogin, TogglForm, Toggl_Project} from './modules/types'
import {Action, Actions} from './modules/actions'
import {padTwoZeros, logUnexpected} from './modules/utils'

const DispatchContext = createContext((a: Action)=>{}) //TODO

const Counter = ({hours, minutes, seconds} :Time) => {
  return(
    <div className="counterContainer">
      <div className="timeCounter">
        <span className="hCount">{padTwoZeros(hours)}</span> :
        <span className="mCount">{padTwoZeros(minutes)}</span> :
        <span className="sCount">{padTwoZeros(seconds)}</span>
      </div>
    </div>
  )
}

const Controls = () => {
  const dispatch = useContext(DispatchContext)

  const work = () => dispatch({type: Actions.WORK})
  const rest = () => dispatch({type: Actions.REST})

  return (
    <div className="controlsContainer">
      <input className="workButton" type="button" value="work" onClick={work} />
      <input className="restButton" type="button" value="rest" onClick={rest} />
    </div>
  )
}

const TogglForm = (
    {logged, projects, lastProject, shouldSave, desc, unsaved} : {logged :boolean, projects :Array<Toggl_Project>, lastProject :number|null} & TogglForm
  ) => {
  const dispatch = useContext(DispatchContext)
  
  const setActive = (e :Event) => dispatch({
    type : Actions.TOGGL_FORM,
    form : {shouldSave: (e.target as HTMLInputElement).checked} // TODO - bug in Preact typings
  })
  const setDesc = (e :Event) => dispatch({
    type : Actions.TOGGL_FORM,
    form: {desc: (e.target as HTMLInputElement).value} // TODO
  })
  const retroSave = (e :Event) => dispatch({
    type : Actions.TOGGL_SAVE_LAST
  })
  const setProject = (e :Event) => dispatch({
    type : Actions.TOGGL_FORM,
    form: {projectId: Number((e.target as HTMLInputElement).value)} // TODO
  })

  return logged ? (
    <div className="togglFormContainer">
      <label><input className="togglShouldSave" type="checkbox" checked={shouldSave} onChange={setActive} />save work entry in Toggl</label>
      <input className="togglDesc" type="text" placeholder="description.." value={desc} onInput={setDesc} />
      {!!unsaved && <input className="togglSave" type="button" value="save last work entry" onClick={retroSave} />}
      <label>
        <select className="togglProject" onChange={setProject} value={lastProject||undefined}>
          {projects.map(p => <option value={p.id}>{p.name}</option>)}
        </select>
      </label>
    </div>
   ) : null
}

const Options = ({ratio} :Config) => {
  const dispatch = useContext(DispatchContext)

  const setRatio = (e :Event) => dispatch({
    type: Actions.CONFIG,
    config: {ratio : Number((e.target as HTMLInputElement).value)} //TODO
  })

  return (
    <div className="optionsContainer">
      <label>
        Rest ratio:
        <input 
          className="ratioInput" 
          type="range"
          value={ratio}  //any bugs?
          min="1"
          max="10"
          step="1"
          onChange={setRatio}
        />
      </label> 
    </div>
  )
}

const Legend = ({working, resting} :{working :boolean, resting :boolean}) => {
  const message = working ? 'working..' : resting ? 'resting..' : ''
  return (
    <div className="legendContainer">
      <span className="legendMessage">{message}</span>
    </div>
  )
}

const TogglProfile = ({token : logged, error, loading} :TogglLogin) => {
  const dispatch = useContext(DispatchContext)
  const tokenRef = useRef(null)

  const logIn = () => {
    dispatch({
      type: Actions.TOGGL_IN, 
      token: (tokenRef.current! as HTMLInputElement).value // TODO
    })
  }
  const logOut = () => {
    dispatch({
      type : Actions.TOGGL_OUT
    })
  }

  const content = !logged ? ( 
    <div className="togglPromt">
      Enter your toggl token to connect:
      <input className="tokenInput" type="text" maxLength={100} ref={tokenRef} />
      <input className="connectInput" type="button" value="connect" onClick={logIn} />
    </div>
   ) : (
    <div className="togglLogged">
      <input className="logoutInput" type="button" value="logout" onClick={logOut} disabled={loading} />
    </div>
  )

  const ifError = error ? (
    <div className="togglError">
      {error}
    </div>
  ): null

  return  (
    <div className="togglContainer">
      {content}
      {ifError}
    </div>
  )
}

const App = () => {
  const react = (action :Action) => {
    action.type == Actions.STATE ? setAppState(action.state) : logUnexpected(new Error('Unexpected object at popup port: ' + JSON.stringify(action)))
  }
  const dispatch = (action :Action) => {
    console.log('Dispatched: ', action)
    port ? port.postMessage(action) : logUnexpected(new Error('Action dispatched on popup while no port is present: ' + JSON.stringify(action)))
  }

  const [port, setPort] = useState(null as (null | browser.runtime.Port))
  const [state, setAppState] = useState(null as (null | State))

  useEffect(() => {
    const p = browser.runtime.connect()
    p.onMessage.addListener(react as ({}) => void)
    setPort(p)
  }, [])
  
  console.log('Port:', port, '\nState:', state)
  return port && state &&  (
    <DispatchContext.Provider value={dispatch}>
      <div className="counterBlock">
        <Counter  {...state.timer}/>
      </div>
      <div className="controlsBlock">
        <Controls />
        <TogglForm logged={!!state.toggl.login.token} projects={state.toggl.login.projects} lastProject={state.toggl.login.lastProjectId} {...state.toggl.form} />
      </div>
      <div className="legendBlock">
        <Legend working={!!state.working} resting={!!state.resting} />
      </div>
      <div className="optionsBlock">
        <Options {...state.config} />
      </div>
      <div className="togglBlock">
        <TogglProfile {...state.toggl.login} />
      </div>
    </ DispatchContext.Provider>
  )
}

render(<App />,document.getElementById('appContainer')!) //TODO

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
