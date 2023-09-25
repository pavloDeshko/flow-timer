import wretch from 'wretch'
import favicon from 'favicon.js' //write @types TODO
import useMediaQuery from '@mui/material/useMediaQuery'
import debounce from '@mui/material/utils/debounce'
import  { z, ZodSchema } from 'zod'
import {useState} from 'react'

import {
  Toggl_Entry_Params,
  Toggl_Auth,
  Toggl_Me,
  Toggl_Me_Schema,
  AlarmType, Notification_Schema, AlarmId,
  IconObject,
  State,
  State_Schema,
  AlarmId_Schema,
  Error_Info
} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME, EXTENSION} from '../settings'
import {stringifyError} from './utils'
import {ICONS, SOUNDS} from './assets'
import TEXT from './text'
import eventManager from './events'

export const dispatchError = (info:Error_Info)=>{
  eventManager.emit('message',{type:'ERROR', info})
}

/// Network relatede stuff ///
const w = wretch()
  .url(TOGGL_URL)

const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${auth}:api_token` : `${auth.user}:${auth.pass}`)

const reTogglError = (userMessage:string) => (err:Error):never => {
  dispatchError({errorJson: stringifyError(err)})
  throw new Error(userMessage)
}

export const togglApiConnect = async (credential :Toggl_Auth) => {
  const data = await w.url(TOGGL_USER_URL)
  .auth(getAuth(credential))
  .get()
  .forbidden(reTogglError(TEXT.TOGGL_ERROR_TOKEN))
  .fetchError(reTogglError(TEXT.TOGGL_ERROR_NETWORK))
  .json()

  try {
    const valid = Toggl_Me_Schema.parse(data)
    return {
      projects: valid.data.projects.map(p => ({ id: p.id, name: p.name })),
      last: valid.data.time_entries[0]?.pid
    }
  }catch(err: any) {
    throw reTogglError(TEXT.TOGGL_ERROR_COMPAT)(err)
  }
}

export const togglApiDisconnect = async (credential :Toggl_Auth) => {
  // api call to end sessino goes here (none needed)
}

export const togglApiAdd = async (credential :Toggl_Auth, start :number, stop :number, description :string, project :number | null) => {
  const data : Toggl_Entry_Params = {time_entry:{
    start: new Date(start).toISOString(),
    duration: Math.floor((stop - start)/1e3),
    //stop: new Date(stop).toISOString(),
    description,
    created_with: CLIENT_NAME,
    pid: project != null ? project : undefined
  }}

  w.url(TOGGL_ADD_URL)
    .auth(getAuth(credential))
    .post(data)
    .unauthorized(reTogglError(TEXT.TOGGL_ERROR_AUTH))
    .fetchError(reTogglError(TEXT.TOGGL_ERROR_NETWORK))
    .res()
}

/// chrome related stuff ///
export const iconChange = (path : string | IconObject)=> {
  EXTENSION ? chrome.action.setIcon({path}) : favicon.change(typeof path == 'string' ? path : path[16]) 
}

export const reload = ()=>{ EXTENSION ? chrome.runtime.reload() : location.reload()}

export const usePreffersDark:(()=>boolean) = ()=> useState(useMediaQuery('(prefers-color-scheme: dark)'))[0]

/// Storage related funcs ///
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
      (data = JSON.stringify((await chrome.storage.session.get(key))[key]))
  }
  return data
}

type SaveGet<T> = {save:(data:T|null)=>Promise<void>, get:()=>Promise<T|null>}
const makeSaveGet = <T>(key:string, schema:ZodSchema<T>, session = false):SaveGet<T>=>{
  return {
    save : async(data)=>{
      try{
        await setToStorage(key, data, session)
      }catch(err:any){
        //err.message = `Erorr saving to storage on key ${key}: ` + (err.message||'')//TODO! ?
        dispatchError({errorJson: stringifyError(err), userMessage: TEXT.STORAGE_ERROR_SAVE})
      }
    },

    get : async()=>{
      try{
        const data = await getFromStorage(key, session)
        return data ? schema.parse(data) : null
      }catch(err:any){
        //err.message = `Erorr getting from storage or parsing on key ${key}: ` + (err.message||'') //TODO ?
        dispatchError({ errorJson: stringifyError(err), userMessage: TEXT.STORAGE_ERROR_GET})
        return null
      }
    }
  }
}

export const {save : _stateSave, get : stateGet} = makeSaveGet<State>('STORAGE_STATE_KEY',State_Schema)
export const stateSave = debounce(_stateSave,100)
export const {save : notificationSave, get : notificationGet} = makeSaveGet<AlarmType>('STORAGE_NOTIFICATION_KEY',Notification_Schema)
export const {save : alarmSave, get : alarmGet} = makeSaveGet<AlarmId>('STORAGE_ALARM_KEY',AlarmId_Schema)
export const {save : errorSave, get : errorGet} = makeSaveGet<Error_Info>('STORAGE_ERROR_KEY', z.any(), true)

/// Alarms related functions ///
let workAudio :HTMLAudioElement, pomAudio :HTMLAudioElement, retries = 5
const loadAudio = () => {
  workAudio = new window.Audio(SOUNDS.WORK)
  pomAudio = new window.Audio(SOUNDS.POM)
}
window.Audio && loadAudio()

export const notify = async(type:AlarmType)=>{
  const pomodoro = type == AlarmType.POM

  ;(pomodoro ? pomAudio : workAudio)?.play().catch((err:Error)=>{
    if(retries){
      loadAudio()
      setTimeout(()=>notify(type), 1000)
      retries -= 1
    }else{
      dispatchError({ errorJson: stringifyError(err), userMessage:TEXT.NOTIFY_ERROR_SOUND})
    }
  })

  try{
    EXTENSION ? await chrome.notifications.create({
      type: 'basic',
      silent: false,
      title: pomodoro ? TEXT.NOTIFY_POM_TITLE : TEXT.NOTIFY_WORK_TITLE,
      message: pomodoro ? TEXT.NOTIFY_POM_MESSAGE : TEXT.NOTIFY_WORK_MESSAGE,
      iconUrl: chrome.runtime.getURL(pomodoro ? ICONS.POM_ALERT : ICONS.WORK_ALERT)
  }) : ()=>{} //TODO! implement web notification
  }catch(err:any){
    dispatchError({errorJson: stringifyError(err), userMessage:TEXT.NOTIFY_ERROR})
  }
}
