export async const togglApiConnect = token => {
  // api call goes here
  console.log('TOGGLE CONNECTED', token)
}

export async const togglApiDisconnect = token => {
  // api call to end sessino goes here
  console.log ('TOGGLE DISCONNECTED', token)
}

export async const togglApiStart = desc => {
  // api call to create session goes here
  console.log('TOGGLE STARTED ', desc)
}

export async const togglApiStop = (id, desc) => {
  // api call to end session goes here
  console.log('TOGGLE STOPPED ', id, desc)
}

export async const togglApiAdd = (start, end, desc) => {
  // api coll to add finished entry goes here
  console.log('TOGGLE ADDING')
}

export async const togglApiCancel = id => {
  // api call to cancel running entry
  console.log('TOGGLE CANCELING')
}