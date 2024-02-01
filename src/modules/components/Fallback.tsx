import React, {memo} from 'react'
import {
  Paper, 
  Box,
  Typography,
  Button 
} from '@mui/material'
import Refresh from "@mui/icons-material/Refresh"

import {SUPPORT_EMAIL,EXTENSION, APP_WIDTH} from '../../settings'
import {reload} from '../service'
import TEXT from '../text'
import { CopyLink } from './'
import { Settings } from '@mui/icons-material'

/// Some extras ///
export const Fallback = memo(({errorString}:{errorString:string}) => {
  const content = EXTENSION ? 
    <p>{TEXT.FEEDBACK_PREPENDED(
      <CopyLink value={TEXT.FEEDBACK_PREPENDED_DATA(errorString,SUPPORT_EMAIL)} text={TEXT.FEEDBACK_EMAIL_LINK}/>
    )}</p> 
  :
    <p>{TEXT.FEEDBACK(
      <CopyLink value={errorString} text="here"/>,
      <CopyLink value={SUPPORT_EMAIL} text={SUPPORT_EMAIL} />)}
    </p>

  return(
    <Paper elevation={3} sx={{padding:"0.5rem", width: APP_WIDTH, boxSizing:"border-box"}}>
      <Typography component="div" sx={{margin:"1rem"}}>
        <Typography variant="h6" component="h2" color="error">{TEXT.FEEDBACK_TITLE}</Typography>
        {content}
        <p>{TEXT.FEEDBACK_ENDING}</p>
        <Box sx={{textAlign:'center'}}>
          <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>{EXTENSION ? TEXT.RELOAD_EXT : TEXT.RELOAD_PAGE}</Button>
        </Box>
      </Typography>
    </Paper>
  )
})
