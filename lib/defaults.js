const path = require('path');

module.exports = {

    // Mock server port
    serverPort: 9080,

    // Mock server websocket port
    wsPort: 9090,

    // Identify the requests to be recorded
    requestMatcher: [],

    // Overwrite existing mock data
    overwrite: true,

    // MSTR internal mode
    mstrMode: false,

    // Whether use https protocal
    https: false

}
