import Emittery from 'emittery'
import z from 'zod'

import {Time, Config, TogglForm, State, AlarmType} from './types'
import {EXTENSION} from '../settings'

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
  type: 'CLEAR_ALARM'
}|{
  type: 'CLOSE_NOTIFY'
}/* |{
  type: 'STATE',
  state: State
} */

export type Trouble = {
  type:'TIP', message:string
}|{
  type:'WARNING',message:string, error ?:Error
}|{
  type:'ERROR',message:string, error :Error
}

export const MessageSchema = z.object({
  type: z.literal('NOTIFY'),
  subType: z.nativeEnum(AlarmType)
}).or(z.object({
  type: z.literal('SET_ALARM'),
  subType: z.nativeEnum(AlarmType),
  timeout : z.number()
})).or(z.object({
  type: z.literal('CLEAR_ALARM')
}))

export type Message = z.infer<typeof MessageSchema>

const eventManager = new Emittery<{
  'action':Action,
  'message':Message,
  'trouble':Trouble
}>()

if(EXTENSION){
  eventManager.on('message', action=>browser.runtime.sendMessage(action)) //TODO could be romoved by user? not good
  browser.runtime.onMessage.addListener((data:any)=>{
    eventManager.emit('message',MessageSchema.parse(data))
  })
}else{
  // Nothing needed if in web - they just use the same Emmittabele !

  // TODO service worker code goes here
  // what if code for back and front are differnt?.. check somehow? another var in settings?
}

export default eventManager
