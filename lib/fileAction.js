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

  readConfig: function read(){
    // TODO:
  }

  writeConfig: function writeConfig(){
    // TODO:
  }

  updateConfig: function updateConfig(){
    // TODO:
  }
}
