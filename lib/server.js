const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');
const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');


module.exports = class Server {
  constructor(dir) {
    this.readConfig(dir);
    this.start();
    console.log("Mock server is listening on port", this.server_port);
  }

  readConfig(dir){
    try{
      Server.prototype.configString = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
      console.log('The config file exists');
    } catch(error){
      console.log(error);
      throw "Can not find config file!";
    }
    let config = eval(Server.prototype.configString);
    Server.prototype.server_port = config.server_port;
    Server.prototype.ws_port = config.ws_port;
    Server.prototype.server_url = config.server_url;
    Server.prototype.distinguisher = config.distinguisher;
    Server.prototype.target_url = config.target_url;
    Server.prototype.routesInUse = config.routes;
    Server.prototype.recordLatest = config.recordLatest;
    Server.prototype.dir = dir;

  }

  start(){
      Server.prototype.server = http.createServer(function(req, res){
        let proxy = httpProxy.createProxyServer({
          target: Server.prototype.server_url,
        });
        let body = [];
        req.on('error', (err) => {
          console.error(err);
        }).on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          body = Buffer.concat(body).toString();
          console.log("incoming req body is  ", body);
          req.body = body;
          body = queryString.parse(body);
          // use ok to determine if the req can produce a valid
          // route based on the rules in getRouteByReq.
          let route, ok;
          [route, ok] = getRouteByReq(req, body, Server.prototype.distinguisher);
          if(ok && Server.prototype.routesInUse.includes(route)){
            console.log('return MockData');
            let dataPath = path.join(Server.prototype.dir, route);
            let mockData = require(dataPath);
            returnMockData(mockData, res);
          }else {
            proxy.on('error', function (err, req, res){
              console.log('Both Remote Server and MockData are not available');
              res.writeHead(500, {
                'Content-Type': 'text/plain'
              });
              res.end('Both Remote Server and MockData are not available');
            });
          var bufferStream = new stream.PassThrough();
          bufferStream.end(new Buffer(req.body));
          req.bodyStream = bufferStream;
          proxy.web(req, res, {buffer: req.bodyStream});
        }
      });

      proxy.on('proxyRes', function (proxyRes, req, res) {
        if(isTargetReq(req, Server.prototype.target_url)){
          console.log("in response body is  ", JSON.stringify(body));
          let data = {};
          let Resbody = Buffer.alloc(0);
          let [route, ok] = getRouteByReq(req, body, Server.prototype.distinguisher);
          if(ok){
            console.log("route is used");
            if(Server.prototype.recordLatest || Server.prototype.configString.indexOf(JSON.stringify(route)) < 0){
              console.log("will be record");

              let storePath = path.join(Server.prototype.dir, route);
              data.headers = proxyRes.headers;
              proxyRes.on('data', function (data) {
                Resbody = Buffer.concat([Resbody, data]);
              });
              proxyRes.on('end', function () {
                // stringify and then parse to avoid the parse error
                // when the example is like following
                // "{\"prop1\" : \"test\\'test\"}"
                Resbody = Resbody.toString();
                try{
                  data.body = JSON.parse(Resbody);
                }catch(error){
                  data.body = Resbody;
                }
                recordMockData(storePath, data);
                updateConfig(Server.prototype, route);
              });
            }
          }
        }
      });
    }).listen(Server.prototype.server_port);
  }

  stop(){
    Server.prototype.server.close();
  }

}
