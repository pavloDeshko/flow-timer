import React from 'react'

import {SUPPORT_EMAIL, EXTENSION} from '../settings'
const TEXT = {
  WORKING_PRE: 'WORKING - ',
  RESTING_PRE: 'RESTING - ',
  
  APP_TITLE : 'Flow Timer',
  APP_LOGO_ALT : 'Flow Timer logo',

  // DESC and about also go to manifest.json and public/web/manifest.json
  APP_DESC : 'Intelligent Pomodoro with Adaptive Rests. Flow Timer will adjust rest durations according to your work intervals. Toggl Track integration included. Stay in the Flow!',
  APP_DESC_SHORT : 'Intelligent Pomodoro Timer will adjust rest durations according to your work intervals. Stay in the Flow!',
  APP_DESC_SHORTEST : 'will adjust your breaks according to work intervals. Stay in the Flow!',
  //for web and readme
  APP_ABOUT_TITLE :'Why and How?', 
  APP_ABOUT: [
    'Are you fan of the Pomodoro technique? Us too! However, many existing apps lack flexibility, locking users into strict routines :(',
    'Unlike its counterparts, Flow Timer is an adaptable assistant, which will not only remind you to have a rest in time, but will also adjust break time based on your actual work duration, freeing you from rigid timeframes and allowing to work as long as you feel being in the zone!',
    'Setup is easy - choose preferred Pomodoro timer duration and set desired number of rest minutes per hour of work. For beginning or ending your work and rest segments, simply use respective buttons.',
    'With Flow Timer, productivity bends to your rhythm, not the other way around!'
  ] as const,

/*   TOGGL_ERROR_SAVE:"Couldn't save Toggl entry :( ",
  TOGGL_ERROR_LOG:  `Couldn't log into Toggl :( `,

  TOGGL_ERROR_NETWORK : `Can't connect to Toggl :(`, */
  
  //TOGGL_ERROR_GENERIC : `Can't connect to Toggl :(`,
  TOGGL_ERROR_CONNECT:  `Can't connect to Toggl :(`,
  TOGGL_ERROR_ADD:`Can't save entry to Toggl :(`,
  TOGGL_ERROR_COMPAT : `Can't make sence of data from Toggl :( ${
    EXTENSION?'Updating extension might help': 'Contact us if problem persists'}`,
  TOGGL_TOO_MANY : `Looks like too many requests to Toggl were made :( Try again in a minute`,
  TOGGL_ERROR_TOKEN : `Invalid Toggl token :(`,
  TOGGL_ERROR_AUTH : `Can't authorize to Toggl :( Have you changed your token?`,
  
  //const BACKGROUND_ERROR_TEXT = 'Some errors in background, app might misbehave :(',
  BACKGROUND_ERROR: `Some errors in the background - your alarm may not sound :( Contact us if problem persists`,

  STORAGE_ERROR_SAVE : 'Troubles with saving data to storage, your app may misbehave :(',
  STORAGE_ERROR_GET : 'Troubles with getting data from storage, your app may misbehave :(',
  
  NOTIFY_ERROR_SOUND : `Unable to play alert sound :( Please check sound permissions`,
  NOTIFY_ERROR : 'Unable to notify you when timer is up :( Please check notification permissions',

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
  ASK_INTERACTION: 'Click anywhere, so app can play sound when alarms are due, thanks!',

  OPTION_FLOW:"Flow - adjust your rest time",
  OPTION_FLOW_LEGEND:'Minutes of rest per Hour of work:',
  OPTION_POMODORO:"Pomodoro reminder every",
  OPTION_DARK_LIGHT:'Dark/light mode',

  TOGGL_HELP: "At your Toggl profile page go to:\n Profile -> Profile Settings -> API Token -> Click to reveal \n Than copy and paste it to the form below. \nNOTE: You're save - Flow Timer will never send your credentials anywhere - token will be stored on your computer only",
  //TOGGL_HELP_IMAGE_ALT:'',
  TOGGL_GOTO_TOKEN: 'Go to Toggl profile',
  
  TOGGL_TOKEN:'Your toggl token goes here',
  TOGGL_CONNECT: 'Connect to save time entries in Toggl',

  TOGGL_SAVE_NEXT:'Save next work',
  TOGGL_DESC:'Descritpion',
  TOGGL_SAVED:'saved',
  TOGGL_SAVED_EXT:'last work entry saved to Toggl',
  TOGGL_SAVE_PREV:'Save last unsaved work',

  TOGGL_COLLAPSED:'Toggl integration',
  TOGGL_EXIT:'Exit from Toggl',

  COPY: 'copy to clipboard',
  RELOAD_EXT:'Reload extension',
  RELOAD_PAGE:'Reload page'
} as const

export default TEXT

