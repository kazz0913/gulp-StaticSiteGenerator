import merge from 'webpack-merge';
import commonConfig from './webpack.common.js';

export default merge(commonConfig, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'main.js'
  }
})
