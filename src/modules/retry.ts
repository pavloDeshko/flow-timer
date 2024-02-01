/// Used by sound.html page too, so put in separate module to minimize its batch size ///
const retry = (cb:()=>void|Promise<void>, reSet?:()=>void, onFail?:(err:unknown)=>void, n = 3, timeout = 300)=>{
  const process = async()=>{
    try{
      await cb()
    }catch(err:unknown){
      if(n){
        reSet && reSet()
        setTimeout(process,timeout)
        n--
      }else{
        onFail && onFail(err)
      }
    }
  }
  process()
}

export default retry