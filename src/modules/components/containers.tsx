import React, {useState, ReactNode} from 'react'
import {
  Paper, PaperProps,
  Box,
  Stack,
  IconButton,
  Accordion, AccordionSummary, AccordionDetails,
  Popover
} from '@mui/material'
import ExpandMore from  "@mui/icons-material/ExpandMore"
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined'
import Close from '@mui/icons-material/Close'

import {EXTENSION, APP_WIDTH} from '../../settings'

/// Containers ///
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
  {className='', label, children, expanded=false}:{className?:string,label:ReactNode,children:ReactNode[],expanded?:boolean}) => {
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

/** Help icon button and popover it opens with content passed down as children */
export const HelpPopover = ({children}:{children:ReactNode})=>{
  const [anchor, setAnchor] = useState<SVGSVGElement | null>(null)

  return(<span>
    <HelpOutlineOutlined
      sx={{ml:'0.3rem',cursor:"pointer"}} 
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