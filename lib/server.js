const {distinguisher, proxy_url, } = require('./config');
const isReachable = require('is-reachable');
const http = require('http');
const httpProxy = require('http-proxy');
const {mock_handler, record_handler} = require('./handlers')

module.exports = function(option){
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
          console.log('ooops, can not reach target server, use mockdata instead' );
          mock_handler(proxyReq, res);
        }
    });
  });


  /* if we can connect the target server
    we use record_handler to deal with it.
  */


  proxy.on('proxyRes', function(proxyRes, req, res){
    record_handler(proxyRes, req);
  });




}
