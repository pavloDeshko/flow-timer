import {MIN_REST, DEFAULT_RATIO, secondsToObject} from './utils'

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

export type Config = {
  ratio: number
}

export type TogglForm = {
  active: boolean,
  desc: string,
  toggling: null | string
}

export type TogglLogin = {
  token : string | null,
  error : Error | null,
  loading : boolean
}

export class State{
  constructor(){
  }
  timer :Time = secondsToObject(0)
  nextRest :Time = secondsToObject(MIN_REST)
  working :(null | number) = null
  resting :(null | number) = null
  config : Config = {ratio: DEFAULT_RATIO} //TODO
  toggl :{login :TogglLogin, form :TogglForm} = {
    login : {
      token : null,
      error : null,
      loading : false
    },
    form : {
      active: false,
      toggling: null,
      desc: ''
    }
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