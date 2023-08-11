import wretch from 'wretch'
import favicon from 'favicon.js' //write @types TODO
import {serializeError, deserializeError} from 'serialize-error'
import useMediaQuery from '@mui/material/useMediaQuery'
import { debounce } from '@mui/material/'

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
  Error_Info_Schema
} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME, EXTENSION} from '../settings'
import {log, useFreeze} from './utils'
import {ICONS, SOUNDS} from './assets'
import eventManager from './events'

/* const storage = EXTENSION ? 
  {get : browser.storage.local.get, set : browser.storage.local.set} : 
  {
    get: 
     (keys :string[]) => keys.map(k=>localStorage.getItem(k)), 
    set: 
      () => localStorage.setItem
  } 
const ICON = ''
const NOTIFICATION = ''*/


/// Network relatede stuff ///
const w = wretch()
  .url(TOGGL_URL)

const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${auth}:api_token` : `${auth.user}:${auth.pass}`)

const handleToggl403 = (err :Error) => {
  log.error(err,'403 on trying to connect to Toggl')
  throw new Error('Looks like your toggl credentials are wrong :(')
}
const handleTogglOther = (err :Error) => {
  log.error(err,'Error on trying to reach to Toggl')
  throw new Error(`Can't reach out to Toggl :(`)
}
const handleInvalidData = (err :Error) => {
  log.error(err, 'Error on parsing data from Toggl')
  throw new Error(`Can't make sence of data from Toggl :( Updating extension might help..`)
}
 
export const togglApiConnect = async (credential :Toggl_Auth) => {
  return w.url(TOGGL_USER_URL)
    .auth(getAuth(credential))
    .get()
    .unauthorized(handleToggl403)
    .fetchError(handleTogglOther)
    .json(
      (d :unknown) => {
        const valid = Toggl_Me_Schema.parse(d)
        return {
          projects: valid.data.projects.map(p => ({id: p.id, name: p.name})),
          last: valid.data.time_entries[0]?.pid
        }
      }
    )
    .catch(handleInvalidData)
}

export const togglApiDisconnect = async (credential :Toggl_Auth) => {
  // api call to end sessino goes here
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
    .unauthorized(handleToggl403)
    .res().catch(handleTogglOther)
}

/// Browser related stuff ///
export const iconChange = (path : string | IconObject)=> {
  EXTENSION ? browser.browserAction.setIcon({path}) : favicon.change(typeof path == 'string' ? path : path[16])
}

export const reload = ()=>{ EXTENSION ? browser.runtime.reload() : location.reload()}

export const usePreffersDark = ()=> useFreeze(useMediaQuery('(prefers-color-scheme: dark)'))


/// Storage related funcs ///

const setToStorage = async (key :string, value :string, session = false)=>{
  try{
    if(EXTENSION && session){
      chrome.storage.session && await chrome.storage.session.set({key : value})
    }else{
      EXTENSION ?
        await browser.storage.local.set({key : value})://TODO add validation here?
        localStorage.setItem(key, value)
    }
    log.debug('Saved to storage.',value)
  }catch(err:any){
    eventManager.emit('trouble',{type:"ERROR",message: "Can't save critical data :( Your app may misbehave..", error: err})
    //throw new Error(`Can't save date data storage on key ${key} :(`)
  }finally{
    return Promise.resolve()
  }
}
const getFromStorage = async (key :string, session = false):Promise<string>=>{
  try{
    let data = null
    if(EXTENSION && session){
      chrome.storage.session && await chrome.storage.session.get([key])
    }else{
      data = EXTENSION ? 
        await browser.storage.local.get([key]):
        localStorage.getItem(key)
    }
    data && log.debug('Retrieved from storage: ', data)
    return JSON.stringify(data)
  }catch(err:any){
    eventManager.emit('trouble',{type:"ERROR",message: "Can't retrive critical data :( Your app may misbehave..", error: err})
    return JSON.stringify(null)
    //throw new Error(`Problems trying to get data from storage on key ${key} :/`) 
  }
}


const STORAGE_STATE_KEY = 'STORAGE_STATE_KEY'
export const stateSave = debounce(async(state :State)=>{
  return setToStorage(STORAGE_STATE_KEY, JSON.stringify(state))
},100)
export const stateGet = async():Promise<State|null>=>{
  try{
    const data = JSON.parse(await getFromStorage(STORAGE_STATE_KEY))
    return data ? State_Schema.parse(data) : null
  }catch(err:any){
    eventManager.emit('trouble',{type:"ERROR",message: "Seems like saved data was corrupted :( Your app may misbehave..", error:err})
    return null
  }
}

