import {State, Mode, TogglProject} from './modules/types'
//commited envs
export const MIN_REST = 4*1000
export const MAX_REST = 3600*1000
export const DEFAULT_RATIO = 2
export const POM_TIMES = [1, 5, 10, 15, 20, 30, 45, 50, 60] as const
export const ERROR_MESSAGE = 'Unknown error occured :(' // TODO get other messages here too

export const TOGGL_TOKEN_URL = 'https://track.toggl.com/profile#api-token'
export const TOGGL_URL = 'https://api.track.toggl.com/api/v8'
export const TOGGL_ADD_URL = '/time_entries'
export const TOGGL_USER_URL = '/me?with_related_data=true'

export const CLIENT_NAME = 'Flow Timer Web-Extension'

export const SUPPORT_EMAIL = 'pavlodeshko92@gmail.com'

export const EXTENSION = !process.env["REACT_APP_ENV"] //TODO move

export const DESC_LONG = ['blaeue,ueo  eouoeuoeuoueu', 'oeuoeuoeuoeuoeuo oeuoeueu uoeuou eueuoeu ', 'oeuoeeeeeeeeu'] as const
export const DESC = 'oeuoeuoeuoeuoeu'

export const DEFAULT_STATE :State = {
  alarms: { work: null, pom: null },
  nextRestTime: MIN_REST, 
  workingStart: null,
  restingTarget: null,
  config: {
    pomTime: 50,
    pomActive: false,
    ratio: DEFAULT_RATIO, 
    mode: Mode.ON,
    dark: null
  },
  toggl: {
    token: null,
    projects: [] as TogglProject[],
    form: {
      shouldSave: false,
      unsaved: null,
      desc: '',
      projectId: null,
    },
    loaded: true
  },
  notification: null,
  warning: null
}

//private envs
//export const env = process.env['env']
//export const TOGGL_DEBUG = ''
