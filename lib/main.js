const {createConfig} = require('../file/createConfig');
const server = require('./server');
const ws = require('./ws');

function createServer(options) {
  if(configE)
  let resolvedOptions = Object.assign({}, SERVER_OPTION_DEFAULTS, options);
  server(options);
  console.log('server: ', resolvedOptions);
}

function createWS(options) {
  let resolvedOptions = Object.assign({}, WS_OPTION_DEFAULTS, options);
  ws(options);
  console.log('ws: ', resolvedOptions);
}

module.exports = {createServer, createWS};
