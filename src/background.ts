
import {log} from './modules/utils'
import {storageErrorSave} from './modules/service'
import { disconnectBack } from './modules/connector'
import {App} from './modules/app'

//GLOBAL ERROR CATCHERS
const handleError = (err :Error)=>{
  log.error('Error caught in background script', err)
  storageErrorSave(err)
  disconnectBack(err)
  throw err
}
addEventListener('error', (e:ErrorEvent)=>{handleError(e.error)})
addEventListener('unhandledrejection', (e:PromiseRejectionEvent)=>{handleError(e.reason)})

//LAUNCH
//Promise.reject('test async promise error in background')
//throw new Error('test sync error in background!')//TODO debug
new App()
