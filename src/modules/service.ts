import wretch from 'wretch'

import {Toggl_Entry_Params, Toggl_Auth, Toggl_Me, Toggl_Project, UserStorage} from './types'
import {TOGGL_URL, TOGGL_ADD_URL, TOGGL_USER_URL, CLIENT_NAME} from './settings'
import {log} from './utils'

const w = wretch()
  .url(TOGGL_URL)

const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${auth}:api_token` : `${auth.user}:${auth.pass}`)

const handleToggl403 = (err :Error) => {
  log.error('403 on trying to connect to Toggl',err)
  throw new Error('Looks like your toggl credentials are wrong :(')}
const handleTogglOther = (err :Error) => {
  log.error('Error on trying to reach to Toggl',err)
  throw new Error(`Can't reach out to Toggl :(`)
}
 
export const togglApiConnect = async (credential :Toggl_Auth) => {
  return w.url(TOGGL_USER_URL)
    .auth(getAuth(credential))
    .get()
    .unauthorized(handleToggl403)
    .json(
      d => ({
        projects: (d as Toggl_Me).data.projects.map(p => ({id: p.id, name: p.name})),
        last: (d as Toggl_Me).data.time_entries[0].pid
      }) //TODO
    )
    .catch(handleTogglOther)
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
    const data = await browser.storage.local.get(['config', 'toggle']) as UserStorage
    log.debug('Retrieved from storage: ', data)
    return data
  }catch(err){
    log.error('Error on trying to get data to storage', err)
    throw new Error("Problems trying to read your data from browser's storage :/")
  }
}

export const storageSave = async(data :UserStorage)=>{
  try{
    await browser.storage.local.set(data)
    log.debug('Saved to storage.',data)
  }catch(err){
    log.error('Error on trying to save to storage', err)
    throw new Error("Can't save your data in your browser's storage :(")
  }
}