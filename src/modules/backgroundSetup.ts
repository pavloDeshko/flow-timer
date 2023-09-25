import { alarmGet, alarmSave, notify, notificationSave} from './service'
//import {BackgroundApp} from './modules/backgroundApp'
import {EXTENSION} from '../settings'
import {AlarmType} from './types'
import eventManager, { Message} from './events'


export default function setUpBackground(){
  const onAlarm = async(type:AlarmType)=>{
    alarmSave(null)

    await notificationSave(type)
    eventManager.emit('message', {type : 'NOTIFY', subType : type})
    
    type == AlarmType.WORK ? notify(AlarmType.WORK) : notify(AlarmType.POM)
    EXTENSION && typeof chrome.action.openPopup == 'function' && chrome.action.openPopup()// TODO check it when they fix it
  }

  if(EXTENSION){
    chrome.alarms.onAlarm.addListener(
      info=>info.name.includes(AlarmType.WORK) ? onAlarm(AlarmType.WORK) : onAlarm(AlarmType.POM)
    ) 
  }

  eventManager.on('message', async(message :Message)=>{
    if(message.type == "CLEAR_ALARM" || message.type == "SET_ALARM"){
      const id = await alarmGet()
      if(id != null){
        EXTENSION ?
          chrome.alarms.clear(id) :
          clearTimeout(Number(id))
        message.type == "CLEAR_ALARM" && await alarmSave(null)
      }
    }

    if(message.type == "SET_ALARM"){
      let freshId :string
      if(EXTENSION){
        freshId = message.subType + String(Date.now())
        chrome.alarms.create(freshId, {when : Date.now()+message.timeout})
      }else{
        freshId = String(setTimeout(()=>onAlarm(message.subType),message.timeout))
      }
      alarmSave(freshId)
    }
  })
}
