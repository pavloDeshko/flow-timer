import React, {useRef, memo, ReactNode, useCallback, useMemo, useEffect} from 'react'
import {
  Box,
  Typography,
  Stack,
  Divider,
  useTheme,
  alpha
} from '@mui/material'
import Particles from 'react-particles'
import { Container, Vector, Particle } from "tsparticles-engine"
import {loadLinksPreset} from 'tsparticles-preset-links'

import {APP_WIDTH} from '../../settings'
import {useIsNarrow} from '../service'
import {ICONS} from '../assets'
import { Elevation, BlockContainer} from '.'
import { text } from '../utils'

/// Containers ///
export const PageContainer = ({children, backgroundActive=false}:{children:ReactNode, backgroundActive?:boolean})=>{
  const theme = useTheme()
  const narrow = useIsNarrow()
  return (
    <Elevation className="fallbackBackground" elevation={0} sx={{
      height:'100vh',
      position:'relative',
      backgroundColor:theme.palette.background.backdrop,
      //backgroundImage: `url(${IMGS.BACKGROUND})`
    }}>
      {narrow? null : <ParticlesBackground active={backgroundActive} />}
      <Elevation className="Column"
        elevation={10}
        square={!!narrow}
        sx={{
          marginX: "auto",
          maxWidth: APP_WIDTH,
          marginY: narrow ? 0: "0.5rem",
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

/// Extras for web-page variant ///
export const ParticlesBackground = memo(({active}:{active: boolean})=>{
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
    containerRef.current = container
    if(!activeRef.current){
      setTimeout(()=>container.pause(),1000)
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
})

export const PageHeader = () => {
  const theme = useTheme()
  const narrow = useIsNarrow()
  const splitTitle = text('APP_TITLE').split(' ')

  return (<BlockContainer square={true} elevation={7}>
    <Stack direction="row" spacing={2}>
      <Box sx={{float:"left"}}><img src={ICONS.MAIN} style={{width:"64px", height:"64px"}} alt={text('APP_LOGO_ALT')} /></Box>
      <Box>
        <Typography variant="h5" component='h1' sx={{
          '& .title_0':{textShadow:`0px 0px 4px ${theme.palette.primary.main}`},
          '& .title_1': theme.palette.mode == 'light' ?
          {textShadow:`0px 0px 8px ${alpha(theme.palette.secondary.light, 0.6 )}`}:
          {textShadow:`0px 0px 4px ${alpha(theme.palette.secondary.light, 1)}`},
          color:'text.secondary'
        }}>{
          <><span className="title_0">{splitTitle[0]}</span> <span className="title_1">{splitTitle[1]}</span></>
        }</Typography>
        <Typography>{narrow ? text('APP_DESC_SHORTEST') : text('APP_DESC_SHORT')}</Typography>
      </Box>
    </Stack>
  </BlockContainer>)
}

export const PageDesc = ()=> (
  <BlockContainer square={true} sx={{textIndent:'0rem'}} elevation={7}>
    <Typography variant="h5" component="h2">{text('APP_ABOUT_TITLE')}</Typography>
    <Divider sx={{marginY:"0.5rem"}}/>
    <Typography component="div" align="justify" sx={{'& .MuiTypography-root':{mb:'0.5rem'}}}>
      {text('APP_ABOUT').split('\n').map((t,n)=>
        <Typography paragraph key={n}>{'- '+t}</Typography>
      )} 
    </Typography>
</BlockContainer>
)