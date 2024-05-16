declare module 'favicon.js' {export function change(url:string):void}

interface Navigator extends Navigator {
  userActivation: {hasBeenActive:boolean, isActive:boolean};
}

declare module "*.svg" {
  import React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}