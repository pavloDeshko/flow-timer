import { h, render, createContext} from 'preact'
import {memo} from 'preact/compat'
import {useContext, useState, useRef, useEffect} from 'preact//hooks'

import {State, Time, Config, TogglLogin, TogglForm, Toggl_Project, Mode} from './modules/types'
import {Action, Actions} from './modules/actions'
import {padTwoZeros, logUnexpected, jsonMemo} from './modules/utils'

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

const TimeForm = memo(({hours = 0, minutes = 0, seconds = 0}:{hours :number, minutes :number, seconds :number}) => {
  const dispatch = useContext(DispatchContext)
  const hoursRef = useRef(null)
  const minutesRef = useRef(null) //TODO wtf????
  const secondsRef = useRef(null)
  
  const onChange = () =>{
    dispatch({
      type: Actions.ADJUST,
      time: {
        hours: Number((hoursRef.current! as HTMLInputElement).value),
        minutes: Number((minutesRef.current! as HTMLInputElement).value),
        seconds: 0
      }
    })
  }

  return(
    <div className="timeFormContainer">
      <div className="timeForm">
        <input className="hCount" value={padTwoZeros(hours)} ref={hoursRef} onChange={onChange} />h : 
        <input className="mCount" value={padTwoZeros(minutes)} ref={minutesRef} onChange={onChange}/>m :
        <input className="sCount" value={padTwoZeros(seconds)} ref={secondsRef} onChange={onChange}/>s
      </div>
    </div>
  )
})

const Rest = ({nextRest, mode} :{nextRest :Time, mode :Mode}) => {
  const dispatch = useContext(DispatchContext)
  const onRecalculate = ()=>{
    dispatch({
      type: Actions.ADJUST,
      time: null
    })
  }

  return (<div className="restContainer">
    Next rest: <TimeForm hours={nextRest.hours} minutes={nextRest.minutes} seconds={nextRest.seconds}/>
    <input type="button" value="recalcute rest" onClick={onRecalculate} disabled={mode == Mode.ON} />
  </div>)
}

const Controls = memo(() => {
  const dispatch = useContext(DispatchContext)

  const work = () => dispatch({type: Actions.WORK})
  const rest = () => dispatch({type: Actions.REST})

  return (
    <div className="controlsContainer">
      <input className="workButton" type="button" value="work" onClick={work} />
      <input className="restButton" type="button" value="rest" onClick={rest} />
    </div>
  )
})

const TogglForm = memo((
    {logged, projects, projectId, shouldSave, desc, unsaved} : {logged :boolean, projects :Array<Toggl_Project>} & TogglForm
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
        <select className="togglProject" onInput={setProject} value={projectId||undefined}>
          {projects.map(p => <option value={p.id}>{p.name}</option>)}
        </select>
      </label>
    </div>
   ) : null
})

const Options = memo(({ratio, mode} :Config) => {
  const dispatch = useContext(DispatchContext)

  const setRatio = (e :Event) => dispatch({
    type: Actions.CONFIG,
    config: {ratio : Number((e.target as HTMLInputElement).value)} //TODO
  })
  const setMode = (e :Event) => dispatch({
    type: Actions.CONFIG,
    config: {mode : (e.target as HTMLInputElement).checked ? Mode.ON : Mode.OFF}
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
      <label>
        <input type="checkbox" checked={!!mode} onChange={setMode}></input>
        Estimate rest?
      </label>
    </div>
  )
})

const Legend = memo(({working, resting} :{working :boolean, resting :boolean}) => {
  const message = working ? 'working..' : resting ? 'resting..' : ''
  return (
    <div className="legendContainer">
      <span className="legendMessage">{message}</span>
    </div>
  )
})

const TogglProfile = memo(({token : logged, error, loading} :TogglLogin) => {
  const dispatch = useContext(DispatchContext)
  const tokenRef = useRef(null)

  const logIn = () => {
    dispatch({
      type: Actions.TOGGL_IN, 
      token: (tokenRef.current! as HTMLInputElement).value.replace(/(^\s+)|(\s+$)/g,'') // TODO
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
})

const App = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{logUnexpected(new Error('Dispatched on popup but no port: ' + JSON.stringify(a)))}])
  const [state, setAppState] = useState(null as (null | State))

  useEffect(() => {
    const p = browser.runtime.connect()
    setDispatch([(action :Action) => {
      console.dir('Action disptched: '+ JSON.stringify(action, undefined, '  '))
      p.postMessage(action) 
    }])
    p.onMessage.addListener(react as ({}) => void) //TODO
  }, [])

  const react = (action :Action) => {
    action.type == Actions.STATE ? setAppState(action.state) : logUnexpected(new Error('Unexpected object at popup port: ' + JSON.stringify(action)))
    console.log('New state: ' + JSON.stringify(action, undefined, '  '))
  }
  
  return state &&  (
    <DispatchContext.Provider value={dispatch}>
      <div className="counterBlock">
        <Counter  {...state.timer}/>
      </div>
      <div className="legendBlock">
        <Legend working={!!state.working} resting={!!state.resting} />
      </div>
      <div className="restBlock">
        <Rest nextRest={state.nextRest} mode={state.config.mode} ></Rest>
      </div>
      <div className="controlsBlock">
        <Controls />
        <TogglForm logged={!!state.toggl.login.token} projects={jsonMemo(state.toggl.login.projects)} {...state.toggl.form} />
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


/* 
const ConsoleDummy = memo(({bla} :{bla:number}) => {
  console.log('dummy rerendered')
  return <div>bla</div>
})

const DumbDummy = memo(()=>{
  console.log('dumb dummy rerendered')
  return <div>foo</div>
})

const OutsideDummy = memo(()=>{
  console.log('outside dummy rerendered')
  return <div>bar</div>
}) */
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
