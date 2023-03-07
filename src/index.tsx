import React, { useState, useEffect, useMemo, memo} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
//import './background'//TODO DIFF WITH EXT debug

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
import {log, useTimeoutUnless} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'
import {connectFront as connect, Connector} from './modules/connector'
import {EXTENSION} from "./settings"

const App = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{log.bug('Action dispatched on popup while no port is present: ', a)}])
  const [state, setAppState] = useState<State | null>(null)
  const memoProjects = useMemo(() => state ? state.toggl.login.projects : [], [state?.toggl.login.projects.length])
  
  const [alert, setAlert] = useState<NotifyType | null>(null)
  if(alert == NotifyType.POM && !state?.working || alert == NotifyType.WORK && (state?.working || state?.resting)){
    setAlert(null)
  }
/*   const updateAlerts = (forceCancel?:boolean, work?:boolean,rest?:boolean)=>{
    log.debug(`${String(alert)} + ${work} + ${rest}`);
    ( forceCancel ||
      alert == NotifyType.POM && !work || 
      alert == NotifyType.WORK && (work || rest)
    ) && setAlert(null)
  } */

  const handleFatal = useErrorHandler()
  const crash = async (reason:string) => {
    storageErrorGet().then(
      error=>{
        log.error(reason, error)
        handleFatal(error)
      },
      handleFatal
    )
  }
  useTimeoutUnless(()=>crash('Crashed on timeout'), !!state, 3000)
  
  const react = (action :{} | Action) => {
    log.debug('New action recieved', action)
    if('type' in action){
      if(action.type == 'STATE'){
        setAppState(EXTENSION ? action.state : {...action.state})
        //updateAlerts(false, !!action.state.working, !!action.state.resting)
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
    return ()=>{
      log.debug('disconneted!')
      p.disconnect()
    }
  }, [])

  const app = state && (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        {/*<Legend {...{working : !!state.working, resting : !!state.resting}}/>*/}
        <Counter {...state.time} />
        <Controls working={!!state.working} resting={!!state.resting} />
        <RestAdjust nextRest={state.nextRest} mode={state.config.mode} ></RestAdjust>
        <TimeAlert type={alert} onClose={()=>setAlert(null)}/>
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

createRoot(document.getElementById('appRoot') as Element).render(//TODO what about ThemeProvider here?
  <ErrorBoundary FallbackComponent={AppFallback}>
    <App/>
  </ErrorBoundary>
)

