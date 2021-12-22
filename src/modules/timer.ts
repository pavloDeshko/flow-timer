import easyTimer from 'easytimer.js'
declare module 'easytimer.js'{//TODO update and remove as pr merged
  interface Timer {
    removeAllEventListeners(eventType?: TimerEventType): void;
  }
}
import {Time} from './types'
import {ZERO_TIMER} from './utils'

export default class TimerWrapper{
  private eTimer = new easyTimer()
  private update :()=>void
  private end :()=>void

  constructor(onUpdate = (t :Time)=>{}, onEnd = (t :Time)=>{}){
    this.update = ()=>onUpdate(this.values)
    this.end = ()=>onEnd(this.values)

    this.eTimer.on('secondsUpdated', this.update)
    this.eTimer.on('targetAchieved', this.end)
  }

  up(){
    this.eTimer.stop()
    this.eTimer.start()
    return {...ZERO_TIMER}
  }
  down(t :Time){
    this.eTimer.stop()
    this.eTimer.start({countdown: true, startValues: t})
    return {...t}
  }
  pause(){
    this.eTimer.pause()
    return this.values
  }
  reset(){
    this.eTimer.stop()
    return {...ZERO_TIMER}
  }
  clear(){
    this.eTimer.removeAllEventListeners()
  }

  get values(){
    return {...this.eTimer.getTimeValues()}
  }
}