const {SERVER_OPTION_DEFAULTS, WS_OPTION_DEFAULTS} = require('./defaults');

function startServer(options) {
  let resolvedOptions = Object.assign({}, SERVER_OPTION_DEFAULTS, options);
  console.log('server: ', resolvedOptions);
}

function startWS(options) {
  console.log('ws: TODO');
}

function initConfigFile(options) {
  console.log(options);
}

module.exports = {startServer, startWS, initConfigFile};