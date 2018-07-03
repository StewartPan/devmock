const prompt = require('prompt');
const default_path = require('path').resolve();
const {SERVER_PORT, WS_PORT, SERVER_URL, TARGET_URL, DISTINGUISHER} = require('../lib/config');

const schema = {
  properties: {
    server_port: {
      description: 'Enter server port',
      type: 'integer',
      default: SERVER_PORT,
      required: true
    },
    server_port: {
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
    dir: {
      description: 'Enter directory to store mockdata and config',
      type: 'string',
      default: default_path,
      required: true
    },
    target_url: {
      description: 'Enter target_url to cache desired ajax data',
      type: 'string',
      default: TARGET_URL,
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
