const HtmlWebpackPlugin = require('html-webpack-plugin');

class ScriptTags {
  apply(compiler) {
    compiler.hooks.compilation.tap('ScriptTags', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('ScriptTags', (data, cb) => {
        const newData = { ...data };

        for (const script of newData.assetTags.scripts) {
          script.attributes.charset = 'UTF-8';
        }
        cb(null, newData);
      });
    });
  }
}
module.exports = ScriptTags;
