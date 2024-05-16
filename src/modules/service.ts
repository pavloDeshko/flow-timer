import wretch, {WretcherError} from 'wretch'
import favicon from 'favicon.js' //write @types TODO
import useMediaQuery from '@mui/material/useMediaQuery'
import debounce from '@mui/material/utils/debounce'
import  { ZodType, input, ZodTypeAny } from 'zod'
import {useState} from 'react'

import {
  Toggl_Entry,
  Toggl_Auth,
  Toggl_Me_Schema,
  AlarmType, AlarmType_Schema, AlarmId,
  State,
  State_Schema,
  ErrorInfo,
  Status,
  Error_Info_Schema,
} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME, EXTENSION, APP_WIDTH} from '../settings'
import { deObfuscate, text} from './utils'
import {ICONS, SOUNDS} from './assets'
import eventManager, {dispatchError, isConnected, WORKER} from './events'
import retry from './retry'

export const userifyError = (err:Error,userMessage:string):Error=>{
  dispatchError(err, null)
  return new Error(userMessage)
}

/// Network relatede stuff ///
const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${deObfuscate(auth)}:api_token` : `${auth.user}:${deObfuscate(auth.pass)}`)//TODO ?

const w = wretch()
  .url(TOGGL_URL)
  .content('application/json')

export const togglApiConnect = async (credential :Toggl_Auth) => {
  const data = await w.url(TOGGL_USER_URL)
  .auth(getAuth(credential))
  .get()
  .json()
  .catch((err:WretcherError)=>{
    const message = 
      err.status == 403 ? text('TOGGL_ERROR_TOKEN') :
      err.status == 249 ? text('TOGGL_TOO_MANY') :
      text('TOGGL_ERROR_CONNECT')
    throw userifyError(err, message)
  })

  try {
    const valid = Toggl_Me_Schema.parse(data)
    return {
      workspace: valid.default_workspace_id,
      projects: valid.projects.filter(p=>p.active).map(({id,name,workspace_id,color}) => ({id,name,workspace_id,color})),
      last: valid.time_entries[0]?.project_id
    }
  }catch(err: any) {
    throw userifyError(err, text('TOGGL_ERROR_COMPAT',{TOGGL_RELOAD: text(EXTENSION ? 'TOGGL_RELOAD_EXT':'TOGGL_RELOAD_WEB')})) //TODOt
  }
}

export const togglApiDisconnect = async (credential :Toggl_Auth) => {
  // api call to end sessino goes here (none needed) TODO
}

export const togglApiAdd = async (credential :Toggl_Auth, start :number, stop :number, description :string, project :number | null,  workspace_id :number,) => {
  const data : Toggl_Entry= {
    start: new Date(start).toISOString(),
    duration: Math.floor((stop - start)/1e3),
    //stop: new Date(stop).toISOString(),
    description,
    created_with: CLIENT_NAME,
    project_id: project != null ? project : undefined,
    workspace_id
  }

  await w.url(TOGGL_ADD_URL(workspace_id))
    .auth(getAuth(credential))
    .post(data)
    .res()
    .catch((err:WretcherError)=>{
      const message = 
        err.status == 403 ? text('TOGGL_ERROR_AUTH') :
        err.status == 249 ? text('TOGGL_TOO_MANY') :
        text('TOGGL_ERROR_ADD')
      throw userifyError(err, message)
    })
}

/// Chrome related stuff ///
export const iconTitleChange = (status:Status)=>{
  const title = 
    (status == Status.RESTING ? text('RESTING_PRE'):
    status == Status.WORKING ? text('WORKING_PRE') :
    '') + text('APP_TITLE')
  EXTENSION ? chrome.action.setTitle({title}) :(document.title = title)
  
  const icon = 
    status == Status.RESTING ? ICONS.REST:
    status == Status.WORKING ? ICONS.WORK :
    ICONS.DEFAULT
  EXTENSION ? 
    chrome.action.setIcon({path:icon}) : 
    favicon.change(typeof icon == 'string' ? icon : icon[16])
}

export const reload = ()=>{ EXTENSION ? chrome.runtime.reload() : location.reload()}

/// Storage related stuff ///
const setToStorage = async (key :string, value :unknown, forSessionOnly = false)=>{
  if (!forSessionOnly) {
    EXTENSION ?
      await chrome.storage.local.set({ [key]: value as any}) :
      localStorage.setItem(key, JSON.stringify(value))
  } else {
    EXTENSION && chrome.storage.session &&
      await chrome.storage.session.set({ [key]: value })
  }
}
const getFromStorage = async (key: string, forSessionOnly = false): Promise<unknown> => {
  let data :unknown = null
  if (!forSessionOnly) {
    data = EXTENSION ?
      (await chrome.storage.local.get(key))[key] :
      JSON.parse(localStorage.getItem(key)||String(null))
  } else {
    EXTENSION && chrome.storage.session &&
      (data = (await chrome.storage.session.get(key))[key])
  }
  return data
}

type _SaveGet<T> = {save:(data:T|null)=>Promise<void>, get:()=>Promise<T|null>}
const _makeSaveGet = <T>(key:string, schema:ZodType<T,any,input<ZodTypeAny>>, {keepSilent=false, session=false}={}):_SaveGet<T>=>{
  return {
    save : async(data)=>{
      try{
        await setToStorage(key, data, session)
      }catch(err:any){
        !keepSilent && dispatchError(err, text('STORAGE_ERROR_SAVE'))
      }
    },

    get : async()=>{
      try{
        const data = await getFromStorage(key, session)
        return data ? schema.parse(data) : null
      }catch(err:any){
        !keepSilent && dispatchError(err, text('STORAGE_ERROR_GET'))
        return null
      }
    }
  }
}

export const {save : _stateSave, get : stateGet} = _makeSaveGet<State>('STORAGE_STATE_KEY', State_Schema)
export const stateSave = debounce(_stateSave,100)
export const {save : alarmSave, get : alarmGet} = _makeSaveGet<AlarmType>('STORAGE_ALARM_KEY',AlarmType_Schema)
//export const {save : alarmIdSave, get : alarmIdGet} = _makeSaveGet<AlarmId>('STORAGE_ALARM_ID_KEY',AlarmId_Schema)
export const {save : errorSave, get : errorGet} = _makeSaveGet<ErrorInfo>('STORAGE_ERROR_KEY', Error_Info_Schema, {keepSilent:true, session:true})

/// Alarms related functions ///
const ID = 'FLOW_TIMER_NOTIFICATION'
export const notify = async(type:AlarmType)=>{
  const pomodoro = type == AlarmType.POM;
  
  if(window.Audio){
    playAudio(pomodoro)
  }else if(EXTENSION){
    playAudioInWindow(pomodoro)
  }
  
  try{
    if(EXTENSION){
      await chrome.notifications.clear(ID)
      await chrome.notifications.create(// hell it's needed - async error want' be caught otherwise
        ID,
        {
          type: 'basic',
          silent: false,
          title: pomodoro ? text('NOTIFY_POM_TITLE') : text('NOTIFY_WORK_TITLE'),
          message: pomodoro ? text('NOTIFY_POM_MESSAGE') : text('NOTIFY_WORK_MESSAGE'),
          iconUrl: chrome.runtime.getURL(pomodoro ? ICONS.POM_ALERT : ICONS.WORK_ALERT),
/*           buttons: pomodoro ? 
            [{title : text('STOP_WORK')}, {title : text('REST')}] :
            [{title : text('WORK')}, {title : text('STOP_REST')}] */
        }
      )
    }else if(window.Notification?.permission == 'granted' ){
      new window.Notification(
        pomodoro ? text('NOTIFY_POM_TITLE') : text('NOTIFY_WORK_TITLE'),
        {
          body:pomodoro ? text('NOTIFY_POM_MESSAGE') : text('NOTIFY_WORK_MESSAGE'),
          icon: pomodoro ? ICONS.POM_ALERT : ICONS.WORK_ALERT,
          tag:ID,
          renotify:true
          //actions:[{action:'BLA',title:'start work'}]
        }
      )
    }
  }catch(err:any){
    dispatchError(err, text('NOTIFY_ERROR'))
  }
}

/* if(EXTENSION && WORKER){
  chrome.notifications.onButtonClicked.addListener(((id,i)=>{
    eventManager.emit('')
  }))
}else if(!EXTENSION){

} */

//Could be used by web page or opened popup 
let workAudio :HTMLAudioElement, pomAudio :HTMLAudioElement
const loadAudio = () => {
  workAudio = new window.Audio(SOUNDS.WORK)
  pomAudio = new window.Audio(SOUNDS.POM)
}
window.Audio && loadAudio()

const playAudio = (pomodoro :boolean) => {
  retry(// The were some errors in loading audio from the first time for no apparent reason
    async()=>(pomodoro ? pomAudio : workAudio)!.play(),
    loadAudio,
    (err)=>dispatchError((err as Error), text('NOTIFY_ERROR_SOUND'))
  )
}

//Used for extension - tryies to open new window or tab to play audio 
const playAudioInWindow = async(pomodoro :boolean) => {
  const currentWindow = await chrome.windows.getCurrent()
  const url = 'alertSound.html?type=' + (pomodoro ? 'pom' : 'work')

  if(currentWindow.focused || isConnected()){
    chrome.windows.create({// open and close new window to play sound
      type: "popup",
      focused: true,
      height: 1,width: 1, left: currentWindow.left,
      top: Math.trunc((currentWindow.top||1)+(currentWindow.height||1)*0.9), 
      url
    })
  }else{
    await chrome.tabs.create({// open and close new tab to play sound
      active:true,
      index: (await chrome.tabs.query({active:true, currentWindow:true}))[0]?.index,
      url
    }) 
  }
}

//Notification permissions for Web page 
export const checkPermission = ()=> window.Notification?.permission || null
export const askPermission = async ()=>{
  return window.Notification?.permission == 'default' ? Notification.requestPermission() : Promise.resolve(null)
}

/// Some media queries ///
export const usePreffersDark:(()=>boolean) = ()=> useState(useMediaQuery('(prefers-color-scheme: dark)'))[0]

const _isNarrowQ = `(max-width:${APP_WIDTH}px)`
export const isNarrowQ = `@media ${_isNarrowQ}`
export const useIsNarrow = ()=>useMediaQuery(_isNarrowQ)