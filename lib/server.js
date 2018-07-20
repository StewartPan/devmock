const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');

const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');
module.exports = function startServer(resolvedConfig, dir){
  let {distinguisher, server_url, target_url, server_port, routes} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({
    target: server_url,
  });
  let cache = {};
  cache.config = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');
  cache.routeTable = Array.from(routes);
  let server = http.createServer(function(req, res){
    let body = [];
    req.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      var bufferStream = new stream.PassThrough();
      bufferStream.end(new Buffer(body));
      req.bodyStream = bufferStream;
      body = queryString.parse(body);
      // use ok to determine if the req can produce a valid
      // route based on the rules in getRouteByReq.
      let route, ok;
      [route, ok] = getRouteByReq(req, body, distinguisher);
      if(ok && routes.includes(route)){
        console.log('return MockData');
        let dataPath = path.join(dir, route);
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
        proxy.web(req, res, {buffer: req.bodyStream});
      }
    });

    proxy.on('proxyRes', function (proxyRes, req, res) {
      if(isTargetReq(req, target_url)){
        let data = {};
        let Resbody = Buffer.alloc(0);
        let [route, ok] = getRouteByReq(req, body, distinguisher);
        if(ok){
          let storePath = path.join(dir, route);
          data.headers = proxyRes.headers;
          proxyRes.on('data', function (data) {
            Resbody = Buffer.concat([Resbody, data]);
          });
          proxyRes.on('end', function () {
            Resbody = Resbody.toString();
            // console.log('Resbody' , Resbody);
            data.body = Resbody;
            // if(proxyRes.headers.hasOwnProperty('content-type') && proxyRes.headers['content-type'].split(';')[0] === 'application/json'){
            //   data.body = JSON.parse(Resbody);
            // }else{
            //   data.body = Resbody;
            // }
            recordMockData(storePath, data);
            updateConfig(dir, route, cache);
          });
        }
      }
    });
  }).listen(server_port);

}
