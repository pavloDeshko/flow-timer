import E from "Emittery"

import { EXTENSION } from '../settings' 
import {log} from './utils'
import {BackgroundApp} from './backgroundApp'
import {setupErrorCatchers} from '../background'
import {storageErrorSave} from './service'
import {Message, MessageSchema} from './types'


const getConnector = (target: "FRONT"|"BACK")=>{
  const emitter = new E<{'action':Message}>()

  if(EXTENSION){// TODO change to Some env
    emitter.on('action', action=>browser.runtime.sendMessage(action))
    browser.runtime.onMessage.addListener((data:any)=>{
      emitter.emit('action',MessageSchema.parse(data))
    })
  }else{
   // TODO
  }

  return {
    on : (cb:(a:Message)=>void)=>{emitter.on('action',cb)},
    send : (a:Message)=>{emitter.emit('action',a)},
    clear: ()=>{emitter.clearListeners()}
  }
}

export const backConnector = getConnector('BACK')
export const frontConector = getConnector('FRONT')

/*
*/
export interface Connector{
  postMessage(m :any):void
  onMessage(cb :(message: object)=>void):void
  disconnect(cause?:any):void
  onDisconnect(cb :()=>void):void
}

interface ConnectorPair{
  connectFront():Connector
  onConnectBack(cb:(c:Connector)=>void):void
  forceDisconnectBack(cause?:any):void
}

/***********/
class ExtensionConnector implements Connector{
  constructor(
    private port :browser.runtime.Port
  ){}
  postMessage(message :any){
    this.port.postMessage(message)
  }
  onMessage(cb :(message: object)=>void){
    this.port.onMessage.addListener(cb)
  }
  onDisconnect(cb :()=>void){
    this.port.onDisconnect.addListener(cb)
  }
  disconnect(cause?: any): void {
    this.port.disconnect()
  }
}

class ExtensionConnectorPair implements ConnectorPair{
  private back:ExtensionConnector|null = null
  private onConnectBackCb :((p:browser.runtime.Port)=>void) | null = null
  connectFront():Connector {
    return new ExtensionConnector(browser.runtime.connect())
  }
  onConnectBack(cb: (c: Connector) => void): void {
    browser.runtime.onConnect.addListener(
      this.onConnectBackCb = p=>{
        cb(this.back = new ExtensionConnector(p))
      })
  }
  forceDisconnectBack(cause?: any): void {
    this.back?.disconnect()
    this.onConnectBackCb && browser.runtime.onConnect.removeListener(this.onConnectBackCb)
  }
}

/***********/

class WebConnector implements Connector{
  private onMessageCb  = (m:object)=>{}
  private onDisconnectCb  = (cause?:any)=>{}
  public _sibling: WebConnector|null = null
  onMessage(cb:(message: object)=>void){
    this.onMessageCb = cb
  }
  postMessage(message: any){
    setTimeout(
      ()=>this._sibling?.onMessageCb(message)
    ,0)
  }
  onDisconnect(cb: ()=>void){
    this.onDisconnectCb = cb
  }
  disconnect(cause?: any): void {
    setTimeout(
      ()=>{this._sibling?.onDisconnectCb(cause)}
    ,0)
  }
}

class WebConnectorPair implements ConnectorPair{
  private front = new WebConnector()
  private back = new WebConnector()
  private onConnectCb = (c:Connector)=>{}
  constructor(){
    this.front._sibling = this.back
    this.back._sibling = this.front
  }
  connectFront(){
    setTimeout(
      ()=>this.onConnectCb(this.back)
    ,0)
    return this.front
  }
  onConnectBack(cb :(c:Connector)=>void){
    this.onConnectCb = cb
  }
  forceDisconnectBack(){
    this.back.disconnect()
    
  }
}

/***********/

const pair = EXTENSION ? new ExtensionConnectorPair() : new WebConnectorPair()
export const connectFront = pair.connectFront.bind(pair)
export const onConnectBack = pair.onConnectBack.bind(pair)
export const disconnectBack = pair.forceDisconnectBack.bind(pair)

/**********/

if(!EXTENSION){// on ext done in background.ts
  setupErrorCatchers()
  new BackgroundApp()
}
