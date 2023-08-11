import React, {useContext, useRef, useState, memo, ChangeEvent, ReactNode, useEffect, ComponentType} from 'react'
import {
  Paper, PaperProps,
  Box,
  Typography,
  Button,
  ButtonGroup,
  ThemeProvider,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  Select, SelectChangeEvent,
  MenuItem,
  IconButton,
  Slider,
  TextField,
  InputAdornment,
  Tooltip,
  Collapse,
  Theme,
  Checkbox,
  Accordion, AccordionSummary, AccordionDetails,
  Autocomplete,
  Popover,
  Card, CardContent, CardActions, CardMedia,
  Alert,
  Skeleton
 } from '@mui/material'
import Update from "@mui/icons-material/Update"
import Save from "@mui/icons-material/Save"
import Link from "@mui/icons-material/Link"
import ExitToApp from "@mui/icons-material/ExitToApp"
import BrightnessMedium from "@mui/icons-material/BrightnessMedium"
import Brightness4 from '@mui/icons-material/Brightness4'
import Brightness7 from '@mui/icons-material/Brightness7'
import Refresh from "@mui/icons-material/Refresh"
import Key from "@mui/icons-material/Key"
import FileCopyOutlined from "@mui/icons-material/FileCopyOutlined"
import ExpandMore from  "@mui/icons-material/ExpandMore"
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import Close from '@mui/icons-material/Close';

import clipboardCopy from 'clipboard-copy'

import {Action, Time, Config, TogglForm as TogglFormData, TogglProject, Mode, AlarmType} from './types'
import {padTwoZeros, parse, log, useFreeze, msToTime} from './utils'
import {SUPPORT_EMAIL,POM_TIMES,TOGGL_TOKEN_URL, DESC, DESC_LONG, EXTENSION} from '../settings'
import {reload} from './service'
import {IMGS,ICONS} from './assets'
import { boolean } from 'zod'

export const DispatchContext = React.createContext((a:Action)=>{log.debug('Dispached action: ', a)})//for testing compts without provider
const APP_WIDTH = 500 //TODO move to settings?

export const PageContainer = ({children}:{children:ReactNode})=>{
  return (
   <Elevation className="Background" elevation={0} sx={{height:'100vh'}}>
      <Elevation className="Column"  
        elevation={10}
         sx={{
          marginX:"auto",
          maxWidth:APP_WIDTH+'px',
          marginY:"0.5rem"
         }}
      >
        <Elevation sx={{backgroundColor: 'background.web',}} elevation={1}>
          <Stack spacing={1}>
            {children}
          </Stack>
        </Elevation>
      </Elevation>
    </Elevation>
  )
}

export const PageHeader = () => {
  return (<BlockContainer>
    <Stack direction="row" spacing={2}>
      <Box sx={{float:"left"}}><img src={ICONS.MAIN} style={{width:"64px", height:"64px"}} alt="flow timer logo" /></Box>
      <Box>
        <Typography variant="h5" component='h1'>Flow Timer</Typography>
        <Typography>{DESC}</Typography>
      </Box>
    </Stack>
  </BlockContainer>)
}

export const PageDesc = ()=>{
  return (
    <BlockContainer>
      <Typography variant="h5" component="h2">About Frow Timer</Typography>
      <Divider sx={{marginY:"0.5rem"}}/>
      <Typography component="div" align="justify" sx={{'& .MuiTypography-root':{mb:'0.5rem'}}}>
        {DESC_LONG.map((t,n)=><Typography paragraph key={n}>{t}</Typography>)}
      </Typography>
  </BlockContainer>
  )
}

export const AppContainer = ({children}:{children:ReactNode})=>
  <Box className="App" sx={{
    boxSizing: "border-box",
    maxWidth: APP_WIDTH+"px",
    padding: ".5rem",
    backgroundColor: EXTENSION ? "background.default" : "inherit",
    fontFamily: "Roboto, sans-serif"
  }}>
    <Stack className="AppStack" spacing={1}>
      {children}
    </Stack>
  </Box>

export const Elevation = (props :PaperProps)=>{
  const downProps = {
    square:true,
    ...props, 
    sx:{...{width: "100%", margin:"0px",padding:"0px",overflow:"auto"}, ...props.sx}
  }
  return <Paper {...downProps} />
}

