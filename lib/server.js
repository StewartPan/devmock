const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent} = require('./util');
module.exports = function startServer(resolvedConfig, dir){
  let {distinguisher, server_url, target_url, server_port, routes, type} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({target: server_url});

  let server = http.createServer(function(req, res){
    let route = getRouteByReq(req, distinguisher);
    console.log("req route is ", route);
    if(routes.includes(routes)){
      let path = path.join(dir, route);
      let mockData = require(path);
      returnMockData(mockData, res);
    }else {
      proxy.web(req, res, { target: server_url });
    }
    proxy.on('proxyRes', function (proxyRes, req, res) {
      if(isTargetReq(req, target_url)){
        recordMockData(proxyRes, req, dir, distinguisher);
        //updateConfig();
      }else{
        // do nothing
      }
    });

  }).listen(server_port);

}
