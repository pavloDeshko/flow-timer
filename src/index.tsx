import React, { useState, useEffect, useMemo, useCallback, useReducer, memo, ReactNode} from 'react'
import {createRoot} from 'react-dom/client'
import {ThemeProvider} from '@mui/material/styles'
import { ErrorBoundary, useErrorHandler } from 'react-error-boundary'
import {produce as immer} from 'immer'

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
  TimeAlert,
  AppPlaceholder,
  RestAdjust
} from './modules/components'
import {CounterTicker, RestAdjustTicker} from './modules/tickers'
import {Action, State, AlarmType, Mode, Message} from './modules/types'
import {
  reload,
  errorSave,
  errorGet,
  usePreffersDark, 
  iconChange, 
  stateGet, 
  stateSave, 
  notificationGet, 
  notificationSave, 
  togglApiAdd,
  togglApiDisconnect, 
  togglApiConnect
} from './modules/service'
import {useAsyncEffect, timeToMs, msToTime} from './modules/utils'
import {lightTheme, darkTheme} from './modules/styles'
import {EXTENSION, MAX_REST, MIN_REST, DEFAULT_STATE} from "./settings"
import {ICONS} from "./modules/assets"
import eventManager from "./modules/events"
import setupBackground from "./background"

type SetStateT = React.Dispatch<React.SetStateAction<State|null>>

const App = () => {
  const [state, setState] = useState<State|null>(null)
  const crash = useErrorHandler()

  useAsyncEffect(async()=>{
    /// First render, no state is present, state retrieved ///
    if(!state){
      const [stateResult, errorResult] = await Promise.all([
        stateGet(),
        errorGet()
      ])
      errorResult ? crash(errorResult) : setState(stateResult || DEFAULT_STATE)
    /// Subsequent renders, state saved ///
    }else{
      stateSave(state)
    }
  },[state])

 return state ? 
   <AppContent {...{state,setState}}/> : 
   EXTENSION ? null : <AppPlaceholder/>
}

