import {secondsToObject} from './utils'
import { MIN_REST, MAX_REST, DEFAULT_RATIO} from './settings'

export type Time = {
  days?: number,
  hours: number,
  minutes: number,
  seconds: number,
  secondTenths?: number
}

export type Partial<T> = {
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

export type Toggl_Entry = {
  start :string,
  duration :number,
  //stop :string,
  description :string,
  created_with :string,
  pid? :number
}

export type Toggl_Entry_Params = {
  time_entry: Toggl_Entry
}

export type Toggl_Auth = string | {user :string, pass :string}

export type Toggl_Project = {
  id : number,
  name : string
}

export type Toggl_Me = {
  data : {
    projects : Array<Toggl_Project>,
    time_entries : Array<Toggl_Entry>
  }
}

export type UserStorage = {
  config? : Config,
  toggle? : {
    auth : string,
    form : TogglForm
  } 
}

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