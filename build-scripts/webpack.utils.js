const vssConfig = require('../vss-extension.prod.json');
const id = [vssConfig.publisher.toLowerCase(), vssConfig.id.toLowerCase()];
const fs = require('fs');

module.exports = {
  getOutputName(moduleName) {
    return [...id, moduleName].join('.');
  },

  getModuleVersions(modules) {
    return modules
      .filter(x => x.generate)
      .reduce((obj, item) => {
        const moduleFile = JSON.parse(fs.readFileSync(`${item.entry}.json`).toString());
        const version = `${moduleFile.version.Major}.${moduleFile.version.Minor}.${moduleFile.version.Patch}`;
        return {
          ...obj,
          [`${item.name.replace(new RegExp('-', 'g'), '_').toUpperCase()}_VERSION`]: version
        };
      }, {});
  },
  getExtensionVersion() {
    return {
      EXTENSION_VERSION: process.env.TASK_EXTENSION_VERSION || vssConfig.version
    };
  }
};
