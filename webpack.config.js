const path = require('path');

const MODE = 'development';

module.exports = {
  mode: MODE,
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, '/dist'),
    filename: 'main.js'
  },
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
