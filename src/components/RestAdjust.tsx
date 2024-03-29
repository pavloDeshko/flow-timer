import React, {useContext, useRef, memo, useMemo} from 'react'
import {
  Box,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'
import isEqual from 'lodash.isequal'
import Update from "@mui/icons-material/Update"

import {Time, Mode} from '../modules/types'
import {padTwoZeros, parse, text} from '../modules/utils'
import { DispatchContext, tooltipMarginProp } from './'

/** User adjustable time form*/
export const RestAdjust = memo(({hours, minutes, seconds, appMode} :Time & {appMode :Mode}) => {
  const dispatch = useContext(DispatchContext)
  
  const hoursRef = useRef<HTMLInputElement>()
  const minutesRef = useRef<HTMLInputElement>()
  const secondsRef = useRef<HTMLInputElement>()

  const onRecalculate = ()=>{
    dispatch({
      type: 'RECALC'
    })
  }
  const onChange = () => {
    if(!hoursRef.current || !minutesRef.current || !secondsRef.current){return}

    const time = {
      hours: parse.h(hoursRef.current.value, hours), 
      minutes: parse.m(minutesRef.current.value, minutes),
      seconds: parse.s(secondsRef.current.value, seconds)
    }

    !isEqual(time, {hours, minutes,seconds}) && dispatch({
      type: 'ADJUST',
      time
    })
  }

  const fields = useMemo(()=>(<>
      <TextField 
        size="small" 
        label={text('H')}
        value={padTwoZeros(hours)} 
        inputRef={hoursRef} 
        onChange={onChange}
      />
      <TextField 
        size="small" 
        label={text('M')}
        value={padTwoZeros(minutes)} 
        inputRef={minutesRef} 
        onChange={onChange} 
      />
      <TextField 
        size="small" 
        label={text('S')}
        className="seconds" 
        value={padTwoZeros(seconds)}   
        inputRef={secondsRef} 
        onChange={onChange} 
      /> 
  </>),[hours,minutes,seconds,dispatch])

  const button = useMemo(()=>(
    <Tooltip {...tooltipMarginProp} title={text('RECALCULATE')} placement="bottom-start" arrow >
      <span><IconButton 
        sx={{verticalAlign:'top', display: appMode == Mode.PAUSED ? undefined : 'none'}}
        color="primary" 
        onClick={onRecalculate} 
        //disabled={appMode == Mode.ON}
      ><Update fontSize="small" /></IconButton></span> 
  </Tooltip>
  ),[appMode,dispatch])
  
  return(
    <Box className="NextRestSection" sx={{
      ".legend":{display:"inline-block",paddingY:"0.55rem",mr:0.25},
      ".MuiTextField-root":{width:"3rem", marginX:0.25},
      ".MuiOutlinedInput-input":{textAlign:"center",padding:0.75},
      ".MuiTextField-root.seconds":{
        width:"2rem",
        ".MuiOutlinedInput-input":{
          fontSize:"0.6rem",
          padding:0.5
      }}
    }}>
      <Box sx={{mr:'6px'}} className="legend">{text('NEXT_REST_LEGEND')}</Box>
      {fields}
      {button}
    </Box>
  )
})