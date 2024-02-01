import "./modules/mockDom"// so same app modules can work both in Worker background and pop-up/web page
import backgroundSetup, {setupGlobalErrorListeners} from "./modules/backgroundSetup"
import { EXTENSION } from "./settings"

EXTENSION && setupGlobalErrorListeners()
EXTENSION && backgroundSetup() // For web page setup is done before rendering the app, from index.ts
