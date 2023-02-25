import React, { useState, useEffect, useMemo, memo} from 'react'
import ReactDOM from 'react-dom'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import './background'//TODO DIFF WITH EXT

import { 
  PageContainer,
  PageHeader,
  PageDesc,
  AppContainer,
  BlockContainer,
  AccordionContainer,
  AppFallback, 
  Controls, 
  Counter, 
  DispatchContext, 
  //Legend,
  Options,
  RestAdjust,
  TogglError,
  TogglLogin,
  TogglForm,
  TogglCollapsed,
  TimeAlert
} from './modules/components'
import {Action, State, NotifyType} from './modules/types'
import {storageErrorGet} from './modules/service'
import {log, RetrievedError, useTimeoutUnless} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'
import {connect, Connector} from './modules/connector'
import {EXTENSION} from "./settings"

const App = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{log.bug('Action dispatched on popup while no port is present: ', a)}])
  const [state, setAppState] = useState<State | null>(null)
  const memoProjects = useMemo(() => state ? state.toggl.login.projects : [], [state?.toggl.login.projects.length])
  
  const [alert, setAlert] = useState<NotifyType | null>(null)
  const cancelAlerts = (work:boolean,rest:boolean)=>{
    (
      alert == NotifyType.POM && !work || 
      alert == NotifyType.WORK && !rest
    ) && setAlert(null)
  }

  const handleFatal = useErrorHandler()
  const crash = (reason:string) => {
    storageErrorGet().then(
      errorJSON=>{
        log.error(reason +' retrived object: ', errorJSON)
        handleFatal(new RetrievedError(errorJSON))
      },
      handleFatal
    )
  }
  useTimeoutUnless(()=>crash('Crashed on timeout'), !!state, 1000)
  
  const react = (action :{} | Action) => {
    log.debug('New action recieved', action)
    if('type' in action){
      if(action.type == 'STATE'){
        setAppState(EXTENSION ? action.state : {...action.state})
        cancelAlerts(!!action.state.working, !!action.state.resting)
      }else if(action.type == 'NOTIFY'){
        setAlert(action.subType)
      }
    }else{
      log.bug('Unknown object at popup port', action)
    }
  }

  useEffect(() => {
    const p = connect()
    setDispatch([(action :Action) => {
      log.debug('Action dispatched: ', action)
      p.postMessage(action) 
    }])
    p.onMessage(react)
    p.onDisconnect(()=>crash('Crashed on disconnect'))//check
  }, [])

  const app = state && (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        {/*<Legend {...{working : !!state.working, resting : !!state.resting}}/>*/}
        <Counter {...state.time} />
        <Controls working={!!state.working} resting={!!state.resting} />
        <RestAdjust nextRest={state.nextRest} mode={state.config.mode} ></RestAdjust>
        <TimeAlert type={alert} />
      </BlockContainer>

      <BlockContainer className="OptionsBlock">
        <Options {...state.config} />
      </BlockContainer>

      <AccordionContainer className="TogglBlock"
        label={<TogglCollapsed logged={!!state.toggl.login.token} />}
        expanded={!!state.toggl.login.token}
      >
        {!state.toggl.login.token ?
          <TogglLogin {...state.toggl.login} /> :
          <TogglForm {...state.toggl.form} projects={memoProjects} />
        }
        <TogglError error={state.toggl.login.error} />
      </AccordionContainer>

      {!EXTENSION && <PageDesc/>}
    </AppContainer>
  )
  
  return app && (
      <DispatchContext.Provider value={dispatch}>
        <ThemeProvider theme={state.config.dark ? darkTheme : lightTheme}>
        {EXTENSION ? 
          app :
          <PageContainer>
            <PageHeader/>
            {app}
            <PageDesc/>
          </PageContainer>
        }
          
        </ThemeProvider>
      </ DispatchContext.Provider>
  )
}

ReactDOM.render(//TODO what about ThemeProvider here?
  <ErrorBoundary FallbackComponent={AppFallback}>
    <App/>
  </ErrorBoundary>, 
document.getElementById('appRoot'))

