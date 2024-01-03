import React, {useContext, useRef, useState, memo, ChangeEvent, ReactNode, useCallback, useMemo, useEffect} from 'react'
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
  Alert, AlertProps,
  Skeleton,
  useTheme,
  alpha
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
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined'
import Close from '@mui/icons-material/Close'
import DoneOutlineIcon from '@mui/icons-material/DoneOutline'
import clipboardCopy from 'clipboard-copy'
import Particles from 'react-particles'
import { Container, Engine, Vector, Particle } from "tsparticles-engine"
import {loadLinksPreset} from 'tsparticles-preset-links'

import {Time, Config, TogglForm as TogglFormData, TogglProject, Mode, AlarmType, AlertPos, Warning} from './types'
import {padTwoZeros, parse, useLinger} from './utils'
import {SUPPORT_EMAIL,POM_TIMES,TOGGL_TOKEN_URL, EXTENSION} from '../settings'
import {reload} from './service'
import {IMGS,ICONS} from './assets'
import TEXT from './text'
import {Action} from './events'
//import Background from './Background'

export const DispatchContext = React.createContext((a:Action)=>console.log('Dispached action: ', a))//for testing compts without provider
const APP_WIDTH = 500 //TODO move to settings? 600px minus scrollbars is max for extension

const tooltipMarginProp = {componentsProps:{tooltip:{sx:{m:'4px !important'}}}}

export const PageContainer = ({children, backgroundActive=false}:{children:ReactNode, backgroundActive?:boolean})=>{
  const theme = useTheme()
  return (
    <Elevation className="fallbackBackground" elevation={0} sx={{
      height:'100vh',
      position:'relative',
      backgroundColor:theme.palette.background.backdrop,
      //backgroundImage: `url(${IMGS.BACKGROUND})`
    }}>
      <ParticlesBackground active={backgroundActive} />
      <Elevation className="Column"
        elevation={10}
        sx={{
          marginX: "auto",
          maxWidth: APP_WIDTH,
          marginY: "0.5rem",
          position: "relative"
        }}
      >
        <Elevation className='ColumnBackground' sx={{
          backgroundColor: 'background.web',
        }} elevation={1}>
          <Stack spacing={1}>
            {children}
          </Stack>
        </Elevation>
      </Elevation>
    </Elevation>
  )
}

export const ParticlesBackground = ({active}:{active: boolean})=>{
  const theme = useTheme()

  const containerRef = useRef<Container>()
  const activeRef = useRef(active)
  useEffect(()=>{
    //updated for loaded cb to use if particles are reloaded
    activeRef.current = active
    
    //play/pause for active container
    const container = containerRef.current
    if(container){
      active && container.play()
      !active && container.pause()
    }
  },[active])

  const init = useCallback(async (engine:any) => {
    await loadLinksPreset(engine)
  },[])
  const loaded = useCallback(async(container?:Container)=>{
    if(!container) return
    //console.log('loaded called, current active is:', crunchRef.current )
    containerRef.current = container
    if(!activeRef.current){
      setTimeout(()=>container.pause(),1000)
      //console.log('filter: ', container.particles.filter(()=>true))
      container.particles.filter(()=>true).forEach((p:Particle) => {
        const oldVelocity = p.velocity 
        p.velocity = Vector.create(0, 0)
        setTimeout(() => p.velocity = oldVelocity, 1100)  
      })
    }
  },[])

  const options = useMemo(()=>({
    preset: 'links',
    background: {color: {value:
      theme.palette.background.backdrop
    }},
    particles: {
      number: {value: 60},
      shape:{type:'none'},
      links: {color: {value:
        theme.palette.mode == 'dark' ? theme.palette.primary.light : theme.palette.secondary.main
      }},
      move: {speed: {min:0.25, max:2}}
    }
  }),[theme])
  
  return (
    <Particles options={options} init={init} loaded={loaded} />
  )
}

