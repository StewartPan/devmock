const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');

module.exports = {
  prepareConfig: function prepareConfig(options){
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

  getRouteByReq: function getRouteByReq(req, distinguisher){
    let method = req.method;
    let route = path.join(method, url.parse(req.url).pathname);
    let identifier = '';
    if(distinguisher.length != 0){
      let reqbody = getReqBody(req);
      for(let i = 0; i < distinguisher.length; i++){
        if(reqbody.distinguisher[i]){
          identifier += reqbody.distinguisher[i];
        }else{
          throw 'Property as distinguisher does not find in request body';
        }
      }
      route = path.join(route, identifier);
    }
    return route;
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
    let reqFullUrl = fullURL(req);
    return reqFullUrl.indexOf(target_url) > -1;

    function fullURL(req){
      return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl,
      });
    }
  },

  recordMockData: function recordMockData(proxyRes, req, dir, distinguisher){
    let data = {};
    let body = new Buffer('');
    let storePath = path.join(dir, getRouteByReq(req, distinguisher));
    data.headers = proxyRes.getHeaders();
    proxyRes.on('data', function (data) {
      body = Buffer.concat([body, data]);
    });
    proxyRes.on('end', function () {
      body = body.toString();
    });
    data.body = JSON.parse(body);
    writeFileJSONFormat(storePath, data);
  },

  writeFileJSONFormat: function writeFileJson(dir, obj){
    let formatter = {
      type: 'space',
      size: 2,
    }
    fs.writeFileSync(dir, jsonFormat(obj, formatter), function(err){
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    })
  },

  // updateConfig: function updateConfig(){
  //   // TODO:
  // }



}
