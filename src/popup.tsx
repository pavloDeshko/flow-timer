import React, {useContext, useState, useRef, useEffect, memo, ChangeEvent, FormEvent} from 'react'
import ReactDOM from 'react-dom'
import {Button, IconButton, TextField, FormControlLabel, Switch, Slider, Select, InputAdornment, ThemeProvider, Tooltip, Typography } from '@material-ui/core'
import {Update, Save, Link, ExitToApp, CreateOutlined, LockOutlined, BrightnessMedium, Refresh, FileCopyOutlined} from '@material-ui/icons'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import clipboardCopy from 'clipboard-copy'
import useTimeout from '@rooks/use-timeout'

import {State, Time, Config, TogglLogin, TogglForm, Toggl_Project, Mode} from './modules/types'
import {Action, Actions} from './modules/actions'
import {padTwoZeros, log, jsonMemo, RetrievedError, useTimeoutUnless} from './modules/utils'
import {SUPPORT_EMAIL} from './modules/settings'
import * as useStyles from './modules/styles'
import { start } from 'repl'

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

const Options = memo(({ratio, mode, dark} :Config) => {
  const dispatch = useContext(DispatchContext)
  const classes = useStyles.options()

  const setRatio = (_:any, value :number|number[]) => dispatch({
    type: Actions.CONFIG,
    config: {ratio : 60 / (value as number)} //TODO
  })
  const setMode = (_:any, value :boolean) => dispatch({
    type: Actions.CONFIG,
    config: {mode : value ? Mode.ON : Mode.OFF}
  })
  const setDark = () => dispatch({
    type: Actions.CONFIG,
    config: {dark : !dark}
  })

  return (
    <div className={classes.root}>
      Rest ratio:
      <Slider
        marks={[1,5,10,15,20,30,45,60].map((value)=>({value}))}
        step={null}
        valueLabelDisplay="auto"
        valueLabelFormat={x=>x+'m'}
        min={1}
        max={60}
        scale={x=>x}//TODO scale it!
        value={Math.floor(60/ratio)}
        onChangeCommitted={setRatio}
      />
      <FormControlLabel label={'Estimate rest'} control={
        <Switch  
          color='primary'
          checked={!!mode}
          onChange={setMode} 
        />
      }/>
      <Tooltip title='dark/light mode'>
        <IconButton color="primary" onInput={setDark}>
          <BrightnessMedium />
        </IconButton>
      </Tooltip>
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

const AppFallback = ({error}:{error:Error}) => {
  const classes = useStyles.appFallback()
  
  const reload = ()=>{
    browser.runtime.reload()
  }

  return <div>
    <Typography>
      <p>Sorry, it seems like internals of our app crashed :/</p>
      <p>Please, drop us a note at <CopyLink value={SUPPORT_EMAIL} /> about what happened. Click
        <CopyLink value={`${error.toString()} Stack: \n  ${error.stack}`} text="here"/>
        to copy geeky data and paste it into your email so we can understand what went wrong.
      </p>
      <p>We <span className={classes.strong}>will</span> try to solve the problem asap!</p>
    </Typography>
    <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>Reload extension</Button>
  </div>
}

const CopyLink = ({value, text, loading = false}:{value:string, text?:string, loading?:boolean})=>{
  const copy = ()=>clipboardCopy(value)
  
  return <Tooltip title={'copy to clipboard'} arrow>
    <Button
      variant="text"
      size="small"
      startIcon={<FileCopyOutlined fontSize="small" />}
      onClick={copy}
      disabled={loading}
    >{text || value}</Button>
  </Tooltip>
}

const App = () => {
  const classes = useStyles.app()
  const [[dispatch], setDispatch] = useState([(a :Action)=>{log.bug('Action dispatched on popup while no port is present: ', a)}])
  const [state, setAppState] = useState(null as (null | State))
  const handleFatal = useErrorHandler()
  
  const react = (action :Action) => {
    log.debug('New action recieved', action)
    action.type == Actions.STATE ? setAppState(action.state) :  log.bug('Unknown object at popup port', action)
  }
  
  const crash = () => {
    browser.storage.local.get('lastError').then(
      storage=>{
        const err = (new RetrievedError(storage['lastError']))
        log.error('retrived object: ', err)
        handleFatal(err)
      },
      handleFatal
    )
  }
  
  useTimeoutUnless(crash, !!state, 1000)

  useEffect(() => {
    const p = browser.runtime.connect()
    setDispatch([(action :Action) => {
      log.debug('Action dispatched: ', action)
      p.postMessage(action) 
    }])
    p.onMessage.addListener(react as ({}) => void) //TODO
    p.onDisconnect.addListener(()=>{crash})
  }, [])


  return state && (
      <DispatchContext.Provider value={dispatch}>
        <ThemeProvider theme={state.config.dark ? useStyles.darkTheme : useStyles.lightTheme}>
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

ReactDOM.render(
  <ErrorBoundary FallbackComponent={AppFallback}>
    <App/>
  </ErrorBoundary>, 
document.getElementById('appContainer')!) //TODO


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
