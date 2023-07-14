import wretch from 'wretch'
import favicon from 'favicon.js' //write @types TODO
import {serializeError, deserializeError} from 'serialize-error'
import useMediaQuery from '@mui/material/useMediaQuery';

import {Toggl_Entry_Params, Toggl_Auth, Toggl_Me, Toggl_Project, UserStorage, UserStorageSchema, Toggl_Me_Schema, NotifyType, IconObject} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME, EXTENSION} from '../settings'
import {log, useFreeze} from './utils'
import {ICONS, SOUNDS} from './assets'

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

const STORAGE_ERROR_KEY = 'STORAGE_ERROR_KEY'
const STORAGE_USER_KEY = 'STORAGE_USER_KEY'

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

export const iconChange = (path : string | IconObject)=> {
  EXTENSION ? browser.browserAction.setIcon({path}) : favicon.change(typeof path == 'string' ? path : path[16])
}

export const storageGet = async():Promise<UserStorage>=>{
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
}

let workAudio :HTMLAudioElement, pomAudio :HTMLAudioElement, retries = 5
const loadAudio = () => {
  workAudio = new Audio(SOUNDS.WORK)
  pomAudio = new Audio(SOUNDS.POM)
}
loadAudio()

export const notify = (type:NotifyType)=>{
  const pomodoro = type == NotifyType.POM
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

export const reload = ()=>{ EXTENSION ? browser.runtime.reload() : location.reload()}

export const usePreffersDark = ()=> useFreeze(useMediaQuery('(prefers-color-scheme: dark)'))