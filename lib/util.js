const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const mkdirp = require('mkdirp');
const stringifyObject = require('stringify-object');
const beautify = require('js-beautify').js_beautify;
const zlib = require('zlib');
const stream = require('stream');

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

    decompressData: function (encodingType, dataBuf) {
        if (encodingType == 'gzip') {
            dataBuf = zlib.gunzipSync(dataBuf);
        } else if (encodingType == 'deflate') {
            dataBuf = zlib.inflateSync(dataBuf);
        }
        return dataBuf;
    },

    compressData: function (encodingType, dataStr) {
        if (encodingType == 'gzip') {
            zlib.gzip(dataStr, function (error, result) {
                if (error) throw error;
                return result;
            });
        } else if (encodingType == 'deflate') {
            zlib.deflate(dataStr, function (error, result) {
                if (error) throw error;
                return result;
            });
        } else {
            return dataStr;
            // reset the content-length
        }
    },


    isTargetReq: function (req, requestMatcher) {
        let reqFullUrl = url.parse(req.url).pathname;
        for (let i = 0; i < requestMatcher.length; i++) {
            if (reqFullUrl.indexOf(requestMatcher[i]) > -1) return true;
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

    updateConfig: function (Server, route) {
        // avoid writing repeated routes;
        if (Server.configString.indexOf(JSON.stringify(route)) < 0) {
            let config_dir = path.join(Server.dir, 'config.js');
            Server.configString = Server.configString.replace(/(routes\s*:\s*\[[\s\S]*?)(\])/, "$1" + '//' + JSON.stringify(route) + ',\n]');
            let formatData = beautify(Server.configString, {indent_size: 2});
            fs.writeFile(config_dir, formatData, function (err) {
                if (err) {
                    console.log('Error happens in updateConfig function', err);
                }
            });
        }
    },

    streamifyStr: function (str) {
        let bufferStream = new stream.PassThrough();
        bufferStream.end(Buffer.from(str, 'utf-8'));
        return bufferStream;
    }
}
