import {boolean, z} from 'zod'

import {secondsToObject} from './utils'
import { MIN_REST, MAX_REST, DEFAULT_RATIO} from './settings'

export type Time = {
  days?: number,
  hours: number,
  minutes: number,
  seconds: number,
  secondTenths?: number
}

export type Partial<T> = {//TODO remove, exists in ts
  [key in keyof T]?: T[key]
}

export enum Mode {
  OFF = 0,
  PAUSED,
  ON
} 

export type Config = {
  ratio: number,
  mode: Mode,
  dark: boolean
}

export type TogglForm = {
  shouldSave: boolean,
  desc: string,
  unsaved: {start: number, end: number} | null,
  projectId: number | null
}

export type TogglLogin = {
  token : string | null,
  error : Error | null,
  loading : boolean,
  projects : Array<Toggl_Project>
}

export class State{
  constructor(){
  }
  timer :Time = secondsToObject(0)
  nextRest :Time = secondsToObject(MIN_REST)
  working :(null | number) = null
  resting :(null | number) = null
  config : Config = {
    ratio: DEFAULT_RATIO, 
    mode: Mode.ON,
    dark: false
  } //TODO
  toggl :{login :TogglLogin, form :TogglForm} = {
    login : {
      token : null,
      error : null,
      loading : false,
      projects : []
    },
    form : {
      shouldSave: false,
      unsaved: null,
      desc: '',
      projectId: null
    }
  }
}

export type Toggl_Entry_Params = {
  time_entry: Toggl_Entry
}

export type Toggl_Auth = string | {user :string, pass :string}

//to validate
export const Toggl_Project_Schema = z.object({
  id: z.number(),
  name: z.string()
})
export type Toggl_Project = z.infer<typeof Toggl_Project_Schema>

export const Toggl_Entry_Schema = z.object({
  start : z.string(),
  duration : z.number(),
  description : z.string(),
  created_with : z.string(),
  pid : z.number().optional()
})
export type Toggl_Entry = z.infer<typeof Toggl_Entry_Schema>

export const Toggl_Me_Schema = z.object({
  data: z.object({
    projects : Toggl_Project_Schema.array(),
    time_entries : Toggl_Entry_Schema.array()
  })
})
export type Toggl_Me = z.infer<typeof Toggl_Me_Schema>

export const UserStorageSchema = z.object({
  config: z.object({
    ratio: z.number(),
    mode: z.nativeEnum(Mode),
    dark: z.boolean()
  }).optional(),
  toggl: z.object({
    auth: z.string(),
    shouldSave: z.boolean()
  }).optional()
})
export type UserStorage = z.infer<typeof UserStorageSchema>


/* {
  timer: secondsToObject(0),
  nextRest:  secondsToObject(MIN_REST),
  working: null, 
  resting: null,
  config: {ratio: DEFAULT_RATIO},
  toggl: {
    token: null,
    error: null,
    loading: false,
    form: {active: false, desc: ''},
    toggling: null
  }
} */