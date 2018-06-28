const http = require('http');
const httpProxy = require('http-proxy');

module.exports = function(resolvedConfig){
  let {distinguisher, proxy_url, server_port} = resolvedConfig;
  let proxy = httpProxy.createProxyServer({});

  let server = http.createServer(function(req, res){
    if(isRouteMatch(req)){
      let mockData = getMockData();
      returnMockData();
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
