import React, {useState, useEffect} from 'react'

import {Time} from './types'
import {useFreeze, msToTime} from './utils'
import {RestAdjust, Counter} from './components'

const up = ((refTime :number)=>{
  return Math.abs(Math.round(Date.now() - refTime))
})

const down = (refTime :number)=>{
  const rounded = Math.round(Date.now()-refTime)
  return rounded < 0 ? Math.abs(rounded) : 0
}

type TickerProps <P extends Time> = {
  refTime :number|null, 
  type: 'UP' | 'DOWN' | ((refTime:number)=>number)
} & Omit<P, keyof Time> & Partial<Record<keyof Time,never>>

export const withTicker = <P extends Time>(TimerComp: React.FC<P>) => {
  return ({refTime, type = 'UP', ...rest} :TickerProps<P>)=>{
    const getValue = () => refTime != null ? 
      (type == 'UP' ? up : type == 'DOWN' ? down : type)(refTime) : 
      0

    const [value, setValue] = useState(useFreeze(getValue()))

    useEffect(() => {
      // Does reset of the whole thing
      setValue(getValue())

      const res = {interval:undefined as any, timeout:undefined as any}
      if (refTime != null) {
        res.timeout = setTimeout(() => {
          setValue(getValue())
          res.interval = setInterval(() => {
            setValue(getValue())
          }, 1000)
        }, 1000 - (Math.abs(getValue())) % 1000)
      }

      return () => {
        res.timeout && clearTimeout(res.timeout)
        res.interval && clearInterval(res.interval)
      }
    }, [refTime, type])

    return <TimerComp {...msToTime(value) as P} {...rest}/>

    /* const zero = refTime === null
    const targetOrStart = refTime !== null ? refTime : 0
  
    const [state, setState] = useState(useFreeze(Date.now() - targetOrStart))
    const setCurrent = ()=>setState(Date.now() - targetOrStart)

    const timeouts = useFreeze([] as any[])
    const clearTimeouts = ()=>{
      timeouts.forEach(t=>clearTimeout(t))
      timeouts.splice(0)
    }

    useEffect(()=>{
      clearTimeouts()
      if(!zero){
        setCurrent()
        timeouts.push(setTimeout(()=>{
          setCurrent()
          timeouts.push(setInterval(()=>{
            setCurrent()
          },1000))
        },1000 - (Math.abs(Date.now() - targetOrStart)) % 1000) as any)
      }
      return ()=>clearTimeouts()
    },[targetOrStart,down])
    
    const value = zero || down && Math.round(state/1000) >= 0 ? 0 : Math.abs(state)


    return <TimerComp {...msToTime(result) as P} {...rest}/>// TODO fix type */
  }
}

export const CounterTicker = withTicker(Counter)
export const RestAdjustTicker = withTicker(RestAdjust)