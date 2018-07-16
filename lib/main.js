const {prepareConfig, createConfig, convertObjToMod} = require('./util');
const startServer = require('./server');
const startWS = require('./ws');
const path = require('path');
const fs = require('fs');
const defaults = require('./defaults');

function createServer(options) {
  let resolvedConfig = prepareConfig(options);
  startServer(resolvedConfig, options.dir);
}

function createWS(options) {
  let resolvedConfig = prepareConfig(options);
  startWS(resolvedConfig, options.dir);
}


function initConfigFile(dir, options) {
  //  TODO: need to check the path is absolute or relative
  //  to avoid write data in devmock folder
  let config = options? Object.assign({}, options) : defaults;
  config.routes = [];
  let config_path = path.join(dir, 'config.js');
  convertObjToMod(config, config_path);
}

module.exports = {createServer, createWS, initConfigFile};
