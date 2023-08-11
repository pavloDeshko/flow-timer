
import {log} from './modules/utils'
import {storageErrorSave,  alarmGet, alarmSave, notify, notificationSave} from './modules/service'
import { disconnectBack } from './modules/connector'
//import {BackgroundApp} from './modules/backgroundApp'
import {EXTENSION} from './settings'
import { Action, AlarmType, Message, AlarmId} from './modules/types'
import eventManager from './modules/events'

//GLOBAL ERROR CATCHERS
export const setupErrorCatchers = () => {
  const handleError = (err :Error)=>{
    log.error(err, 'in background app')
    storageErrorSave(err)
    disconnectBack(err)
    if(EXTENSION){throw err}//TODO should throw?
  }
  addEventListener('error', (e:ErrorEvent)=>{handleError(e.error)})
  addEventListener('unhandledrejection', (e:PromiseRejectionEvent)=>{handleError(e.reason)})
}

//LAUNCH
/* if(EXTENSION) {// on web done at connector
  setupErrorCatchers()
  new BackgroundApp()
}
 */





// New setup

if(EXTENSION){// If module loaded in its own batch. If in the main - see import of it in index
  setUpBackground()
}
export default function setUpBackground(){
  const onAlarm = async(type:AlarmType)=>{
    await notificationSave(type)
    type == AlarmType.WORK ? notify(AlarmType.WORK) : notify(AlarmType.POM)
    eventManager.emit('message', {type : 'NOTIFY', subType : type})
  }

  if(EXTENSION){
    browser.alarms.onAlarm.addListener(
      info=>info.name.includes(AlarmType.WORK) ? onAlarm(AlarmType.WORK) : onAlarm(AlarmType.POM)
    )
  }

  eventManager.on('message', async(message :Message)=>{
    if(message.type == "CLEAR_ALARM" || message.type == "SET_ALARM"){
      // For both clear and set
      const id = await alarmGet()
      if(EXTENSION){
        id !== null && browser.alarms.clear(id)
      }else{
        id !== null && clearTimeout(Number(id))
      }
      await alarmSave(null)
    }

    if(message.type == "SET_ALARM"){
      // For set only
      let freshId :string
      if(EXTENSION){
        freshId = message.subType + String(Date.now())
        browser.alarms.create(freshId, {when : Date.now()+message.timeout})
      }else{
        freshId = String(setTimeout(()=>onAlarm(message.subType)))
      }
      alarmSave(freshId)
    }
  })
}
