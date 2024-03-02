import retry from './modules/retry'
import {SOUNDS} from './modules/assets'

window.onload = ()=>{
  let audio: HTMLAudioElement
  const load = () => {
    audio = new window.Audio(window.location.search.includes('pom') ? SOUNDS.POM : SOUNDS.WORK)
    audio.addEventListener('ended', ()=>window.close())
  }
  load()
  
  setTimeout(()=>retry(
    () => audio!.play(),
    load,
    (err)=>window.close()//console.error(err)//TODO
  ),100)
/* 
  setTimeout(function () {
    window.close()
  }, 3000) */
}


