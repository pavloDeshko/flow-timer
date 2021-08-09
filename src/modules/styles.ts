import {makeStyles, createTheme} from "@material-ui/core/styles"

const COLORS = {
  background:'Cornsilk'
}

export const theme = createTheme({

})

//APP and its BLOCKS
export const app = makeStyles({
  root: {//whole app
    'padding':"8px",
    'fontFamily':'sans-serif',
    'max-width':'200px',

    "& *": {//all app elements
      'boxSizing': 'border-box'
    },
    '& >div': {//all blocks
      'margin': '8px 2px',
      'border-width': '0px',
      'border-radius': '2px',
      'box-shadow': '4px 4px 2px lightGrey',
      'background': COLORS.background
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