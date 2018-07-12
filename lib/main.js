const {prepareConfig, createConfig, convertObjToMod} = require('./util');
const startServer = require('./server');
const startWS = require('./ws');
const path = require('path');
const fs = require('fs');

function createServer(options) {
  let resolvedConfig = prepareConfig(options);
  startServer(resolvedConfig, options.dir);
}

function createWS(options) {
  let resolvedConfig = prepareConfig(options);
  startWS(resolvedConfig, options.dir);
}


function initConfigFile(options) {
  //  TODO: need to check the path is absolute or relative
  //  to avoid write data in devmock folder


  let config = Object.assign({}, options);
  console.log("the option path is ", options.dir);
  config.routes = [];

  // delete mockdata_dir since we don't need it.
  delete config.dir;
  let config_path = path.join(options.dir, 'config.js');
  console.log("config_path " + config_path);
  convertObjToMod(config, config_path);

  // store user config as indented json file
  //writeFileJSONFormat(config_path, config);




  //console.log(options);
}

module.exports = {createServer, createWS, initConfigFile};
