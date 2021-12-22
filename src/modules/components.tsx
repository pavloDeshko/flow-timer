import React, {useContext, useRef, memo, ChangeEvent, ReactNode} from 'react'
import {
  Button, 
  IconButton, 
  TextField, 
  FormControlLabel, 
  Switch, 
  Slider, 
  Select, SelectChangeEvent,
  InputAdornment,
  Tooltip, 
  Typography, 
  MenuItem,
  Box,
  Stack,
  Paper
} from '@mui/material'
import {
  Update, 
  Save, 
  Link, 
  ExitToApp, 
  CreateOutlined, 
  LockOutlined, 
  BrightnessMedium, 
  Refresh, 
  FileCopyOutlined
} from '@mui/icons-material'
import clipboardCopy from 'clipboard-copy'


import {Action, Time, Config, TogglLogin, TogglForm as TogglFormData, Toggl_Project, Mode} from './types'
import {padTwoZeros, log, } from './utils'
import {SUPPORT_EMAIL} from './settings'

export const DispatchContext = React.createContext((a:Action)=>{log.debug('Dispached action: ', a)})//for testing compts without provider

export const AppContainer = ({children}:{children: ReactNode}) => <Box sx={{
  maxWidth: 240,
  fontFamily:'default',
  backgroundColor:'background.default'
}}>{children}</Box>//TODO see into why styled doesnt check option keys

export const BlockContainer = ({children, className}:{children: ReactNode, className?: string}) => (
  <Paper className={className} elevation={2} sx={{
    margin: 1,
    padding: 1 
  }}>{children}</Paper>
)

export const Counter = ({hours, minutes, seconds, status} :Time & {status :{working:boolean,resting:boolean}}) => {
/*   const colors = {
    [Status.IDLE]:'text',
    [Status.WORKING]:'secondary',
    [Status.RESTING]:'primary'
  } as const
 */
  const color = status.resting ? 'primary.main' : status.working ? 'secondary.main' : 'text.primary'

  return(
    <Box sx={{
      padding: 1,
      textAlign:'center',
      typography:'h3',
      '.delimiter':{color}
    }}>
      <span>{padTwoZeros(hours)}</span>
      <span className='delimiter'>:</span>
      <span>{padTwoZeros(minutes)}</span>
      <span className='delimiter'>:</span>
      <span>{padTwoZeros(seconds)}</span>
    </Box>
  )
}

export const Legend = memo(({working, resting} :{working :boolean, resting :boolean}) => {
  return (
    <Box sx={{
      textAlign:'center',
      color: resting ? 'primary.main' : working ? 'secondary.main' : 'text.main'
    }}>
      <span>{working ? 'working..' : resting ? 'resting..' : ''}</span>
    </Box>
  )
})

export const TimeForm = memo(({hours = 0, minutes = 0, seconds = 0}:{hours :number, minutes :number, seconds :number}) => {
  const dispatch = useContext(DispatchContext)

  const hoursRef = useRef<HTMLInputElement>()
  const minutesRef = useRef<HTMLInputElement>()
  const secondsRef = useRef<HTMLInputElement>()
  
  const onChange = () => {
    hoursRef.current && minutesRef.current && dispatch({
      type: 'ADJUST',
      time: {
        hours: Number(hoursRef.current!.value), //TODO let it throw is ok?..
        minutes: Number(minutesRef.current!.value),
        seconds: 0
      }
    })
  }

  return(
    <Box sx={{
      marginY:1,
      '& .MuiTextField-root': {
        marginX: 1/4,
        width: '3rem'
      },
      '& .MuiOutlinedInput-input': {
        textAlign: 'center'
      },
      '& .seconds':{
        width:'2rem',
        '.MuiOutlinedInput-input':{
          fontSize: '0.6rem',
          padding: 0.5,
        }
      }
    }}>
      <TextField 
        label='h' 
        size='small' 
        value={padTwoZeros(hours)} 
        inputRef={hoursRef} 
        onChange={onChange} 
      />
      <TextField 
        label='m' 
        size='small' 
        value={padTwoZeros(minutes)} 
        inputRef={minutesRef} 
        onChange={onChange} 
      /> 
      <TextField 
        className='seconds' 
        label='s'
        size='small' 
        value={padTwoZeros(seconds)} 
        inputRef={secondsRef} 
        onChange={onChange} 
    />
    </Box>
  )
})

export const RestAdjust = ({nextRest, mode} :{nextRest :Time, mode :Mode}) => {
  const dispatch = useContext(DispatchContext)

  const onRecalculate = ()=>{
    dispatch({
      type: 'ADJUST',
      time: null
    })
  }

  return (
    <Box sx={{
      marginY:1,
    }}>
      <Typography>Your next rest will be..</Typography> 
      <TimeForm {...nextRest}/>
      <Button 
        variant="text"
        size="small" 
        startIcon={<Update />}
        onClick={onRecalculate} 
        disabled={mode == Mode.ON}
      >reset</Button>
    </Box>
  )
}

export const Controls = memo(() => {
  const dispatch = useContext(DispatchContext)

  const work = () => dispatch({type: 'WORK'})
  const rest = () => dispatch({type: 'REST'})
  
  const buttonProps = {variant:'contained',  size:'large', fullWidth:true} as const
  return (
      <Stack direction={'row'} justifyContent={'space-between'} spacing={2} sx={{
        marginY:1,
        '& .MuiButton-root': {
          padding: 0.5,
          fontWeight: 'fontWeightMedium'
        }
      }}>
        <Button {...buttonProps} color='secondary' onClick={work}>Work</Button>
        <Button {...buttonProps} color='primary' onClick={rest}>Rest</Button>
      </Stack>
  )
})

