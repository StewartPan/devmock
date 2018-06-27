const {SERVER_OPTION_DEFAULTS, WS_OPTION_DEFAULTS} = require('./defaults');
const {createConfig} = require('../file/createConfig');
const server = require('./server');
const ws = require('./ws');

function startServer(options) {
  let resolvedOptions = Object.assign({}, SERVER_OPTION_DEFAULTS, options);
  createConfig(options);
  server(options);
  console.log('server: ', resolvedOptions);
}

function startWS(options) {
  let resolvedOptions = Object.assign({}, WS_OPTION_DEFAULTS, options);
  createConfig(options);
  ws(options);
  console.log('ws: ', resolvedOptions);
}

module.exports = {startServer, startWS};
