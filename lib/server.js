const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const path = require('path');
const queryString = require('query-string');
const fs = require('fs');
const crypto = require('crypto');
const url = require('url');
const beautify = require('js-beautify').js_beautify;
const keyDir = path.join(__dirname, '..', 'keys');


const {isTargetReq, recordMockData, decompressData, compressData, streamifyStr} = require('./util');
const filter = ['xts'];

let server, proxy;

module.exports = class Server {

    /*
     *   @param
     *   targetUrl: string;
     *   requestMatcher: array of strings;
     *   overwrite: boolean
     *   serverPort: number
     *   wsPort: number
     *   mstrMode: boolean
     *   routes: array of string
     *   https: boolean
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
                let route = getRouteByReq(req, self.mstrMode);
                if (self.routes.includes(route)) {
                    self.respondWithMockData(route, res);
                } else {
                    let bufferStream = streamifyStr(body);
                    proxy.web(req, res, {buffer: bufferStream});
                }
            });
        }

        proxy.on('proxyRes', function (proxyRes, req, res) {
            if (isTargetReq(req.url, self.requestMatcher)) {
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
                        console.log("Record mock data in", storePath);
                        recordMockData(storePath, data);
                        self.updateConfig(route);
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


    updateConfig(route) {
        // avoid writing repeated routes;
        if (this.configString.indexOf(JSON.stringify(route)) < 0) {
            let config_dir = path.join(this.dir, 'config.js');
            this.configString = this.configString.replace(/(routes\s*:\s*\[[\s\S]*?)(\])/, "$1" + '//' + JSON.stringify(route) + ',\n]');
            let formatData = beautify(this.configString, {indent_size: 2});
            fs.writeFile(config_dir, formatData, function (err) {
                if (err) {
                    console.log('Error happens in updateConfig function', err);
                }
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
                target: this.targetUrl,
                ssl: httpsOpt,
                secure: false,
                changeOrigin: true

            };
        }else{
            proxyOpt = {
                target: this.targetUrl,
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
            // set-up the route number as mockId in the response headers
            res.setHeader('mockId', route);
        }
        if (body) {
            let encodingType = headers['content-encoding'];
            if (typeof body !== 'string') {
                body = JSON.stringify(body);
            }
            body = compressData(body, encodingType);
            res.setHeader('content-length', body.length);
            res.write(body);
            res.end();
        } else {
            res.end();
        }
    }
}

function getRouteByReq(req, mstrMode) {
    let body = req.bodyObj;
    if (mstrMode) {
        // use hash of string =  merethod + req.url + reqbody
        // to generate the routes
        // filter properties in req body that we don't need;
        for(let i = 0; i < filter.length; i++){
            delete body[filter[i]];
        }
        let reqString = req.method + url.parse(req.url).pathname + JSON.stringify(body);
        let route = crypto.createHash('md5').update(reqString).digest('hex');
        return route;
    } else {
        let base = path.join(req.method, url.parse(req.url).pathname);
        if (base[base.length - 1] == '/' || base[base.length - 1] == '\\') {
            return path.join(base, 'folder');
        } else {
            return base;
        }
    }
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
