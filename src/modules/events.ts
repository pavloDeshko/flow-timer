import Emittery from 'emittery'
import z from 'zod'

import {Time, Config, TogglForm, State, AlarmType, Error_Info_Schema} from './types'
import {EXTENSION} from '../settings'
import { errorSave } from './service'

/// Types and schemas /// 
export type Action = {
  type: 'WORK'
}|{
  type: 'REST'
}|{
  type: 'REST_ENDED'
}|{
  type: 'ADJUST',
  time: Time
}|{
  type: 'RECALC'
}|{
  type: 'CONFIG'
  config: Partial<Config>
}|{
  type: 'TOGGL_IN',
  token: string
}|{
  type: 'TOGGL_OUT'
}|{
  type: 'TOGGL_FORM',
  form: Partial<TogglForm>
}|{
  type: 'TOGGL_SAVE_LAST'
}|{
  type: 'CLOSE_ALERT',
  subType: 'WARN'|'NOTIFY'
}

export const MessageSchema = z.object({
  type: z.literal('NOTIFY'),
  subType: z.nativeEnum(AlarmType)
}).or(z.object({
  type: z.literal('ERROR'),
  info: Error_Info_Schema
})).or(z.object({
  type: z.literal('SET_ALARM'),
  subType: z.nativeEnum(AlarmType),
  timeout : z.number()
})).or(z.object({
  type: z.literal('CLEAR_ALARM')
})).and(z.object({
  external:z.boolean().optional()
}))
export type Message = z.infer<typeof MessageSchema>

/// Event manager setup ///
const eventManager = new Emittery<{
  'action':Action,
  'message':Message
}>()

eventManager.on('message', message=>{
  if(message.type == "ERROR"){ 
    console.error(message.info.userMessage || 'Error with no user message: ', message.info.errorJson)
    message.info.userMessage && errorSave(message.info)
  }
})

if(EXTENSION){
  const handleIn = (data:any)=>{
    const message = MessageSchema.parse(data)
    eventManager.emit('message',{...message,external:true})
  }
  const handleOut =  (message:Message)=>{
    !message.external && port && port.postMessage(message)
  }
  
  let port :chrome.runtime.Port|null

  if('ServiceWorkerGlobalScope' in self){/// For background ///
    chrome.runtime.onConnect.addListener(p=>{
      port = p
      p.onMessage.addListener(handleIn)
      p.onDisconnect.addListener(()=>{
        port=null
      })
    })

  }else{
    port = chrome.runtime.connect()/// For front ///
    port.onMessage.addListener(handleIn)

  }
  eventManager.on('message',handleOut) /// For both ///
  //TODO could be romoved by user? not good
}else{
  // Nothing needed if in web - they just use the same Emmittabele !

  // TODO service worker code goes here
  // what if code for back and front are differnt?.. check somehow? another var in settings?
}

export default eventManager
