#! /usr/bin/env node

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

function dirHelper(options){
  // if use options -d, but not specify dir, it will return {dir : 'true'}, weird!!
  let dir = options.dir;
  if(dir){
    dir = dir != 'true'? (path.isAbsolute(dir)? dir : path.join(path.resolve(), dir)) : path.resolve();
  }else{
    dir = path.resolve();
  }
  return dir;
}

if (mod == 'init') {
  if (options.yes) { // Use default config
    let dir = dirHelper(options);
    devmock.initConfigFile(dir, null);
  } else { // Use prompt
    let dir = dirHelper(options);
    configPrompt(dir, (dir, options) => devmock.initConfigFile(dir, options));
  }
}
else if (mod == 'server') {
  devmock.createServer(options.dir);
}
else if (mod == 'ws') {
  devmock.createWS(options.dir);
}
