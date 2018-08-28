const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const mkdirp = require('mkdirp');
const zlib = require('zlib');
const stream = require('stream');
const beautify = require('js-beautify').js_beautify;
const filter = ['xts', 'mstrWeb', '_xts_'];


function resolveDir(dir) {
    // if use options -d, but not specify dir, it will return {dir : 'true'}, weird!!
    if (dir) {
        dir = dir != 'true' ? (path.isAbsolute(dir) ? dir : path.join(path.resolve(), dir)) : path.resolve();
    } else {
        dir = path.resolve();
    }
    return dir;
}

function readConfig(dir) {
    try {
        let configStr = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
        return configStr;
    } catch (error) {
        console.log("Can not find config file, make sure the directory is valid");
        throw error;
    }
}

function decompressData (dataBuf, encodingType) {
    if (encodingType == 'gzip') {
        dataBuf = zlib.gunzipSync(dataBuf);
    } else if (encodingType == 'deflate') {
        dataBuf = zlib.inflateSync(dataBuf);
    }
    return dataBuf;
}

function compressData (dataStr, encodingType) {
    return new Promise((resolve, reject) => {
        if (encodingType === 'gzip') {
            zlib.gzip(dataStr, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        } else if (encodingType === 'deflate') {
            zlib.deflate(dataStr, function (error, result) {
                if (error) reject(error);
                else resolve(result);
            });
        } else {
            resolve(dataStr);
        }
    });
}

function writeToFile (storePath, str){
    return new Promise(function(resolve, reject){
        let formatData = beautify(str, {indent_size: 4});
        mkdirp(path.dirname(storePath), function (err) {
            if ("mkdirp function error", err) {
                console.error(err);
                reject(err);
            } else {
                fs.writeFileSync(storePath, formatData, function (err) {
                    if (err) {
                        throw error;
                    }else{
                        console.log("The file was saved!");
                    }
                });
                resolve();
            }
        });
    });
}

function recordMockData (storePath, str) {
    return writeToFile(storePath, str);
}

function writeConfig (storePath, str) {
    return writeToFile(storePath, str);
}

function streamifyStr (str) {
    let bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(str, 'utf-8'));
    return bufferStream;
}

function addRoute (configStr, route) {
    return configStr.replace(/(\"routes\"\s*:\s*\[[\s\S]*?)(\])/, "$1" + '//' + JSON.stringify(route) + ',\n]');
}

function generateRoute (req, mstrMode){
    // filter unnecessary property
    for(let i = 0; i < filter.length; i++){
        delete req.body[filter[i]];
    }
    let route = '';
    if(!mstrMode){
        route = path.join(req.headers.method, req.headers.pathname);
        // corner case when request path ends with / or \, padding with 'folder' so it has filename 'folder'.
        if (route[route.length - 1] == '/' || route[route.length - 1] == '\\') {
            route = path.join(route, 'folder');
        }
    }else{
        let reqbodyStr = JSON.stringify(Array.from(convertObjToMap(req.body).entries()));
        let reqString = req.headers.method + req.headers.pathname + reqbodyStr;
        route = path.join(req.body['taskId'] +'/', crypto.createHash('md5').update(reqString).digest('hex'));
    }
    return route;
}

function readMockData(mockDataDir) {
    let configDir = path.dirname(mockDataDir);
    let configStr = readConfig(configDir);

    let {mstrMode} = eval(configStr);
    let promisesArray = [];
    fs.readdir(mockDataDir, 'utf8', function(err, fileNames){
        if(err){
            console.log('unable to read mockData', err);
            return;
        }
        fileNames.forEach(function (filename) {
            let ReadFilePromise = new Promise(function (resolve, reject) {
                let ext = '.json';
                let mockFilePath = path.join(mockDataDir, filename);
                let {request, response} = require(mockFilePath);
                let route = generateRoute(request, mstrMode);
                let storePath = path.join(configDir, route) + ext;
                configStr = addRoute(configStr, route);
                recordMockData(storePath, JSON.stringify(response)).then(() => {
                    console.log("read mock data in ", mockFilePath);
                    resolve();
                },(error) => {
                    console.log(error);
                    reject();
                });
            });
            promisesArray.push(ReadFilePromise);
        });
        Promise.all(promisesArray).then(() => {
            writeConfig(path.join(configDir, 'config.js'), configStr);
        }, (error) => {
            console.log('Fail to read mock data, error is', error);
        })
    });


}

function convertObjToMap(obj){
    let array = [];
    let map = new Map();
    for(let prop in obj){
        array.push(prop);
    }
    array.sort();
    for(let i = 0; i < array.length; i++){
        map.set(array[i], obj[array[i]]);
    }
    return map;
}

module.exports = {resolveDir, readConfig, decompressData, compressData, recordMockData, writeConfig,
    streamifyStr, addRoute, readMockData, generateRoute};