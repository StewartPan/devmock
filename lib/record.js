var fs = require('fs');

module.exports = function record(path, content){
  fs.writeFile(path, content, function(err) {
	  if(err) {
        return console.log(err);
	  }
	  console.log("The file was saved!");
  });
}
