const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');

const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');
module.exports = function startServer(resolvedConfig, dir){
  let {distinguisher, server_url, target_url, server_port, routes} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({target: server_url});
  let server = http.createServer(function(req, res){
    let body = [];
    req.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      body = queryString.parse(body);
      // use ok to determine if the req can produce a valid
      // route based on the rules in getRouteByReq.
      let route, ok;
      [route, ok] = getRouteByReq(req, body, distinguisher);
      if(ok && routes.includes(route)){
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
        proxy.web(req, res, function(e){});
      }
    });

    proxy.on('proxyRes', function (proxyRes, req, res) {
      if(isTargetReq(req, target_url)){
        console.log("find target!");
        let data = {};
        let body = Buffer.alloc(10);
        let [route, ok] = getRouteByReq(req, distinguisher);
        if(ok){
          let storePath = path.join(dir, route);
          data.headers = proxyRes.headers;
          proxyRes.on('data', function (data) {
            body = Buffer.concat([body, data]);
          });
          proxyRes.on('end', function () {
            body = body.toString();
            if(proxyRes.headers.hasOwnProperty('content-type') && proxyRes.headers['content-type'].split(';')[0] === 'application/json'){
              data.body = JSON.parse(bodyString);
            }else{
              data.body = body;
            }
            recordMockData(storePath, data);
            updateConfig(dir, route);
          });
        }

      }
      // Then the response will be forward to client automatically
      // no matter we record the data or not.
    });
  }).listen(server_port);

}
