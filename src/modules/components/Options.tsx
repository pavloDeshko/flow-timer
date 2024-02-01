import React, {useContext, useState, memo, ChangeEvent, useMemo} from 'react'
import {
  Box,
  Typography,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  TextField,
  InputAdornment,
  Autocomplete
} from '@mui/material'
import Brightness4 from '@mui/icons-material/Brightness4'
import Brightness7 from '@mui/icons-material/Brightness7'

import {Config, Mode} from '../types'
import {parse} from '../utils'
import {POM_TIMES} from '../../settings'
import TEXT from '../text'
import { DispatchContext } from './'

export const Options = memo(({pomTimeMins, pomActive, ratio, mode, dark} :Config) => {
  const dispatch = useContext(DispatchContext)
  const [initialRatio] = useState(ratio)

  const setMode = (_:unknown, value :boolean) => dispatch({
    type: 'CONFIG',
    config: {mode : value ? Mode.ON : Mode.OFF}
  })
  const setRatio = (_:unknown, value:number|number[]) => dispatch({
    type: 'CONFIG',
    config: {ratio : 60 /  (Array.isArray(value) ? (value[0] || 0) : value) } //TODO shitty material union type for range and value slider
  })
  const setPomActive = (e:ChangeEvent<HTMLInputElement>)=> dispatch({
    type: 'CONFIG',
    config: {pomActive : e.target.checked}
  })
  const setPomTime = (_:unknown, value:string) => {
    parse.twoDigit(value,pomTimeMins) !== pomTimeMins && dispatch({
      type: 'CONFIG',
      config: {pomTimeMins : parse.twoDigit(value,pomTimeMins)}
    })
  }
  const setDark = () => dispatch({
    type: 'CONFIG',
    config: {dark : !dark}
  })

  const autocomplete = useMemo(()=>(// TODO dyou really need it?
    <Autocomplete
      sx={{ ".MuiAutocomplete-inputRoot .MuiAutocomplete-input": { minWidth: "20px" } }}
      //open={true}
      freeSolo disablePortal disableClearable
      options={POM_TIMES.map(v=>String(v))}
      value={String(pomTimeMins)}
      inputValue={String(pomTimeMins)}
      disabled={!pomActive}
      onInputChange={setPomTime}
      renderInput={par => <TextField {...par} 
        variant="standard" 
        size="small" 
        InputProps={{
          ...par.InputProps, endAdornment: <InputAdornment position="end">m</InputAdornment>
        }} 
      />}
    />
  ),[pomTimeMins, pomActive, dispatch])

  return(
    <Box>
      <FormControlLabel
        control={<Switch
          color='primary'
          checked={!!mode}
          onChange={setMode}
        />}
        label={TEXT.OPTION_FLOW}
      />
      <Typography sx={{mt:'0.25rem'}}>{TEXT.OPTION_FLOW_LEGEND}</Typography>
      <Slider
        min={1}
        max={60}
        step={1}
        valueLabelDisplay="auto"
        valueLabelFormat={l => l + ' m'}
        disabled={!mode}
        defaultValue={Math.floor(60 / initialRatio)}
        onChangeCommitted={setRatio}
      />
      <Divider />
      <FormControlLabel
        sx={{ marginRight: "8px" }}
        control={<Switch
          checked={pomActive}
          onChange={setPomActive}
        />}
        label={TEXT.OPTION_POMODORO}
      />
      <Box className="AutocompleteContainer"
        sx={{
          display: "inline-block",
          position: "relative",
          bottom: "2px",
          ".MuiAutocomplete-listbox .MuiAutocomplete-option": {
            paddingX: "4px"
          }
        }}
      >
        {autocomplete}
      </Box>
      <Divider />
      <Button
        sx={{color:"text.primary", textTransform:"none", fontSize:"1rem", fontWeight:'normal', pl:"6px", pb:0}}
        size="large"
        startIcon={dark ? <Brightness7 color="primary"/>:<Brightness4 color="primary"/>}
        onClick={setDark}
      >{TEXT.OPTION_DARK_LIGHT}</Button>
    </Box>
  )
})