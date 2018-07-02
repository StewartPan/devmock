const prompt = require('prompt');
const default_path = require('path').resolve();
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
    },
    mockdata_dir: {
      description: 'Enter directory to store mockdata and config',
      type: 'string',
      default: default_path,
      required: true
    },
    distinguisher: {
      description: 'Enter distinguisher to identify different requests',
      type: 'array',
      default: [],
      require: true
    },

    target_url: {
      description: 'Enter target_url to cache desired ajax data',
      type: 'string',
      default: 'http://localhost:8080/MstrMainBranch/servlet/mstrWeb',
      require: true
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
