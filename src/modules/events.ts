import Emittery from 'emittery'
import z from 'zod'

import {Time, Config, TogglForm, State, AlarmType, Error_Info_Schema} from './types'
import {EXTENSION} from '../settings'
import { errorSave } from './service'
import {stringifyError} from './utils'
import TEXT from './text'

/// Types and schemas /// 
export type Action = {
  type: 'WORK'
}|{
  type: 'REST'
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
  type: 'TOGGL_REFRESH'
}|{
  type: 'CLOSE_USER_ALERT',
  alertType: 'WARN'|'NOTIFY'
}

export const MessageSchema = z.object({
  type: z.literal('ALARM'),
  subType: z.nativeEnum(AlarmType)
}).or(z.object({
  type: z.literal('ERROR'),
  errorInfo: Error_Info_Schema
})).or(z.object({
  type: z.literal('SET_ALARM'),
  subType: z.nativeEnum(AlarmType),
  timeout : z.number()
})).or(z.object({
  type: z.literal('CLEAR_ALARM')
})).and(z.object({
  _external:z.boolean().optional()
}))
export type Message = z.infer<typeof MessageSchema>


/// Event manager setup ///
const WORKER = 'ServiceWorkerGlobalScope' in self

const eventManager = new Emittery<{
  'action':Action,
  'message':Message
}>()

/** Helper for ".emit('message',{type:'ERROR'..." and "console.error(userMessage, errorJson) and "errorSave(errorInfo)"*/
export const dispatchError = async(err:Error, userMessage:string|null, keepLocal=false)=>{
  const errorInfo = {errorJson : stringifyError(err), userMessage:userMessage}

  console.error(errorInfo.userMessage || 'Error with no user message: ', errorInfo.errorJson)
  if(errorInfo.userMessage){
    await errorSave(errorInfo)
    eventManager.emit('message',{type:'ERROR', errorInfo : {errorJson : stringifyError(err), userMessage:userMessage}, _external:keepLocal})
  }
}

if(EXTENSION){
  let port :chrome.runtime.Port|null

  const handleIn = (data:any)=>{
    const message = MessageSchema.parse(data)
    eventManager.emit('message',{...message, _external:true})
  }
  const handleOut =  (message:Message)=>{
    try{
      !message._external && port?.postMessage(message)
    }catch(err:any){
      dispatchError(err, TEXT.BACKGROUND_ERROR, true)
    }
  }   

  const connectWorker = ()=>{
    chrome.runtime.onConnect.addListener(p=>{
      port = p
      p.onMessage.addListener(handleIn)
      p.onDisconnect.addListener(()=>{
        port=null
      }) 
    })
  }
  const connectPopup = ()=>{
    port = chrome.runtime.connect()
    port.onMessage.addListener(handleIn)
    port.onDisconnect.addListener(()=>{
      port = null
      connectPopup()
    }) 
  }

  WORKER ?
    connectWorker()/// For background ///
    :connectPopup() /// For front ///
  eventManager.on('message',handleOut) /// For both ///  //TODO could be removed by user? not good

}else{
  // Nothing needed if in web - they just use the same Emmittabele ! pwa sometime
}

export default eventManager
