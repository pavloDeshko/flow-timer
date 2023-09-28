import React from 'react'

import {SUPPORT_EMAIL} from '../settings'
const TEXT = {
  TOGGL_ERROR_SAVE:"Couldn't save Toggl entry :( ",
  TOGGL_ERROR_LOG:  `Couldn't log into Toggl :( `,
  TOGGL_ERROR_GENERIC : `Can't connect to Toggl :(`, //TODO ?
  TOGGL_ERROR_TOKEN : `Invalid Toggl token :(`,
  TOGGL_ERROR_AUTH : `Don't have permission to save time entry to your Toggl :(`,
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

  FEEDBACK_PREPENDED_DATA : (data:string, email:string)=>`please email this to:\n\n${SUPPORT_EMAIL}\n\n${data}`,
  FEEDBACK_EMAIL_LINK : 'here',
  FEEDBACK_PREPENDED : (data:React.ReactNode)=>
    <>Please, drop us an email so we could understand what went wrong. Click {data} to copy email address and some geeky data.</>,
  FEEDBACK: (data:React.ReactNode,email:React.ReactNode)=>
    <>Please, drop us a note at {email} about what happened. Click {data} to copy geeky data and paste it into your email so we can understand what went wrong.</>,
  FEEDBACK_TITLE: 'Sorry, looks like internals of our app crashed :-/',
  FEEDBACK_ENDING: 'We will try to solve the problem asap!',
  
  APP_TITLE : 'Flow Timer',
  APP_LOGO_ALT : 'Flow Timer logo',
  APP_DESC : 'Intelligent Pomodoro with Adaptive Rests. Flow Timer will adjust rest durations according to your work intervals. Toggl Track integration included. Stay in the flow!',
  APP_ABOUT_TITLE :'Why? and How?', 
  APP_ABOUT: ['why you need it','how to adjust','thank me'] as const,

  NEXT_REST_LEGEND: 'Next rest will be',
  TIME_LABELS: {h:'h',m:'m',s:'s'},

  RECALCULATE: 'recalculate',

  WORK:'work',
  REST:'rest',
  STOP_WORK:'stop working',
  STOP_REST:'stop resting',

  ALERT_WORK: 'Time to work!',
  ALERT_REST: 'Time to rest!',

  OPTION_FLOW:"Flow - adjust your rest time",
  OPTION_FLOW_LEGEND:'Minutes for every hour of work:',
  OPTION_POMODORO:"Pomodoro reminder every",
  OPTION_DARK_LIGHT:'Dark/light mode',

  TOGGL_HELP: '',
  TOGGL_HELP_IMAGE_ALT:'',
  TOGGL_GOTO_TOKEN: 'Go to Toggl profile',
  
  TOGGL_TOKEN:'Your toggl token here',
  TOGGL_CONNECT: 'Connect to save time entries in Toggl',

  TOGGL_SAVE_NEXT:'Save next work',
  TOGGL_DESC:'Descritpion',
  TOGGL_SAVED:'saved',
  TOGGL_SAVE_PREV:'Save previous entry',

  TOGGL_COLLAPSED:'Toggl integration',
  TOGGL_EXIT:'Exit from Toggl',

  COPY: 'copy to clipboard',
  RELOAD_EXT:'Reload extension',
  RELOAD_PAGE:'Reload page'
} as const

export default TEXT