const blockStyles= {
  position:"relative",
  padding: "1rem",
  "& .MuiDivider-root":{marginY:"0.5rem"}
} as const

export const BlockContainer = (
  {children, className='', stacked=false, sx = {}}:{children:ReactNode, className?:string, stacked?:boolean, sx?:PaperProps}
) => {
  return <Paper className={className} elevation={4}
      sx={{...blockStyles,...sx}}
  >{stacked ? <Stack spacing={2}>{children}</Stack> : children}</Paper>
}

export const AccordionContainer = (
  {className='', label, children, expanded=false}
  :{className?:string,label:ReactNode,children:ReactNode[],expanded?:boolean}) => {
  expanded = useFreeze(expanded)
  return (
    <Elevation square={false} elevation={4}>
      <Accordion className={className} elevation={4} defaultExpanded={expanded} sx={{
        ...blockStyles,
        boxShadow:0,
        ".MuiAccordionSummary-root, .MuiAccordionDetails-root":{paddingX:0},
        ".MuiAccordionSummary-root":{minHeight:0},
        ".MuiAccordionSummary-content":{marginY:0},
        ".MuiAccordionDetails-root":{padding: "1rem 0 0 0"}
      }} disableGutters={true}>
        <AccordionSummary expandIcon={<ExpandMore fontSize="small" />}>
          {label}
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </Elevation>
  )
}

const HelpPopover = ({children}:{children:ReactNode})=>{
  const triggerRef = React.createRef<SVGSVGElement>()

  const [open, setOpen] = useState(false)

  return(<span>
    <HelpOutlineOutlined
      sx={{fontSize:"inherit",cursor:"pointer"}}
      ref={triggerRef}
      onClick={e=>setOpen(true)}
    />
{  <Popover
      sx={{ml:"10px"}}
      anchorOrigin={{vertical:'top',horizontal:'center'}}
      transformOrigin={{vertical:'bottom',horizontal:'center'}}
      anchorEl={()=>(triggerRef.current as SVGSVGElement)}//TODO botched material function type
      onClose={()=>setOpen(false)}
      open={open}
    >
      {children}
      <IconButton size="small" 
        sx={{position:"absolute", top:'5px', right:'5px'}}
        onClick={_=>setOpen(false)}
      ><Close/></IconButton>
    </Popover>}
  </span>)
}

export const Counter = ({hours, minutes, seconds} :Time) => {
/*   const colors = {
    [Status.IDLE]:'text',
    [Status.WORKING]:'secondary',
    [Status.RESTING]:'primary'
  } as const
  const color = status.resting ? 'primary.main' : status.working ? 'secondary.main' : 'text.primary'
 */
  return(
    <Typography sx={{
      '.seconds': {
        fontSize: '2rem',
        verticalAlign: 'top',
        position: 'relative',
        top: '0.20rem'
      }
    }} variant="h3" component="p" textAlign="center">
      <span>{padTwoZeros(hours)}</span>
      <span className='delimiter'>:</span>
      <span>{padTwoZeros(minutes)}</span>
      <span className='delimiter'>:</span>
      <span className='seconds'>{padTwoZeros(seconds)}</span>
    </Typography>
  )
}

export const RestAdjust = memo(({hours, minutes, seconds, mode} :Time & {mode :Mode}) => {
  const dispatch = useContext(DispatchContext)
  
  const hoursRef = useRef<HTMLInputElement>()
  const minutesRef = useRef<HTMLInputElement>()
  const secondsRef = useRef<HTMLInputElement>()

  const onRecalculate = ()=>{
    dispatch({
      type: 'RECALC'
    })
  }
  const onChange = () => {
    hoursRef.current && minutesRef.current && dispatch({
      type: 'ADJUST',
      time: {
        hours: parse.h(hoursRef.current!.value, hours), //TODO let it throw is ok?..
        minutes: parse.m(minutesRef.current!.value, minutes),
        seconds: parse.s(secondsRef.current!.value, seconds)
      }
    })
  }
  
  return(
    <Box className="NextRestSection" sx={{
      ".legend":{display:"inline-block",paddingY:"0.5rem",mr:0.25},
      ".MuiTextField-root":{width:"3rem", marginX:0.25},
      ".MuiOutlinedInput-input":{textAlign:"center",padding:0.75},
      ".MuiTextField-root.seconds":{
        width:"2rem",
        ".MuiOutlinedInput-input":{
          fontSize:"0.6rem",
          padding:0.5
      }}
    }}>
      <div className="legend">Next rest will be</div>

      <TextField 
        size="small" 
        label="h"
        value={padTwoZeros(hours)} 
        inputRef={hoursRef} 
        onChange={onChange}
      />
      <TextField 
        size="small" 
        label="m" 
        value={padTwoZeros(minutes)} 
        inputRef={minutesRef} 
        onChange={onChange} 
      />
      <TextField 
        size="small" 
        label="s" 
        className="seconds" 
        value={padTwoZeros(seconds)} 
        inputRef={secondsRef} 
        onChange={onChange} 
      /> 

      <Tooltip title="reset time" placement="right" arrow>
        <span><IconButton 
          color="primary" 
          onClick={onRecalculate} 
          disabled={mode == Mode.ON}
        ><Update fontSize="small" /></IconButton></span>
      </Tooltip>
    </Box>
  )
})

