const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');
const zlib = require('zlib');

const {getRouteByReq, returnMockData, isTargetReq, recordMockData, updateConfig, decompressData, compressData} = require('./util');


module.exports = class Server {

  constructor(dir){

    let targetUrl = null;
    let requestMatcher = null;
    let overwrite = null;
    let serverPort = null;
    let wsPort = null;
    let mstrMode = null;
    let routes = null;

    this.dir = dir;
    this.readConfig(dir);
    this.start();
    console.log("Mock server is running on port ", this.serverPort);
  }

  readConfig(dir){
    try{
      this.configString = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
    } catch(error){
      console.log("Can not find config file, make sure the directory is valid");
      throw error;
    }
    let config = eval(this.configString);
    Object.assign(this, config);
  }

  start(){
    let self = this;
    self.server = http.createServer(function(req, res){
      let proxy = httpProxy.createProxyServer({
        target: self.targetUrl,
      });
      let body = [];
      let bodyObj = {};
      req.on('error', (err) => {
        console.error(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        bodyObj = queryString.parse(body); // parse body as object
        let route = getRouteByReq(req, bodyObj, self.mstrMode);
        if(self.routes.includes(route)){
          returnMockData(self.dir, res, route);
        }else {
          proxy.on('error', function (err, req, res){
            res.writeHead(500, {
              'Content-Type': 'text/plain'
            });
            res.end('Both Remote Server and MockData are not available');
          });
          var bufferStream = new stream.PassThrough();
          bufferStream.end(Buffer.from(body, 'utf-8'));
          req.bodyStream = bufferStream;
          proxy.web(req, res, {buffer: req.bodyStream});
        }
      });

      proxy.on('proxyRes', function (proxyRes, req, res) {
        if(isTargetReq(req, self.targetUrl)){
          let data = {};
          let Resbody = Buffer.alloc(0);
          let route = getRouteByReq(req, bodyObj, self.mstrMode);
          if(self.overwrite || self.configString.indexOf(JSON.stringify(route)) < 0){
            data.headers = proxyRes.headers;
            proxyRes.on('data', function (data) {
              Resbody = Buffer.concat([Resbody, data]);
            });
            proxyRes.on('end', function () {
              // "{\"prop1\" : \"test\\'test\"}"
              let encodingType = proxyRes.headers['content-encoding'];        
              Resbody = decompressData(encodingType, Resbody).toString();
              try{
                data.body = JSON.parse(Resbody);
              }catch(error){
                data.body = Resbody;
              }
              let storePath = path.join(self.dir, route);   
              console.log("Record mock data in", storePath);
              recordMockData(storePath, data);
              updateConfig(self, route);
            });
          }
        }
      });
    }).listen(self.serverPort);
  }

  stop(){
    this.server.close();
  }


}
