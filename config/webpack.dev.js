const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'main.js'
  }
}
