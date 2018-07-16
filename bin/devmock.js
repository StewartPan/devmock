const argv = require('argv');
const package = require('../package');
const devmock = require('../lib/main');
const configPrompt = require('./configPrompt');
const path = require('path');

const MODS = [{
  mod: 'init',
  description: 'Initialize a config file',
  options: [{
    name: 'yes',
    short: 'y',
    type: 'boolean'
  },{
    name: 'dir',
    short: 'd',
    type: 'string'
  }]
}, {
  mod: 'server',
  description: 'Http mock server',
  options: [{
    name: 'dir',
    short: 'd',
    type: 'string'
  }]
}];

// parse command-line arguments
MODS.forEach((opt) => argv.mod(opt));
let {options, mod} = argv.version(package.version).run();


if (mod == 'init') {
  if (options.yes) { // Use default config
    devmock.initConfigFile(dir, null);
  }
  else { // Use prompt
    let dir = options.dir? options.dir : path.resolve();
    configPrompt(dir, devmock.initConfigFile(dir, options));
  }
}
else if (mod == 'server') {
  devmock.createServer(options);
  console.log("The option is ", JSON.stringify(options));
}
else if (mod == 'ws') {
  devmock.createWS(options);
}
