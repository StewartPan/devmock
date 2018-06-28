const {prepareConfig, createConfig} = require('./util');
const server = require('./server');
const ws = require('./ws');

function createServer(options) {
  let resolvedConfig = prepareConfig(options);
  //startServer(resolvedConfig);
}

function createWS(options) {
  let resolvedConfig = prepareConfig(options);
  //startServer(resolvedConfig);
}

// function prepareConfig(options){
//   console.log(findConfig(options));
//   return '';
  // if(findConfig(options)){
  //   var config = readConfig(options);
  // }else{
  //   var config = createConfig();
  // }
  // let resolvedConfig = resolveConfig(config);
  // return resolvedConfig;
// }

module.exports = {createServer, createWS};
