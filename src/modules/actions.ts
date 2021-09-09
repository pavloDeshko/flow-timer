import {Config, TogglForm, State, Time} from './types'

export enum Actions{
  'WORK' = 1,
  'REST',
  'ADJUST',
  'CONFIG',
  'TOGGL_IN',
  'TOGGL_OUT',
  'TOGGL_CONFIG',
  'TOGGL_FORM',
  'TOGGL_SAVE_LAST',
  'STATE'
}

export type Action = {
  type: Actions.WORK
}|{
  type: Actions.REST
}|{
  type: Actions.ADJUST,
  time: Time | null
}|{
  type: Actions.CONFIG
  config: Partial<Config>
}|{
  type: Actions.TOGGL_IN,
  token: string
}|{
  type: Actions.TOGGL_OUT
}|{
  type: Actions.TOGGL_FORM,
  form: Partial<TogglForm>
}|{
  type: Actions.TOGGL_SAVE_LAST
}|{
  type: Actions.STATE
  state: State
}

/* const spec = [
  ['WORK'],
  ['REST'],
  ['CONFIG', 'config'],
  ['TOKEN', 'token'],
  ['TOKEN_OUT'],
  ['TOGGL_CONFIG', 'config'],
  ['STATE', 'state']
]

createAction = (type, ...keys) => {
  return (...args) => {
    return {type, ...keys.reduce((result, key, i) => ({...result, [key]: args[i]}), {})}
  }
}

export const actionTypes = spec.reduce((result,type) => ({...result, [type[0]]:type[0]}), {})
export default actions = spec.reduce((result,type) => ({...result, [type[0]]:createAction(...type)}), {}) */
