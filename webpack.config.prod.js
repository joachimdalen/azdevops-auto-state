const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const vssConfig = require('./vss-extension.dev.json');
const id = [vssConfig.publisher.toLowerCase(), vssConfig.id.toLowerCase()];

const getOutputName = moduleName => {
  return [...id, moduleName].join('.');
};

const modules = [
  {
    name: 'observer',
    entry: './src/observer/module',
    root: 'observer-container',
    generate: true
  },
  {
    name: 'admin-hub',
    entry: './src/admin-hub/module',
    root: 'admin-hub-container',
    generate: true
  },
  {
    name: 'rule-modal',
    entry: './src/rule-modal/module',
    root: 'modal-container',
    generate: true
  }
];

const entries = modules.reduce(
  (obj, item) => ({
    ...obj,
    [item.name]: item.entry
  }),
  {}
);

console.log(entries);

module.exports = {
  devtool: 'inline-source-map',
  mode: 'production',
  entry: entries,
  output: {
    publicPath: '/',
    filename: pathData => {
      return `static/${getOutputName(pathData.chunk.name)}.[chunkhash:8].js`;
    },
    library: '[name]',
    libraryTarget: 'umd',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'azure-devops-extension-sdk': path.resolve('node_modules/azure-devops-extension-sdk')
    }
  },
  // stats: 'errors-only',
  optimization: {
    runtimeChunk: {
      name: entrypoint => `${entrypoint.name}-runtime`
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'azure-devops-ui/buildScripts/css-variables-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.woff$/,
        type: 'asset/resource'
      },
      {
        test: /\.html$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  plugins: [].concat(
    modules
      .filter(x => x.generate)
      .map(entry => {
        return new HtmlWebpackPlugin({
          filename: entry.name + '.html',
          inject: false,
          templateContent: ({ htmlWebpackPlugin }) =>
            `<html><head>${htmlWebpackPlugin.tags.headTags}</head><body><div id="${entry.root}"></div>${htmlWebpackPlugin.tags.bodyTags}</body></html>`,
          chunks: [entry.name]
        });
      })
  )
};
