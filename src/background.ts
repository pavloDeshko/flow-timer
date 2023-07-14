
import {log} from './modules/utils'
import {storageErrorSave} from './modules/service'
import { disconnectBack } from './modules/connector'
import {BackgroundApp} from './modules/backgroundApp'
import {EXTENSION} from './settings'

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
if(EXTENSION) {// on web done at connector
  setupErrorCatchers()
  new BackgroundApp()
}
