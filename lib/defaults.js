module.exports = {

    // The routes follows the following format:
    // dir/method_name/url_pathname
    // : ../MockData/GET/api/users

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
    mstrMode: false

}
