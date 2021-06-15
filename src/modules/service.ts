import wretch from 'wretch'

import {Toggl_Entry_Params, Toggl_Auth, Toggl_Me, Toggl_Project} from './types'

const TOGGL_URL = 'https://api.track.toggl.com/api/v8'
const TOGGL_ADD_URL = '/time_entries/start'
const TOGGL_USER_URL = '/me?with_related_data=true'

const w = wretch()
  .url(TOGGL_URL)

const getAuth = (auth :Toggl_Auth) => 'Basic ' + btoa(typeof auth == 'string' ? `${auth}:api_token` : `${auth.user}:${auth.pass}`)

const handle403 = (err :Error) => {throw new Error('Looks like your credentials are wrong :(')}
const handleOther = (err :Error) => {throw new Error(`Can't reach out to Toggl :(`)}
 
export const togglApiConnect = async (credential :Toggl_Auth) => {
  return w.url(TOGGL_USER_URL)
    .auth(getAuth(credential))
    .get()
    .unauthorized(handle403)
    .json<Array<Toggl_Project>>(
      d => (d as Toggl_Me).data.projects.map(p => ({id: p.id, name: p.name})) //TODO
    )
    .catch(handleOther)
}

export const togglApiDisconnect = async (credential :Toggl_Auth) => {
  // api call to end sessino goes here
}

export const togglApiAdd = async (credential :Toggl_Auth, start :number, end :number, desc :string, project :number | null) => {
  const data : Toggl_Entry_Params = {time_entry:{
    start: new Date(start).toISOString(),
    end: new Date(end).toISOString(),
    desc,
    created_with: 'curl',
    pid: project != null ? project : undefined
  }}

  w.url(TOGGL_ADD_URL)
    .auth(getAuth(credential))
    .post(data)
    .unauthorized(handle403)
    .res().catch(handleOther)
}
