import React, {useContext, useState, useRef, useEffect, memo, ChangeEvent, FormEvent} from 'react'
import ReactDOM from 'react-dom'
import {Button, TextField, FormControlLabel, Switch, Slider, Select, InputAdornment, ThemeProvider, useTheme, StylesProvider} from '@material-ui/core'
import {Update, Save, Link, ExitToApp, CreateOutlined, LockOutlined} from '@material-ui/icons'

import {State, Time, Config, TogglLogin, TogglForm, Toggl_Project, Mode} from './modules/types'
import {Action, Actions} from './modules/actions'
import {padTwoZeros, logUnexpected, jsonMemo} from './modules/utils'
import * as useStyles from './modules/styles'

const DispatchContext = React.createContext((a: Action)=>{}) //TODO

const Counter = ({hours, minutes, seconds} :Time) => {
  const classes = useStyles.counter()
  return(
      <div className={classes.root}>
        <span className="hCount">{padTwoZeros(hours)}</span>:
        <span className="mCount">{padTwoZeros(minutes)}</span>:
        <span className="sCount">{padTwoZeros(seconds)}</span>
      </div>
  )
}

const Legend = memo(({working, resting} :{working :boolean, resting :boolean}) => {
  const classes = useStyles.legend()
  const message = working ? 'working..' : resting ? 'resting..' : ''
  return (
    <div className={classes.root}>
      <span className="legendMessage">{message}</span>
    </div>
  )
})

const TimeForm = memo(({hours = 0, minutes = 0, seconds = 0}:{hours :number, minutes :number, seconds :number}) => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.timeForm()
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
    <div className={classes.root}>
      <TextField label='h' value={padTwoZeros(hours)} inputRef={hoursRef} onChange={onChange} />
      <TextField label='m' value={padTwoZeros(minutes)} inputRef={minutesRef} onChange={onChange} />
    </div>
  )
})

const RestAdjust = ({nextRest, mode} :{nextRest :Time, mode :Mode}) => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.restAdjust()
  const onRecalculate = ()=>{
    dispatch({
      type: Actions.ADJUST,
      time: null
    })
  }

  return (
    <div className={classes.root}>
      Next rest: <TimeForm hours={nextRest.hours} minutes={nextRest.minutes} seconds={nextRest.seconds}/>
      <Button 
        variant="text"
        color="default" 
        size="small" 
        startIcon={<Update />}
        onClick={onRecalculate} 
        disabled={mode == Mode.ON}
      >recalcute</Button>
    </div>
  )
}

const Controls = memo(() => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.controls()

  const work = () => dispatch({type: Actions.WORK})
  const rest = () => dispatch({type: Actions.REST})

  return (
    <div className={classes.root}>
      <Button className={classes.controlButton} variant='contained' color='secondary' size='large' onClick={work}>Work</Button>
      <Button className={classes.controlButton} variant='contained' color='primary' size='large' onClick={rest}>Rest</Button>
    </div>
  )
})

const TogglForm = memo((
    {logged, projects, projectId, shouldSave, desc, unsaved} : {logged :boolean, projects :Array<Toggl_Project>} & TogglForm
  ) => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.togglForm()
  
  const setActive = (e :ChangeEvent) => dispatch({
    type : Actions.TOGGL_FORM,
    form : {shouldSave: (e.target as HTMLInputElement).checked} // TODO - bug in Preact typings
  })
  const setDesc = (e :FormEvent) => dispatch({
    type : Actions.TOGGL_FORM,
    form: {desc: (e.target as HTMLInputElement).value} // TODO
  })
  const retroSave = (e :FormEvent) => dispatch({
    type : Actions.TOGGL_SAVE_LAST
  })
  const setProject = (e :ChangeEvent<any>) => dispatch({
    type : Actions.TOGGL_FORM,
    form: {projectId: Number((e.target as HTMLInputElement).value)} // TODO
  })

  return logged ? (
    <div className={classes.root}>
      <FormControlLabel label={'Save in toggl'} control={
        <Switch
          color='primary'
          checked={shouldSave} 
          onChange={setActive} 
        />
      }/>
      <TextField
        label='Description'
        placeholder='..'
        InputProps={{
          startAdornment: (<InputAdornment position='start'><CreateOutlined/></InputAdornment>)
        }}
        value={desc} 
        onInput={setDesc} 
      />
      <Select
        label={'Project'}
        value={projectId||undefined}
        onChange={setProject}
      >
        {projects.map(p => <option value={p.id}>{p.name}</option>)}
      </Select>
      {!!unsaved && <Button 
        variant="text" 
        size="small" 
        color="default" 
        startIcon={<Save />}
        onClick={retroSave}
      >save prev work entry</Button>}
    </div>
   ) : null
})

