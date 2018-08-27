const prompt = require('prompt');
const {recordUrl, recordMatcher, overwrite, serverPort, wsPort, mstrMode, https} = require('../lib/defaults');

const schema = {
    properties: {
        recordUrl: {
            description: 'Enter delegated server url',
            type: 'string',
            default: recordUrl,
            required: true
        },
        serverPort: {
            description: 'Enter mock server port',
            type: 'integer',
            default: serverPort,
            required: true
        },
        wsPort: {
            description: 'Enter mock server websocket port',
            type: 'integer',
            default: wsPort,
            required: true
        },
        recordMatcher: {
            // to be refined
            description: 'Enter an array of request matchers to record the desired request(press ^C to end input)',
            type: 'array',
            default: recordMatcher,
            required: true
        },
        overwrite: {
            description: 'Enter true/false to overwrite existing mock data',
            type: 'boolean',
            default: overwrite,
            required: true
        },
        mstrMode: {
            description: 'Enter true for MSTR internal use, or enter false if you are not sure',
            type: 'boolean',
            default: mstrMode,
            required: true
        },
        https: {
            description: 'Enter true for https, false for http',
            type: 'boolean',
            default: https,
            required: true
        }
    }
};

module.exports = function configPrompt(cb) {
    prompt.start();
    prompt.message = '';
    prompt.get(schema, function (err, result) {
        if (err) {
            console.error(err);
        }
        else {
            cb && cb(result);
        }
        prompt.stop();
    });
};
