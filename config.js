const {CURRENT_DIR} = require('../defaults');


module.exports = {
  // Default path to store recorded data
  routes: {};

  // Default server port
  server_port: 9080;

  // Default websocket port
  ws_port: 9090;

  // Routes that to be mocked
  routes: {};

  // Destination of proxy
  proxy_url: 'http://localhost:9005';

  // Array of properties that used to distinguish different requests
  // If the urls are the same between them
  // if distinguisher is empty, we use url of requests by default
  distinguisher: [];
}
