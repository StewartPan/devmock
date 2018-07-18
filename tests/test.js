const http = require('http');
const httpProxy = require('http-proxy');
let proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  auth: 'user:password'
});
let server = http.createServer(function(req, res){
  proxy.web(req, res);
}).listen(9081);
