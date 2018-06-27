const {distinguisher} = require('./config');
const url = require('url');

module.exports = {

  // we use properties in distinguisher or url resource name
  // to generate key for the data as their filename.
  getMockDataFileName: function getMockDataFileName(){
    if(distinguisher.length == 0){
      let key = getResourceNameByURL(req.url);
      return {key: key, ok: true};
    }else{
      let key = '';
      for(let i = 0; i < distinguisher.length; i++){
        if(!req.hasOwnProperty(distinguisher[i])){
          return {key: '', ok: false};
        }else{
          key += req.distinguisher[i];
        }
      }
      return {key: key, ok: true};
    }

    function getResourceNameByURL(URL){
      var nameArray = url.parse(URL).pathname.split('/');
      return nameArray[nameArray.length-1];
    }
  }

  getMockDataFilePath: function getMockDataFilePath(){
    // TODO:
  }
}
