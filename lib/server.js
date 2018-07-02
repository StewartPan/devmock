const http = require('http');
const httpProxy = require('http-proxy');

module.exports = function startServer(resolvedConfig){
  let {distinguisher, proxy_url, server_port, routes} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({});

  let server = http.createServer(function(req, res){
    let route = getRouteByReq(req, distinguisher);
    if(routes.includes(route)){
      let path = dir + route;
      let mockData = require(path);
      returnMockData(mockData, res);
    }else {
      if(isTargetReq(req)){
        recordMockData();
        updateConfig();
      }else{
        proxy.web(req, res, { target: proxy});
      }
    }
  });


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
