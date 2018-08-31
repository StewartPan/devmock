const path = require('path');
const mkdirp = require('mkdirp');
const jsondiff = require('json-diff');

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
    let temp = {};
    temp[config['recordUrl']] = config.recordMatcher;
    config['recordMatcher'] = temp;
    config.routes = [];
    delete config['recordUrl'];
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

function compareWorkflow(originWFDir, curWFDir){
    originWFDir = resolveDir(originWFDir);
    curWFDir = resolveDir(curWFDir);
    let originRoutes = require(path.join(originWFDir, 'config.js')).routes;
    let curRoutes = require(path.join(curWFDir, 'config.js')).routes;
    let ext = '.json';
    console.log("The difference of request are shown below:");
    console.log(jsondiff.diffString(originRoutes.sort(), curRoutes.sort()));
    for(let i = 0; i < curRoutes.length; i++){
        if(originRoutes.includes(curRoutes[i])){
            let oldData = require(path.join(originWFDir, curRoutes[i] + ext));
            let curData = require(path.join(curWFDir, curRoutes[i] + ext));
            let diff = jsondiff.diffString(oldData, curData);
            if(diff !== ''){
                console.log("The difference of response for ", curRoutes[i], ':');
                console.log(diff);
            }
        }
    }
}


module.exports = {createServer, createWS, initConfigFile, loadMockData, compareWorkflow};