export const PageHeader = () => {
  const theme = useTheme()
  const splitTitle = TEXT.APP_TITLE.split(' ')
  return (<BlockContainer square={true} >
    <Stack direction="row" spacing={2}>
      <Box sx={{float:"left"}}><img src={ICONS.MAIN} style={{width:"64px", height:"64px"}} alt={TEXT.APP_LOGO_ALT} /></Box>
      <Box>
        <Typography variant="h5" component='h1' sx={{
          '& .title_0':{textShadow:`0px 0px 4px ${theme.palette.primary.main}`},
          '& .title_1':{textShadow:`0px 0px 4px ${alpha(theme.palette.secondary.light, theme.palette.mode == 'light' ?  0.7 : 1)}`},
          color:'text.secondary'
        }}>{
          <><span className="title_0">{splitTitle[0]}</span> <span className="title_1">{splitTitle[1]}</span></>
        }</Typography>
        <Typography>{TEXT.APP_DESC_SHORT}</Typography>
      </Box>
    </Stack>
  </BlockContainer>)
}

export const PageDesc = ()=>{
  return (
    <BlockContainer square={true} sx={{textIndent:'0rem'}}>
      <Typography variant="h5" component="h2">{TEXT.APP_ABOUT_TITLE}</Typography>
      <Divider sx={{marginY:"0.5rem"}}/>
      <Typography component="div" align="justify" sx={{'& .MuiTypography-root':{mb:'0.5rem'}}}>
        {TEXT.APP_ABOUT.map((t,n)=><Typography paragraph key={n}>{'- '+t}</Typography>)}
      </Typography>
  </BlockContainer>
  )
}

export const AppContainer = ({children}:{children:ReactNode})=>
  <Box className="App" sx={{
    boxSizing: "border-box",
    [EXTENSION ? 'minWidth': 'maxWidth']: APP_WIDTH,
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
  {children, className='', stacked=false, sx = {}, ...rest}:{children:ReactNode, className?:string, stacked?:boolean} & PaperProps
) => {
  return <Paper className={className} elevation={4}
      sx={{...blockStyles,...sx}}
      {...rest}
  >{stacked ? <Stack spacing={2}>{children}</Stack> : children}</Paper>
}

export const AccordionContainer = (
  {className='', label, children, expanded=false}
  :{className?:string,label:ReactNode,children:ReactNode[],expanded?:boolean}) => {
    const [initialExpanded] = useState(expanded)

    return (
      <Elevation square={false} elevation={4}>
        <Accordion className={className} elevation={4} defaultExpanded={initialExpanded} sx={{
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
  const [anchor, setAnchor] = useState<SVGSVGElement | null>(null)

  return(<span>
    <HelpOutlineOutlined
      sx={{ml:'0.3rem',cursor:"pointer"}} //TODO too small
      onClick={e=>setAnchor(e.currentTarget)}
    />
{  <Popover
      sx={{ml:"10px"}}
      anchorOrigin={{vertical:'top',horizontal:'center'}}
      transformOrigin={{vertical:'bottom',horizontal:'center'}}
      anchorEl={anchor}//TODO botched material function type
      disableScrollLock={true}
      onClose={()=>setAnchor(null)}
      open={!!anchor}
    >
      {children}
      <IconButton size="small" color="primary"
        sx={{position:"absolute", top:'5px', right:'5px'}}
        onClick={()=>setAnchor(null)}
      ><Close/></IconButton>
    </Popover>}
  </span>)
}

export const Counter = memo(({hours, minutes, seconds} :Time) => {
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
        fontSize: '1.5rem',
        verticalAlign: '1rem'
      }
    }} variant="h3" component="p" textAlign="center">
      <span>{padTwoZeros(hours)}</span>
      <span className='delimiter'>:</span>
      <span>{padTwoZeros(minutes)}</span>
      <span className='delimiter'>:</span>
      <span className='seconds'>{padTwoZeros(seconds)}</span>
    </Typography>
  )
})

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
        hours: parse.h(hoursRef.current!.value, hours), 
        minutes: parse.m(minutesRef.current!.value, minutes),
        seconds: parse.s(secondsRef.current!.value, seconds)
      }
    })
  }
  const fields = useMemo(()=>(<>
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.h}
        value={padTwoZeros(hours)} 
        inputRef={hoursRef} 
        onChange={onChange}
      />
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.m}
        value={padTwoZeros(minutes)} 
        inputRef={minutesRef} 
        onChange={onChange} 
      />
      <TextField 
        size="small" 
        label={TEXT.TIME_LABELS.s}
        className="seconds" 
        value={padTwoZeros(seconds)}   
        inputRef={secondsRef} 
        onChange={onChange} 
      /> 
  </>),[hours,minutes,seconds,dispatch])

  const tooltip = useMemo(()=>(
    <Tooltip {...tooltipMarginProp} title={TEXT.RECALCULATE} placement="bottom-start" arrow >
      <span><IconButton 
        sx={mode == Mode.ON ? {display:'none'}:{pb:0,verticalAlign:'top'}}
        color="primary" 
        onClick={onRecalculate} 
        disabled={mode == Mode.ON}
      ><Update fontSize="small" /></IconButton></span>
  </Tooltip>
  ),[mode,dispatch])
  
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
      <Box sx={{mr:'6px'}} className="legend">{TEXT.NEXT_REST_LEGEND}</Box>
      {fields}
      {tooltip}
    </Box>
  )
})

