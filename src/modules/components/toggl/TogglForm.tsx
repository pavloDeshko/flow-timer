import React, {useContext, useState, memo, ChangeEvent, useMemo} from 'react'
import {
  Box,
  Stack,
  FormControlLabel,
  Switch,
  Select, SelectChangeEvent,
  MenuItem,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'
import Save from "@mui/icons-material/Save"
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'

import {TogglForm as TogglFormData, TogglProject} from '../../types'
import {parse} from '../../utils'
import TEXT from '../../text'
import { DispatchContext, tooltipMarginProp } from '../'

export const TogglForm = memo((
  {projects, projectId, shouldSave, desc, saved} : {projects :Array<TogglProject>} & TogglFormData
) => {
  const dispatch = useContext(DispatchContext)
  const [initialShouldSave] = useState(shouldSave)

  const setActive = (_:unknown, value :boolean) => dispatch({
    type : 'TOGGL_FORM',
    form : {shouldSave: value}
  })
  const setDesc = (e :ChangeEvent<HTMLInputElement>) => dispatch({
    type : 'TOGGL_FORM',
    form: {desc: parse.togglDesc(e.target.value, desc)}
  })
  const retroSave = () => dispatch({
    type : 'TOGGL_SAVE_LAST'
  })
  const setProject = (e :SelectChangeEvent<number|''|'REFRESH'>) => {
    dispatch(e.target.value == 'REFRESH' ? 
      {type: 'TOGGL_REFRESH'}:
      {type : 'TOGGL_FORM',form: {projectId: e.target.value !== 'EMPTY' ? Number(e.target.value) : null}}
    )
  }

  const select = useMemo(()=>(
    <Select<number|''|'REFRESH'>
      size="small" 
      sx={{flexBasis:'8rem', flexShrink:'0.7', overflow:'hidden'}}
      value={projectId ?? ''}
      onChange={setProject}
    >
      {[
        <MenuItem value={"EMPTY"} key={0}><em>-none-</em></MenuItem>, 
        ...projects.map(p => <MenuItem value={p.id} key={p.id}><span style={{color:p.color}}>|</span>&thinsp;{p.name}</MenuItem>),
        <MenuItem value={"REFRESH"} key={-1}><em>-refresh-</em></MenuItem>
      ]}
    </Select>
  ),[projectId,projects, dispatch,/*  refreshed, opened */])

  const savedBit = useMemo(()=>(
    <Box sx={{m:'0px !important', minWidth:'2.5rem'}}>{
      saved === true ? 
        <Tooltip {...tooltipMarginProp} title={TEXT.TOGGL_SAVED_EXT} placement="top-end">
          <Box sx={{
            //visibility: !!saved ? 'visible':'hidden',
            fontSize: '0.7rem',
            color: 'primary.light',
            textAlign: 'center',
            pt: "0.7rem",
            lineHeight: '0.5rem'
          }}>
            <DoneOutlineIcon sx={{ fontSize: '1rem' }} />
            {TEXT.TOGGL_SAVED}
          </Box>
        </Tooltip>
      : !!saved ?
        <Tooltip {...tooltipMarginProp} title={TEXT.TOGGL_SAVE_PREV} placement="top-end" arrow>
          <span><IconButton color="primary" 
            sx={{ 
              //visibility: !!saved ? 'visible':'hidden',
              ml:'0 !important'
            }}
            //disabled={!saved}
            onClick={retroSave}
          >
            <Save fontSize="medium" />
          </IconButton></span>
        </Tooltip>
        : null
    }</Box>
  ),[saved, dispatch])

  return(
    <Box>
      <Stack direction="row" spacing={1}>
        <FormControlLabel 
          sx={{
            mr:0.5,	
            ".MuiFormControlLabel-label":{
              fontSize:'0.7rem',
              lineHeight:'0.9',
              textAlign:'center'
            }
          }}
          label={TEXT.TOGGL_SAVE_NEXT} 
          control={
            <Switch
              sx={{mr:-1}}
              color='primary'
              defaultChecked={initialShouldSave} 
              onChange={setActive} 
            />
        }/>
        <TextField size="small"
          label={TEXT.TOGGL_DESC}
          focused
          value={desc}
          onChange={setDesc} 
        />
        {select}
        {savedBit}
      </Stack>
  </Box>   
  )
})