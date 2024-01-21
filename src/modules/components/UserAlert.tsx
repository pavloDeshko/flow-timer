import React, {useContext, memo, ReactNode} from 'react'
import {
  Typography,
  IconButton,
  Collapse,
  Alert, AlertProps } from '@mui/material'
import Close from '@mui/icons-material/Close'

import {AlarmType, UserAlertType, UserWarning, UserAlarm} from '../types'
import {useStateLinger} from '../utils'
import {SUPPORT_EMAIL} from '../../settings'
import TEXT from '../text'
import { CopyLink, DispatchContext } from './'

export const UserAlert = memo(({warning:opened, alertType} :{warning:UserWarning|UserAlarm|null, alertType:UserAlertType})=>{
  const dispatch = useContext(DispatchContext)

  const warning = useStateLinger(opened)// Needed so collapse is allowed to close with old content when warning is set to null
  let message :ReactNode = ''
  let alertProps :Partial<AlertProps> = {variant:"filled", severity:'warning'} 

  switch (warning?.type){
    case AlarmType.WORK:{
      message = TEXT.ALERT_WORK
      alertProps.color = 'secondary' as any // TODO mui type is botched?
      break
    }
    case AlarmType.POM:{
      message = TEXT.ALERT_REST
      alertProps.color = 'primary' as any
      break
    }
    case 'ERROR':{
      message = <>
        {warning.userMessage}
        {warning.errorJson && <CopyLink value={TEXT.FEEDBACK_PREPENDED_DATA(warning.errorJson, SUPPORT_EMAIL)} text='error info' />}
      </>
      alertProps = { variant: "outlined", severity: 'error' }
      break
    }
    case 'WARNING':{
      message = warning.userMessage
      alertProps.variant = 'outlined'
    }
  }

  return (
    <Collapse sx={{
      '&':{mt:'0px !important'},
      '& .MuiAlert-root':{mt:"1rem", pb:0}
    }}//moving stack margin inside collapse
      in={!!opened}
    >
      <Alert
        {...alertProps}
        sx={{color:'inherit'}}
        action={<IconButton
          sx={{ paddingY: "2px" }}
          onClick={()=>dispatch({type:'CLOSE_USER_ALERT', alertType})}
        ><Close/>
        </IconButton>}
      ><Typography>{message}</Typography></Alert>
    </Collapse>
  )
})
