const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const mkdirp = require('mkdirp');
const stringifyObject = require('stringify-object');
const beautify = require('js-beautify').js_beautify;
const zlib = require('zlib');
const crypto = require('crypto');

module.exports = {

  getRouteByReq: function getRouteByReq(req, bodyObj){
    // use hash of string =  method + req.url + reqbody
    // to generate the routes
    let ext = '.json';
    // delete timestamp in req body;
    delete bodyObj['xts'];
    let reqString = req.method + url.parse(req.url).pathname + JSON.stringify(bodyObj);
    // console.log("reqString is ", reqString);
    let route = crypto.createHash('md5').update(reqString).digest('hex') + ext;
    return route;
  },

  returnMockData: function returnMockData(mockData, res, route){
    let {headers, body} = mockData;
    if(headers){
      for (let prop in headers){
        res.setHeader(prop, headers[prop]);
      }
      // set-up the mockId in the response headers
      let mockId = route.substr(0, route.lastIndexOf('.')) || route;
      // console.log('mockId is ', mockId);
      res.setHeader('mockId', mockId);
    }
    if(body){
      let encodingType = headers['content-encoding'];
      if(typeof body !== 'string'){
        body = JSON.stringify(body);
      }
      if(encodingType == 'gzip'){
        zlib.gzip(body, function (error, result) {
          if (error) throw error;
          res.setHeader('content-length', result.length);
          res.write(result);
          res.end();
        });
      }else if(encodingType == 'deflate'){
        zlib.deflate(body, function (error, result) {
          if (error) throw error;
          res.setHeader('content-length', result.length);
          res.write(result);
          res.end();
        });
      }else{
        // reset the content-length
        res.setHeader('content-length', body.length);
        res.write(body);
        res.end();
      }
    }else{
      res.end('ERROR, can not find the MockData');
    }
  },

  isTargetReq: function isTargetReq(req, target_url){
    let reqFullUrl = url.parse(req.url).pathname;
    for(let i = 0; i < target_url.length; i++){
      if(reqFullUrl.indexOf(target_url[i]) > -1) return true;
    }
    return false;
  },

  recordMockData: function recordMockData(storePath, data){
    module.exports.writeFileJSONFormat(storePath, data);
  },


  writeFileJSONFormat: function writeFileJSONFormat(dir, obj){
    let formatter = {
      type: 'space',
      size: 2,
    }
    mkdirp(path.dirname(dir), function (err) {
        if ("mkdirp function error", err) {
          console.error(err);
        }else {
          fs.writeFileSync(dir, jsonFormat(obj, formatter), function(err){
            if(err) {
              console.log("writeFileSync error", err);
            }
            console.log("The file was saved!");
          });
        }
    });

  },

  convertObjToMod: function convertObjToMod(obj, dir){
    mkdirp(path.dirname(dir), function (err) {
        if (err) {
          console.error("convertObjToMod", err);
        }else {
          let stream = fs.createWriteStream(dir, {flags: 'w'});
          stream.write('module.exports = ');
          let prettyObj = stringifyObject(obj, {
            indent: '  ',
            singleQuotes: true,
          });
          stream.write(prettyObj);
          stream.end();
        }
    });
  },

  updateConfig: function updateConfig(Server, route){
    // avoid writing repeated routes;
    if(Server.configString.indexOf(JSON.stringify(route)) < 0){
      let config_dir = path.join(Server.dir, 'config.js');
      Server.configString = Server.configString.replace(/(routes\s*:\s*\[[\s\S]*?)(\])/, "$1" + '//' + JSON.stringify(route) + ',\n]');
      let formatData = beautify(Server.configString, { indent_size: 2 });
      fs.writeFile(config_dir, formatData, function(err){
        if(err) {
          return console.log(err);
        }
      });
    }
  }
}
