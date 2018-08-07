const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');
const zlib = require('zlib');

const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');


module.exports = class Server {
  constructor(dir) {
    this.readConfig(dir);
    this.logInfo();
    this.start();
    console.log("Mock server is running...");
  }

  readConfig(dir){
    try{
      this.configString = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
      console.log('The config file exists');
    } catch(error){
      console.log(error);
      throw "Can not find config file!";
    }
    let config = eval(this.configString);
    this.server_port = config.server_port;
    this.ws_port = config.ws_port;
    this.server_url = config.server_url;
    this.target_url = config.target_url;
    this.routesInUse = config.routes;
    this.recordLatest = config.recordLatest;
    this.mode = config.mode;
    this.dir = dir;
  }

  logInfo(){
    console.log("The server info are shown below:");
    for(let prop in this){
      if(prop !== 'configString' && prop != 'server'){
        console.log(prop + " : ", this[prop]);
      }
    }
  }


  start(){
      let self = this;
      self.server = http.createServer(function(req, res){
        let proxy = httpProxy.createProxyServer({
          target: self.server_url,
        });
        let body = [];
        let bodyObj = {};
        req.on('error', (err) => {
          console.error(err);
        }).on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          bodyObj = queryString.parse(body);
          // use ok to determine if the req can produce a valid
          // route based on the rules in getRouteByReq.
          let route = getRouteByReq(req, bodyObj, self.mode);
          if(self.routesInUse.includes(route)){
            let dataPath = path.join(self.dir, route);
            let mockData = require(dataPath);
            console.log("Return mockData in ", route);
            returnMockData(mockData, res, route);
          }else {
            proxy.on('error', function (err, req, res){
              console.log('Both Remote Server and MockData are not available');
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
        if(isTargetReq(req, self.target_url)){
          let data = {};
          let Resbody = Buffer.alloc(0);
          let encodingType = proxyRes.headers['content-encoding'];
          let route = getRouteByReq(req, bodyObj, self.mode);
          if(self.recordLatest || self.configString.indexOf(JSON.stringify(route)) < 0){
            let storePath = path.join(self.dir, route);
            data.headers = proxyRes.headers;
            proxyRes.on('data', function (data) {
              Resbody = Buffer.concat([Resbody, data]);
            });
            proxyRes.on('end', function () {
              // stringify and then parse to avoid the parse error
              // when the example is like following
              // "{\"prop1\" : \"test\\'test\"}"
              if(encodingType == 'gzip'){
                Resbody = zlib.gunzipSync(Resbody);
              }else if(encodingType == 'deflate'){
                Resbody = zlib.inflateSync(Resbody);
              }
              Resbody = Resbody.toString();
              try{
                data.body = JSON.parse(Resbody);
              }catch(error){
                data.body = Resbody;
              }
              console.log("Record mock data in", storePath);
              recordMockData(storePath, data);
              updateConfig(self, route);
            });
          }
        }
      });
    }).listen(self.server_port);
  }

  stop(){
    this.server.close();
  }


}
