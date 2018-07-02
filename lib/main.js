const {prepareConfig, createConfig} = require('./util');
const server = require('./server');
const ws = require('./ws');
const path = require('path');
const fs = require('fs');
const jsonFormat = require('json-format');

function createServer(path) {
  let resolvedConfig = prepareConfig(path);
  startServer(resolvedConfig);
}

function createWS(path) {
  let resolvedConfig = prepareConfig(path);
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
