import React, { useState, useEffect, useCallback, ReactNode, memo} from 'react'
import {createRoot} from 'react-dom/client'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import {produce as immer} from 'immer'
import {ThemeProvider} from '@mui/material/styles'

import { State, AlarmType, Mode, UserAlertType, Status, ErrorInfo, UserWarning} from './modules/types'
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
  CounterTicker, 
  RestAdjustTicker
} from './modules/components/'
import {
  reload,
  errorSave,
  errorGet,
  usePreffersDark, 
  iconTitleChange,
  stateGet, 
  stateSave, 
  alarmGet, 
  alarmSave, 
  togglApiAdd,
  togglApiDisconnect, 
  togglApiConnect,
  askPermission,
  checkPermission
} from './modules/service'
import {useAsyncEffect, timeToMs, msToTime, stringifyError} from './modules/utils'
import {lightTheme, darkTheme} from './modules/themes'
import {EXTENSION, MAX_REST, MIN_REST, DEFAULT_STATE} from "./settings"
import TEXT from './modules/text'
import eventManager, {Action, Message} from "./modules/events"
import setUpBackground from './modules/backgroundSetup'

const App = () => {
  const [state, setState] = useState<State|null>(null)
  /// On first render, no state is present, so state retrieved from storage. Subsequent renders, state saved to storage every time it's changed ///
  useAsyncEffect(async()=>{
    !state ?
      setState(await stateGet() || DEFAULT_STATE) :
      stateSave(state)
  },[state])
 return state ? 
   <AppContent {...{state,setState}}/> : 
   EXTENSION ? null : <AppPlaceholder/>
}

