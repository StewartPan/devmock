const path = require('path');

module.exports = {

    // Delegated server url
    targetUrl: 'http://localhost:8080',

    // Identify the requests to be mocked
    requestMatcher: [],

    // Overwrite existing mock data
    overwrite: true,


    // Mock server port
    serverPort: 9080,


    // Mock server websocket port
    wsPort: 9090,


    // MSTR internal mode
    mstrMode: false,

    // whether use https protocal
    https: false,

    // certificate/private keys directory for https
    keyDir: path.join(__dirname, '..', 'keys')

}
