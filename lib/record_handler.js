const {routes, distinguisher} = require('./config');
const {CURRENT_DIR} = require('../defaults');

module.exports = function(proxyRes, req){
  if(isTargetReq(req)){
    let {key, ok} = createDataKey(req);
        storePath = getStorePath(req, key);

  }

}
