const argv = require('argv');
const package = require('../package');
const devmock = require('../lib/main');
const {createServer, createWS} = require('../lib/main');
const SERVER_MOD = {
  mod: 'server',
  description: 'Http mock server',
  options: [{
    name: 'port',
    short: 'p',
    type: 'int'
  },{
    name: 'dir',
    short: 'd',
    type: 'path'
  }]
};

// parse command-line arguments
let {options, mod} = argv.mod(SERVER_MOD).version(package.version).run();


if (mod == 'server') {
  devmock.createServer(path);
} else {
  devmock.createWS(path);
}
