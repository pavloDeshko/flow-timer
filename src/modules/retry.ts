const retry = (cb:()=>void, reSet?:()=>void, onFail?:(err:unknown)=>void, n = 3, timeout = 300)=>{
  const process = ()=>{
    try{
      cb()
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