//const bla = ()=>(<RestAdjustTicker time={44} mod={n=>n/2} mode={Mode.OFF}/>)
/* 
<Collapse in={true}>
               <Alert 
                variant="outlined" 
                severity="warning" 
                sx={{
                  //pl:"0.5rem",
                  "& > *": {paddingY:"0px"}
                }}
                action={<IconButton 
                sx={{paddingY:"0px"}}
                >
                  <Close />
                </IconButton>}
               ><Typography>Time to work!</Typography></Alert>
              </Collapse>
*/

export const Controls = memo(({working,resting}:{working:boolean,resting:boolean}) => {
  const dispatch = useContext(DispatchContext)

  const work = () => dispatch({type: 'WORK'})
  const rest = () => dispatch({type: 'REST'})
  
  //const buttonProps = {variant:'contained',  size:'large', fullWidth:true} as const

  return(
    <ButtonGroup sx={{
      '.MuiButton-root, .MuiButton-root:hover':{borderWidth:'2px'}
    }} fullWidth>
      <Button variant={working? 'contained' : 'outlined'} color="secondary" onClick={work}>{working?'stop working':'work'}</Button>
      <Button variant={resting? 'contained' : 'outlined'} color="primary" onClick={rest}>{resting?'stop resting':'rest'}</Button>
    </ButtonGroup>
  )
})

export const TimeAlert = ({type} :{type :(AlarmType|null)})=>{
  const dispatch = useContext(DispatchContext)
  return (
    <Collapse in={!!type}>
      <Alert
        variant="outlined"
        severity="warning"//TODO color depends on type?
        sx={{
          "& > *": { paddingY: "0px" },
          maxHeight:"2rem",
          ".MuiAlert-message": {overflow:"visible"}//TODO whats wrong?..
        }}
        action={<IconButton
          sx={{ paddingY: "0px" }}
          onClick={()=>dispatch({type:'CLOSE_NOTIFY'})}
        ><Close/>
        </IconButton>}
      ><Typography>{type == AlarmType.WORK ? 'Time to work!' : 'Time to rest!'}</Typography></Alert>
    </Collapse>
  )
}

