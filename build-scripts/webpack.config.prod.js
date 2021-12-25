const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { getOutputName } = require('./webpack.utils');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: '',
    filename: pathData => {
      return `static/${getOutputName(pathData.chunk.name)}.[chunkhash:8].js`;
    },
    library: '[name]',
    libraryTarget: 'umd',
    clean: true
  }
});
