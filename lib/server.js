const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');

module.exports = function startServer(resolvedConfig, dir){
  let {distinguisher, proxy_url, target_url, server_port, routes} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({target: proxy_url});

  let server = http.createServer(function(req, res){
    let route = getRouteByReq(req, distinguisher);
    if(routes.includes(routes)){
      let path = path.join(dir, route);
      let mockData = require(path);
      returnMockData(mockData, res);
    }else {
      proxy.on('proxyRes', function(proxyRes, req, res){
        if(isTargetReq(req, target_url)){
          recordMockData(proxyRes, req, dir, distinguisher);
          updateConfig();
        }else{
          // do nothing
        }
      });
    }
  }).listen(server_port);


  // proxy.on('proxyReq', function(proxyReq, req, res, options){
  //   isReachable(proxy_url).then(reachable => {
  //       if(reachable){
  //         console.log('Good job, the target server is reachable!');
  //       }else {
  //         console.log('ooops, can not reach target server, use mockdata instead' );
  //         mock_handler(proxyReq, res);
  //       }
  //   });
  // });


  /* if we can connect the target server
    we use record_handler to deal with it.
  */


  // proxy.on('proxyRes', function(proxyRes, req, res){
  //   record_handler(proxyRes, req);
  // });

}
