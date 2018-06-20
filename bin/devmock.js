const argv = require('argv');
const package = require('../package');

// default values
const DEFAULT_PORT = 9080;

let options = [{
  name: 'port',
  short: 'p',
  type: 'int',
  description: `Defines the port of dev mock server. Defaults to ${DEFAULT_PORT}`,
  example: "'devmock --port=value' or 'devmock -p value'"
}];

let args = argv.option(options).version(package.version).help().run();
console.dir(args);