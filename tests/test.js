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
    var option = {
      target: 'http://localhost:9005',
      selfHandleResponse : true
    };
    proxy.on('proxyRes', function (proxyRes, req, res) {
        var body = new Buffer('');
        proxyRes.on('data', function (data) {
            body = Buffer.concat([body, data]);
        });
        proxyRes.on('end', function () {
            body = body.toString();
            console.log("res from proxied server:", body);
            res.end("my response to cli");
        });
    });
    proxy.web(req, res, option);
});
 
console.log("listening on port 5050")
server.listen(5050);
