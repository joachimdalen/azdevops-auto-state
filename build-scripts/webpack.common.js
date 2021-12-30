const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptTags = require('./webpack-script-tags-plugin');
const { entries, modules } = require('./entry-points');

console.log(entries);

const vendorGroups = modules.reduce(
  (obj, item) => ({
    ...obj,
    [`${item.name}-vendor`]: {
      test: /[\\/]node_modules[\\/]/,
      name: `${item.name}.vendor`,
      enforce: true,
      chunks: chunk => {
        return chunk.name === item.name;
      }
    }
  }),
  {}
);

console.log(vendorGroups);

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: entries,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'azure-devops-extension-sdk': path.resolve('node_modules/azure-devops-extension-sdk')
    }
  },
  // stats: 'errors-only',
  optimization: {
    runtimeChunk: {
      name: entrypoint => `${entrypoint.name}.runtime`
    },
    splitChunks: {
      cacheGroups: vendorGroups
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
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      }
    ]
  },
  plugins: [new ScriptTags()].concat(
    modules
      .filter(x => x.generate)
      .map(entry => {
        return new HtmlWebpackPlugin({
          meta: {
            charset: 'UTF-8'
          },
          filename: entry.name + '.html',
          inject: false,
          templateContent: ({ htmlWebpackPlugin }) =>
            `<html><head>${htmlWebpackPlugin.tags.headTags}</head><body><div id="${entry.root}"></div>${htmlWebpackPlugin.tags.bodyTags}</body></html>`,
          chunks: [entry.name]
        });
      })
  )
};
