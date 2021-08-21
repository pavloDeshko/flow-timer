import {makeStyles, createTheme} from "@material-ui/core/styles"

const COLORS = {
  background:'Cornsilk'
}

export const lightTheme = createTheme({
  "palette": {
    "background": {
      "paper": "rgba(243, 251, 245, 1)",
      "default": "rgba(191, 220, 207, 1)"
    },
    "primary": {
      "main": "rgba(94, 168, 167, 1)",
      "contrastText": "#fff"
    },
    "secondary": {
      "main": "rgba(255, 68, 71, 1)",
      "contrastText": "#fff"
    },
    "error": {
      "main": "rgba(196, 0, 31, 1)",
      "contrastText": "#fff"
    },
    "text": {
      "primary": "rgba(0, 0, 0, 0.8)"
    }
  }
})

export const darkTheme = createTheme({
  "palette": {
    "type": "dark",
    "background": {
      "paper": "rgba(44, 44, 44, 1)",
      "default": "rgba(30, 30, 30, 1)"
    },
    "primary": {
      "main": "rgba(94, 168, 167, 1)",
      "contrastText": "#fff"
    },
    "secondary": {
      "main": "rgba(255, 68, 71, 1)",
      "contrastText": "#fff"
    },
    "error": {
      "main": "rgba(196, 0, 31, 1)",
      "contrastText": "#fff"
    },
    "text": {
      "primary": "rgba(255, 255, 255, 0.87)"
    }
  }
})

//APP and its BLOCKS
export const app = makeStyles({
  root: {//whole app
    'padding':"8px",
    'fontFamily':'sans-serif',
    'max-width':'200px',

    "& *": {//all app elements
      //'boxSizing': 'border-box'
    },
    '& >div': {//all blocks
      'margin': '8px 2px',
      'border-width': '0px',
      'border-radius': '2px',
      'box-shadow': '4px 4px 2px lightGrey',
      //'background': COLORS.background
    },
    '& .timerBlock': {//specific block
    }
  }
})

//COMPONENTS
export const counter = makeStyles({
  root: {
    'text-align':'center',
    'font':'36px',
    '& span':{
      
    }
  }
})

export const legend = makeStyles({
  root: {
    'font':'8px',
    'text-align':'center'
  }
})

export const restAdjust = makeStyles({
  root: {
    '& .MuiTextField-root': {
      margin: '0px',
      width: '1.5em'
    }
  }
})

export const timeForm = makeStyles({
  root: {
    
  }
})

export const controls = makeStyles({
  root: {
    padding:"8px",
    backgroundColor:'Cornsilk'
  },
  controlButton: {
    padding:"3px",
    margin:"3px"
  }
})

export const togglForm = makeStyles({
  root: {
    
  }
})

export const options = makeStyles({
  root: {
    
  }
})

export const togglProfile = makeStyles({
  root: {
    
  },
  prompt: {

  },
  status: {

  },
  error:{

  }
})

export const appFallback = makeStyles({
  root: {},
  strong: {}
})