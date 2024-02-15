declare module "@mui/material/styles" {interface TypeBackground {web:string,backdrop:string}}
import {createTheme} from '@mui/material/styles'

const colors = {
  primary: {
    'main': '#5ea8a7',
    'contrastText': '#deeded'
  },
  secondary: {
    'main': '#ff4447',
    'contrastText': '#ffe6e6'
  },
  error: {
    'main': '#e7472e',
    'contrastText': '#fcebe8'
  }
}

export const lightTheme = createTheme({
  palette: {
    mode:'light',
    ...colors,
    background: {
      web: '#cde4e4',
      paper: '#f3fbf5',
      default: '#cde4e4',
      backdrop: '#EEF6F6'
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
      default: '#1e1e1e',
      backdrop: '#1e1e1e'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)'
    }
  }
})
