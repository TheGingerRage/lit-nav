const path = require('path');

module.exports = {
  entry: {
    litnav_background_bundle: './src/background/background.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'app', 'scripts')
  },
  module: {
    rules: [{ test: /\.(js)$/, use: 'babel-loader' }]
  },
  devtool: 'cheap-module-source-map'
};