export const Options = memo(({pomTime, pomActive, ratio, mode, dark} :Config) => {
  log.debug('render options, pomtime: ' + pomTime)
  const dispatch = useContext(DispatchContext)

  const setMode = (_:unknown, value :boolean) => dispatch({
    type: 'CONFIG',
    config: {mode : value ? Mode.ON : Mode.OFF}
  })
  ratio = useFreeze(ratio)
  const setRatio = (_:unknown, value:number|number[]) => dispatch({
    type: 'CONFIG',
    config: {ratio : 60 /  (Array.isArray(value) ? (value[0] || 0) : value) } //TODO shitty material union type for range and value slider
  })
  const setPomActive = (e:ChangeEvent<HTMLInputElement>)=> dispatch({
    type: 'CONFIG',
    config: {pomActive : e.target.checked}
  })
  const setPomTime = (_:unknown, value:string)=> parse.twoDigit(value,pomTime) !== pomTime && dispatch({//reason=="input" TODO why
      type: 'CONFIG',
      config: {pomTime : parse.twoDigit(value,pomTime)}
  })
  const setDark = () => dispatch({
    type: 'CONFIG',
    config: {dark : !dark}
  })

  return(
    <Box>
      <FormControlLabel
        control={<Switch
          color='primary'
          checked={!!mode}
          onChange={setMode}
        />}
        label={"Flow - adjust your rest time"}
      />
      <Typography>Minutes for every hour of work:</Typography>
      <Slider
        min={1}
        max={60}
        step={1}
        valueLabelDisplay="auto"
        valueLabelFormat={l => l + ' m'}
        defaultValue={Math.floor(60 / ratio)}
        onChangeCommitted={setRatio}
      />
      <Divider />

      <FormControlLabel
        sx={{ marginRight: "8px" }}
        control={<Switch
          checked={pomActive}
          onChange={setPomActive}
        />}
        label={"Pomodoro reminder every"}
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
        <Autocomplete
          sx={{ ".MuiAutocomplete-inputRoot .MuiAutocomplete-input": { minWidth: "20px" } }}
          //open={true}
          freeSolo disablePortal disableClearable
          options={POM_TIMES.map(v=>String(v))}
          value={String(pomTime)}
          inputValue={String(pomTime)}
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
      </Box>

      <Divider />

      <Button
        sx={{color:"text.primary", textTransform:"none", fontSize:"1rem", pl:"6px"}}
        size="large"
        startIcon={dark ? <Brightness7 color="primary"/>:<Brightness4 color="primary"/>}
        onClick={setDark}
      >Dark/light mode</Button>
    </Box>
  )
})

export const TogglError = memo( ({error}:{error :string | null})=>{
  return(
    <Collapse in={!!error}>
      <Box 
        sx={{ mb:"-0.5rem",mt:"0.25rem"}}
      >
        <Typography 
          sx={{color:"error.light",fontSize:"0.75rem"}}
        >
          {error}
        </Typography>
      </Box>
    </Collapse>
  )
})

const TogglHelpCard = ()=>(
  <Card sx={{maxWidth:"300px"}}>
    <CardMedia component="img" width="300px" alt="Help Image" image={IMGS.TOGGL_HELP}/>
    <CardContent sx={{pb:"0"}}>
      <Typography>Loren Ipsun blablabla Loren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablablaLoren Ipsun blablabla </Typography> 
    </CardContent>
    <CardActions>
      <Button size="small" href={TOGGL_TOKEN_URL} target="_blank">
        Go to toggl profile
      </Button>
    </CardActions>
  </Card>
)

export const TogglLogin = memo(({loading} :{loading:boolean}) => {

  const dispatch = useContext(DispatchContext)
  const [token,setToken] = useState('')
  const valid = parse.togglToken(token).success
 
  const logIn = () => {
    const parsed = parse.togglToken(token)
    parsed.success && dispatch({
      type: 'TOGGL_IN', 
      token: parsed.data
    })
  }
  
  return( 
    <Box>
        {/* <IconButton 
          sx={{position:"absolute", right:1, top:1}}
        >
          <ExpandLess 
            sx={{fontSize:16}}
          />
        </IconButton> */}

        <TextField 
          size="small" 
          type="password" 
          focused
          InputLabelProps={{shrink:true,sx:{pointerEvents:'auto'}}}
          InputProps={{
            startAdornment:
              <InputAdornment position="start"><Key/></InputAdornment>,
            sx:{pl:"0.5rem"}
          }}
          label={
            <Typography component="span" sx={{fontSize:"inherit"}}>
              Your toggl token here
              <HelpPopover><TogglHelpCard/></HelpPopover>
            </Typography>
          } 
          value={token}
          onChange={ e=>setToken(e.target.value) }
          error={token!=='' && !valid}
        />
        
        <Tooltip title="Connect to save time entries in toggle" placement="left" arrow>
          <span><IconButton color="primary"
            sx={{pb:"0px"}}
            onClick={logIn} 
            disabled={!valid || loading}
          >
            <Link fontSize="large" 
              sx={{position:"relative",bottom:"4px"}}
            /> 
          </IconButton></span>
        </Tooltip>
    </Box>
  )


  /* const content = 
    <div>
      <TextField
        label='Toggle Token'
        placeholder='..'
        size="small"
        InputProps={{
          startAdornment: (<InputAdornment position='start'><LockOutlined/></InputAdornment>)
        }}
        helperText="your token won't be sent anywhere"
        value={token}
        onChange={ e=>setToken(e.target.value) }
        error={token!=='' && !valid}
      />
      <Tooltip title="Connect to save time entries in toggle" placement="left-start" arrow>
        <span><IconButton  color="primary" onClick={logIn} disabled={!valid}>
          <Link/>
        </IconButton></span>
      </Tooltip>
    </div>
    (
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
  )*/
})

