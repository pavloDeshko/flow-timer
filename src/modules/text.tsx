import React from 'react'

import {SUPPORT_EMAIL} from '../settings'
const TEXT = {
  WORKING_PRE: 'WORKING - ',
  RESTING_PRE: 'RESTING - ',
  
  APP_TITLE : 'Flow Timer',
  APP_LOGO_ALT : 'Flow Timer logo',

  // DESC and about also go to manifest.json and public/web/manifest.json
  APP_DESC : 'Intelligent Pomodoro with Adaptive Rests. Flow Timer will adjust rest durations according to your work intervals. Toggl Track integration included. Stay in the flow!',
  APP_DESC_SHORT : 'Intelligent Pomodoro Timer will adjust rest durations according to your work intervals. Stay in the flow!',
  //for web and readme
  APP_ABOUT_TITLE :'Why and How?', 
  APP_ABOUT: [
    'Are you fan of the Pomodoro technique? Us too! However, many existing apps lack flexibility, locking users into strict routines :(',
    'Unlike its counterparts, Flow Timer is an adaptable assistant, which will not only remind you to have a rest in time, but will also adjust break time based on your actual work duration, freeing you from rigid timeframes and allowing you to work as long as you feel being in the zone!',
    'Setup is easy - choose preferred Pomodoro timer duration and set desired number of rest minutes per hour of work. For beginning or ending your work and rest segments, simply use respective buttons.',
    'With Flow Timer, productivity bends to your rhythm, not the other way around!'
  ] as const,

  TOGGL_ERROR_SAVE:"Couldn't save Toggl entry :( ",
  TOGGL_ERROR_LOG:  `Couldn't log into Toggl :( `,
  TOGGL_ERROR_GENERIC : `Can't connect to Toggl :(`, //TODO ?
  TOGGL_ERROR_TOKEN : `Invalid Toggl token :(`,
  TOGGL_ERROR_AUTH : `No permission to save Toggl entry :(`,
  TOGGL_ERROR_NETWORK : `Can't connect to Toggl :(`,
  TOGGL_ERROR_COMPAT : `Can't make sence of data from Toggl :( Updating extension might help..`,

  STORAGE_ERROR_SAVE : 'Troubles with saving data to storage, your app may misbehave :(',
  STORAGE_ERROR_GET : 'Troubles with getting data from storage, your app may misbehave :(',
  
  NOTIFY_ERROR_SOUND : `Can't play sound to alert you :( Make sure you gave permission`,
  NOTIFY_ERROR : 'Trobles notifying you when timer is up :( Make sure you gave permission',

  NOTIFY_WORK_TITLE : 'Time to work!',
  NOTIFY_WORK_MESSAGE : 'your rest time is up',
  NOTIFY_POM_TITLE : 'Pomodoro alert!',
  NOTIFY_POM_MESSAGE : 'you\'ve been working for a long time, take a rest',

  FEEDBACK_PREPENDED_DATA : (data:string, email:string)=>`please email this text to:\n\n${SUPPORT_EMAIL}\n\n${data}`,
  FEEDBACK_EMAIL_LINK : 'here',
  FEEDBACK_PREPENDED : (data:React.ReactNode)=>
    <>Please, drop us an email so we could understand what went wrong. Click {data} to copy email address and some geeky data.</>,
  FEEDBACK: (data:React.ReactNode,email:React.ReactNode)=>
    <>Please, drop us a note at {email} about what happened. Click {data} to copy geeky data and paste it into your email so we can understand what went wrong.</>,
  FEEDBACK_TITLE: 'Sorry, looks like internals of our app crashed :-/',
  FEEDBACK_ENDING: 'We will really try to solve the problem asap!',
  
  NEXT_REST_LEGEND: 'Next rest will be',
  TIME_LABELS: {h:'h',m:'m',s:'s'},

  RECALCULATE: 'recalculate',

  WORK:'work',
  REST:'rest',
  STOP_WORK:'stop working',
  STOP_REST:'stop resting',

  ALERT_WORK: 'Time to work!',
  ALERT_REST: 'Time to rest!',

  ASK_PERMISSION: 'Please, allow app to notify you when time is up. It will never use it for anything else',

  OPTION_FLOW:"Flow - adjust your rest time",
  OPTION_FLOW_LEGEND:'Minutes for every hour of work:',
  OPTION_POMODORO:"Pomodoro reminder every",
  OPTION_DARK_LIGHT:'Dark/light mode',

  TOGGL_HELP: "At your Toggl profile page go to:\n Profile -> Profile Settings -> API Token -> Click to reveal \n Than copy and paste it to the form below. \nNOTE: You're save - Flow Timer will never send your credentials anywhere - token will be stored on your computer only",
  TOGGL_HELP_IMAGE_ALT:'',
  TOGGL_GOTO_TOKEN: 'Go to Toggl profile',
  
  TOGGL_TOKEN:'Your toggl token goes here',
  TOGGL_CONNECT: 'Connect to save time entries in Toggl',

  TOGGL_SAVE_NEXT:'Save next work',
  TOGGL_DESC:'Descritpion',
  TOGGL_SAVED:'saved',
  TOGGL_SAVE_PREV:'Save previous unsaved work',

  TOGGL_COLLAPSED:'Toggl integration',
  TOGGL_EXIT:'Exit from Toggl',

  COPY: 'copy to clipboard',
  RELOAD_EXT:'Reload extension',
  RELOAD_PAGE:'Reload page'
} as const

export default TEXT

