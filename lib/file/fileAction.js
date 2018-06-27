var fs = require('fs');

module.exports = {
  recordData: function recordData(path, content){
    fs.writeFile(path, content, function(err) {
  	  if(err) {
          return console.log(err);
  	  }
  	  console.log("The file was saved!");
    });
  }

  readMockData: function readMockData(){
    //  TODO:
  }

  readConfig: function readConfig(){
    // TODO:
  }

  createConfig: function createConfig(){
    // TODO:
  }

  updateConfig: function updateConfig(){
    // TODO:
  }
}
