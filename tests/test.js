// const http = require('http'),
//     // httpProxy = require('http-proxy');
//  	  // record = require('../lib/record');
//     url = require('url'),
//     path = require('path');
//
// console.log(path.resolve());


var http = require('http'),
    httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, { target: 'http://127.0.0.1:8080' });
});

console.log("listening on port 5050")
server.listen(5050);

// var option = {
//   target: 'http://localhost:9005',
//   //selfHandleResponse : true
// };
//
// var proxy = httpProxy.createProxyServer(option);
//
// proxy.listen(5050);
//
// proxy.on('error', function(e){
//   if(e.code === 'ECONNREFUSED'){
//     console.log("catch the did error! ");
//   }else{
//     console.log("ooops， something went wrong！")
//   }
// });
//
// proxy.on('proxyReq', function(proxyReq, req, res, options) {
//   //sproxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
//   console.log('the request url is ', req.url);
// });
//
// proxy.on('proxyRes', function (proxyRes, req, res) {
//   var body = new Buffer('');
//   proxyRes.on('data', function (data) {
//     body = Buffer.concat([body, data]);
//   });
//     proxyRes.on('end', function () {
//     body = body.toString();
//     //console.log("res from proxied server:", body);
//     let storePath = '../data/recordData' + req.url;
//     console.log(storePath);
//     //record(storePath, body);
//     res.end("my response to cli");
//     });
// });

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//


// var server = http.createServer(function(req, res) {
//   // You can define here your custom logic to handle the request
//   // and then proxy the request.
//
//
//     proxy.web(req, res, option);
// });

// console.log("listening on port 5050")
// server.listen(5050);
