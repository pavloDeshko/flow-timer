import retry from './modules/retry'
import {SOUNDS} from './modules/assets'

window.onload = ()=>{
  window.focus()
  window.alert()
  window.scroll()
  let audio: HTMLAudioElement
  const load = () => {
    audio = new window.Audio(window.location.search.includes('pom') ? SOUNDS.POM : SOUNDS.WORK)
  }

  load()
  setTimeout(()=>retry(
    () => audio!.play(),
    load,
    (err)=>console.error(err)
  ),100)

  setTimeout(function () {
    window.close()
  }, 5000)
}


