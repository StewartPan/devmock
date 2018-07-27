const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const mkdirp = require('mkdirp');
const stringifyObject = require('stringify-object');
const beautify = require('js-beautify').js_beautify;
const zlib = require('zlib');

module.exports = {

  getRouteByReq: function getRouteByReq(req, body, distinguisher){
    let ext = '.json';
    let base = path.join(req.method, url.parse(req.url).pathname);
    if(distinguisher.length == 0){
      if(base[base.length-1] == '/' || base[base.length-1] == '\\'){
        return [path.join(base, 'folder' + ext), true];
      }else{
        return [base + ext, true];
      }
    }else{
      let id = '';
      for(let i = 0; i < distinguisher.length; i++){
        // NOTE: body.distinguisher[i] will throw error:
        // Cannot read property '0' of undefined
        if(body[distinguisher[i]]){
          id += body[distinguisher[i]];
        }else{
          return ['', false];
        }
      }
      return [path.join(base, id) + ext, true];
    }
  },

  returnMockData: function returnMockData(mockData, res){
    console.log("We are going to use mockData");
    let {headers, body} = mockData;
    if(headers){
      for (let prop in headers){
        res.setHeader(prop, headers[prop]);
      }
    }
    if(body){
      let encodingType = headers['content-encoding'];
      if(typeof body !== 'string'){
        body = JSON.stringify(body);
      }
      if(encodingType == 'gzip'){
        console.log("we are going to compress the mock data");
        zlib.gzip(body, function (error, result) {
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
    return reqFullUrl.indexOf(target_url) > -1;
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
