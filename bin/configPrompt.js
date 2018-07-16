const prompt = require('prompt');
const default_path = require('path').resolve();
const {SERVER_PORT, WS_PORT, SERVER_URL, DISTINGUISHER} = require('../lib/defaults');

const schema = {
  properties: {
    server_port: {
      description: 'Enter server port',
      type: 'integer',
      default: SERVER_PORT,
      required: true
    },
    websocket_port: {
      description: 'Enter websocket port',
      type: 'integer',
      default: WS_PORT,
      required: true
    },
    server_url: {
      description: 'Enter server url to proxy',
      type: 'string',
      default: SERVER_URL,
      required: true
    },
    target_url: {
      description: 'Enter target_url to cache desired ajax data',
      type: 'string',
      default: '',
      require: true
    },
    distinguisher: {
      description: 'Enter distinguisher to identify different requests',
      type: 'string',
      default: DISTINGUISHER,
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
