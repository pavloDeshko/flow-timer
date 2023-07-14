export const errors = {
  frontError: false,
  frontRejection: false,
  backError: false,
  backRejection: false
} as const

export const test = (cb:()=>void) => {
    if(process.env['NODE_ENV'] != 'production' ){
      cb()
    }
  }

export const delay = 5 * 1000