const AppContent = memo(({state,setState}:{state:State, setState:SetStateT}) => {
  const setStateWithImmer = (cb:(fresh :State)=>void)=>{
    setState(state=>immer(state,cb))
  }
  
  /// Main state managment ///
  const dispatch = useCallback(
    (action:Action)=>{eventManager.emit('action',action)}
  ,[])

  useEffect(()=>{
    return eventManager.on('action',onAction)
  },[state])

  /// Other handlers attached ///
  useEffect(()=>{
    return eventManager.on('message',(message:Message)=>{
      message.type == "NOTIFY" && setStateWithImmer(fresh=>{fresh.notification = message.subType})
    })
  },[])

  useEffect(()=>{
    return eventManager.on('trouble',(d)=>setStateWithImmer(fresh=>{
      fresh.warning = d.message
    }))
  },[])

  /// Notification data fetched from storage separetly///
  useAsyncEffect(async()=>{
    const notification = await notificationGet()
    setStateWithImmer(fresh=>{fresh.notification = notification})
  },[])

  const crash = useErrorHandler()
  
  /// Util and modifier function ///
  const calcRestDuration = useCallback((workingStart:number) => {
    const result = Math.floor((Date.now() - workingStart) / state.config.ratio)
    return result < MIN_REST ? MIN_REST : result > MAX_REST ? MAX_REST : result
  },[state.config.ratio])

  /// Main action handler ///
  const onAction = (action: Action) => {
    try{
      setState(immer(state,fresh=>{
        /// Async logic extracted ///
        const pushToggl = async(start:number, end:number)=>{
          if(!state.toggl.token){return}
          try {
            fresh.toggl.loaded = false
            await togglApiAdd(state.toggl.token, start, end, state.toggl.form.desc, state.toggl.form.projectId)
            setStateWithImmer(fresh => {
              fresh.toggl.loaded = true//TODO !
              fresh.toggl.form.unsaved = null
            })
          } catch (err: any) {
            setStateWithImmer(fresh => {
              fresh.toggl.loaded = err.message || 'Problems with reaching Toggl :('//TODO log error here
            })
          }
        }

        const pushOrSaveLastToggl = ()=>{
          if(!state.workingStart){return}

          state.toggl.token && state.toggl.form.shouldSave ?
          pushToggl(state.workingStart, Date.now()):
          fresh.toggl.form.unsaved = [state.workingStart, Date.now()]
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
                form : {...state.toggl.form, projectId : result.last || null}// TODO assign?
              }
            })
          }catch(err:any){
            setStateWithImmer(fresh=>{
              fresh.toggl.loaded = err.message || "Can't log into Toggl :("
            })
          }
        }

        const clearNotify = async()=>{
          fresh.notification = null
          notificationSave(null)
        }
        
        /// Main "switch" ///
        if(action.type == 'WORK' && !state.workingStart){
          fresh.restingTarget = null
          fresh.workingStart = Date.now()
          
          fresh.toggl.form.unsaved = null
          
          iconChange(ICONS.WORK)
          clearNotify()
          state.config.pomActive && eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.POM, timeout:state.config.pomTime})//TODO is pomtime in ms?
      
        }else if(action.type == 'WORK' && state.workingStart){
          fresh.workingStart = null
          fresh.nextRestTime = state.config.mode == Mode.ON ? calcRestDuration(state.workingStart) : state.nextRestTime
      
          pushOrSaveLastToggl()

          iconChange(ICONS.DEFAULT)
          clearNotify()
          eventManager.emit('message',{type:"CLEAR_ALARM"})

        }else if(action.type == 'REST' && !state.restingTarget){
          const freshRestTime = state.workingStart && state.config.mode == Mode.ON ? calcRestDuration(state.workingStart) : state.nextRestTime

          fresh.workingStart = null
          fresh.restingTarget = Date.now() + freshRestTime
          fresh.nextRestTime = freshRestTime
          fresh.config.mode = state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode //state.config.mode && Mode.ON
          
          state.workingStart && pushOrSaveLastToggl()

          iconChange(ICONS.REST)
          clearNotify()
          eventManager.emit('message',{type:"SET_ALARM", subType:AlarmType.WORK, timeout:freshRestTime})

        }else if(action.type == 'REST' && state.restingTarget){
          fresh.restingTarget = null

          iconChange(ICONS.DEFAULT)
          eventManager.emit('message',{type:'CLEAR_ALARM'})

        }else if(action.type == 'ADJUST'){
          fresh.nextRestTime = timeToMs(action.time)
          fresh.config.mode = state.config.mode == Mode.ON ? Mode.PAUSED : state.config.mode

        }else if(action.type == 'RECALC'){
          fresh.nextRestTime = state.workingStart ? calcRestDuration(state.workingStart) : state.nextRestTime
          fresh.config.mode =  state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode

        }else if(action.type == 'CONFIG'){
          fresh.config = {...fresh.config, ...action.config} //TODO assign?

        }else if(action.type == 'TOGGL_IN'){
          loginToggl(action.token)

        }else if(action.type == 'TOGGL_OUT'){
          fresh.toggl.token = null

          state.toggl.token && togglApiDisconnect(state.toggl.token)

        }else if(action.type == 'TOGGL_FORM'){
          fresh.toggl.form = {...state.toggl.form, ...action.form } //TODO assign?

        }else if(action.type == 'TOGGL_SAVE_LAST'){
          state.toggl.form.unsaved && pushToggl(...state.toggl.form.unsaved)

        }else if(action.type == 'CLOSE_NOTIFY'){
          clearNotify()
        }
      }))
    }catch(err){
      crash(action)
    }
  }
  
  /// UI ///
  const preffersDark = usePreffersDark()
  const theme = state.config.dark == null ?
    preffersDark ? darkTheme : lightTheme :
    state.config.dark ? darkTheme : lightTheme

  const content = (
    <AppContainer>
      <BlockContainer className="CounterBlock" stacked>
        {/*<Legend {...{workingStart : !!state.workingStart, restingTarget : !!state.restingTarget}}/>*/}
        <CounterTicker refTime={state.workingStart || state.restingTarget } type={!!state.restingTarget ? 'DOWN' : 'UP'} />
        {/*<Counter {...state.time} /> */}
        <Controls working={!!state.workingStart} resting={!!state.restingTarget} />
        {state.workingStart && state.config.mode == Mode.ON ? 
          <RestAdjustTicker refTime={state.workingStart} type={calcRestDuration} mode={state.config.mode}/> : 
          <RestAdjust {...msToTime(state.nextRestTime)} mode={state.config.mode}/>
        }
        <TimeAlert type={state.notification} />
      </BlockContainer>

      <BlockContainer className="OptionsBlock">
        <Options {...state.config} />
      </BlockContainer>

      <AccordionContainer className="TogglBlock"
        label={<TogglCollapsed logged={!!state.toggl.token} />}
        expanded={!!state.toggl.token}
      >
        {!state.toggl.token ?
          <TogglLogin loading={!state.toggl.loaded} /> ://TODO true when eror
          <TogglForm {...state.toggl.form} projects={state.toggl.projects} />
        }
        <TogglError error={typeof state.toggl.loaded == 'string' ? state.toggl.loaded  : null} />
      </AccordionContainer>
      {/* userWaring goes here TODO  */}
    </AppContainer>
  )
  
  /// Providers ///
  return (
      <DispatchContext.Provider value={dispatch}>
        <ThemeProvider theme={theme}> 
          {EXTENSION ? content : <PageWrapper> {content} </PageWrapper>}
        </ThemeProvider>
      </ DispatchContext.Provider>
  )
})

