export const togglApiConnect = async (token :string) => {
  // api call goes here
  console.log('TOGGLE CONNECTED', token)
}

export const togglApiDisconnect = async (token :string) => {
  // api call to end sessino goes here
  console.log ('TOGGLE DISCONNECTED', token)
}

export const togglApiStart = async (desc :string) => {
  // api call to create session goes here
  console.log('TOGGLE STARTED ', desc)
}

export const togglApiStop = async (id :string, desc :string) => {
  // api call to end session goes here
  console.log('TOGGLE STOPPED ', id, desc)
}

export const togglApiAdd = async (start :number, end :number, desc :string) => {
  // api coll to add finished entry goes here
  console.log('TOGGLE ADDING')
}

export const togglApiCancel = async (id :string) => {
  // api call to cancel running entry
  console.log('TOGGLE CANCELING')
}