import React, { } from 'react'
import {createRoot} from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

import {reload} from './modules/service'
import {EXTENSION} from "./settings"
import setUpBackground, {setupGlobalErrorListeners} from './modules/backgroundSetup'
import App, {AppFallback} from './modules/App'

/// Setup : background and render with Error-boundary ///
setupGlobalErrorListeners()
!EXTENSION && setUpBackground()// If its extension, it's loaded in ather batch (background.ts)

createRoot(document.getElementById('appRoot') as Element).render(
  <ErrorBoundary 
    FallbackComponent={AppFallback}
    onError={()=>EXTENSION && window.addEventListener('unload', ()=>reload())}
  >
    <App/>
  </ErrorBoundary>
)
