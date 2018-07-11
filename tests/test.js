const fs = require('fs');

let regex = new RegExp("/(route:)//$]/");

fs.readFile("jsonTest.js", 'utf8', function (err, data) {
    if (err) throw err;
    console.log(data);
    console.log('Res is ', data.replace(regex, 'Oh my god'));
});
