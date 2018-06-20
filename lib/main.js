function startServer(options) {
  console.log('server: ', options);
}

function startWS(options) {
  console.log('ws: ', options);
}

module.exports = {startServer, startWS};