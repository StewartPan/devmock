const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const util = require('util');
const mkdirp = require('mkdirp');

module.exports = {
  prepareConfig: function prepareConfig(options){
    let dir = path.join(options.dir, 'config.json');
    let config = {};
    console.log("config path is ", dir);
    if(fs.existsSync(dir)){
      config = require(dir);
      console.log('The config file exists');
    }else{
      throw "Can not find config file!";
    }
    console.log(JSON.stringify(config));
    return config;
  },

  getReqBody: function getReqBody(req){
    let body = [];
    req.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
    });
    reqbody = JSON.parse(body);
    return reqbody;
  },

  getDirByReq: function getDirByReq(req, distinguisher){
    let method = req.method;
    let reqPath = path.join(method, url.parse(req.url).pathname);
    if(distinguisher.length != 0){
      return reqPath;
    }else{
      return path.dirname(reqPath);
    }
  },

  getNameByReq: function getNameByReq(req, distinguisher){
    let name = '';
    let identifier = '';
    let ext = '.json';
    if(distinguisher.length != 0){
      let reqbody = getReqBody(req);
      for(let i = 0; i < distinguisher.length; i++){
        if(reqbody.distinguisher[i]){
          identifier += reqbody.distinguisher[i];
        }else{
          throw 'Property as distinguisher does not find in request body';
        }
      }
      name = identifier;
    }else{
      name = url.parse(req.url).pathname.split('/').pop();
    }
    return name + ext;
  },

  getRouteByReq: function getRouteByReq(req, distinguisher){
    return path.join(module.exports.getDirByReq(req, distinguisher), module.exports.getNameByReq(req, distinguisher));
  },


  returnMockData: function returnMockData(mockData, res){
    let {headers, body} = mockData;
    if(mockData.headers){
      for (let prop in headers){
        res.setHeader(prop, headers[prop]);
      }
    }
    if(mockData.body){
      res.write(JSON.stringify(body));
      res.end();
    }else{
      res.end('ERROR, can not find the MockData');
    }
  },

  isTargetReq: function isTargetReq(req, target_url){
    let reqFullUrl = url.parse(req.url).pathname;
    console.log("reqFullUrl is ", reqFullUrl);
    return reqFullUrl.indexOf(target_url) > -1;

    // function fullURL(req){
    //   return url.format({
    //     // protocol: req.protocol,
    //     // host: req.headers.host,
    //     pathname: url.parse(req.url).pathname,
    //   });
    // }
  },

  recordMockData: function recordMockData(proxyRes, req, dir, distinguisher){
    let data = {};
    let body = new Buffer('');
    let storePath = path.join(dir, module.exports.getRouteByReq(req, distinguisher));
    console.log("The store path is ", storePath);
    // console.log("What the heck is proxyRes", util.inspect(proxyRes));
    data.headers = proxyRes.headers;
    //console.log("What the heck is headers", util.inspect(data.headers));
    console.log('Yello, what is the content type', proxyRes.headers['content-type']);
    //console.log("The content-type is ", proxyRes.headers['content-type'].split(';')[0]);
    // if(proxyRes.headers.);
    proxyRes.on('data', function (data) {
      body = Buffer.concat([body, data]);
    });
    proxyRes.on('end', function () {
      body = body.toString();
      //console.log("The body is ", body);
      if(proxyRes.headers.hasOwnProperty('content-type') && proxyRes.headers['content-type'].split(';')[0] === 'application/json'){
        data.body = JSON.parse(bodyString);
      }else{
        data.body = body;
      }
      module.exports.writeFileJSONFormat(storePath, data);
    });

  },

  // getUrlContentType: function getUrlContentType(headers){
  //   return headers['content-type'].split(';')[0];
  // },

  writeFileJSONFormat: function writeFileJSONFormat(dir, obj){
    let formatter = {
      type: 'space',
      size: 2,
    }
    //console.log("In write function, the body is", obj.body);
    mkdirp(path.dirname(dir), function (err) {
        if (err) {
          console.error(err);
        }else {
          fs.writeFileSync(dir, jsonFormat(obj, formatter), function(err){
            if(err) {
              return console.log(err);
            }
            console.log("The file was saved!");
          });
        }
    });

  },

  // updateConfig: function updateConfig(){
  //   // TODO:
  // }
}
