const state = {
  working: false,
  resting: false,
  workStart: null
}
//TODO add proxy

const getRestTime = (workTime) => {
  return workTime/6
}

const startWork = () => {
  state.working = true
  workStart = Date.now()
  stopRest()
}

const stopWork = () => {
  state.working = false
  state.workStart = null
}

const startRest = () => {
  state.resting = true
  window.setTimeout(notify, getRestTime(Date.now() - state.workStart))
  stopWork()
}

const stopRest = () => {
  state.resting = false
}

const notify = () => {
  console.log('Rest time is up')
}