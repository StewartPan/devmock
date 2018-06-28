const argv = require('argv');
const package = require('../package');
const devmock = require('../lib/main');
const runPrompt = require('./prompt');

const MODS = [{
  mod: 'init',
  description: 'Initialize a config file',
  options: [{
    name: 'yes',
    short: 'y',
    type: 'boolean'
  }]
}, {
  mod: 'server',
  description: 'Http mock server',
  options: [{
    name: 'port',
    short: 'p',
    type: 'int'
  }, {
    name: 'dir',
    short: 'd',
    type: 'path'
  }]
}];

const schema = {
  properties: {
    server_port: {
      description: 'Enter server port',
      type: 'integer',
      default: 9080,
      required: true
    },
    server_url: {
      description: 'Enter server url to proxy',
      type: 'string',
      default: 'http://localhost:8080',
      required: true
    }
  }
};

// parse command-line arguments
MODS.forEach((opt) => argv.mod(opt));
let {options, mod} = argv.version(package.version).run();

if (mod == 'init') {
  if (options.yes) { // Use default config
    devmock.initConfigFile();
  }
  else { // Use prompt
    runPrompt(schema,config=>devmock.initConfigFile(config));
  }
}
else if (mod == 'server') {
  devmock.startServer(options);
}
else if (mod == 'ws') {
  devmock.startWS(options);
}