var fs = require('fs'),
    util = require('util'),
    cp = require('child_process');

var filename = 'jsonTest.js';
var lines2nuke = 3;
var command = util.format('tail -n %d %s', lines2nuke, filename);

cp.exec(command, (err, stdout, stderr) => {
    if (err) throw err;
    var to_vanquish = stdout.length;
    console.log('stdout length is ', stdout.length);
    fs.stat(filename, (err, stats) => {
        if (err) throw err;
        fs.truncate(filename, stats.size - to_vanquish, (err) => {
            if (err) throw err;
            console.log('File truncated!');
        })
    });
});
