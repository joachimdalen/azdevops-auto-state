const vssConfig = require('./vss-extension.json');
const id = [vssConfig.publisher.toLowerCase(), vssConfig.id.toLowerCase()];

module.exports = {
  getOutputName(moduleName) {
    return [...id, moduleName].join('.');
  }
};
