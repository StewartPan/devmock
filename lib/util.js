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

  getRouteByReq: function getRouteByReq(req, body, distinguisher){
    let ext = '.json';
    let base = path.join(req.method, url.parse(req.url).pathname);
    console.log(base);
    if(distinguisher.length == 0) return [base + ext, true];
    else{
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
    let reqFullUrl = url.parse(req.url).pathname;
    console
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
