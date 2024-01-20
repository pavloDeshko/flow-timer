import React, {useState, useEffect} from 'react'

import {Time} from './types'
import { msToTime} from './utils'
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
  typeOrModifier: 'UP' | 'DOWN' | ((refTime:number)=>number)
} & Omit<P, keyof Time> & Partial<Record<keyof Time,never>>

/** Makes dumb time showing component into up or down ticker - so change every second is handled by local state*/
export const withTicker = <P extends Time>(TimerComp: React.FC<P>) => {
  return ({refTime, typeOrModifier = 'UP', ...rest} :TickerProps<P>)=>{
    const getValue = ()=>{
      if (refTime === null){return 0}
      switch (typeOrModifier){
        case 'UP': return up(refTime)
        case 'DOWN': return down(refTime)
        default: return typeOrModifier(refTime)
      }
    }
    
    const [value, setValue] = useState(getValue())

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
    }, [refTime, typeOrModifier])

    return <TimerComp {...msToTime(value) as P} {...rest}/>
  }
}

export const CounterTicker = withTicker(Counter)
export const RestAdjustTicker = withTicker(RestAdjust)