/// Stuff to differ from extension/page and wrap app accordingly, also fallback///
const AppFallback = ({error}:{error:Error})=>{
  const dark = usePreffersDark()
  return(//TODO reuse theme from state?
  <ThemeProvider theme={dark ? darkTheme : lightTheme}>
    {EXTENSION ? 
      <Fallback error={error}/> : 
      <PageWrapper>
        <Fallback error={error}/>
      </PageWrapper>
    }
  </ThemeProvider>)
}

const PageWrapper = ({children}:{children:ReactNode})=>(
  <PageContainer>
    <PageHeader/>
      {children}
    <PageDesc/>
  </PageContainer>
)

if(!EXTENSION){// If its not loaded in several batches
  setupBackground()
}

const handleError = (error:Error, info:{componentStack:string})=>{
   errorSave(error) //TODO where component stack goes?
   EXTENSION && window.addEventListener('unload', ()=>reload())// TODO not persistent at all
}

createRoot(document.getElementById('appRoot') as Element).render(
  <ErrorBoundary 
    FallbackComponent={AppFallback}
    onError={handleError}
  >
    <App/>
  </ErrorBoundary>
)


/*   //TOGGL APP ACTIONS

  
  toggl_RetroSave = async ()=> {
    const form = this.state.toggl.form, login = this.state.toggl.login 
    if(login.token && form.unsaved){
      try{
        login.loading = true
        this.out_Dispatch()
        await togglApiAdd( login.token, form.unsaved.start, form.unsaved.end, form.desc, form.projectId)
        login.error = null
      }catch(e:any){
        this.out_Toggl_Error(e)
      }finally{
        login.loading = false
        form.unsaved = null
        this.out_SaveStorage()//to save form
        this.out_Dispatch()
      }
    }else{
      log.bug('Inavild retrosaved action recieved',{token:login.token, unsaved:form.unsaved})
    }
  }
  
 */
