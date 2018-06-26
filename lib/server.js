const {distinguisher, proxy_url, } = require('../config');
const isReachable = require('is-reachable');

module.exports = function(option){
  var http = require('http'),
      httpProxy = require('http-proxy');

  var proxy = httpProxy.createProxyServer({target: proxy_url});

  /* we listen on the proxyReq event, Once we receive the request
    we check if target server is available or not.
    if not we use the mock_handler to deal with it.
  */

  // TODO: we check target server every time when we have a request
  // but it is not efficient, because once we build TCP connection with
  // the target server, not need to check availability again unless the
  // connect is broken.

  proxy.on('proxyReq', function(proxyReq, req, res, options){
    isReachable(proxy_url).then(reachable => {
        if(reachable){
          console.log('Good job, the target server is reachable!');
        }else {
          mock_handler(proxyReq, res);
        }
    });
  });

  proxy.on('proxyRes', function(proxyRes, req, res){
    record_handler(proxyRes, req);
  });
  
  // proxy.on('error', function(e){
  //   if(e.code === 'ECONNREFUSED'){
  //     console.log("Notice: Can't connect the target \
  //     server, use mock data instead if there exists!");
  //     mock_handler();
  //   }
  // });

  /* if we can connect the target server
    we use record_handler to deal with it.
  */


}
