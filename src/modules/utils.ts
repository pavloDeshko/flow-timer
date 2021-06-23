import { Time } from './types'

export const MIN_REST = 4
export const MAX_REST = 3600
export const DEFAULT_RATIO = 2
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

  return seconds
}

export const padTwoZeros = (number :number) => {
  return ('00' + number).slice(-2)
}

export const logUnexpected = (e :Error) => {
  console.log(e)
}