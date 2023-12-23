import { Time } from './types'
import { DependencyList, useEffect, useState} from 'react'
import { z }from 'zod'
import {serializeError} from 'serialize-error'

import {SUPPORT_EMAIL} from '../settings'
import TEXT from './text'

const JWT = /^[A-Za-z0-9-_=]+$/

export const stringifyError = (err:Error)=>JSON.stringify(serializeError(err),undefined,2)

export const useAsyncEffect = (cb:()=>Promise<void>,deps:DependencyList)=>{
  return useEffect(()=>{cb()},deps)
}

export const useLinger = <T>(fresh:T)=>{
  const [value, setValue] = useState(fresh) // subsequent default value is ignored
  fresh !== null && fresh !== value && setValue(fresh)
  return value
}

export const ZERO_TIMER :Time = {
  hours: 0,
  minutes: 0,
  seconds: 0
}
export const ZERO_TIMER_FULL :Time = {days:0, ...ZERO_TIMER, secondTenths:0}

export const msToTime = (ms :number) => {
  let totalSeconds = Math.round(ms/1000)
  const values :Time = {...ZERO_TIMER_FULL}

  values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400 //TODO! bitwise?
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

export const padTwoZeros = (number :number) => {
  return ('00' + number).slice(-2)
}

const makeParseNumber = (max:number) => (value :string, fallback :number) => {
  const result = z.number().nonnegative().max(max).int().safeParse(Number(value))
  return result.success ? result.data : fallback
}

const obf = (value:string)=> (value.slice(value.length/2)+value.slice(0,value.length/2)).split('').reverse().join('')
export const deObf = (value:string)=>obf(value)

export const parse = {
  twoDigit: makeParseNumber(99),
  h: makeParseNumber(24),
  m: makeParseNumber(60),
  s: makeParseNumber(60),
  togglTokenSafe: (value:string)=>{
    return z.string().regex(JWT).transform(obf).safeParse(value.trim())
  },
  togglDesc:  (value:string, fallback :string)=>{  
    const result = z.string().max(1000).safeParse(value)
    return result.success ? result.data : fallback
  }
}

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
