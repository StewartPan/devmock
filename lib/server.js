const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');
const zlib = require('zlib');

const {returnMockData, isTargetReq, recordMockData, updateConfig, decompressData, compressData, streamifyStr} = require('./util');
const filter = ['xts'];
let server, proxy;

module.exports = class Server {

    targetUrl = null;
    requestMatcher = null;
    overwrite = null;
    serverPort = null;
    wsPort = null;
    mstrMode = null;
    routes = null;

    constructor(dir) {
        this.dir = dir;
        this.readConfig(dir);
        this.start();
        console.log("Mock server is running on port ", this.serverPort);
    }

    getRouteByReq(req, body, mstrMode) {
        let ext = '.json';
        if (mstrMode) {
            // use hash of string =  method + req.url + reqbody
            // to generate the routes
            // delete property in req body that we don't need;
            for (prop in filter) {
                delete body[prop];
            }
            let reqString = req.method + url.parse(req.url).pathname + JSON.stringify(body);
            let route = crypto.createHash('md5').update(reqString).digest('hex') + ext;
            return route;
        } else {
            let base = path.join(req.method, url.parse(req.url).pathname);
            if (base[base.length - 1] == '/' || base[base.length - 1] == '\\') {
                return path.join(base, 'folder' + ext);
            } else {
                return base + ext;
            }
        }
    }

    parseReqBody(contentType, body) {
        // use indexOf instead of === is because contentType may contain charset parameters.
        if (contentType.indexOf('application/x-www-form-urlencoded')) {
            return queryString.parse(body);
        } else if (contentType.indexOf('application/json')) {
            return JSON.parse(body);
        } else {
            return {"ReqBody": body};
        }
    }

    parseResBody(encodingType, body) {
        // "{\"prop1\" : \"test\\'test\"}"
        body = decompressData(encodingType, body).toString();
        try {
            body = JSON.parse(body);
        } catch (error) {
            body = body;
        }
        return body;
    }

    needRecord(route) {
        if (this.overwrite || this.configString.indexOf(JSON.stringify(route)) < 0) return true;
        else return false;
    }

    readConfig(dir) {
        try {
            this.configString = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
        } catch (error) {
            console.log("Can not find config file, make sure the directory is valid");
            throw error;
        }
        let config = eval(this.configString);
        Object.assign(this, config);
    }

    start() {
        let self = this;
        proxy = httpProxy.createProxyServer({target: this.targetUrl});
        server = http.createServer(function (req, res) {
            let body = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                let bodyObj = parseReqbody(req['content-type'], body); // parse body as object
                let route = getRouteByReq(req, bodyObj, self.mstrMode);
                if (self.routes.includes(route)) {
                    returnMockData(self.dir, res, route);
                } else {
                    let bufferStream = st
                    req.bodyObj = bodyObj;
                    proxy.web(req, res, {buffer: bufferStream});
                }
            });

            proxy.on('proxyRes', function (proxyRes, req, res) {
                if (isTargetReq(req, self.requestMatcher)) {
                    let data = {};
                    let resBody = Buffer.alloc(0);
                    let route = getRouteByReq(req, req.bodyObj, self.mstrMode);
                    if (this.needRecord(route)) {
                        proxyRes.on('data', function (data) {
                            resBody = Buffer.concat([resBody, data]);
                        });
                        proxyRes.on('end', function () {
                            let encodingType = proxyRes.headers['content-encoding'];
                            data.headers = proxyRes.headers;
                            data.body = self.parseResBody(encodingType, resBody);
                            let storePath = path.join(self.dir, route);
                            console.log("Record mock data in", storePath);
                            recordMockData(storePath, data);
                            updateConfig(self, route);
                        });
                    }
                }
            });

            proxy.on('error', function (err, req, res) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('Both Remote Server and MockData are not available');
            });

        }).listen(self.serverPort);
    }

    stop() {
        proxy.close();
        server.close();
    }


}
