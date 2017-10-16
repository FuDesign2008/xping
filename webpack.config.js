const webpack = require('webpack')

const path = require('path')

const libraryName = 'library'
const plugins = []

const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
const env = process.env.WEBPACK_ENV

let outputFile = `${libraryName}.js`
if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    minimize: true
  }))
  outputFile = `${libraryName}.min.js`
}


const config = {
  entry: path.resolve(__dirname, '/src/index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '/lib'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },

  moudule: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    root: path.resolve('./src'),
    extentions: ['', '.js']
  },

  plugins
}


module.exports = config
