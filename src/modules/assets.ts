
import {EXTENSION} from "../settings"

const publicPath = !EXTENSION ? process.env['PUBLIC_URL'] + 'static/' : ''

export const ICONS = {
  MAIN: publicPath + "media/main.svg",
  DEFAULT:{16: publicPath + "media/idle_16.png", 32: publicPath + "media/idle_32.png", 64: publicPath + "media/idle_64.png"} ,
  WORK:{16: publicPath + "media/work_16.png", 32: publicPath + "media/work_32.png", 64: publicPath + "media/idle_64.png"},
  REST:{16: publicPath + "media/rest_16.png", 32: publicPath + "media/rest_32.png", 64: publicPath + "media/rest_64.png"},
  WORK_ALERT: publicPath + 'media/workAlert.svg',
  POM_ALERT: publicPath +'media/workAlert.svg'
} as const

export const SOUNDS = {
  WORK: publicPath + 'media/work.ogg',// TODO debug test remove
  POM: publicPath + 'media/pom.ogg'
} as const

export const IMGS = {TOGGL_HELP: publicPath + "media/togglHelpImg.png"} as const