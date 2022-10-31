import wretch from 'wretch'

import {Toggl_Entry_Params, Toggl_Auth, Toggl_Me, Toggl_Project, UserStorage, UserStorageSchema, Toggl_Me_Schema, NotifyType} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME} from '../settings'
import {log} from './utils'

const WORK_SOUND = 'res/work.ogg'
const POM_SOUND = 'res/pom.ogg'
const WORK_ALERT_ICON = 'res/workAlert.svg'
const POM_ALERT_ICON = 'res/pomAlert.svg'

const STORAGE_ERROR_KEY = 'STORAGE_ERROR_KEY'

const w = wretch()
  .url(TOGGL_URL)

const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${auth}:api_token` : `${auth.user}:${auth.pass}`)

const handleToggl403 = (err :Error) => {
  log.error('403 on trying to connect to Toggl',err)
  throw new Error('Looks like your toggl credentials are wrong :(')
}
const handleTogglOther = (err :Error) => {
  log.error('Error on trying to reach to Toggl',err)
  throw new Error(`Can't reach out to Toggl :(`)
}
const handleInvalidData = (err :Error) => {
  log.error('Error on parsing data from Toggl', err)
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

export const storageGet = async():Promise<UserStorage>=>{
  try{
    const data = UserStorageSchema.parse(await browser.storage.local.get<UserStorage>(['config', 'toggle']))
    log.debug('Retrieved from storage: ', data)
    return data
  }catch(err){
    log.error('Error on trying to get data to storage', err)
    throw new Error("Problems trying to restore your options :/") 
  }
}

export const storageSave = async(data :UserStorage)=>{
  try{
    await browser.storage.local.set(data)//TODO add validation here?
    log.debug('Saved to storage.',data)
  }catch(err){
    log.error('Error on trying to save to storage', err)
    throw new Error("Can't save your options for future use :(")
  }
}

export const storageErrorSave = async(err: Error)=>{
  return browser.storage.local.set({
    [STORAGE_ERROR_KEY]: JSON.stringify(err, undefined, 2)//TODO string wrongly saved `${err.name}: ${err.message} ${err.stack ? `Stack: \n  ${err.stack}`:''}`
  })
}

export const storageErrorGet = ()=>{
  return browser.storage.local.get(STORAGE_ERROR_KEY).then(storage=>storage[STORAGE_ERROR_KEY])
}

export const notify = (type:NotifyType)=>{
  const pomodoro = type == NotifyType.POM
  browser.notifications.create({
    type: 'basic',
    title: pomodoro ? 'Pomodoro alert!' : 'Time to work!',
    message: pomodoro ? 'you\'ve been working for a long time, take a rest' : 'your rest time is up',
    iconUrl: pomodoro ? POM_ALERT_ICON : WORK_ALERT_ICON
  })
  new Audio(pomodoro ? POM_SOUND : WORK_SOUND).play()
}