type SetStateT = React.Dispatch<React.SetStateAction<State|null>>
const AppContent = memo(({state,setState}:{state:State, setState:SetStateT}) => {
  /**Immer will pass fresh state to cb to be changed immutably, used for async state changes */
  const setStateWithImmer = (cb:(freshState :State)=>void)=>{
    setState(oldState=>immer(oldState,cb))
  }
  const crash = useErrorHandler()
  
  /// State managment ///
  /**To be passed down as callback to components */
  const dispatch = useCallback(
    (action:Action)=>{eventManager.emit('action',action)}
  ,[])
  
  // Updates listener every time state changes so onAction has access to up-to-date state through its closure 
  useEffect(()=>{
    return eventManager.on('action',onAction)
  },[state])
  
  // Separate state with more pure setter, so new error won't trigger some endless loop (like saver error triggers state resave)
  const [errorWarning, setErrorWarning] = useState<UserWarning|null>(null)
   
  /** New notification data handler */ 
  const handleAlarm = (alarm :AlarmType) => {
    setStateWithImmer(fresh => {
      fresh.alarm = alarm
      alarm == AlarmType.WORK && 
        fresh.restingUntil && fresh.restingUntil - Date.now() < 900 && dispatch({type:'REST'})
    })
    alarmSave(null)
  }
  /** New error data handler */ 
  const handleError = (errorInfo:ErrorInfo) => {
    if(errorInfo.userMessage && (!errorWarning || errorWarning.userMessage !== errorInfo.userMessage)){
      setErrorWarning({type:'ERROR', ...errorInfo as {userMessage:string, errorJson:string}})
    }
    errorSave(null)
  }
  
  /// Gets notification and error data from storage and listens for new data ///
  useAsyncEffect(async () => {
    const [alarm, errorInfo] = await Promise.all([alarmGet(), errorGet()])
    alarm && handleAlarm(alarm)
    errorInfo && handleError(errorInfo)
  }, [])
  useEffect(()=>{
    return eventManager.on('message',(message:Message)=>{
      message.type == "ALARM" && handleAlarm(message.subType)
      message.type == "ERROR" && message.errorInfo.userMessage && handleError(message.errorInfo)
    })
  },[])

  /** Rest time based on start of work time and user set ratio. Used as util and modifier passed down to Ticker components. */
  const calcRestDuration = useCallback((workingSince:number) => {
    const result = Math.floor((Date.now() - workingSince) / state.config.ratio)
    return result < MIN_REST ? MIN_REST : result > MAX_REST ? MAX_REST : result
  },[state.config.ratio])

  /** App's main action handler *///
  const onAction = (action: Action) => {
    try{
      setState(immer(state, fresh=>{// Immer modifies state object imutably
        /// Async logic extracted ///
        const pushToggl = async(start:number, end:number)=>{
          if(!state.toggl.login){return}

          const {login, form, projects} = state.toggl
          try {
            fresh.toggl.loaded = false
            await togglApiAdd(login.token, start, end, form.desc, form.projectId, 
              projects.find(p=>p.id==form.projectId)?.workspace_id ?? login.workspace)
            setStateWithImmer(fresh => {
              fresh.toggl.loaded = true
              fresh.toggl.form.saved = true
            })
          } catch (err: any) {
            setStateWithImmer(fresh => {
              fresh.toggl.loaded =  err.message //|| TEXT.TOGGL_ERROR_SAVE
              fresh.toggl.form.saved = [start,end]
            })
          }
        }
        
        /**Saves or remebers unsaved time entry based on user setting */
        const pushOrSaveLastToggl = ()=>{
          if(!state.workingSince){return}

          state.toggl.login && state.toggl.form.shouldSave ?
          pushToggl(state.workingSince, Date.now()):
          fresh.toggl.form.saved = [state.workingSince, Date.now()]
        }

        const loginToggl = async(token:string, keepForm=false)=>{
          try{
            fresh.toggl.loaded = false
            const result = await togglApiConnect(token)
            setStateWithImmer(fresh=>{
              fresh.toggl = {
                login:{token, workspace :result.workspace}, 
                projects : result.projects, 
                loaded : true, 
                form : !keepForm ? {...state.toggl.form, 
                  projectId : result.last ?? null 
                } : state.toggl.form
              }
            })
          }catch(err:any){
            setStateWithImmer(fresh=>{
              fresh.toggl.loaded = err.message //|| TEXT.TOGGL_ERROR_LOG
            })
          }
        }

        const ensurePermissionToNotify = () => {
          if(!EXTENSION && checkPermission() == 'default'){
            fresh.warning = {type:'WARNING', userMessage:TEXT.ASK_PERMISSION}
            askPermission().then(result=> result!='default' && setStateWithImmer(fresh=>{fresh.warning=null}))
          }
        }
        
        /// Main "switch" ///
        if(action.type == 'WORK' && !state.workingSince){// Start work
          fresh.restingUntil = null
          fresh.workingSince = Date.now()
          fresh.alarm = null
          
          iconTitleChange(Status.WORKING)
          state.config.pomActive && ensurePermissionToNotify()
          state.config.pomActive ? 
            eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.POM, timeout:state.config.pomTimeMins * 60e3}) :
            eventManager.emit('message',{type:"CLEAR_ALARM"})
          
          fresh.toggl.form.saved = false
      
        }else if(action.type == 'WORK' && state.workingSince){// End work
          fresh.workingSince = null
          fresh.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingSince) : state.nextRestTime
          fresh.alarm = null

          iconTitleChange(Status.IDLE)
          eventManager.emit('message',{type:"CLEAR_ALARM"})

          pushOrSaveLastToggl()

        }else if(action.type == 'REST' && !state.restingUntil){// Start rest
          const freshRestTime = state.workingSince && state.config.mode == Mode.ON ? calcRestDuration(state.workingSince) : state.nextRestTime

          fresh.workingSince = null
          fresh.restingUntil = Date.now() + freshRestTime
          fresh.nextRestTime = freshRestTime
          fresh.config.mode = state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode //state.config.mode && Mode.ON
          fresh.alarm = null
          
          iconTitleChange(Status.RESTING)
          ensurePermissionToNotify()
          eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.WORK, timeout:freshRestTime})

          state.workingSince && pushOrSaveLastToggl()

        }else if(action.type == 'REST' && state.restingUntil){// End rest
          fresh.restingUntil = null
          fresh.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingSince || Date.now()) : state.nextRestTime

          iconTitleChange(Status.IDLE)
          eventManager.emit('message',{type:'CLEAR_ALARM'})

        }else if(action.type == 'ADJUST'){
          fresh.nextRestTime = timeToMs(action.time)
          fresh.config.mode = state.config.mode == Mode.ON ? Mode.PAUSED : state.config.mode

        }else if(action.type == 'RECALC'){
          fresh.nextRestTime = calcRestDuration(state.workingSince || Date.now())
          fresh.config.mode =  state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode// TODO! or better disable when not working?

        }else if(action.type == 'CONFIG'){
          fresh.config = {...fresh.config, ...action.config}
          // Will reset pomodoro alarm of already runnig work if its settings are change
          if(fresh.workingSince && (state.config.pomActive !== fresh.config.pomActive || state.config.pomTimeMins !== fresh.config.pomTimeMins)){
            const timeout = fresh.config.pomActive ? fresh.config.pomTimeMins * 60e3 - (Date.now()-fresh.workingSince) : 0
            eventManager.emit('message', timeout > 0 ? {type:"SET_ALARM", subType:AlarmType.POM, timeout} : {type:"CLEAR_ALARM"})
          }

        }else if(action.type == 'TOGGL_IN'){
          loginToggl(action.token)

        }else if(action.type == 'TOGGL_REFRESH'){
          state.toggl.login && loginToggl(state.toggl.login.token, true)
        
        }else if(action.type == 'TOGGL_OUT'){
          fresh.toggl.login = null

          state.toggl.login && togglApiDisconnect(state.toggl.login.token)

        }else if(action.type == 'TOGGL_FORM'){
          fresh.toggl.form = {...state.toggl.form, ...action.form }

        }else if(action.type == 'TOGGL_SAVE_LAST'){
          Array.isArray(state.toggl.form.saved) && pushToggl(...state.toggl.form.saved)
        
        }else if(action.type == 'CLOSE_USER_ALERT'){
          action.alertType == UserAlertType.NOTIFY && (fresh.alarm = null)
          if(action.alertType== UserAlertType.WARN){
            fresh.warning = null
            setErrorWarning(null)
          } 
        }
      }))
    }catch(err){
      /// Catch critical error in main function and displays app fallback ///
      crash(err)
      //TODO log?
    }
  }
  
  /// UI ///
  const _preffersDark = usePreffersDark()
  const dark = state.config.dark !== null ? state.config.dark : _preffersDark 

  const content = (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        <CounterTicker refTime={state.workingSince || state.restingUntil } typeOrModifier={!!state.restingUntil ? 'DOWN' : 'UP'} />
        <Controls working={!!state.workingSince} resting={!!state.restingUntil} />
        <UserAlert warning={state.alarm && {type:state.alarm}} alertType={UserAlertType.NOTIFY}/>
        {state.workingSince && state.config.mode == Mode.ON ? 
          <RestAdjustTicker refTime={state.workingSince} typeOrModifier={calcRestDuration} appMode={state.config.mode}/> 
          : 
          <RestAdjust {...msToTime(state.nextRestTime)} appMode={state.config.mode}/>
        }
        <UserAlert warning={state.warning || errorWarning} alertType={UserAlertType.WARN}/>
      </BlockContainer>

      <BlockContainer className="OptionsBlock">
        <Options {...state.config } dark={dark} />
      </BlockContainer>

      <AccordionContainer className="TogglBlock"
        label={<TogglCollapsed logged={!!state.toggl.login} />}
        expanded={!!state.toggl.login}
      >
        {!state.toggl.login ?
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

/** Optinally wraps app for web-page and passes down prop for interative background *///
const PageWrapper = ({children, backgroundActive=false}:{children:ReactNode, backgroundActive?:boolean})=>{
  return EXTENSION ? 
    <>{children}</> 
    :
    <PageContainer backgroundActive = {backgroundActive}>
      <PageHeader/>
        {children}
      <PageDesc/>
    </PageContainer>
}

const AppFallback = ({error}:{error:Error})=>{
  const dark = usePreffersDark()
  const errorString = stringifyError(error)

  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <PageWrapper>
        <Fallback errorString={errorString} />
      </PageWrapper>
    </ThemeProvider>
  )
}

/// Setup : background and render with Error-boundary ///
if(!EXTENSION){// If its extension, it's loaded in ather batch
  setUpBackground()
}

createRoot(document.getElementById('appRoot') as Element).render(
  <ErrorBoundary 
    FallbackComponent={AppFallback}
    onError={()=>EXTENSION && window.addEventListener('unload', ()=>reload())}
  >
    <App/>
  </ErrorBoundary>
)
