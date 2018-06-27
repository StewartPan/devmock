const {routes, distinguisher} = require('./config');
const {CURRENT_DIR} = require('./defaults');
const {recordData, updateConfig}


module.exports = {
  mock_handler: function mock_handler(){
    // TODO:
    {route, ok} = getMockDataRoute();
    if(ok){
      {header, body} = readMockData(route);
      res.writeHead(head);
      res.writeBody(body);
      res.end();
    }else {
      console.log('required mockdata does not exist！');
    }

    function getMockDataRoute(){
      // TODO:
    }
  }

  record_handler: function record_handler(proxyRes, req){
    // TODO:
    if(isTargetReq(req)){
      recordData();
      updateConfig();
    }
  }
}
