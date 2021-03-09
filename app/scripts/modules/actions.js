const WORK = 'WORK'
const REST = 'REST'
const CONFIG = 'CONFIG'
const TOKEN = 'TOKEN'
const TOKEN_OUT = 'TOKEN_OUT'

const actions = {
  WORK: () => ({type: WORK}),
  REST: () => ({type: REST}),
  CONFIG: config => ({type: CONFIG, config}),
  TOKEN: token => ({type: TOKEN, token}),
  TOKEN_OUT: () => ({type: TOKEN_OUT})
}

export default actions