const STORAGE_NOTIFICATION_KEY = 'STORAGE_NOTIFICATION_KEY'
export const notificationSave = (type: AlarmType | null)=>{ // TODO or better delete key?
  return setToStorage(STORAGE_NOTIFICATION_KEY, JSON.stringify(type))
}
export const notificationGet = async ():Promise<AlarmType | null>=>{
  try{
    const data = JSON.parse(await getFromStorage(STORAGE_NOTIFICATION_KEY))
    return data ? Notification_Schema.parse(data) : null
  }catch(err:any){
    eventManager.emit('trouble',{type:"ERROR",message:"Seems like saved data was corrupted :( Your app may misbehave..", error:err})
    return null
  }
}

// Used by background script to save and get alarms id
const STORAGE_ALARM_KEY = 'STORAGE_ALARM_KEY'
export const alarmSave = (id: AlarmId | null)=>{ // TODO or better delete key?
  return setToStorage(STORAGE_ALARM_KEY, JSON.stringify(id))
}
export const alarmGet = async ():Promise<AlarmId | null >=>{
  try{
    const data = JSON.parse(await getFromStorage(STORAGE_ALARM_KEY))
    return data ? AlarmId_Schema.parse(data) : null
  }catch(err:any){
    eventManager.emit('trouble',{type:"ERROR",message: "Seems like saved data was corrupted :( Your app may misbehave..", error:err})
    return null
  }
}

const STORAGE_ERROR_KEY = 'STORAGE_ERROR_KEY'
export const errorSave = async(err:Error)=>{
  return setToStorage(STORAGE_ERROR_KEY, JSON.stringify(err), true)
}
export const errorGet = async()=>{
  try{
    const data = JSON.parse(await getFromStorage(STORAGE_ERROR_KEY, true))
    return data ? Error_Info_Schema.parse(data) : null
  }catch(err:any){
    //eventManager.emit('trouble',{type:"ERROR",message: "Seems like saved data was corrupted :( Your app may misbehave..", error:err})TODO ?
    return null
  }
}
// do you need it at all?
/* 
export const storageErrorSave = async(err: Error)=>{
  const data = JSON.stringify(serializeError(err))
  //const data = JSON.stringify(err, undefined, 2)//TODO string wrongly saved `${err.name}: ${err.message} ${err.stack ? `Stack: \n  ${err.stack}`:''}`
  return EXTENSION ? 
    browser.storage.local.set({[STORAGE_ERROR_KEY]: data}):
    localStorage.setItem(STORAGE_ERROR_KEY, data)
}

export const storageErrorGet = async()=>{
  const data =  EXTENSION ? 
    await browser.storage.local.get(STORAGE_ERROR_KEY).then(storage=>storage[STORAGE_ERROR_KEY]):
    localStorage.getItem(STORAGE_ERROR_KEY)
  return data ? deserializeError(JSON.parse(data.toString())) : null
} */
/* 
const STORAGE_USER_KEY = 'STORAGE_USER_KEY'
export const storageGet = async():Promise<UserStorage>=>{// doesn't make sence any more TODO
  try{
    const data =  UserStorageSchema.parse(EXTENSION ? 
      await browser.storage.local.get<UserStorage>(['config', 'toggle']):
      JSON.parse(localStorage.getItem(STORAGE_USER_KEY) || '{}')
    )
    log.debug('Retrieved from storage: ', data)
    return data
  }catch(err){
    log.error(err, 'error on trying to get data to storage')
    throw new Error("Problems trying to restore your options :/") 
  }
}
export const storageSave = async(data :UserStorage)=>{
  try{
    EXTENSION ?
      await browser.storage.local.set(data)://TODO add validation here?
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data))
    log.debug('Saved to storage.',data)
  }catch(err){
    log.error(err, 'Error on trying to save to storage')
    throw new Error("Can't save your options for future use :(")
  }
}
 */


/// Alarms related functions ///
export const notify = (type:AlarmType)=>{
  const pomodoro = type == AlarmType.POM
  EXTENSION ? browser.notifications.create({
    type: 'basic',
    title: pomodoro ? 'Pomodoro alert!' : 'Time to work!',
    message: pomodoro ? 'you\'ve been working for a long time, take a rest' : 'your rest time is up',
    iconUrl: pomodoro ? ICONS.POM_ALERT : ICONS.WORK_ALERT
  }) : ()=>{} //TODO implement web notification

  (pomodoro ? pomAudio : workAudio).play()
    .catch(()=>{
      log.debug('rejection played')
      if(retries){
        loadAudio()
        setTimeout(()=>notify(type), 1000)
        retries -= 1
      }else{
        throw new Error("Failed to play alert sounds.")
      }
    })
}

let workAudio :HTMLAudioElement, pomAudio :HTMLAudioElement, retries = 5
const loadAudio = () => {
  workAudio = new Audio(SOUNDS.WORK)
  pomAudio = new Audio(SOUNDS.POM)
}
loadAudio()




