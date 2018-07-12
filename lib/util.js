const fs = require('fs');
const url = require('url');
const path = require('path');
const jsonFormat = require('json-format');
const util = require('util');
const mkdirp = require('mkdirp');
const stringifyObject = require('stringify-object');
const cp = require('child_process');
const beautify = require('js-beautify').js_beautify;

module.exports = {
  prepareConfig: function prepareConfig(options){
    let dir = path.join(options.dir, 'config.js');
    let config = {};
    console.log("config path is ", dir);
    if(fs.existsSync(dir)){
      config = require(dir);
      console.log('The config file exists');
    }else{
      throw "Can not find config file!";
    }
    let prettyObj = stringifyObject(config, {
      indent: '  ',
      singleQuotes: true,
    });
    console.log(prettyObj);
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
      console.log("reqPath is ", reqPath);
      return reqPath;
    }else{
      console.log("reqPath is ", path.dirname(reqPath));
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
    console.log("The name of req is ", name + ext);
    return name + ext;
  },

  getRouteByReq: function getRouteByReq(req, distinguisher){
    return path.join(module.exports.getDirByReq(req, distinguisher), module.exports.getNameByReq(req, distinguisher));
  },


  returnMockData: function returnMockData(mockData, res){
    console.log("We are going to use mockData");
    let {headers, body} = mockData;
    if(mockData.headers){
      for (let prop in headers){
        res.setHeader(prop, headers[prop]);
      }
    }
    if(mockData.body){
      res.write(body);
      res.end();
    }else{
      res.end('ERROR, can not find the MockData');
    }
  },

  isTargetReq: function isTargetReq(req, target_url){
    //let reqFullUrl = req.headers.protocol + '://' + req.headers.host + url.parse(req.url).pathname;

    let reqFullUrl = req.headers.host + url.parse(req.url).pathname;
    console.log(" reqFullUrl is ", reqFullUrl);
    console.log(" Target Url is ", target_url);

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

  convertObjToMod: function convertObjToMod(obj, dir){
    mkdirp(path.dirname(dir), function (err) {
        if (err) {
          console.error(err);
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

  updateConfig: function updateConfig(dir, route){
    let config_dir = path.join(dir, 'config.js');
    fs.readFile(config_dir, 'utf8', function (err, data) {
        if (err) throw err;
        //append route
        let newData = data.replace(/(routes\s*:\s*\[[\s\S]*?)(\])/, "$1" + '//' + JSON.stringify(route) + ',\n]');
        let formatData = beautify(newData, { indent_size: 2 });
        fs.writeFile(config_dir, formatData, function(err){
          if(err) {
            return console.log(err);
          }
        });
    });
  }
}
