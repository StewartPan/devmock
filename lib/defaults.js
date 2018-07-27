module.exports = {

  // the routes follows the following format:
  // dir/method_name/url_pathname
  // : ../MockData/GET/api/users

  // Default server port
  server_port: 9080,

  // Default websocket port
  ws_port: 9090,


  // Destination of proxys
  server_url: 'http://localhost:8080',

  // Array of properties that used to distinguish different requests
  // If the urls are the same between them
  // If distinguisher is empty, we use url of requests by default
  distinguisher: [],

  target_url: [],

  recordLatest: true
}
