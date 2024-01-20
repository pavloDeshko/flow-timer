import "./modules/mockDom"// so same app modules can work both in Worker background and pop-up/web page
import backgroundSetup from "./modules/backgroundSetup"
import { EXTENSION } from "./settings"
import { dispatchError} from "./modules/events"
import TEXT from './modules/text'

const global = EXTENSION ? self : window
global.addEventListener('unhandledrejection', (event: any) => {// TODO! in extension only?.. enscap and add them to web somewhere
  dispatchError(event.reason || event.detail?.reason || event.error, TEXT.BACKGROUND_ERROR) //TODO
})
global.addEventListener('error', event => {
  dispatchError(event.error, TEXT.BACKGROUND_ERROR)
})

EXTENSION && backgroundSetup() // For web page setup is done before rendering the app, from index.ts