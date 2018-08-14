const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const path = require('path');
const queryString = require('query-string');
const fs = require('fs');
const crypto = require('crypto');
const url = require('url');


const {returnMockData, isTargetReq, recordMockData, updateConfig, decompressData, compressData, streamifyStr} = require('./util');
const filter = ['xts'];

let server, proxy;
module.exports = class Server {

    /*
     *   @param
     *   targetUrl = null
     *   requestMatcher = null
     *   overwrite = null
     *   serverPort = null
     *   wsPort = null
     *   mstrMode = null
     *   routes = null
     */

    constructor(dir) {
        this.dir = dir;
        this.readConfig(dir);
        this.start();
        console.log("Mock server is running on port ", this.serverPort);
    }

    start() {
      // http -> https set changeOrigin: true,
      // https -> https set ssl set secure: false;
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
            let body = [];
            req.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();
                let bodyObj = self.parseReqBody(req.headers['content-type'], body); // parse body as object
                let route = self.getRouteByReq(req, bodyObj, self.mstrMode);
                if (self.routes.includes(route)) {
                    self.returnMockData(route, res);
                } else {
                    let bufferStream = streamifyStr(body);
                    req.bodyObj = bodyObj;
                    proxy.web(req, res, {buffer: bufferStream});
                }
            });
        }

        proxy.on('proxyRes', function (proxyRes, req, res) {
            if (isTargetReq(req, self.requestMatcher)) {
                let data = {};
                let resBody = Buffer.alloc(0);
                let route = self.getRouteByReq(req, req.bodyObj, self.mstrMode);
                if (self.needRecord(route)) {
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

    getRouteByReq(req, body, mstrMode) {
        let ext = '.json';
        if (mstrMode) {
            // use hash of string =  merethod + req.url + reqbody
            // to generate the routes
            // delete property in req body that we don't need;
            for(let i = 0; i < filter.length; i++){
                delete body[filter[i]];
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
        if(!contentType){
            return {};
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

    resolveProtocalOpt(){
        let self = this;
        let proxyOpt, httpsOpt;
        if(this.https){

            httpsOpt = {
              key: fs.readFileSync(path.join(self.keyDir, 'privkey.pem'), 'utf8'),
              cert: fs.readFileSync(path.join(self.keyDir, 'cacert.pem'), 'utf8')
            }

            proxyOpt = {
                target: self.targetUrl,
                ssl: httpsOpt,
                secure: false
            };
        }else{
            proxyOpt = {
                target: self.targetUrl,
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

    returnMockData (route, res) {
        let dataPath = path.join(this.dir, route);
        console.log("Return mockData in ", dataPath);
        let {headers, body} = require(dataPath);;
        if (headers) {
            for (let prop in headers) {
                res.setHeader(prop, headers[prop]);
            }
            // set-up the mockId in the response headers
            let mockId = route.substr(0, route.lastIndexOf('.')) || route;
            res.setHeader('mockId', mockId);
        }else{
            console.log("mockdata header is empty!");
        }
        if (body) {
            let encodingType = headers['content-encoding'];
            if (typeof body !== 'string') {
                body = JSON.stringify(body);
            }
            body = compressData(encodingType, body);
            res.setHeader('content-length', body.length);
            res.write(body);
            res.end();
        } else {
            console.log('mockData body is empty!');
            res.end('mockData body is empty');
        }
    }
}
