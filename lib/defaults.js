const path = require('path');

module.exports = {

    // Delegated server url
    recordUrl: 'http://localhost:8080',

    // Mock server port
    serverPort: 9080,

    // Mock server websocket port
    wsPort: 9090,

    // Identify the requests to be recorded
    recordMatcher: [],

    // Overwrite existing mock data
    overwrite: true,

    // MSTR internal mode
    mstrMode: false,

    // Whether use https protocal
    https: false

}
