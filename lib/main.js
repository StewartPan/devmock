const {SERVER_OPTION_DEFAULTS, WS_OPTION_DEFAULTS} = require('./defaults');
const server = require('./server');
const ws = require('./ws');

function startServer(options) {
  let resolvedOptions = Object.assign({}, SERVER_OPTION_DEFAULTS, options);
  server(options);
  console.log('server: ', resolvedOptions);
}

function startWS(options) {
  let resolvedOptions = Object.assign({}, WS_OPTION_DEFAULTS, options);
  ws(options);
  console.log('ws: ', resolvedOptions);
}

module.exports = {startServer, startWS};
