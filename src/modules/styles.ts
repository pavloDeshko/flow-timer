declare module "@mui/material/styles" {interface TypeBackground {web?:string}}
import {createTheme, TypeBackground} from '@mui/material/styles'

const colors = {
  primary: {
    'main': '#5ea8a7',
    'contrastText': '#fff'
  },
  secondary: {
    'main': '#ff4447',
    'contrastText': '#fff'
  },
  error: {
    'main': '#e7472e',
    'contrastText': '#fff'
  }
}

export const lightTheme = createTheme({
  palette: {
    mode:'light',
    ...colors,
    background: {
      web: '#bfdccf',
      paper: '#f3fbf5',
      default: '#bfdccf'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.8)'
    }
  }
})

//colors.error.main = "#ff0026"
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
    background: {
      web: 'inherit',
      paper: '#2c2c2c',
      default: '#1e1e1e'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)'
    }
  }
})