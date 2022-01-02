import { EXTENSION } from './settings'

export interface Connector{
  postMessage(m :any):void
  onMessage(cb :(message: object)=>void):void
  onDisconnect(cb :()=>void):void
}

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
}

const onConnectExt = (cb :(c:Connector)=>void)=>{
  browser.runtime.onConnect.addListener(p=>{
    cb(new ExtensionConnector(p))
  })
}

const connectExt :()=>Connector = ()=>{
  return new ExtensionConnector(browser.runtime.connect())
}

/***********/

class WebConnector implements Connector{
  private onMessageCb :((message: object)=>void) | null = null
  public _sibling: WebConnector|null = null
  postMessage(message: any){
    setTimeout(
      ()=>this._sibling?.onMessageCb && this._sibling.onMessageCb(message)
    ,0)
  }
  onMessage(cb:(message: object)=>void){
    this.onMessageCb = cb
  }
  onDisconnect(cb: ()=>void){}
}

let onConnectCb :((c:Connector)=>void)|null= null

const onConnectWeb = (cb :(c:Connector)=>void)=>{
  onConnectCb = cb
}

const connectWeb = ():Connector=>{
  const pair = getWebConnectorPair()
  setTimeout(
    ()=>onConnectCb && onConnectCb(pair[0])
  ,0)
  return pair[1] 
}

const getWebConnectorPair = ():[WebConnector,WebConnector]=>{
  const two = new WebConnector()
  const one = new WebConnector()
  one._sibling = two
  two._sibling = one
  return [one,two]
}

export const connect = EXTENSION ? connectExt : connectWeb
export const onConnect = EXTENSION ? onConnectExt : onConnectWeb
