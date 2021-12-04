const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { getOutputName } = require('./webpack.utils');

module.exports = merge(common, {
  mode: 'development',
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
        { from: 'dist/control.html', to: 'control.html' },
        { from: 'dist/panel.html', to: 'panel.html' },
        { from: 'admin.html', to: 'admin-hub.html' },
        { from: 'modal.html', to: 'rule-modal.html' }
      ]
    }
  },
  output: {
    publicPath: '/',
    filename: pathData => {
      return `static/${getOutputName(pathData.chunk.name, true)}.js`;
    },
    library: '[name]',
    libraryTarget: 'umd',
    clean: true
  }
});
