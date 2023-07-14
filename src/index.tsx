import React, { useState, useEffect, useMemo, memo, ReactNode} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'

import {test, errors, delay} from './modules/test'

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
  Options,
  RestAdjust,
  TogglError,
  TogglLogin,
  TogglForm,
  TogglCollapsed,
  TimeAlert,
  AppPlaceholder,
  Ticker
} from './modules/components'
import {Action, State, NotifyType} from './modules/types'
import {storageErrorGet, usePreffersDark} from './modules/service'
import {log, useTimeoutUnless} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'
import {connectFront as connect, Connector} from './modules/connector'
import {EXTENSION} from "./settings"
import { useTheme } from '@material-ui/styles'

const Content = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{log.bug('Action dispatched on popup while no port is present: ', a)}])
  const [state, setAppState] = useState<State | null>(null)
  const memoProjects = useMemo(() => state ? state.toggl.login.projects : [], [state?.toggl.login.projects.length])
  
  const [alert, setAlert] = useState<NotifyType | null>(null)
  if(
    alert == NotifyType.POM && !state?.working || 
    alert == NotifyType.WORK && (state?.working || state?.resting)
  ){setAlert(null)}

  const handleFatal = useErrorHandler()
  const crash = async (comment:string) => {
    storageErrorGet().then(
      (error = new Error('no error object retrived from storage'))=>{
        log.error(error, `front end error: ${comment}`)
        handleFatal(error)
      },
      handleFatal
    )
  }
  useTimeoutUnless(()=>crash('crashed on timeout'), !!state, 3000)
  
  const preffersDark = usePreffersDark()
  const theme =  state && state.config.dark !== null ? 
    state.config.dark ? darkTheme : lightTheme 
    : preffersDark ? darkTheme : lightTheme  

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
    setTimeout(()=>{
      errors.frontError && test(()=>{throw new Error(`Front test Error at ${new Date()}`)})//TODO remove test
      errors.frontRejection && test(()=>{Promise.reject(new Error(`Front test Rejection at ${new Date()}`))})//TODO remove test
    },delay)

    const p = connect()
    setDispatch([(action :Action) => {
      log.debug('Action dispatched: ', action)
      p.postMessage(action) 
    }])
    p.onMessage(react)
    p.onDisconnect(()=>crash('crashed on disconnect'))//check
    return ()=>{
      log.debug('disconneted!')
      p.disconnect()
    }
  }, [])
  
  const app = state ? (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        {/*<Legend {...{working : !!state.working, resting : !!state.resting}}/>*/}
        <Ticker time={state.working || state.resting } down={!!state.resting}/>
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
    </AppContainer>
  ) : EXTENSION ? null : <AppPlaceholder/>

  return (
      <DispatchContext.Provider value={dispatch}>
        <ThemeProvider theme={theme}> 
          {EXTENSION ? app : <Page> {app} </Page>}
        </ThemeProvider>
      </ DispatchContext.Provider>
  )
}

const FallbackContent = ({error}:{error:Error})=>{
  const dark = usePreffersDark()
  return(//TODO reuse theme from state?
  <ThemeProvider theme={dark ? darkTheme : lightTheme}>
    {EXTENSION ? 
      <AppFallback error={error}/> : 
      <Page>
        <AppFallback error={error}/>
      </Page>
    }
  </ThemeProvider>)
}

const Page = ({children}:{children:ReactNode})=>(
  <PageContainer>
    <PageHeader/>
      {children}
    <PageDesc/>
    </PageContainer>
)

createRoot(document.getElementById('appRoot') as Element).render(
  <ErrorBoundary FallbackComponent={FallbackContent}>
    <Content/>
  </ErrorBoundary>
)