export const Controls = memo(({working,resting}:{working:boolean,resting:boolean}) => {
  const dispatch = useContext(DispatchContext)

  const work = () => dispatch({type: 'WORK'})
  const rest = () => dispatch({type: 'REST'})
  
  //const buttonProps = {variant:'contained',  size:'large', fullWidth:true} as const

  return(
    <ButtonGroup sx={{
      '.MuiButton-root, .MuiButton-root:hover':{borderWidth:'2px'}
    }} fullWidth>
      <Button variant={working? 'contained' : 'outlined'} color="secondary" onClick={work}>
        {working ? TEXT.STOP_WORK : TEXT.WORK}
      </Button>
      <Button variant={resting? 'contained' : 'outlined'} color="primary" onClick={rest}>
        {resting ? TEXT.STOP_REST : TEXT.REST}
      </Button>
    </ButtonGroup>
  )
})

export const UserAlert = memo(({warning:opened, alertPos} :{warning:Warning|null, alertPos:AlertPos})=>{
  const warning = useLinger(opened)
  
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
    case 'ASK_PERMISSION':{
      message = TEXT.ASK_PERMISSION
      alertProps.variant = 'outlined'
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
      message = warning.message
      alertProps.variant = 'outlined'
    }
  }

  const dispatch = useContext(DispatchContext)
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
          onClick={()=>dispatch({type:'CLOSE_ALERT', alertPos})}//TODO reused as warning
        ><Close/>
        </IconButton>}
      ><Typography>{message}</Typography></Alert>
    </Collapse>
  )
})

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
  const setPomTime = (_:unknown, value:string) => 
    parse.twoDigit(value,pomTimeMins) !== pomTimeMins && dispatch({//reason=="input" TODO! why. what?..
      type: 'CONFIG',
      config: {pomTimeMins : parse.twoDigit(value,pomTimeMins)}
    })
  const setDark = () => dispatch({
    type: 'CONFIG',
    config: {dark : !dark}
  })

  const autocomplete = useMemo(()=>(
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

export const TogglError = memo( ({error}:{error :string | null})=>{
  return(
    <Collapse in={!!error}>
      <Box 
        sx={{ mb:"-0.5rem",mt:"0.25rem"}}
      >
        <Typography 
          sx={{color:"error.main",fontSize:"0.75rem"}}
        >
          {error}
        </Typography>
      </Box>
    </Collapse>
  )
})

const TogglHelpCard = ()=>{
  const HELP_WIDTH = APP_WIDTH * 0.9 //TODO! move out?
  return(
  <Card sx={{maxWidth:HELP_WIDTH}}>
    <CardMedia component="img" height={HELP_WIDTH*(2/3)} width={HELP_WIDTH} alt={TEXT.TOGGL_HELP_IMAGE_ALT} image={IMGS.TOGGL_HELP}/> 
    <CardContent sx={{pb:"0"}}>
      <Typography component="div" paragraph={true} sx={{"& p":{marginY:'.5rem'}}}>
        {TEXT.TOGGL_HELP.split('\n').map((line,i)=>(<p key={i}>{line}</p>))}
      </Typography> 
    </CardContent>
    <CardActions>
      <Button size="small" href={TOGGL_TOKEN_URL} target="_blank">
        {TEXT.TOGGL_GOTO_TOKEN}
      </Button>
    </CardActions>
  </Card>
)}

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
              <Box component="span" sx={{position:'relative', bottom:'0.3rem'}}>{TEXT.TOGGL_TOKEN}</Box>
              <HelpPopover><TogglHelpCard/></HelpPopover>
            </Typography>
          } 
          value={token}
          onChange={ e=>setToken(e.target.value) }
          error={token!=='' && !valid}
        />
        
        <Tooltip {...tooltipMarginProp} title={TEXT.TOGGL_CONNECT} placement="top-end" arrow>
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
  const setProject = (e :SelectChangeEvent<number|''>) => dispatch({
    type : 'TOGGL_FORM',
    form: {projectId: Number(e.target.value) || null}
  })

  const select = useMemo(()=>(
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
  ),[projectId,projects, dispatch])

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

        <Box sx={{m:'0px !important', minWidth:'2.5rem'}}>{
          saved === true ? 
            <Box sx={{
              visibility: !!saved ? 'visible':'hidden',
              fontSize: '0.7rem',
              color: 'primary.light',
              textAlign: 'center',
              pt: "0.7rem",
              lineHeight: '0.5rem'
            }}>
              <DoneOutlineIcon sx={{ fontSize: '1rem' }} />
              {TEXT.TOGGL_SAVED}
            </Box>
          :
            <Tooltip {...tooltipMarginProp} title={TEXT.TOGGL_SAVE_PREV} placement="top-end" arrow>
              <span><IconButton color="primary" 
                sx={{ 
                  visibility: !!saved ? 'visible':'hidden',
                  ml:'0 !important'
                }}
                disabled={!saved}
                onClick={retroSave}
              >
                <Save fontSize="medium" />
              </IconButton></span>
            </Tooltip>
        }</Box>
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
        sx={{ color: "primary.main", fontSize: "0.75rem", mr:'0.3rem'}}
        component="span"
      >
        {TEXT.TOGGL_COLLAPSED}
      </Typography>
        {logged && <Tooltip title={TEXT.TOGGL_EXIT} placement="right" arrow>
          <IconButton 
            sx={{p:0}}
            onClick={logOut} 
            //disabled={loading}
          >
            <ExitToApp
            sx={{fontSize:'1rem'}}
            />
          </IconButton>
        </Tooltip>}
    </Box>
  )
})

