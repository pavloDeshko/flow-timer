const fs = require('fs')
const CopyPlugin = require("copy-webpack-plugin")
const EventHooksPlugin = require('event-hooks-webpack-plugin')
const EnvPlugin = require('webpack').EnvironmentPlugin

const writeData = ()=>{
  // Text data
  const EN = JSON.parse(fs.readFileSync('./public/common/_locales/en/messages.json', 'utf8'))
  const APP_DESC = EN['APP_DESC'].message

  // Description for Extension and PWA manifests 
  const setDesc = path => {
    const result = JSON.parse(fs.readFileSync(path, 'utf8'))
    result.description = APP_DESC//updateValue(data.description)
    fs.writeFileSync(path, JSON.stringify(result, undefined, 2))
  }
  setDesc('./src/manifest.json')
  setDesc('./public/web/manifest.json')

  // Types for messages
  fs.writeFileSync(
    './src/messages.d.json.ts', 
    `export default ${JSON.stringify(EN,undefined,2)} as const`
  )
  
  // Used by cra for index.html TODO! just change it in public/index.html
  const content = 'REACT_APP_APP_DESC='+APP_DESC
  if(fs.readFileSync('./.env','utf8') !== content){
    fs.writeFileSync('./.env', content)
    throw new Error('APP_DESC in .env file was updated, one more build might be needed for changes to take effect.')
  }
  
}

const getPlugins = (EXTENSION)=>[
  new EventHooksPlugin({'environment': writeData}),
  new EnvPlugin({
    "REACT_APP_ENV": EXTENSION ? "" : "REACT_APP_ENV",
    //"REACT_APP_APP_DESC": APP_DESC
  }),
  new CopyPlugin({
    patterns: EXTENSION ? 
      ['../public/extention','../public/common'] : 
      [{from:'./public/common',to:'./static'}]
  })
]

module.exports.EXT = getPlugins(true)
module.exports.WEB = getPlugins(false)










/* const updateValue = (value)=>{
  const key = value?.trim().match(/^%(.*)%$/)?.[1]
  return key !== undefined ? EN[key].message : value
}

const modifyJSON = (path, mod)=>{
  const result = JSON.parse(fs.readFileSync(path, 'utf8'))
  mod(result)
  fs.writeFileSync(path, JSON.stringify(result, undefined, 2))
} */


/* /// EXT
let CopyPlugin = require("copy-webpack-plugin")
let EnvPlugin = require('webpack').EnvironmentPlugin

module.exports = {
  packageTarget:'dist/extension/packages',
  webpack: (config)=>{
    config.plugins.push(new EnvPlugin({"REACT_APP_ENV":""}))
    config.plugins.push(new CopyPlugin({
      patterns:['../public/extention','../public/common']
    }))
    return config
  }
}


/// WEB
let EnvPlugin = require('webpack').EnvironmentPlugin
let CopyPlugin = require("copy-webpack-plugin")
let 

module.exports = (config, env)=>{
  config.plugins = [
    new EnvPlugin({
      "REACT_APP_ENV":"REACT_APP_ENV"
      "REACT_APP_APP_DESC":''
    }),
    new CopyPlugin({patterns:[{from:'./public/common',to:'./static'}]}), 
    ...config.plugins]
  return config
} */