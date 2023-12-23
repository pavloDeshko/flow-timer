import React, { useState, useEffect, useMemo, useCallback, useReducer, memo, ReactNode} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import {produce as immer} from 'immer'

import { State, AlarmType, Mode, AlertPos, Status} from './modules/types'
import { 
  PageContainer,
  PageHeader,
  PageDesc,
  AppContainer,
  BlockContainer,
  AccordionContainer,
  Fallback, 
  Controls,
  DispatchContext, 
  Options,
  TogglError,
  TogglLogin,
  TogglForm,
  TogglCollapsed,
  UserAlert,
  AppPlaceholder,
  RestAdjust,
  CopyLink
} from './modules/components'
import {CounterTicker, RestAdjustTicker} from './modules/tickers'
import {
  reload,
  errorSave,
  errorGet,
  usePreffersDark, 
  iconTitleChange,
  stateGet, 
  stateSave, 
  notificationGet, 
  notificationSave, 
  togglApiAdd,
  togglApiDisconnect, 
  togglApiConnect,
  askPermission,
  checkPermission
} from './modules/service'
import {useAsyncEffect, timeToMs, msToTime, stringifyError} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'
import {EXTENSION, MAX_REST, MIN_REST, DEFAULT_STATE, SUPPORT_EMAIL} from "./settings"
import {ICONS} from "./modules/assets"
import TEXT from './modules/text'
import eventManager, {Action, Message} from "./modules/events"
import backgroundSetup from "./modules/backgroundSetup"

type SetStateT = React.Dispatch<React.SetStateAction<State|null>>

const App = () => {
  const [state, setState] = useState<State|null>(null)
  useAsyncEffect(async()=>{
    /// First render, no state is present, state retrieved. Subsequent renders, state saved every time it's changed ///
    !state ?
      setState(await stateGet() || DEFAULT_STATE) :
      stateSave(state)
  },[state])

 return state ? 
   <AppContent {...{state,setState}}/> : 
   EXTENSION ? null : <AppPlaceholder/>
}

