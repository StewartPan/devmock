// const http = require('http');
// const httpProxy = require('http-proxy');
//
// const proxy = httpProxy.createProxyServer({});
//
// const server = http.createServer(null, function(req, res) {
//   // You can define here your custom logic to handle the request
//   // and then proxy the request.
//   proxy.web(req, res, {
//     target: 'https://aqueduct-tech.customer.cloud.microstrategy.com',
//     changeOrigin: true
//     });
// });
//
// console.log("listening on port 5050");
// server.listen(5050);
const zlib = require('zlib');


function compressData (dataStr, encodingType) {
    return new Promise((resolve, reject) => {
        if (encodingType == 'gzip') {
            zlib.gzip(dataStr, function (error, result) {
                if (error) throw error;
                resolve(result);
            });
        } else if (encodingType == 'deflate') {
            zlib.deflate(dataStr, function (error, result) {
                if (error) throw error;
                resolve(result);
            });
        } else {
            resolve(result);
        }
    });
}

compressData("haha", 'gzip').then((value) => {
        console.log('value is ', value);
    }
);
