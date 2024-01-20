import { alarmIdGet, alarmIdSave, notify, alarmSave, iconTitleChange} from './service'
import {EXTENSION} from '../settings'
import {AlarmType, Status} from './types'
import eventManager, { Message} from './events'

export default function setUpBackground(){
  const onAlarm = async(type:AlarmType)=>{
    alarmIdSave(null)// no active alarm is left

    await alarmSave(type)// so opened popup could know which alarm went off
    eventManager.emit('message', {type : 'ALARM', subType : type})// in case popup is opened at the moment
    
    EXTENSION && typeof chrome.action.openPopup == 'function' && await chrome.action.openPopup()// TODO wait untel they fix it, not working currently

    if(type == AlarmType.WORK){
      notify(AlarmType.WORK)
      iconTitleChange(Status.IDLE)
    }else{
      notify(AlarmType.POM)
    }
  }
  
  /// Handling of incoming messages ///
  eventManager.on('message', async(message :Message)=>{
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
  
  /// Triggering actual notification and stuff function when alarm is set off ///
  if(EXTENSION){
    chrome.alarms.onAlarm.addListener(
      info=>info.name.includes(AlarmType.WORK) ? onAlarm(AlarmType.WORK) : onAlarm(AlarmType.POM)
    ) 
  }
}
