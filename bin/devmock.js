const argv = require('argv');
const package = require('../package');
const devmock = require('../lib/main');

const SERVER_MOD = {
  mod: 'server',
  description: 'Http mock server',
  options: [{
    name: 'port',
    short: 'p',
    type: 'int'
  }]
};

// parse command-line arguments
let {options, mod} = argv.mod(SERVER_MOD).version(package.version).run();

if (mod == 'server') {
  devmock.startServer(options);
} else {
  devmock.startWS(options);
}