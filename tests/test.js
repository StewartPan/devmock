const fs = require('fs');

function testAppend(){
  let stream = fs.createWriteStream("jsonTest.json", {flags: 'a'});
  console.log(new Date().toISOString());
  [...Array()].forEach(function (item, index){
    stream.write(index + "\n");
  });
  console.log(new Date().toISOString());
  stream.end();
}

testAppend();
