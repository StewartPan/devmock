const {resolveDir, writeConfigFile} = require('./util');
const path = require('path');
const defaults = require('./defaults');
const Server = require('./Server');


function createServer(dir) {
    return new Server(resolveDir(dir));
}

function createWS(dir) {

}


function initConfigFile(dir, options) {
    let config = options ? Object.assign({}, options) : defaults;
    config.routes = [];
    let configPath = path.join(dir, 'config.js');
    writeConfigFile(config, configPath);
    console.log("successfully create config file");
}

module.exports = {createServer, createWS, initConfigFile};