const Options = memo(({ratio, mode} :Config) => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.options()

  const setRatio = (e :ChangeEvent<{}>) => dispatch({
    type: Actions.CONFIG,
    config: {ratio : 60 / (Number((e.target as HTMLInputElement).value))} //TODO
  })
  const setMode = (e :ChangeEvent) => dispatch({
    type: Actions.CONFIG,
    config: {mode : (e.target as HTMLInputElement).checked ? Mode.ON : Mode.OFF}
  })


  return (
    <div className={classes.root}>
      Rest ratio:
      <Slider
        marks={[1,5,10,15,20,30,45,60].map((value)=>({value}))}
        step={null}
        valueLabelDisplay="auto"
        valueLabelFormat={x=>x+'m'}
        max={60}
        scale={x=>x}//TODO scale it!
        defaultValue={15}
        value={ratio}
        onChangeCommitted={setRatio}
      />
      <FormControlLabel label={'Estimate rest'} control={
        <Switch  
          color='primary'
          checked={!!mode}
          onChange={setMode} 
        />
      }/>
    </div>
  )
})

const TogglProfile = memo(({token : logged, error, loading} :TogglLogin) => {
  const dispatch = useContext(DispatchContext)
  const tokenRef = useRef(null)
  const classes = useStyles.togglProfile()

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
    <div className={classes.prompt}>
      <TextField
        label='Toggle Token'
        placeholder='..'
        InputProps={{
          startAdornment: (<InputAdornment position='start'><LockOutlined/></InputAdornment>)
        }}
        helperText="timer won't transfer your token anywhere"
        inputRef={tokenRef}
      />
      <Button 
        variant="outlined" 
        color="primary" 
        size="small"
        startIcon={<Link />}//TODO rotate4 5
        onClick={logIn}
      >connect</Button>
    </div>
   ) : (
    <div className={classes.status}>
      <Button 
        variant="outlined" 
        color="primary" size="small" 
        endIcon={<ExitToApp />}
        onClick={logOut} 
        disabled={loading}
      >logout</Button>
    </div>
  )

  const ifError = error ? (
    <div className={classes.error}>
      {error}
    </div>
  ): null

  return  (
    <div className={classes.root}>
      {content}
      {ifError}
    </div>
  )
})

const App = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{logUnexpected(new Error('Dispatched on popup but no port: ' + JSON.stringify(a)))}])
  const [state, setAppState] = useState(null as (null | State))
  const classes = useStyles.app()

  useEffect(() => {
    const p = browser.runtime.connect()
    setDispatch([(action :Action) => {
      p.postMessage(action) 
    }])
    p.onMessage.addListener(react as ({}) => void) //TODO
  }, [])

  const react = (action :Action) => {
    action.type == Actions.STATE ? setAppState(action.state) : logUnexpected(new Error('Unexpected object at popup port: ' + JSON.stringify(action)))
  }
  
  return state &&  (
    <DispatchContext.Provider value={dispatch}>
      <ThemeProvider theme={useStyles.theme}>
        <div className={classes.root}>
          <div className="timerBlock">
            <Counter  {...state.timer}/>
            <Legend working={!!state.working} resting={!!state.resting} />
            <RestAdjust nextRest={state.nextRest} mode={state.config.mode} ></RestAdjust>
            <Controls />
          </div>
          <div className="togglFormBlock">
            <TogglForm logged={!!state.toggl.login.token} projects={jsonMemo(state.toggl.login.projects)} {...state.toggl.form} />
          </div>
          <div className="optionsBlock">
            <Options {...state.config} />
          </div>
          <div className="togglBlock">
            <TogglProfile {...state.toggl.login} />
          </div>
        </div>
      </ThemeProvider>
    </ DispatchContext.Provider>
  )
}

ReactDOM.render(<App />,document.getElementById('appContainer')!) //TODO


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
