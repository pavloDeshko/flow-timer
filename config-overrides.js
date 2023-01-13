let EnvPlugin = require('webpack').EnvironmentPlugin
let CopyPlugin = require("copy-webpack-plugin")

module.exports = (config, env)=>{
  config.plugins = [
    new EnvPlugin({"REACT_APP_ENV":"REACT_APP_ENV"}),
    new CopyPlugin({patterns:[{from:'./public/common',to:'./static'}]}), 
    ...config.plugins]
  return config
}