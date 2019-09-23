const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, '../dist/assets/js')
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          }
        ]
      }
    ]
  }
}
