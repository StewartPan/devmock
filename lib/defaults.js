const path = require('path');

// current working directory
const CURRENT_DIR = path.resolve();

const SERVER_OPTION_DEFAULTS = {
  port: 9080,
  dir: CURRENT_DIR
};

const WS_OPTION_DEFAULTS = {
  port: 9090,
  dir: CURRENT_DIR
};

module.exports = {SERVER_OPTION_DEFAULTS, WS_OPTION_DEFAULTS};