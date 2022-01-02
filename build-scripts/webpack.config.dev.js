const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { getOutputName } = require('./webpack.utils');

module.exports = merge(common, {
  devServer: {
    watchFiles: {
      paths: ['src/**']
    },
    devMiddleware: {
      writeToDisk: false
      // stats: 'errors-only'
    },
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    https: true,
    port: 3000,
    hot: true,
    static: [path.resolve(__dirname, 'dist')],
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [
        { from: /\/static\/.+/, to: '/' },
        { from: 'extension-icon.png', to: '/assets/rule-tester-action-icon.png' }
      ]
    }
  },
  output: {
    publicPath: '/',
    filename: pathData => {
      return `static/${getOutputName(pathData.chunk.name)}.js`;
    },
    library: '[name]',
    libraryTarget: 'umd',
    clean: true
  }
});
