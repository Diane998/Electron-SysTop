const electron = require('electron'),
  path = require('path'),
  fs = require('fs');

class Store {
  constructor(options) {
    const userDataPath = (electron.app || electron.remove.app).getPath(
      'userData'
    );

    this.path = path.joint(userDataPath, options.configName + '.json');
    this.data = parseDataFile(this.path, options.defaults);
  }

  get(key) {
    return this.data[key];
  }
}
