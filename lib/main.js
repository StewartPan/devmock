const path = require('path');
const mkdirp = require('mkdirp');
const {resolveDir, writeConfig, readMockData} = require('./util');
const defaults = require('./defaults');
const Server = require('./Server');


function createServer(dir) {
    return new Server(resolveDir(dir));
}

function createWS(dir) {

}


function initConfigFile(dir, options) {
    let config = options ? Object.assign({}, options) : defaults;
    let configDir = resolveDir(dir);
    config.routes = [];
    let configPath = path.join(configDir, 'config.js');
    let configStr = 'module.exports =' + JSON.stringify(config);
    writeConfig(configPath, configStr).then(()=>{
        console.log('successfully create config.js file');
    }, (error) =>{
        console.log('error occurs when creating config.js file');
    });
    // Todo improve
    mkdirp(path.join(configDir, 'MockData'), function (err) {
        if(err) console.error(err);
    })
}

function loadMockData(dir) {
    let mockDataDir = resolveDir(dir);
    readMockData(mockDataDir);
}

module.exports = {createServer, createWS, initConfigFile, loadMockData};
