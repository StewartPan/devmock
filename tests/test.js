const http = require('http');
const httpProxy = require('http-proxy');
let proxy = httpProxy.createProxyServer({target: 'http://localhost:8080'});

http.createServer(function(req, res) {
  proxy.web(req, res, { target: 'http://localhost:8080' });
}).listen(9090);
