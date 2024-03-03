import React, {useContext, memo} from 'react'
import {
  Typography,
  Button,
  ButtonGroup
} from '@mui/material'

import {Time} from '../modules/types'
import {padTwoZeros, text} from '../modules/utils'
import { DispatchContext } from './'

/** Main time display */
export const Counter = memo(({hours, minutes, seconds} :Time) => {
  return(
    <Typography sx={{
      '.seconds': {
        fontSize: '1.5rem',
        verticalAlign: '1rem'
      }
    }} variant="h3" component="p" textAlign="center">
      <span>{padTwoZeros(hours)}</span>
      <span className='delimiter'>:</span>
      <span>{padTwoZeros(minutes)}</span>
      <span className='delimiter'>:</span>
      <span className='seconds'>{padTwoZeros(seconds)}</span>
    </Typography>
  )
})

export const Controls = memo(({working,resting}:{working:boolean,resting:boolean}) => {
  const dispatch = useContext(DispatchContext)

  return(
    <ButtonGroup sx={{
      '.MuiButton-root, .MuiButton-root:hover':{borderWidth:'2px'}
    }} fullWidth>
      <Button 
        variant={working ? 'contained' : 'outlined'} 
        color="secondary" 
        onClick={()=>dispatch({type: working?'STOP_WORK':'START_WORK'})}
      >
        {working ? text('STOP_WORK') : text('WORK')}
      </Button>
      <Button 
        variant={resting ? 'contained' : 'outlined'} 
        color="primary" 
        onClick={()=>dispatch({type: resting ? 'STOP_REST' : 'START_REST'})}
      >
        {resting ? text('STOP_REST') : text('REST')}
      </Button>
    </ButtonGroup>
  )
})