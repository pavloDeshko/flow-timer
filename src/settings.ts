export const EXTENSION = !process.env["REACT_APP_ENV"] 

export const APP_WIDTH = 500 // 600px minus scrollbars is max for extension

//commited envs
export const MIN_REST = EXTENSION ? 30*1000 : 5*1000
export const MAX_REST = 24 * 3600*1000
export const DEFAULT_RATIO = 6
export const POM_TIMES = [5, 10, 15, 20, 30, 45, 50, 60] as const
export const ALARM_CLEARENCE = 10*1e3 // 15 * 60*1e3

export const TOGGL_TOKEN_URL = 'https://track.toggl.com/profile#api-token'
export const TOGGL_URL = 'https://api.track.toggl.com/api/v9'
export const TOGGL_ADD_URL = (worspace_id:number)=>`/workspaces/${worspace_id}/time_entries`
export const TOGGL_USER_URL = '/me?with_related_data=true'
export const TOGGL_TOKEN_LENGHT = [17,48] as const

export const CLIENT_NAME = EXTENSION ? 'Flow Timer Extension' :'flowtimer.click'

export const WEB_VERSION_ADDRESS = 'https://flowtimer.click'
export const SUPPORT_EMAIL = 'journeyman042@gmail.com'
export const PRIVACY_POLICY_ADDRESS = EXTENSION ? `https://ext.flowtimer.click/privacy.html` : process.env['PUBLIC_URL'] + 'privacy.html'

export const DEFAULT_STATE = {
  nextRestTime: MIN_REST, 
  workingSince: null,
  restingUntil: null,
  config: {
    pomTimeMins: 50,
    pomActive: false,
    ratio: DEFAULT_RATIO, 
    mode: "ON" as Mode,
    dark: null
  },
  toggl: {
    login: null,
    projects: [],
    form: {
      shouldSave: false,
      saved: false,
      desc: '',
      projectId: null,
    },
    loaded: true
  },
  alarm: null,
  warning: null,
  versionNoticed:0
} 

/// redeclared here so zod is not pulled in sound batch TODO
enum Mode {
  OFF = 0,
  PAUSED = 'PAUSED',
  ON = 'ON'
} 