export const TogglFormBlock = memo((
    {logged, projects, projectId, shouldSave, desc, unsaved} : {logged :boolean, projects :Array<Toggl_Project>} & TogglFormData
  ) => {
  const dispatch = useContext(DispatchContext)
  
  const setActive = (_:unknown, value :boolean) => dispatch({
    type : 'TOGGL_FORM',
    form : {shouldSave: value}
  })
  const setDesc = (e :ChangeEvent<HTMLInputElement>) => dispatch({
    type : 'TOGGL_FORM',
    form: {desc: e.target.value}
  })
  const retroSave = () => dispatch({
    type : 'TOGGL_SAVE_LAST'
  })
  const setProject = (e :SelectChangeEvent) => dispatch({
    type : 'TOGGL_FORM',
    form: {projectId: Number(e.target.value) || null}
  })

  return logged ? (
    <BlockContainer>
      <Stack direction="column" spacing={1}>
        <FormControlLabel label={'Save in toggl'} control={
          <Switch
            color='primary'
            defaultChecked={shouldSave} 
            onChange={setActive} 
          />
        }/>
        <TextField
          label='Description'
          placeholder='..'
          InputProps={{
            startAdornment: (<InputAdornment position='start'><CreateOutlined/></InputAdornment>)
          }}
          defaultValue={desc}
          onInput={setDesc} 
        />
        <Select
          label={'Project'}
          defaultValue={projectId ? String(projectId) : ''}
          onChange={setProject}
        >
          {[
            <MenuItem value={""} key={0}><em>none</em></MenuItem>, 
            ...projects.map(p => <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>)
          ]}
        </Select>
        {!!unsaved && <Button 
          variant="text" 
          size="small"
          startIcon={<Save />}
          onClick={retroSave}
        >save prev work entry</Button>}
      </Stack>
    </BlockContainer>
   ) : null
})

export const OptionsBlock = memo(({ratio, mode, dark} :Config) => {
  const dispatch = useContext(DispatchContext)

  const setRatio = (_:unknown, value :number|number[]) => dispatch({
    type: 'CONFIG',
    config: {ratio : 60 / (value as number)} //TODO shitty material union type for range and value slider
  })
  const setMode = (_:unknown, value :boolean) => dispatch({
    type: 'CONFIG',
    config: {mode : value ? Mode.ON : Mode.OFF}
  })
  const setDark = () => dispatch({
    type: 'CONFIG',
    config: {dark : !dark}
  })

  return (
    <BlockContainer>
      <Typography>Rest ratio:</Typography>
      <Slider
        marks={[1,5,10,15,20,30,45,60].map((value)=>({value}))}
        step={null}
        valueLabelDisplay="auto"
        valueLabelFormat={x=>x+'m'}
        min={1}
        max={60}
        scale={x=>x}//TODO scale it!
        value={Math.floor(60/ratio)}
        onChangeCommitted={setRatio}
      />
      <FormControlLabel label={'Estimate rest'} control={
        <Switch  
          color='primary'
          checked={!!mode}
          onChange={setMode} 
        />
      }/>
      <Tooltip title='dark/light mode'>
        <IconButton color="primary" onClick={setDark}>
          <BrightnessMedium />
        </IconButton>
      </Tooltip>
    </BlockContainer>
  )
})

export const TogglProfileBlock = memo(({token : logged, error, loading} :TogglLogin) => {
  const dispatch = useContext(DispatchContext)
  const tokenRef = useRef<HTMLInputElement>()

  const logIn = () => {
    tokenRef.current && dispatch({
      type: 'TOGGL_IN', 
      token: tokenRef.current.value.replace(/(^\s+)|(\s+$)/g,'') // validation?
    })
  }
  const logOut = () => {
    dispatch({
      type : 'TOGGL_OUT'
    })
  }

  const content = !logged ? ( 
    <div>
      <TextField
        label='Toggle Token'
        placeholder='..'
        InputProps={{
          startAdornment: (<InputAdornment position='start'><LockOutlined/></InputAdornment>)
        }}
        helperText="your token won't be sent anywhere"
        inputRef={tokenRef}
      />
      <Button 
        variant="outlined" 
        color="primary" 
        size="small"
        startIcon={<Link />}//TODO rotate 45deg
        onClick={logIn}
      >connect</Button>
    </div>
   ) : (
    <div>
      <Button 
        variant="outlined" 
        color="primary" size="small" 
        endIcon={<ExitToApp />}
        onClick={logOut} 
        disabled={loading}
      >logout from toggl</Button>
    </div>
  )

  const ifError = error ? (
    <Box sx={{
        color:'error.main'
    }}>
      {error}
    </Box>
  ): null

  return  (
    <BlockContainer>
      {content}
      {ifError}
    </BlockContainer>
  )
})

export const AppFallback = ({error}:{error:Error}) => {
  const reload = ()=>{
    browser.runtime.reload()
  }

  return <div>
    <Typography>
      <p>Sorry, it seems like internals of our app crashed :/</p>
      <p>Please, drop us a note at <CopyLink value={SUPPORT_EMAIL} /> about what happened. Click
        <CopyLink value={`${error.toString()} Stack: \n  ${error.stack}`} text="here"/>
        to copy geeky data and paste it into your email so we can understand what went wrong.
      </p>
      <p>We <span>will</span> try to solve the problem asap!</p>
    </Typography>
    <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>Reload extension</Button>
  </div>
}

export const CopyLink = ({value, text, loading = false}:{value:string, text?:string, loading?:boolean})=>{
  const copy = ()=>clipboardCopy(value)
  
  return <Tooltip title={'copy to clipboard'} arrow>
    <Button
      variant="text"
      size="small"
      startIcon={<FileCopyOutlined fontSize="small" />}
      onClick={copy}
      disabled={loading}
    >{text || value}</Button>
  </Tooltip>
}
