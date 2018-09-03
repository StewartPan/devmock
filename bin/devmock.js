#! /usr/bin/env node

const argv = require('argv');
const package = require('../package');
const devmock = require('../lib/main');
const configPrompt = require('./configPrompt');

const MODS = [{
    mod: 'init',
    description: 'Initialize a config file',
    options: [{
        name: 'yes',
        short: 'y',
        type: 'boolean'
    }, {
        name: 'dir',
        short: 'd',
        type: 'string'
        }]
    }, {
    mod: 'server',
    description: 'Http/Https mock server',
    options: [{
        name: 'dir',
        short: 'd',
        type: 'string'
    }]
    },{
    mod: 'load',
    description: 'load mock data',
    options: [{
        name: 'dir',
        short: 'd',
        type: 'string'
    },]
    },{
    mod: 'diff',
    description: 'compare current workflow data with original one',
    options: [{
        name: 'originWFDir',
        short: 'w',
        type: 'string'
    },{
        name: 'curWFDir',
        short: 'c',
        type: 'string'
    }]
}];

// parse command-line arguments
MODS.forEach((opt) => argv.mod(opt));
let {options, mod} = argv.version(package.version).run();


if (mod === 'init') {
    if (options.yes) { // Use default config
        devmock.initConfigFile(options.dir, null);
    } else { // Use prompt
        configPrompt(arguments => devmock.initConfigFile(options.dir, arguments));
    }
}else if(mod === 'load') {
    devmock.loadMockData(options.dir);
}else if (mod === 'server') {
    devmock.createServer(options.dir);
}else if (mod === 'ws') {
    devmock.createWS(options.dir);
}else if (mod === 'diff'){
    devmock.compareWorkflow(options.originWFDir, options.curWFDir);
}
