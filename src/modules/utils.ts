import { Time } from './types'
import { MIN_REST, MAX_REST, DEFAULT_RATIO} from './settings'
import React, { ComponentType, FunctionComponent, ReactComponentElement } from 'react'

export const ZERO_TIMER :Time = {
  hours: 0,
  minutes: 0,
  seconds: 0
}

export const getRestTime = (workTimeObj :Time, ratio = DEFAULT_RATIO) => {
  const restSeconds = Math.floor(objectToSeconds(workTimeObj) / ratio)
  return restSeconds < MIN_REST ? 
    secondsToObject(MIN_REST) : 
    restSeconds > MAX_REST ? 
      secondsToObject(MAX_REST) : 
      secondsToObject(restSeconds) 
}

export const secondsToObject = (totalSeconds :number) => {
  const values :Time = {} as Time // TODO

  values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400 //TODO bitwise?
  values.hours = Math.floor(totalSeconds / 3600), totalSeconds %= 3600
  values.minutes = Math.floor(totalSeconds / 60), totalSeconds %= 60
  values.seconds = Math.floor(totalSeconds / 1), totalSeconds %= 1
  values.secondTenths = Math.floor(totalSeconds / 0.1)
  
  return values
}

export const objectToSeconds = (obj :Time) => {
  let seconds = 0
  seconds += (obj.days || 0) * 86400
  seconds += (obj.hours || 0) * 3600
  seconds += (obj.minutes || 0) * 60
  seconds += (obj.seconds || 0) * 1
  seconds += (obj.secondTenths || 0) * 0.1

  return Math.floor(seconds)
}

export const padTwoZeros = (number :number) => {
  return ('00' + number).slice(-2)
}

export const log = {
  error: (message? :string, error? :Error, state? :{})=>{
    console.log('Error logged: ', message)
    error && console.log(' error: ', JSON.stringify(error))
    state && console.log('  state: ', JSON.stringify(state, undefined, 2))
  },
  bug: (message? :string, state? :{})=>{
    if(process.env.NODE_ENV != 'production' ){
      console.log('Bug met: ', message)
      state && console.dir('  state: ', state)
    }
  },
  debug: (message? :string, state? :{})=>{
    if(process.env.NODE_ENV != 'production' ){
      console.log('Debug info: ', message)
      state && console.dir('  state: ', state)
    }
  }
}

let last :any = null
export const jsonMemo = <T>(value :T):T => {
  if (JSON.stringify(value) == JSON.stringify(last)){
    return last
  }else{
    last = value
    return value
  }
}
