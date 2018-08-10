const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  proxy.web(req, res, {
    target: 'https://aqueduct-tech.customer.cloud.microstrategy.com',
    changeOrigin: true
    });
});

console.log("listening on port 5050")
server.listen(5050);
https://localhost:443/MicroStrategy/servlet/mstrWeb
