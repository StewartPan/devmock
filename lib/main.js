const {prepareConfig, createConfig} = require('./util');
const startServer = require('./server');
const startWS = require('./ws');
const path = require('path');
const fs = require('fs');
const jsonFormat = require('json-format');

function createServer(options) {
  let {dir, port} = options;
  let resolvedConfig = prepareConfig(dir, port);
  startServer(resolvedConfig);
}

function createWS(options) {
  let resolvedConfig = prepareConfig(options);
  startWS(resolvedConfig);
}


function initConfigFile(options) {
  let config = Object.assign({}, options);
// delete mockdata_dir since we don't need it.
  delete config.mockdata_dir;
  let config_path = options.mockdata_dir + '\\config.json';
  console.log("config_path " + config_path);

  // store user config as indented json file
  let formatter = {
    type: 'space',
    size: 2,
  }
  fs.writeFileSync(config_path, jsonFormat(config, formatter), function(err){
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  })
  //console.log(options);
}

module.exports = {createServer, createWS, initConfigFile};
