const fs = require('fs');
const url = require('url');

module.exports = {
  prepareConfig: function prepareConfig(path){
    let config = {};
      console.log("config path is ", path);
      if(fs.existsSync(path)){
        config = require(path);
        console.log('The config file exists');
      }else{
        throw "Can not find config file!";
      }
    console.log(JSON.stringify(config));
    return config;
  }

  isRouteMatch: function(req, distinguisher){

  }

  getRouteByReq: function(req, distinguisher){
    let method = req.method;
    let route = method + '\/' + url.parse(req.url).pathname;
    if(distinguisher.length != 0){
      let reqbody = getReqBody(req);
      let identifier = '';
      for(let i = 0; i < distinguisher.length; i++){
        if(reqbody.distinguisher[i]){
          identifier += reqbody.distinguisher[i];
        }else{
          throw 'Property as distinguisher does not find in request body';
        }
      }
      route += identifier;
      return route;
  }

  getReqBody: function(req){
    let body = [];
    req.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
    }
    reqbody = JSON.parse(body);
    return reqbody;
  }
  // readMockData: function readMockData(){
  //   //  TODO:
  // }
  //
  // readConfig: function readConfig(){
  //   // TODO:
  // }
  //
  // createConfig: function createConfig(){
  //   // TODO:
  // }
  //
  // updateConfig: function updateConfig(){
  //   // TODO:
  // }



  // recordData: function recordData(path, content){
  //   fs.writeFile(path, content, function(err) {
  //     if(err) {
  //         return console.log(err);
  //     }
  //     console.log("The file was saved!");
  //   });
  // }


  // we use properties in distinguisher or url resource name
  // to generate key for the data as their filename.
  // getMockDataFileName: function getMockDataFileName(){
    // if(distinguisher.length == 0){
    //   let key = getResourceNameByURL(req.url);
    //   return {key: key, ok: true};
    // }else{
    //   let key = '';
    //   for(let i = 0; i < distinguisher.length; i++){
    //     if(!req.hasOwnProperty(distinguisher[i])){
    //       return {key: '', ok: false};
    //     }else{
    //       key += req.distinguisher[i];
    //     }
    //   }
    //   return {key: key, ok: true};
    // }
    //
    // function getResourceNameByURL(URL){
    //   var nameArray = url.parse(URL).pathname.split('/');
    //   return nameArray[nameArray.length-1];
    // }

    // mock_handler: function mock_handler(){
      // TODO:
      // {route, ok} = getMockDataRoute();
      // if(ok){
      //   {header, body} = readMockData(route);
      //   res.writeHead(head);
      //   res.writeBody(body);
      //   res.end();
      // }else {
      //   console.log('required mockdata does not exist！');
      // }

    //   function getMockDataRoute(){
    //     // TODO:
    //   }
    // }

    // record_handler: function record_handler(proxyRes, req){
      // TODO:
      // if(isTargetReq(req)){
      //   recordData();
      //   updateConfig();
      // }
  //   }
  //
  // }
  //
  // getMockDataFilePath: function getMockDataFilePath(){
    // TODO:
  // }

}
