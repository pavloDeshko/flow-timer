const plugins = require('./prebuild.js').WEB

module.exports = (config, env)=>{
  config.plugins = [...plugins, ...config.plugins]
  return config
}