import { Time } from './types'
import { MIN_REST, MAX_REST, DEFAULT_RATIO} from '../settings'
import { DependencyList, EffectCallback, useEffect, useState } from 'react'
import { z }from 'zod'

import eventManager  from './events'

const JWT = /^[A-Za-z0-9-_=]+$/

export const useTimeoutUnless = (callback :()=>void, shouldCancel :boolean, timeout :number )=>{
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  useEffect(()=>{
    setTimeoutId(setTimeout(callback, timeout))
    return ()=>{
      (timeoutId !== null) && clearTimeout(timeoutId) //wtf overloads
    }
  },[])
  
  useEffect(()=>{
    (timeoutId !== null) && shouldCancel && clearTimeout(timeoutId)
  })
}

export const useFreeze = <T>(value:T)=>{
  return useState(value)[0]
}// TODO just useMemo?

export const useAsyncEffect = (cb:()=>Promise<void>,deps:DependencyList)=>{
  return useEffect(()=>{cb()},deps)
}

export const ZERO_TIMER :Time = {
  hours: 0,
  minutes: 0,
  seconds: 0
}

export const ZERO_TIMER_FULL :Time = {days:0, ...ZERO_TIMER, secondTenths:0}

/* export const calculateRestTime = (workTime :number, ratio = DEFAULT_RATIO) => {
  const nextRestTime = Math.floor(workTime / ratio)
  return nextRestTime < MIN_REST ? MIN_REST : nextRestTime > MAX_REST ? MAX_REST : nextRestTime
} */

export const msToTime = (ms :number) => {
  let totalSeconds = Math.round(ms/1000)
  const values :Time = {...ZERO_TIMER_FULL}

  values.days = Math.floor(totalSeconds / 86400), totalSeconds %= 86400 //TODO bitwise?
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

const makeParseNumber = (max:number) => (value :string, fallback = 0) => {
  const result = z.number().nonnegative().max(max).int().safeParse(Number(value))
  return result.success ? result.data : fallback
}

export const parse = {
  twoDigit: makeParseNumber(99),
  h: makeParseNumber(24),
  m: makeParseNumber(60),
  s: makeParseNumber(60),
  togglToken: (value:string)=>{
    return z.string().regex(JWT).safeParse(value.replace(/(^\s+)|(\s+$)/g,''))
  },
  togglDesc:  (value:string, fallback = '')=>{  
    const result = z.string().max(1000).safeParse(value)
    return result.success ? result.data : fallback
  }
}

export const log = {
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
}

eventManager.on('trouble', t=>log.error(t.type!="TIP" ? t.error : undefined, t.message))

/* export class RetrievedError extends Error{
  constructor(value :browser.storage.StorageValue | string){
    super('Last error retrived from local storage')
    this.name = 'RetrievedError'
    this.lastError = typeof value == 'string' ? value : String(value)  // value ? value.toString() : ''
  }
  lastError:string
  toString(){
    return `${this.name}: ${this.message}\n  ${this.lastError}`
  }
}
 */