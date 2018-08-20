const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const mkdirp = require('mkdirp');
const stringifyObject = require('stringify-object');
const zlib = require('zlib');
const stream = require('stream');
const isMatch = require('minimatch');

module.exports = {

    resolveDir: function (dir) {
        // if use options -d, but not specify dir, it will return {dir : 'true'}, weird!!
        if (dir) {
            dir = dir != 'true' ? (path.isAbsolute(dir) ? dir : path.join(path.resolve(), dir)) : path.resolve();
        } else {
            dir = path.resolve();
        }
        return dir;
    },

    decompressData: function (dataBuf, encodingType) {
        if (encodingType == 'gzip') {
            dataBuf = zlib.gunzipSync(dataBuf);
        } else if (encodingType == 'deflate') {
            dataBuf = zlib.inflateSync(dataBuf);
        }
        return dataBuf;
    },

    compressData: function (dataStr, encodingType) {
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
    },

    isTargetReq: function (reqUrl, requestMatcher) {
        let reqPath = url.parse(reqUrl).pathname;
        for (let i = 0; i < requestMatcher.length; i++) {
            if (isMatch(reqPath, requestMatcher[i])) return true;
        }
        return false;
    },

    recordMockData: function (storePath, data) {
        let formatter = {
            type: 'space',
            size: 2,
        }
        mkdirp(path.dirname(storePath), function (err) {
            if ("mkdirp function error", err) {
                console.error(err);
            } else {
                fs.writeFileSync(storePath, jsonFormat(data, formatter), function (err) {
                    if (err) {
                        console.log("writeFileSync error", err);
                    }
                    console.log("The file was saved!");
                });
            }
        });
    },

    writeConfigFile: function (obj, dir) {
        mkdirp(path.dirname(dir), function (err) {
            if (err) {
                console.log("Error happens in writeConfigFile function ", err);
                return;
            }
            let stream = fs.createWriteStream(dir, {flags: 'w'});
            let prettyObj = stringifyObject(obj, {
                indent: '  ',
                singleQuotes: true,
            });
            stream.write(`module.exports = ${prettyObj}`);
            stream.end();

        });
    },

    streamifyStr: function (str) {
        let bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(str, 'utf-8'));
        return bufferStream;
    }
}
