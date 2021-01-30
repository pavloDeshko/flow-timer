const Timer = require('./popup')

const timer = new Timer(state=>{
  console.log(`new state is `, state)
},lastState=>{
  console.log(`last state is `, lastState)
})

const SECONDS = 75
timer.countDown(SECONDS * 1000, 3000)