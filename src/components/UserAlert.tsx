import React, {useContext, memo, ReactNode, useState} from 'react'
import {
  Typography,
  IconButton,
  Collapse,
  Alert,
  AlertProps,
  Link
} from '@mui/material'
import Close from '@mui/icons-material/Close'

import {AlarmType, UserAlertType, UserWarning, UserAlarm} from '../modules/types'
import {text, useStateLinger, Text} from '../modules/utils'
import {useIsNarrow} from '../modules/service'
import {SUPPORT_EMAIL, WEB_VERSION_ADDRESS} from '../settings'
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
      "&.MuiCollapse-hidden":{mt:"0px"},
      //'&':{mt:'0px !important'},//TODO use Collapse-hidden like below
      //'& .MuiAlert-root':{mt:"1rem", pb:0}
    }}//moving stack margin inside collapse
      in={!!opened}
    >
      <Alert
        {...alertProps}
        sx={{color:'inherit', pb:0}}
        action={<IconButton
          sx={{ paddingY: "2px" }}
          onClick={()=>dispatch({type:'CLOSE_USER_ALERT', alertType})}
        ><Close/>
        </IconButton>}
      ><Typography>{message}</Typography></Alert>
    </Collapse>
  )
})

const NoticeContainer = ({children, onClose, opened}:{children:ReactNode, onClose:()=>void, opened:boolean})=>{
  return (
    <Collapse in={opened} sx={{"&.MuiCollapse-hidden":{mt:"0px"}}}>
      <Alert
        variant='filled'
        color={'primary' as any}//TODO type
        sx={{
          color:'primary.contrastText',//'text.primary',
          //lineHeight:'normal',
          paddingY:0,  
          '& .MuiAlert-message':{py:'0.4rem'},
          '& .MuiAlert-action':{pt:'0.1rem', pl:0}
        }}
        icon={false}
        //action={<IconButton size='small'><Close fontSize='small'/></IconButton>}
        onClose={onClose}
      >{children}</Alert>
    </Collapse>
  )
}

export const ExtensionNotice = ({dismissed}:{dismissed:boolean})=>{
  const dispatch = useContext(DispatchContext)

  return(
    <NoticeContainer
      opened = {!dismissed}
      onClose = {()=>dispatch({type:'CLOSE_USER_ALERT', alertType:UserAlertType.VERSION})}
    >
      <Text id='WEB_VERSION_NOTICE' values={{
        LINK: <Link
          sx={{ fontWeight: 'normal' }}//,fontSize:'1rem'}}
          color="inherit"
          target='_blank'
          href={WEB_VERSION_ADDRESS}
        >
          {WEB_VERSION_ADDRESS.replace('https://', '')}
        </Link>
      }} />
    </NoticeContainer>
  )
}

export const MobileNotice = ({dismissed}:{dismissed:boolean})=>{
  const dispatch = useContext(DispatchContext)
  const narrow = useIsNarrow()

  return narrow ? 
    <NoticeContainer 
      opened={!dismissed} 
      onClose={()=>dispatch({type:'CLOSE_USER_ALERT', alertType:UserAlertType.VERSION})}
    >
      <Text id="MOBILE_NOTICE" />
    </NoticeContainer>
  : null
}