export const TogglForm = memo((
  {projects, projectId, shouldSave, desc, unsaved} : {projects :Array<TogglProject>} & TogglFormData
) => {
  const dispatch = useContext(DispatchContext)
  
  shouldSave = useFreeze(shouldSave)
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
  const setProject = (e :SelectChangeEvent<number|''>) => dispatch({
    type : 'TOGGL_FORM',
    form: {projectId: Number(e.target.value) || null}
  })

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
          label={'Save next work'} 
          control={
            <Switch
              sx={{mr:-1}}
              color='primary'
              defaultChecked={shouldSave} 
              onChange={setActive} 
            />
        }/>

        <TextField size="small"
          label="Descritpion"
          focused
          value={desc}
          onChange={setDesc} 
        />

        <Select<number|''>
          size="small" 
          sx={{width:"7rem"}}
          value={projectId || ''}
          onChange={setProject}
        >
          {[
            <MenuItem value={""} key={0}><em>-none-</em></MenuItem>, 
            ...projects.map(p => <MenuItem value={p.id} key={p.id}>{p.name}</MenuItem>)
          ]}
        </Select>

        <Tooltip title="Save previous entry" placement="left-start" arrow>
          <IconButton color="primary" 
            sx={{pl:0, visibility: !!unsaved ? 'visible':'hidden'}}
            disabled={!unsaved}
            onClick={retroSave}
          >
            <Save fontSize="medium" />
          </IconButton>
        </Tooltip>
      </Stack>
  </Box>   
  )
})

export const TogglCollapsed = memo(({logged}:{logged:boolean}) => {
  const dispatch = useContext(DispatchContext)
  const logOut = () => {dispatch({
      type : 'TOGGL_OUT'
  })}

  return (
    <Box>
      <Typography
        sx={{ color: "primary.main", fontSize: "0.75rem" }}
      >
        Toggl integration
        {logged && <Tooltip title="Exit from Toggl" placement="left" arrow>
          <IconButton 
            sx={{p:0,pl:1}}
            onClick={logOut} 
            //disabled={loading}
          >
            <ExitToApp
            sx={{fontSize:16}}
            />
          </IconButton>
        </Tooltip>}
      </Typography>
    </Box>
  )
})

export const AppPlaceholder = ()=>(
  <Skeleton variant="rectangular" width={APP_WIDTH} height={"25rem"}/>
)

export const CopyLink = ({value, text, loading = false}:{value:string, text?:string, loading?:boolean})=>{
  const copy = ()=>clipboardCopy(value)
  
  return <Tooltip title={'copy to clipboard'} arrow>
    <Button sx={{
        '.MuiButton-startIcon':{mr:"2px"}
      }}
      variant="text"
      size="small"
      startIcon={<FileCopyOutlined fontSize="small" />}
      onClick={copy}
      disabled={loading}
    >{text || value}</Button>
  </Tooltip>
}

export const Fallback = ({error}:{error:Error}) => {

  return(
    <Paper elevation={3} sx={{padding:"0.5rem", width: APP_WIDTH+'px', boxSizing:"border-box"}}>
      <Typography component="div" sx={{margin:"1rem"}}>
        <Typography variant="h6" component="h2">Sorry, it seems like internals of our app crashed :-/</Typography>
        <p>Please, drop us a note at <CopyLink value={'SUPPORT_EMAIL'} /> about what happened. Click
          <CopyLink value={`${error.toString()} Stack: \n  ${error.stack}`} text="here"/>{/*TODO add state here*/}
          to copy geeky data and paste it into your email so we can understand what went wrong.
        </p>
        <p>We <span>will</span> try to solve the problem asap!</p>
        <Box sx={{textAlign:'center'}}>
          <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>Reload {EXTENSION ? 'extension' : 'page'}</Button>
        </Box>
      </Typography>
    </Paper>
  )
}
