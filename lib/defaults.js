module.exports = {
  // directory to store the userConfig file and mockdata

  // Default path to store recorded data
  // the routes follows the following format:
  // dir/method_name/url_pathname
  // : ../MockData/GET/api/users
  // ROUTES: [],

  // Default server port
  SERVER_PORT: 9080,

  // Default websocket port
  WS_PORT: 9090,


  // Destination of proxys
  SERVER_URL: 'http://localhost:8080',

  // Array of properties that used to distinguish different requests
  // If the urls are the same between them
  // If distinguisher is empty, we use url of requests by default
  DISTINGUISHER: '',

  TARGET_URL: '',
}