const AppContent = memo(({state,setState}:{state:State, setState:SetStateT}) => {
  const setStateWithImmer = (cb:(freshState :State)=>void)=>{
    setState(oldState=>immer(oldState,cb))
  }
  const crash = useErrorHandler()
  
  /// Main state managment ///
  const dispatch = useCallback(
    (action:Action)=>{eventManager.emit('action',action)}
  ,[])

  useEffect(()=>{
    return eventManager.on('action',onAction)
  },[state])
   
  /// Notification ond error data fetching and handlers///
  const handleRestEnd = (state:State)=>{
    if(state.restingUntil && state.restingUntil - Date.now() < 900){
      state.restingUntil = null
      state.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingSince || Date.now()) : state.nextRestTime
    }
  }
 
  useAsyncEffect(async () => {
    const [notification, errorInfo] = await Promise.all([notificationGet(), errorGet()])
    setStateWithImmer(state => {
      state.notification = notification
      notification == AlarmType.WORK && handleRestEnd(state)
      if(errorInfo?.userMessage){
        state.warning = {type:'ERROR', ...errorInfo}
      }
    })
  }, [])

  useEffect(()=>{
    return eventManager.on('message',(message:Message)=>{
      message.type == "NOTIFY" && setStateWithImmer(state=>{
        state.notification = message.subType
        message.subType == AlarmType.WORK && handleRestEnd(state)
      })
      message.type == "ERROR" && message.errorInfo.userMessage && 
        setStateWithImmer(state=>{state.warning = {type:'ERROR', ...message.errorInfo}})
    })
  },[])

  /// Util and modifier function ///
  const calcRestDuration = useCallback((workingSince:number) => {
    const result = Math.floor((Date.now() - workingSince) / state.config.ratio)
    return result < MIN_REST ? MIN_REST : result > MAX_REST ? MAX_REST : result
  },[state.config.ratio])

  /// Main action handler ///
  const onAction = (action: Action) => {
    try{
      setState(immer(state, fresh=>{
        /// Async logic extracted ///
        const pushToggl = async(start:number, end:number)=>{
          if(!state.toggl.token){return}
          try {
            fresh.toggl.loaded = false
            await togglApiAdd(state.toggl.token, start, end, state.toggl.form.desc, state.toggl.form.projectId)
            setStateWithImmer(fresh => {
              fresh.toggl.loaded = true
              fresh.toggl.form.saved = true
            })
          } catch (err: any) {
            setStateWithImmer(fresh => {
              fresh.toggl.loaded =  err.message || TEXT.TOGGL_ERROR_SAVE
            })
          }
        }

        const pushOrSaveLastToggl = ()=>{
          if(!state.workingSince){return}

          state.toggl.token && state.toggl.form.shouldSave ?
          pushToggl(state.workingSince, Date.now()):
          fresh.toggl.form.saved = [state.workingSince, Date.now()]
        }

        const loginToggl = async(token:string)=>{
          try{
            fresh.toggl.loaded = false
            const result = await togglApiConnect(token)
            setStateWithImmer(fresh=>{
              fresh.toggl = {
                token, 
                projects : result.projects, 
                loaded : true, 
                form : {...state.toggl.form, 
                  projectId : result.last || null
                }
              }
            })
          }catch(err:any){
            setStateWithImmer(fresh=>{
              fresh.toggl.loaded = err.message || TEXT.TOGGL_ERROR_LOG
            })
          }
        }

        const permissionToNotify = () => {
          if(!EXTENSION && checkPermission() == 'default'){
            fresh.warning = {type:'WARNING', message:TEXT.ASK_PERMISSION}
            askPermission().then(result=> result!='default' && setStateWithImmer(fresh=>{fresh.warning=null}))
          }
        }

        const clearNotify = async()=>{
          fresh.notification = null
          notificationSave(null)
        }
        const clearWarn = async()=>{
          fresh.warning = null
          errorSave(null)
        }
        
        /// Main "switch" ///
        if(action.type == 'WORK' && !state.workingSince){
          fresh.restingUntil = null
          fresh.workingSince = Date.now()
          
          fresh.toggl.form.saved = false
          
          iconTitleChange(Status.WORKING)
          clearNotify()
          state.config.pomActive && permissionToNotify()
          state.config.pomActive ? 
            eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.POM, timeout:state.config.pomTimeMins * 60e3}) :
            eventManager.emit('message',{type:"CLEAR_ALARM"})
      
        }else if(action.type == 'WORK' && state.workingSince){ 
          fresh.workingSince = null
          fresh.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingSince) : state.nextRestTime
      
          pushOrSaveLastToggl()

          iconTitleChange(Status.IDLE)
          clearNotify()
          eventManager.emit('message',{type:"CLEAR_ALARM"})

        }else if(action.type == 'REST' && !state.restingUntil){
          const freshRestTime = state.workingSince && state.config.mode == Mode.ON ? calcRestDuration(state.workingSince) : state.nextRestTime

          fresh.workingSince = null
          fresh.restingUntil = Date.now() + freshRestTime
          fresh.nextRestTime = freshRestTime
          fresh.config.mode = state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode //state.config.mode && Mode.ON
          
          state.workingSince && pushOrSaveLastToggl()

          iconTitleChange(Status.RESTING)
          clearNotify()
          permissionToNotify()
          eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.WORK, timeout:freshRestTime})

        }else if(action.type == 'REST' && state.restingUntil){
          fresh.restingUntil = null
          fresh.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingSince || Date.now()) : state.nextRestTime

          iconTitleChange(Status.IDLE)
          eventManager.emit('message',{type:'CLEAR_ALARM'})

        }else if(action.type == 'REST_ENDED'){//TODO implemented through alarm alert ... change?
          /// When time ran out by itself ///
          fresh.restingUntil = null

        }else if(action.type == 'ADJUST'){
          fresh.nextRestTime = timeToMs(action.time)
          fresh.config.mode = state.config.mode == Mode.ON ? Mode.PAUSED : state.config.mode

        }else if(action.type == 'RECALC'){
          fresh.nextRestTime = calcRestDuration(state.workingSince || Date.now())
          fresh.config.mode =  state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode// TODO or better disable when not working?

        }else if(action.type == 'CONFIG'){
          fresh.config = {...fresh.config, ...action.config}

        }else if(action.type == 'TOGGL_IN'){
          loginToggl(action.token)

        }else if(action.type == 'TOGGL_OUT'){
          fresh.toggl.token = null

          state.toggl.token && togglApiDisconnect(state.toggl.token)

        }else if(action.type == 'TOGGL_FORM'){
          fresh.toggl.form = {...state.toggl.form, ...action.form }

        }else if(action.type == 'TOGGL_SAVE_LAST'){
          Array.isArray(state.toggl.form.saved) && pushToggl(...state.toggl.form.saved)

        }else if(action.type == 'CLOSE_ALERT'){
          action.alertPos == AlertPos.NOTIFY && clearNotify()
          action.alertPos== AlertPos.WARN && clearWarn()
        }
      }))
    }catch(err){
      crash(err)
    }
  }
  
  /// UI ///
  const preffersDark = usePreffersDark()
  const dark = state.config.dark == null ?
    preffersDark ? true : false :
    state.config.dark ? true : false

  const content = (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        {/*<Legend {...{workingSince : !!state.workingSince, restingUntil : !!state.restingUntil}}/>*/}
        <CounterTicker refTime={state.workingSince || state.restingUntil } typeOrMod={!!state.restingUntil ? 'DOWN' : 'UP'} />
        {/*<Counter {...state.time} /> */}
        <Controls working={!!state.workingSince} resting={!!state.restingUntil} />
        <UserAlert warning={state.notification && {type:state.notification}} alertPos={AlertPos.NOTIFY}/>
        {state.workingSince && state.config.mode == Mode.ON ? 
          <RestAdjustTicker refTime={state.workingSince} typeOrMod={calcRestDuration} mode={state.config.mode}/> : 
          <RestAdjust {...msToTime(state.nextRestTime)} mode={state.config.mode}/>
        }
        <UserAlert warning={state.warning} alertPos={AlertPos.WARN}/>
      </BlockContainer>

      <BlockContainer className="OptionsBlock">
        <Options {...state.config } dark={dark} />
      </BlockContainer>

      <AccordionContainer className="TogglBlock"
        label={<TogglCollapsed logged={!!state.toggl.token} />}
        expanded={!!state.toggl.token}
      >
        {!state.toggl.token ?
          <TogglLogin loading={!state.toggl.loaded} /> :
          <TogglForm {...state.toggl.form} projects={state.toggl.projects} />
        }
        <TogglError error={typeof state.toggl.loaded == 'string' ? state.toggl.loaded  : null} />
      </AccordionContainer>
    </AppContainer>
  )
  
  /// Providers ///
  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <DispatchContext.Provider value={dispatch}>
        <PageWrapper backgroundActive={!!state.workingSince || !!state.restingUntil}>{content}</PageWrapper>
      </DispatchContext.Provider>
    </ThemeProvider>
  )
})

/// Wrappers differnt to extension/page and app fallback///
const AppFallback = ({error}:{error:Error})=>{
  const dark = usePreffersDark()
  const errorString = stringifyError(error)

  return (//TODO reuse theme from state?
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <PageWrapper>
        <Fallback errorString={errorString} />
      </PageWrapper>
    </ThemeProvider>
  )
}

/// Optinal element for web-page ///
const PageWrapper = ({children, backgroundActive=false}:{children:ReactNode, backgroundActive?:boolean})=>{
  return EXTENSION ? <>{children}</> :
    <PageContainer backgroundActive = {backgroundActive}>
      <PageHeader/>
        {children}
      <PageDesc/>
    </PageContainer>
}

/// Setup : background and render with Error-boundary ///
if(!EXTENSION){// If its not loaded in other batch
  backgroundSetup()
}

createRoot(document.getElementById('appRoot') as Element).render(
  <ErrorBoundary 
    FallbackComponent={AppFallback}
    onError={()=>EXTENSION && window.addEventListener('unload', ()=>reload())}
  >
    <App/>
  </ErrorBoundary>
)
