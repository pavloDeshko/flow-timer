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