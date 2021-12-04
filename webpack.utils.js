const vssDevConfig = require('./vss-extension.dev.json');
const vssConfig = require('./vss-extension.json');
const id = [vssConfig.publisher.toLowerCase(), vssConfig.id.toLowerCase()];
const devId = [vssDevConfig.publisher.toLowerCase(), vssDevConfig.id.toLowerCase()];

module.exports = {
  getOutputName(moduleName, isDev) {
    return [...(isDev ? devId : id), moduleName].join('.');
  }
};
