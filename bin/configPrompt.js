const prompt = require('prompt');
const {targetUrl, requestMatcher, overwrite, serverPort, wsPort, mstrMode, https, keyDir} = require('../lib/defaults');

const schema = {
    properties: {
        targetUrl: {
            description: 'Enter delegated server url',
            type: 'string',
            default: targetUrl,
            required: true
        },
        requestMatcher: {
            // to be refined
            description: 'Enter an array of request matchers to identify the desired request(press ^C to end input)',
            type: 'array',
            default: requestMatcher,
            required: true
        },
        overwrite: {
            description: 'Enter true/false to overwrite existing mock data',
            type: 'boolean',
            default: overwrite,
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
        },
        keyDir: {
            description: 'Enter certificate/private keys directory for https, ignore this option if use http',
            type: 'string',
            default: keyDir,
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
