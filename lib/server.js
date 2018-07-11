const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');
module.exports = function startServer(resolvedConfig, dir){
  let {distinguisher, server_url, target_url, server_port, routes, type} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({target: server_url});

  let server = http.createServer(function(req, res){
    let route = getRouteByReq(req, distinguisher);
    console.log("req route is ", route);
    if(routes.includes(route)){
      let path = path.join(dir, route);
      let mockData = require(path);
      returnMockData(mockData, res);
    }else {
      proxy.web(req, res, { target: server_url });
    }
    proxy.on('proxyRes', function (proxyRes, req, res) {
      if(isTargetReq(req, target_url)){
        console.log("find target!");
        let data = {};
        let body = Buffer.alloc(10);
        let route = getRouteByReq(req, distinguisher);
        let storePath = path.join(dir, route);
        data.headers = proxyRes.headers;
        proxyRes.on('data', function (data) {
          body = Buffer.concat([body, data]);
        });
        proxyRes.on('end', function () {
          body = body.toString();
          //console.log("on end function, the body is ", typeof body);
          if(proxyRes.headers.hasOwnProperty('content-type') && proxyRes.headers['content-type'].split(';')[0] === 'application/json'){
            data.body = JSON.parse(bodyString);
          }else{
            data.body = body;
          }
          recordMockData(storePath, data);
          updateConfig(dir, route);
        });

      }
      // Then the response will be forward to client automatically
      // no matter we record the data or not.
    });

  }).listen(server_port);

}
