import {EXTENSION} from "../settings"

const publicPath = !EXTENSION ? process.env['PUBLIC_URL'] + 'static/' : ''

export const ICONS = {
  MAIN: publicPath + "media/main.svg",
  DEFAULT:{16: publicPath + "media/simple_16.png", 32: publicPath + "media/simple_32.png", 64: publicPath + "media/simple_64.png"} ,
  WORK:{16: publicPath + "media/work_16.png", 32: publicPath + "media/work_32.png", 64: publicPath + "media/work_64.png"},
  REST:{16: publicPath + "media/rest_16.png", 32: publicPath + "media/rest_32.png", 64: publicPath + "media/rest_64.png"},
  WORK_ALERT: publicPath + 'media/workAlert.png',
  POM_ALERT: publicPath +'media/pomAlert.png' 
} as const

export const SOUNDS = {
  WORK: publicPath + 'media/work.ogg',
  POM: publicPath + 'media/pom.ogg'
} as const

export const IMGS = {TOGGL_HELP: publicPath + "media/togglHelpImg.png"} as const

/* 
"icons":{"128":"media/main_128.png", "48":"media/main_48.png", "16":"media/simple_16.png"},
"default_icon":{"16":"media/simple_16.png", "32":"media/simple_32.png", "64":"media/simple_64.png"}, */

/* "icons": [
  {
    "src": "static/media/main.svg",
    "sizes": "any"
  },
  {
    "src":"static/media/main_512.png",
    "type": "image/png",
    "sizes": "512x512",
    "purpose": "any"
  }
],
"screenshots" : [
  {
    "src": "screenshot_1.png",
    "sizes": "1080x1920",
    "type": "image/png",
    "label": "abjust work/rest ratio"
  },{
    "src": "screenshot_2.png",
    "sizes": "1080x1920",
    "type": "image/png",
    "label": "get notified when it's time to get back to work again"
  },{
    "src": "screenshot_3.png",
    "sizes": "1080x1920",
    "type": "image/png",
    "label": "use pomodoro"
  },{
    "src": "screenshot_4.png",
    "sizes": "1080x1920",
    "type": "image/png",
    "label": "toggl integration"
  }
],   */