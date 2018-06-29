const prompt = require('prompt');

const schema = {
  properties: {
    server_port: {
      description: 'Enter server port',
      type: 'integer',
      default: 9080,
      required: true
    },
    server_url: {
      description: 'Enter server url to proxy',
      type: 'string',
      default: 'http://localhost:8080',
      required: true
    }
  }
};

module.exports = function configPrompt(cb) {
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

