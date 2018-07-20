const prompt = require('prompt');
const default_path = require('path').resolve();
const {server_port, ws_port, server_url, distinguisher} = require('../lib/defaults');

const schema = {
  properties: {
    server_port: {
      description: 'Enter server port',
      type: 'integer',
      default: server_port,
      required: true
    },
    ws_port: {
      description: 'Enter websocket port',
      type: 'integer',
      default: ws_port,
      required: true
    },
    server_url: {
      description: 'Enter server url to proxy',
      type: 'string',
      default: server_url,
      required: true
    },
    target_url: {
      description: 'Enter target_url to cache desired ajax data',
      type: 'string',
      default: '',
      require: true
    },
    distinguisher: {
      description: 'Enter distinguisher array to identify different requests(use ^C to end)',
      type: 'array',
      default: distinguisher,
      require: true
    },
  }
};

module.exports = function configPrompt(dir, cb) {
  prompt.start();
  prompt.message = '';
  prompt.get(schema, function (err, result) {
    if(err){
      console.error(err);
    }
    else {
      cb && cb(dir, result);
    }
    prompt.stop();
  });
};
