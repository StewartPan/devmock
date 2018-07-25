const {prepareConfig, createConfig, convertObjToMod} = require('./util');
const startServer = require('./server');
const startWS = require('./ws');
const path = require('path');
const fs = require('fs');
const defaults = require('./defaults');
const Server = require('./Server');

function createServer(dir) {
  if(dir != 'true'){
    dir = path.isAbsolute(dir)? dir : path.join(path.resolve(), dir);
  }else{
    dir = path.resolve();
    console.log('dir is ', dir);
  }
  return new Server(dir);
}

function createWS(dir) {

}


function initConfigFile(dir, options) {
  let config = options? Object.assign({}, options) : defaults;
  config.routes = [];
  let config_path = path.join(dir, 'config.js');
  convertObjToMod(config, config_path);
  console.log("successfully create config file");
}

module.exports = {createServer, createWS, initConfigFile};
