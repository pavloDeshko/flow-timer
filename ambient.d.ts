declare module 'favicon.js' {export function change(url:string):void}

interface Navigator extends Navigator {
  userActivation: {hasBeenActive:boolean, isActive:boolean};
}