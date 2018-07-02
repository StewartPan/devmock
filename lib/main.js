const {prepareConfig, createConfig} = require('./util');
const server = require('./server');
const ws = require('./ws');
const path = require('path');

function createServer(path) {
  let resolvedConfig = prepareConfig(path);
  startServer(resolvedConfig);
}

function createWS(path) {
  let resolvedConfig = prepareConfig(path);
  startWS(resolvedConfig);
}


function initConfigFile(options) {
  console.log(options);
}

module.exports = {createServer, createWS, initConfigFile};
