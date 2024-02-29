import React, {memo} from 'react'
import {
  Paper, 
  Box,
  Typography,
  Button 
} from '@mui/material'
import Refresh from "@mui/icons-material/Refresh"

import {SUPPORT_EMAIL,EXTENSION, APP_WIDTH} from '../settings'
import {reload} from '../modules/service'
import { CopyLink } from './'
import { text, Text } from '../modules/utils'

/// Some extras ///
export const Fallback = memo(({errorString}:{errorString:string}) => {
  //const c = <p><T text="bla" values={{a:<p></p>}}/></p>
  
  const content = EXTENSION ?
    <Text id='FEEDBACK_EXT' values={{
      DATA: text('FEEDBACK_EXT_DATA',{
        EMAIL:SUPPORT_EMAIL,
        DATA:errorString
      })
    }}/>
  :
    <Text id="FEEDBACK_WEB" values={{
      EMAIL: <CopyLink value={SUPPORT_EMAIL} message={SUPPORT_EMAIL} />,
      DATA: <CopyLink value={errorString} message={text('HERE')}/>
    }}/>



  return(
    <Paper elevation={3} sx={{padding:"0.5rem", width: APP_WIDTH, boxSizing:"border-box"}}>
      <Typography component="div" sx={{margin:"1rem"}}>
        <Typography variant="h6" component="h2" color="error">{text('FEEDBACK_TITLE')}</Typography>
        <p>{content}</p>
        <p>{text('FEEDBACK_ENDING')}</p>
        <Box sx={{textAlign:'center'}}>
          <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>{EXTENSION ? text('RELOAD_EXT') : text('RELOAD_PAGE')}</Button>
        </Box>
      </Typography>
    </Paper>
  )
})
