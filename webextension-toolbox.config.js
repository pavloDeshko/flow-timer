const plugins = require('./prebuild.js').EXT

module.exports = {
  packageTarget:'dist/extension/packages',
  webpack: (config)=>{
    config.plugins = [...config.plugins, ...plugins]
    return config
  }
}