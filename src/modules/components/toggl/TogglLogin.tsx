import React, {useContext, useState, memo} from 'react'
import {
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material'
import Link from "@mui/icons-material/Link"
import Key from "@mui/icons-material/Key"

import {TogglHelpCard, HelpPopover} from '../'
import {parse, text} from '../../utils'
import { DispatchContext, tooltipMarginProp } from '../'

export const TogglLogin = memo(({loading} :{loading:boolean}) => {
  const dispatch = useContext(DispatchContext)

  const [token,setToken] = useState('')
  const valid = parse.togglTokenSafe(token).success
 
  const logIn = () => {
    const parsed = parse.togglTokenSafe(token)
    parsed.success && dispatch({
      type: 'TOGGL_IN', 
      token: parsed.data
    })
  }
  
  return( 
    <Stack direction="row">
        <TextField sx={{width:"100%", maxWidth:"14rem"}}
          size="small" 
          type="password" 
          focused
          InputLabelProps={{shrink:true,sx:{pointerEvents:'auto'}}}
          InputProps={{
            startAdornment:
              <InputAdornment position="start"><Key/></InputAdornment>,
            sx:{pl:"0.5rem"},
            inputProps:{sx:{pr:"0.5rem"}}
          }}
          label={
            <Typography component="span" sx={{fontSize:"inherit"}}>
              <Box component="span" sx={{position:'relative', bottom:'0.3rem'}}>{text('TOGGL_TOKEN')}</Box>
              <HelpPopover><TogglHelpCard/></HelpPopover>
            </Typography>
          } 
          value={token}
          onChange={ e=>setToken(e.target.value) }
          error={token!=='' && !valid}
        />
        <Tooltip {...tooltipMarginProp} title={text('TOGGL_CONNECT')} placement="top-end" arrow>
          <span><IconButton color="primary"
            sx={{pb:"0px"}}
            onClick={logIn} 
            disabled={!valid || loading}
          >
            <Link fontSize="large" 
              sx={{position:"relative",bottom:"0.3rem"}}
            /> 
          </IconButton></span>
        </Tooltip>
    </Stack>
  )
})