/*   toggl_Save = async ()=> {
    const form = this.state.toggl.form, login = this.state.toggl.login
    if(!this.state.workingStart){
      log.bug('invalid toggle save',this.state)
      return
    }

    if(form.shouldSave && login.token){
      try{
        login.loading = true
        this.out_Dispatch()
        await togglApiAdd( login.token, this.state.workingStart, Date.now(), form.desc, form.projectId)
        login.error = null
      }catch(e:any){
        this.out_Toggl_Error(e)
      }finally{
        login.loading = false
        form.unsaved = null
        this.out_SaveStorage()//to save form
        this.out_Dispatch()
      }
    }else{
      form.unsaved = {start: this.state.workingStart, end: Date.now()}
    } 
  }
      out_Toggl_Error = (e:any) => {
    const message :string = typeof e.message == 'string' ? e.message : settings.ERROR_MESSAGE
    this.state.toggl.login.error = message
    log.error("Toggl network error",e,this.state)
  }
  
  
  */

/*
const onAction = (state :State|null, action :Action) :State|null => { // TODO or usefreeze?
  if(!('type' in action)){
    log.bug('Unknown object at popup port', action)
  } //TODO log bugf
  if (!state) return null // TODO handle initial state somehow?

  let freshState = state
  switch (action.type){
    case 'WORK':{
      // Start work
      if (!state.workingStart) {
        iconChange(ICONS.WORK)
        freshState =  {
          ...state,
          restingTarget : null,
          workingStart : Date.now()
          //Pom timer? DOTO // this.pomTimer.down({...ZERO_TIMER,...{minutes:this.state.config.pomTime}})
          //TOGL unsaved = null. state is too nestet TODO // this.state.toggl.form.unsaved = null
        }
      // Stop work
      }else{
        iconChange(ICONS.DEFAULT)
        freshState = {
          ...state,
          workingStart : null,
          nextRestTime: state.config.mode == Mode.ON ? getRestTime(state) : state.nextRestTime
          //pom timer // this.pomTimer.reset()
          // toggl save TODO //this.toggl_Save()
        }
      }
      break
    }
    case 'REST':{
      // Start rest
      if (!state.restingTarget) {
        iconChange(ICONS.REST)
        const freshRestTime = state.workingStart && state.config.mode == Mode.ON ? getRestTime(state) : state.nextRestTime
        freshState = { ...state,
          // this.state.workingStart && this.toggl_Save() TODO
          workingStart: null,
          restingTarget: Date.now() + freshRestTime,
          // Pom timer reset TODO // this.pomTimer.reset()
          nextRestTime: freshRestTime,
          config: {...state.config,
            mode: state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode//state.config.mode && Mode.ON
          }
        }
      // Stop rest
      }else{
        iconChange(ICONS.DEFAULT)
        freshState = {...state,
          restingTarget : null
        }
      }
      break
    }
    case 'ADJUST': {
      freshState = {...state,
        nextRestTime: timeToMs(action.time),
        config: {...state.config,
          mode: state.config.mode == Mode.ON ? Mode.PAUSED : state.config.mode
        }
      }
      break
    }
    case 'RECALC': {
      freshState = {...state,
        nextRestTime: getRestTime(state), 
        config: {...state.config,
          mode: state.config.mode == Mode.PAUSED ? Mode.ON : state.config.mode
        }
      }
      break
    }
    case 'CONFIG':{
      //const shouldUpdateNextRest =  action.config.mode == Mode.ON  && // TODO its partial!!!
        //(state.config.ratio != action.config.ratio  ||  state.config.mode == Mode.OFF )
      freshState = {...state,
        config: {...state.config, ...action.config}, //TODO fix
        //nextRestTime: shouldUpdateNextRest ? getRestTime() : state.nextRestTime // TODO recalculate rest time
      }
      break
    }
    case 'TOGGL_IN':
      //this.toggl_Connect(action.token)
      break
    case 'TOGGL_OUT':
      //this.toggl_Disconnect()
      break
    case 'TOGGL_FORM':
      //this.state.toggl.form = {...this.state.toggl.form, ...action.form}
      //this.out_Dispatch()
      break
    case 'TOGGL_SAVE_LAST':
      //this.toggl_RetroSave()
      break
    default:
      //let _check :never = action
      log.bug('Unknown object at background port', action)
  }

  return freshState
}
*/