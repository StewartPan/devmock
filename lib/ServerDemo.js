const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const util = require('util');
const queryString = require('query-string');
const fs = require('fs');
const stream = require('stream');
const {getRouteByReq, returnMockData, isTargetReq, recordMockData, isTargetContent, updateConfig} = require('./util');


class Server {
  constructor(dir) {
    let path = path.join(dir, 'config.js');
    let config = {};
    if(fs.existsSync(dir)){
      config = require(dir);
      console.log('The config file exists');
    }else{
      throw "Can not find config file!";
    }
    this.server_port = config.server_port;
    this.ws_port = config.ws_port;
    this.server_url = config.server_url;
    this.distinguisher = config.distinguisher;
    this.target_url = config.target_url;
    this.routeInUse = config.routes;  
    this.configString = fs.readFileSync(path.join(dir, 'config.js'), 'utf8');

  }

  init(){
    // create proxy
    // binding event
  }

  stop(){

  }

}
