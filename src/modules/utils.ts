import { DependencyList, useEffect, useState} from 'react'
import {z} from 'zod'
import {serializeError} from 'serialize-error'

import { Time } from './types'
import {TOGGL_TOKEN_LENGHT} from '../settings'

/// Hooks ///
/** Lets async function to be passed to useEffect */
export const useAsyncEffect = (cb:()=>Promise<void>,deps:DependencyList)=>{
  return useEffect(()=>{cb()},deps)
}

/** Will trigger rerender with new value unless it was set to null - in that case old value will linger */
export const useStateLinger = <T>(fresh:T)=>{
  const [value, setValue] = useState(fresh) // subsequently default value is ignored by setSetstatet
  fresh !== null && fresh !== value && setValue(fresh)  // will trigger rerender of calling component
  return value //new value will be returned on next rerender, but NOT if its null
}

/// Time related stuff ///
export const ZERO_TIMER :Time = {
  hours: 0,
  minutes: 0,
  seconds: 0
}
export const ZERO_TIMER_FULL :Time = {days:0, ...ZERO_TIMER, secondTenths:0}

export const msToTime = (ms :number) => {
  let totalSeconds = Math.round(ms/1000)
  const values :Time = {...ZERO_TIMER_FULL}

  values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400 
  values.hours = Math.floor(totalSeconds / 3600), totalSeconds %= 3600
  values.minutes = Math.floor(totalSeconds / 60), totalSeconds %= 60
  values.seconds = Math.floor(totalSeconds / 1), totalSeconds %= 1
  values.secondTenths = Math.floor(totalSeconds / 0.1)

  return values
}

export const timeToMs = (obj :Time) => {
  let seconds = 0
  seconds += (obj.days || 0) * 86400
  seconds += (obj.hours || 0) * 3600
  seconds += (obj.minutes || 0) * 60
  seconds += (obj.seconds || 0) * 1
  seconds += (obj.secondTenths || 0) * 0.1

  return Math.floor(seconds)*1000
}

/// Parsers ///
const makeParseNumber = (max:number) => (value :string, fallback :number) => 
  z.number().nonnegative().max(max).int().catch(fallback).parse(Number(value))

/** Parses values safely and return fallback (usually prev value) if new valid is invalid. */
export const parse = {
  twoDigit: makeParseNumber(99),
  h: makeParseNumber(24),
  m: makeParseNumber(60),
  s: makeParseNumber(60),
  togglTokenSafe: (value:string)=>z.string().min(TOGGL_TOKEN_LENGHT[0]).max(TOGGL_TOKEN_LENGHT[1]).regex(JWT).transform(obf).safeParse(value.trim()),
  togglDesc:  (value:string, fallback :string)=> z.string().max(1000).catch(fallback).parse(value)
}

/// Misc ///
const JWT = /^[A-Za-z0-9-_=]+$/

export const stringifyError = (err:Error)=>JSON.stringify(serializeError(err),undefined,2)

export const padTwoZeros = (number :number) => {
  return ('00' + number).slice(-2)
}

/** Obfuscate string value */
export const obf = (value:string)=> (value.slice(value.length/2)+value.slice(0,value.length/2)).split('').reverse().join('')
/** Reverse obfuscation of string value */
export const deObf = (value:string)=>obf(value)


/* export const log = {
  error: (error? :any, comment? :string, state? :{})=>{
    console.error(`Logged${comment && ` ${comment}`} : `, error)
    state && console.error('  State at error: ', JSON.stringify(state, undefined, 2))
  },
  bug: (message? :string, state? :{})=>{
    if(process.env['NODE_ENV'] != 'production' ){
      console.log('Bug met: ', message)
      state && console.dir('   ', state)
    }
  },
  debug: (message? :string, state? :{})=>{
    if(process.env['NODE_ENV'] != 'production' ){
      console.log('Debug info: ', message)
      state && console.dir('   ', state)
    }
  },
  throw: (message? :string, state? :{})=>{
    if(process.env['NODE_ENV'] != 'production' ){
      throw new Error(`Test error: ${message}\n  state: ${state}`)
    }
  },
  reject: (message? :string, state? :{})=>{
    if(process.env['NODE_ENV'] != 'production' ){
      Promise.reject(new Error(`Test Promise error: ${message}\n  state: ${state}`))
    }
  }
} */
