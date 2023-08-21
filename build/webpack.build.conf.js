const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const WebpackShellPlugin = require('webpack-shell-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const buildWebpackConfig = merge(baseWebpackConfig, {
  // BUILD config
  mode: 'production',
  
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackShellPlugin({
      onBuildStart:['echo • Start building awesome'], 
      onBuildEnd:['bash deploy/start.sh']})]
})

module.exports = new Promise((resolve, reject) => {
  resolve(buildWebpackConfig)
})
