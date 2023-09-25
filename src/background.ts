import "./modules/mockDom"
import backgroundSetup from "./modules/backgroundSetup"
import { EXTENSION } from "./settings"
import { dispatchError} from "./modules/service"
import { stringifyError } from "./modules/utils"

const BACKGROUND_ERROR_TEXT = 'Some errors in backgroud, app might misbehave :('
const global = EXTENSION ? self : window
global.addEventListener('unhandledrejection', (event: any) => {// TODO! in extension only?.. enscap and add them to web somewhere
  dispatchError({errorJson : stringifyError(event.reason || event.detail?.reason || event.error), userMessage : BACKGROUND_ERROR_TEXT}) //TODO
})
global.addEventListener('error', event => {
  dispatchError({errorJson : stringifyError(event.error), userMessage : BACKGROUND_ERROR_TEXT})
})

EXTENSION && backgroundSetup()    

//setTimeout(()=>{throw new Error('Test background error')}, 5000)
