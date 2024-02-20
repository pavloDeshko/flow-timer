import { notify, alarmSave, iconTitleChange} from './service'
import {EXTENSION} from '../settings'
import {AlarmType, Status} from './types'
import eventManager, { Message} from './events'
import { dispatchError} from "./events"
import {text} from './utils'

export default function setupBackground(){  
  /// Handling of incoming messages ///
  let activeTimeout :number|null = null

  eventManager.on('message', async(message :Message)=>{
    // clears previous alarm 
    if(message.type == "CLEAR_ALARM" || message.type == "SET_ALARM"){
      EXTENSION ? 
        (await chrome.alarms.clearAll()) :
        activeTimeout !== null && clearTimeout(activeTimeout)
    }
      
    // sets new one
    if(message.type == "SET_ALARM"){
      EXTENSION ?
        await chrome.alarms.create(message.subType+Date.now(), {when : Date.now()+message.timeout}) :
        (activeTimeout = Number(setTimeout(()=>onAlarm(message.subType),message.timeout)))
    } 
  }) 

/*   eventManager.on('message', async(message :Message)=>{
    // clears previous alarm 
    if(message.type == "CLEAR_ALARM" || message.type == "SET_ALARM"){
      const id = await alarmIdGet()
      if(id != null){
        EXTENSION ?
          await chrome.alarms.clear(id) :
          clearTimeout(Number(id))
        message.type == "CLEAR_ALARM" && await alarmIdSave(null)
      }
    }
    
    // sets new one
    if(message.type == "SET_ALARM"){
      let freshId :string
      if(EXTENSION){
        freshId = message.subType + String(Date.now())
        await chrome.alarms.create(freshId, {when : Date.now()+message.timeout})
      }else{
        freshId = String(setTimeout(()=>onAlarm(message.subType),message.timeout))
      }
      await alarmIdSave(freshId)
    }
  })
   */

  /// Triggering actual notification and stuff function when alarm is set off ///
  if(EXTENSION){
    chrome.alarms.onAlarm.addListener(
      info=>info.name.includes(AlarmType.REST_END) ? onAlarm(AlarmType.REST_END) : onAlarm(AlarmType.POM)
    )
  }

  const onAlarm = async(type:AlarmType)=>{
    //alarmIdSave(null)// no active alarm is left

    EXTENSION && await alarmSave(type)// so opened popup could know which alarm went off
    eventManager.emit('message', {type : 'ALARM', subType : type})// in case popup is opened at the moment
    
    EXTENSION && typeof chrome.action.openPopup == 'function' && await chrome.action.openPopup()// TODO wait untel they fix it, not working currently

    if(type == AlarmType.REST_END){
      notify(AlarmType.REST_END)
      iconTitleChange(Status.IDLE)
    }else{
      notify(AlarmType.POM)
    }
  }
}

/** Warning user about any ancaught errors *///
export const setupGlobalErrorListeners = ()=>{
    const global = EXTENSION ? self : window
    global.addEventListener('unhandledrejection', (event: any) => {
      dispatchError(event.reason || event.detail?.reason || event.error, text('BACKGROUND_ERROR')) //TODO
    })
    global.addEventListener('error', event => {
      dispatchError(event.error, text('BACKGROUND_ERROR'))
    })
}

//setTimeout(()=>{throw new Error('async background test error')},1000)
//throw new Error('sync background test error')