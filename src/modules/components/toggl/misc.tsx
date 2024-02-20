import React, {useContext, memo} from 'react'
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  Card, CardContent, CardActions, CardMedia
} from '@mui/material'
import ExitToApp from "@mui/icons-material/ExitToApp"

import {TOGGL_TOKEN_URL, APP_WIDTH} from '../../../settings'
import {IMGS} from '../../assets'
import {text} from '../../utils'
import { DispatchContext } from '..'


export const TogglCollapsed = memo(({logged}:{logged:boolean}) => {
  const dispatch = useContext(DispatchContext)
  const logOut = () => {dispatch({
      type : 'TOGGL_OUT'
  })}

  return (
    <Box>
      <Typography
        sx={{ color: "primary.main", fontSize: "0.75rem", mr:'0.3rem'}}
        component="span"
      >
        {text('TOGGL_COLLAPSED')}
      </Typography>
        {logged && <Tooltip title={text('TOGGL_EXIT')} placement="right" arrow>
          <IconButton 
            sx={{p:0}}
            onClick={logOut}
          >
            <ExitToApp
            sx={{fontSize:'1rem'}}
            />
          </IconButton>
        </Tooltip>}
    </Box>
  )
})

export const TogglError = memo(({error}:{error :string | null})=>{
  return(
    <Collapse in={!!error}>
      <Box 
        sx={{ mb:"-0.5rem",mt:"0.25rem"}}
      ><Typography 
          sx={{color:"error.main",fontSize:"0.75rem"}}
        >{error}
        </Typography>
      </Box>
    </Collapse>
  )
})

/** Content passed to HelpPopover */
export const TogglHelpCard = ()=>{
  const HELP_WIDTH = APP_WIDTH * 0.9 //TODO move out?

  return(
  <Card sx={{maxWidth:HELP_WIDTH, '& .MuiCardMedia-img':{height:HELP_WIDTH*(2/3), width:HELP_WIDTH}}}>
    <CardMedia component="img" image={IMGS.TOGGL_HELP}/> 
    <CardContent sx={{pb:"0"}}>
      <Typography component="div" paragraph={true} sx={{
          "& p":{marginY:'.5rem'},
          "p.breadcrumbs":{fontStyle:'italic'},
          "p.notice":{fontSize:'80%'}
        }}>
          <p>{text('TOGGL_HELP_INTRO')}</p>
          <p className='breadcrumbs'>{text('TOGGL_HELP_BREADCRUMBS')}</p>
          <p>{text('TOGGL_HELP_OUTRO')}</p>
          <p className='notice'>{text('TOGGL_HELP_NOTICE')}</p>
{/*         {text('TOGGL_HELP').split('\n').map((line,i)=>(//!TODO bs
          <p key={i} className={line.includes('\u2192') ? 'breadCrumbs' : line.includes('NOTE') ? 'note' : ""}>{line}</p>
        ))} */}
      </Typography> 
    </CardContent>
    <CardActions>
      <Button /* size="small"  */href={TOGGL_TOKEN_URL} target="_blank">
        {text('TOGGL_GOTO_TOKEN')}
      </Button>
    </CardActions>
  </Card>
)}