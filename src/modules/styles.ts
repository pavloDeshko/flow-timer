import {createTheme} from '@mui/material/styles'

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
    'main': '#c4001f',
    'contrastText': '#fff'
  }
} as const

export const lightTheme = createTheme({
  palette: {
    mode:'light',
    ...colors,
    background: {
      paper: '#f3fbf5',
      default: '#bfdccf'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.8)'
    }
  }
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...colors,
    background: {
      paper: '#2c2c2c',
      default: '#1e1e1e'
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)'
    }
  }
})
