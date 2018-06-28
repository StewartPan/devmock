const prompt = require('prompt');

module.exports = function runPrompt(schema, cb) {
  prompt.start();
  prompt.message = '';
  prompt.get(schema, function (err, result) {
    if(err){
      console.error(err);
    }
    else {
      cb && cb(result);
    }
    prompt.stop();
  });
};

