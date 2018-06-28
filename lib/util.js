const fs = require('fs');

module.exports = {
  prepareConfig: function prepareConfig(options){
    let config = require('./config');
    let existFlag = false;
    if(options.hasOwnProperty('dir')){
      let path = options.dir;
      console.log("config path is ", path);
      if(fs.existsSync(path)){
        config = require(path);
        existFlag = true;
        console.log('The config file exists');
      }else{
        throw "Can not find config file!";
        config = {};
      }
    }
    if(options.hasOwnProperty('port')){
      config.port = options.port;
    }
    if(!existFlag) createConfig(config);
    console.log(JSON.stringify(config));
    return config;
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
