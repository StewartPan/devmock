const {prepareConfig, createConfig, convertObjToMod} = require('./util');
const startServer = require('./server');
const startWS = require('./ws');
const path = require('path');
const fs = require('fs');
const defaults = require('./defaults');

function createServer(options) {
  if(options.dir != 'true'){
    options.dir = path.isAbsolute(options.dir)? options.dir : path.join(path.resolve(), options.dir);
  }else{
    options.dir = path.resolve();
    console.log('options.dir is ', options.dir);
  }
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
  console.log("successfully create config file");
}

module.exports = {createServer, createWS, initConfigFile};
