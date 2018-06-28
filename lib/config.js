module.exports = {
  // directory to store the userConfig file and mockdata

  // Default path to store recorded data
  // the routes follows the following format:
  // dir/method_name/url_pathname
  // : ../MockData/GET/api/users
  routes: {},

  // Default server port
  server_port: 9080,

  // Default websocket port
  ws_port: 9090,


  // Destination of proxy
  proxy_url: 'http://localhost:9005',

  // Array of properties that used to distinguish different requests
  // If the urls are the same between them
  // If distinguisher is empty, we use url of requests by default
  distinguisher: [],
}
