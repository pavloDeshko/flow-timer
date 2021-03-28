const spec = [
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
export default actions = spec.reduce((result,type) => ({...result, [type[0]]:createAction(...type)}), {})
