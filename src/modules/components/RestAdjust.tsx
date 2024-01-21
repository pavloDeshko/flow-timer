import React, {useContext, useRef, memo, useMemo} from 'react'
import {
  Box,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'
import Update from "@mui/icons-material/Update"

import {Time, Mode} from '../types'
import {padTwoZeros, parse} from '../utils'
import TEXT from '../text'
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
    hoursRef.current && minutesRef.current && dispatch({
      type: 'ADJUST',
      time: {
        hours: parse.h(hoursRef.current!.value, hours), 
        minutes: parse.m(minutesRef.current!.value, minutes),
        seconds: parse.s(secondsRef.current!.value, seconds)
      }
    })
  }

  const fields = useMemo(()=>(<>
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.h}
        value={padTwoZeros(hours)} 
        inputRef={hoursRef} 
        onChange={onChange}
      />
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.m}
        value={padTwoZeros(minutes)} 
        inputRef={minutesRef} 
        onChange={onChange} 
      />
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.s}
        className="seconds" 
        value={padTwoZeros(seconds)}   
        inputRef={secondsRef} 
        onChange={onChange} 
      /> 
  </>),[hours,minutes,seconds,dispatch])

  const tooltip = useMemo(()=>(
    <Tooltip {...tooltipMarginProp} title={TEXT.RECALCULATE} placement="bottom-start" arrow >
      <span><IconButton 
        sx={appMode == Mode.ON ? {display:'none'}:{pb:0,verticalAlign:'top'}}
        color="primary" 
        onClick={onRecalculate} 
        disabled={appMode == Mode.ON}
      ><Update fontSize="small" /></IconButton></span>
  </Tooltip>
  ),[appMode,dispatch])
  
  return(
    <Box className="NextRestSection" sx={{
      ".legend":{display:"inline-block",paddingY:"0.5rem",mr:0.25},
      ".MuiTextField-root":{width:"3rem", marginX:0.25},
      ".MuiOutlinedInput-input":{textAlign:"center",padding:0.75},
      ".MuiTextField-root.seconds":{
        width:"2rem",
        ".MuiOutlinedInput-input":{
          fontSize:"0.6rem",
          padding:0.5
      }}
    }}>
      <Box sx={{mr:'6px'}} className="legend">{TEXT.NEXT_REST_LEGEND}</Box>
      {fields}
      {tooltip}
    </Box>
  )
})