let webpack = require('webpack')

module.exports = (config, env)=>{
  config.plugins = [new webpack.EnvironmentPlugin({
    "REACT_APP_ENV":"REACT_APP_ENV",
  }), ...config.plugins]
  return config
}