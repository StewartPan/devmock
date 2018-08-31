const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const path = require('path');
const queryString = require('query-string');
const fs = require('fs');
const url = require('url');
const isMatch = require('minimatch');
const keyDir = path.join(__dirname, '..', 'keys');


const {readConfig, recordMockData, writeConfig, decompressData, compressData, streamifyStr, addRoute, generateRoute} = require('./util');

let server, proxy;

module.exports = class Server {

    /*
     *   @param
     *   recordUrl: string;
     *   recordMatcher: array of strings;
     *   overwrite: boolean
     *   serverPort: number
     *   wsPort: number
     *   mstrMode: boolean
     *   routes: array of string
     *   https: boolean
     */

    constructor(dir) {
        this.dir = dir;
        this.init(dir);
        this.start();
        console.log("Mock server is running on port ", this.serverPort);
    }

    init(dir) {
        this.configString = readConfig(dir);
        let config = eval(this.configString);
        Object.assign(this, config);
        for(let prop in config.recordMatcher){
            this.recordUrl = prop;
            this.recordMatcher = config.recordMatcher[prop];
        }
    }

    start() {
      // http -> https set changeOrigin: true,
      // https -> https set ssl, set secure: false;
        let self = this;
        let {proxyOpt, httpsOpt} = this.resolveProtocalOpt();
        proxy = httpProxy.createProxyServer(proxyOpt);
        if(self.https){
            server = https.createServer(httpsOpt, (req, res) => serverHandler(req, res))
                .listen(self.serverPort);
        }else{
            server = http.createServer((req, res) => serverHandler(req,res))
                .listen(self.serverPort);
        }

        function serverHandler(req, res){
            //console.log('this in serverHandler is', this);
            let body = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                let bodyObj = parseReqBody(body, req.headers['content-type']); // parse body as object
                req.bodyObj = bodyObj;
                let bufferStream = streamifyStr(body);
                let route = getRouteByReq(req, self.mstrMode);
                if(self.routes.includes(route)){
                    self.respondWithMockData(route, res);
                }else {
                    proxy.web(req, res, {target: self.recordUrl, buffer: bufferStream});
                }
            });
        }

        proxy.on('proxyRes', function (proxyRes, req, res) {
            if (isTargetReq(req.url, self.recordMatcher)) {
                let data = {};
                let resBody = Buffer.alloc(0);
                let route = getRouteByReq(req, self.mstrMode);
                if (self.needRecord(route)) {
                    proxyRes.on('data', function (data) {
                        resBody = Buffer.concat([resBody, data]);
                    });
                    proxyRes.on('end', function () {
                        let encodingType = proxyRes.headers['content-encoding'];
                        let ext = '.json';
                        data.headers = proxyRes.headers;
                        data.body = parseResBody(encodingType, resBody);
                        let storePath = path.join(self.dir, route) + ext;
                        recordMockData(storePath, JSON.stringify(data)).then(()=>{
                            console.log("Record mock data in", storePath);
                            self.updateConfig(route);
                        },(error) => {
                            console.log("error occurs when recordMockData ", error);
                        });
                    });
                }
            }
        });

        proxy.on('error', function (err, req, res) {
            console.log("proxy error is", err);
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Both Remote Server and MockData are not available');
        });

    }

    stop() {
        proxy.close();
        server.close();
    }

    updateConfig(route) {
        // avoid writing repeated routes;
        if (this.configString.indexOf(JSON.stringify(route)) < 0) {
            let configPath = path.join(this.dir, 'config.js');
            this.configString = addRoute(this.configString, route);
            writeConfig(configPath, this.configString).then(()=>{}, (error) =>{
                console.log("fail to update config.js file");
            });
        }
    }

    resolveProtocalOpt(){
        let proxyOpt, httpsOpt;
        if(this.https){
            httpsOpt = {
              key: fs.readFileSync(path.join(keyDir, 'privkey.pem'), 'utf8'),
              cert: fs.readFileSync(path.join(keyDir, 'cacert.pem'), 'utf8')
            }

            proxyOpt = {
                ssl: httpsOpt,
                secure: false,
                changeOrigin: true

            };
        }else{
            proxyOpt = {
                changeOrigin: true
        };
            httpsOpt = {};
        }
        return {proxyOpt, httpsOpt};
    }

    needRecord(route) {
        if (this.overwrite || this.configString.indexOf(JSON.stringify(route)) < 0) return true;
        else return false;
    }

    respondWithMockData (route, res) {
        let ext = '.json';
        let dataPath = path.join(this.dir, route) + ext;
        console.log("Return mockData in ", dataPath);
        let {headers, body} = require(dataPath);
        if (headers) {
            for(let prop in headers){
                res.setHeader(prop, headers[prop]);
            }
            res.headers = Object.assign({}, headers);
            // in the Mstr mode set-up the route number as mockId in the response headers
            if(this.mstrMode) res.setHeader('mockId', route);
        }
        if (body) {
            let encodingType = headers['content-encoding'];
            if (typeof body !== 'string') {
                body = JSON.stringify(body);
            }
            compressData(body, encodingType).then((value) => {
                res.setHeader('content-length', value.length);
                res.write(value);
                res.end();
            }, (error) =>{
                console.log('error', error);
                res.end();
            });
        } else {
            res.end();
        }
    }
}

function isTargetReq (reqUrl, recordMatcher) {
    let reqPath = url.parse(reqUrl).pathname;
    for (let i = 0; i < recordMatcher.length; i++) {
        if (isMatch(reqPath, recordMatcher[i])) return true;
    }
    return false;
}

function getRouteByReq(req, mstrMode) {
    let request = {};
    let headers = {};
    headers.pathname = url.parse(req.url).pathname;
    headers.method = req.method;
    request.headers = headers;
    request.body = req.bodyObj;
    return generateRoute(request, mstrMode);
}

function parseReqBody(body, contentType) {
    // use indexOf instead of === is because contentType may contain charset parameters.
    if(!contentType){
        return {"ReqBody": body};
    }
    if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        body = queryString.parse(body);
        return body;
    }else if (contentType.indexOf('application/json') > -1){
        body = JSON.parse(body);
        return body;
    }else {
        return {"ReqBody": body};
    }
}

function parseResBody(body, encodingType) {
    // "{\"prop1\" : \"test\\'test\"}"
    body = decompressData(encodingType, body).toString();
    try {
        body = JSON.parse(body);
    } catch (error) {
    }
    return body;
}

function findRoutePath(routes, route){
    for(let i = routes.length-1; i >= 0; i--){
        for(let prop in routes[i]){
            if(isMatch(route, prop)) return routes[i][prop];
        }
    }
    return null;
}