export const AppPlaceholder = ()=>(
  <Skeleton variant="rectangular" width={APP_WIDTH} height={"25rem"}/>
)

export const CopyLink = memo(({value, text, loading = false}:{value:string, text?:string, loading?:boolean})=>{
  const copy = ()=>clipboardCopy(value)
  
  return <Tooltip {...tooltipMarginProp} title={TEXT.COPY} placement="right" followCursor>
    <span><Button sx={{ 
        p:0, pl:"0.5rem",
      '.MuiButton-startIcon':{mr:"2px"}}}
      variant="text"
      size="small"
      startIcon={<FileCopyOutlined fontSize="small" />}
      onClick={copy}
      disabled={loading}
    >{text || value}</Button></span>
  </Tooltip>
})

export const Fallback = memo(({errorString}:{errorString:string}) => {
  const content = EXTENSION ? 
    <p>{TEXT.FEEDBACK_PREPENDED(
      <CopyLink value={TEXT.FEEDBACK_PREPENDED_DATA(errorString,SUPPORT_EMAIL)} text={TEXT.FEEDBACK_EMAIL_LINK}/>
    )}</p> 
  :
    <p>{TEXT.FEEDBACK(
      <CopyLink value={errorString} text="here"/>,
      <CopyLink value={'SUPPORT_EMAIL'} />)}
    </p>

  return(
    <Paper elevation={3} sx={{padding:"0.5rem", width: APP_WIDTH, boxSizing:"border-box"}}>
      <Typography component="div" sx={{margin:"1rem"}}>
        <Typography variant="h6" component="h2" color="error">{TEXT.FEEDBACK_TITLE}</Typography>
        {content}
        <p>{TEXT.FEEDBACK_ENDING}</p>
        <Box sx={{textAlign:'center'}}>
          <Button variant="outlined" startIcon={<Refresh/>} onClick={reload}>{EXTENSION ? TEXT.RELOAD_EXT : TEXT.RELOAD_PAGE}</Button>
        </Box>
      </Typography>
    </Paper>
  )
})
