/** Used to copy data (error details) to clipboard when user clicks on the button*/
import React, {memo} from 'react'
import {
  Button,
  Tooltip,
  Skeleton
} from '@mui/material'
import FileCopyOutlined from "@mui/icons-material/FileCopyOutlined"
import clipboardCopy from 'clipboard-copy'

import {APP_WIDTH} from '../settings'
import {text} from '../modules/utils'

export const tooltipMarginProp = {componentsProps:{tooltip:{sx:{m:'4px !important'}}}}

export const CopyLink = memo(({value, message, loading = false}:{value:string, message?:string, loading?:boolean})=>{
  const copy = ()=>clipboardCopy(value)
  
  return <Tooltip {...tooltipMarginProp} title={text('COPY')} placement="right" followCursor>
    <span><Button sx={{ 
        p:0, pl:"0.25rem",
      '.MuiButton-startIcon':{mr:"2px"}}}
      variant="text"
      size="small"
      startIcon={<FileCopyOutlined fontSize="small" />}
      onClick={copy}
      disabled={loading}
    >{message || value}</Button></span>
  </Tooltip>
})

export const AppPlaceholder = ()=>(
  <Skeleton variant="rectangular" width={APP_WIDTH} height={"25rem"}/>
)
