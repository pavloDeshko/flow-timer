import React, {useContext, memo, ReactNode} from 'react'
import {
  Typography,
  IconButton,
  Collapse,
  Alert,
  AlertProps,
  Link
} from '@mui/material'
import Close from '@mui/icons-material/Close'

import {AlarmType, UserAlertType, UserWarning, UserAlarm} from '../types'
import {text, useStateLinger, Text} from '../utils'
import {SUPPORT_EMAIL, WEB_VERSION_ADRESS} from '../../settings'
import { CopyLink, DispatchContext } from './'

export const UserAlert = memo(({warning:opened, alertType} :{warning:UserWarning|UserAlarm|null, alertType:UserAlertType})=>{
  const dispatch = useContext(DispatchContext)
  
  const warning = useStateLinger(opened)// Needed so collapse is allowed to close with old content when warning is set to null
  let message :ReactNode = ''
  let alertProps :Partial<AlertProps> = {variant:"filled", severity:'warning'} 

  switch (warning?.type){
    case AlarmType.REST_END:{
      message = text('ALERT_WORK')
      alertProps.color = 'secondary' as any // TODO mui type is botched?
      break
    }
    case AlarmType.POM:{
      message = text('ALERT_REST')
      alertProps.color = 'primary' as any
      break
    }
    case 'ERROR':{
      message = <>
        {warning.userMessage}
        {warning.errorJson && <CopyLink 
          value={text('FEEDBACK_EXT_DATA',{EMAIL: SUPPORT_EMAIL, DATA:warning.errorJson})} 
          message={text('ERROR_INFO')} 
        />}{/* // TODOt */}
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

export const VersionNotice = ({opened}:{opened:boolean})=>{
  const dispatch = useContext(DispatchContext)

  return (
    <Collapse in={opened}>
      <Alert
        variant='filled'
        color={'primary' as any}//TODO type
        sx={{
          color:'primary.contrastText',//'text.primary',
          //lineHeight:'normal',
          paddingY:0,  
          '& .MuiAlert-message':{paddingY:'0.4rem'},
          '& .MuiAlert-action':{paddingTop:'0.1rem'}
        }}
        icon={false}
        //action={<IconButton size='small'><Close fontSize='small'/></IconButton>}
        onClose={()=>dispatch({type:'CLOSE_USER_ALERT', alertType:UserAlertType.VERSION})} 
      >
        <Text id='WEB_VERTION_NOTICE' values={{LINK:<Link
          sx={{fontWeight:'normal'}}//,fontSize:'1rem'}}
          color="inherit" 
          target='_blank'
          href={WEB_VERSION_ADRESS}
        >{WEB_VERSION_ADRESS.replace('https://','')}</Link>}} />
      </Alert>
    </Collapse>
  )
}
