import React, { useState, useEffect, useMemo, memo} from 'react'
import ReactDOM from 'react-dom'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'

import { 
  AppContainer,
  BlockContainer,
  AppFallback, 
  Controls, 
  Counter, 
  DispatchContext, 
  Legend,
  OptionsBlock,
  RestAdjust, 
  TogglFormBlock, 
  TogglProfileBlock
} from './modules/components'
import {Action, State} from './modules/types'
import {log, RetrievedError, useTimeoutUnless} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'

const App = () => {
  const [[dispatch], setDispatch] = useState([(a :Action)=>{log.bug('Action dispatched on popup while no port is present: ', a)}])
  const [state, setAppState] = useState<State | null>(null)
  const memoProjects = useMemo(() => state ? state.toggl.login.projects : [], [state?.toggl.login.projects.length])
  const handleFatal = useErrorHandler()
  
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
  
  const react = (action :{} | Action) => {
    log.debug('New action recieved', action)
    'type' in action && action.type == 'STATE' ? setAppState(action.state) :  log.bug('Unknown object at popup port', action)
  }

  useEffect(() => {
    const p = browser.runtime.connect()
    setDispatch([(action :Action) => {
      log.debug('Action dispatched: ', action)
      p.postMessage(action) 
    }])
    p.onMessage.addListener(react)
    p.onDisconnect.addListener(()=>{crash})
  }, [])

  log.debug('light', lightTheme)
  log.debug('dark', darkTheme) 
  return state && (
      <DispatchContext.Provider value={dispatch}>
        <ThemeProvider theme={state.config.dark ? darkTheme : lightTheme}>
          <AppContainer>
            <BlockContainer>
              <Counter {...state.time} status={{working : !!state.working, resting : !!state.resting}}/>
              <Legend {...{working : !!state.working, resting : !!state.resting}}/>
              <RestAdjust nextRest={state.nextRest} mode={state.config.mode} ></RestAdjust>
              <Controls />
            </BlockContainer>
            <TogglFormBlock logged={!!state.toggl.login.token} projects={memoProjects} {...state.toggl.form} />
            <OptionsBlock {...state.config} />
            <TogglProfileBlock {...state.toggl.login} />
          </AppContainer>
        </ThemeProvider>
      </ DispatchContext.Provider>
  )
}

ReactDOM.render(//TODO what about ThemeProvider here?
  <ErrorBoundary FallbackComponent={AppFallback}>
    <App/>
  </ErrorBoundary>, 
document.getElementById('appContainer'))

