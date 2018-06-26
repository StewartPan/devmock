const {distinguisher} = require('../config');

module.exports = function(req) {

  // we use properties in distinguisher to generate
  // key for the data as their filename.
  if(distinguisher.length == 0){
    let key = getResourceNameByURL(req.url);
    return {key: key, ok: true};
  }else{
    let key = '';
    for(int i = 0; i < distinguisher.length; i++){
      if(!req.hasOwnProperty(distinguisher[i])){
        return {key: '', ok: true};
      }else{
        key += req.distinguisher[i];
      }
    }
    return {key: key, ok: true};
  }
}
