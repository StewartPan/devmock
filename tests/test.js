const fs = require('fs');
const path = require('path');
const http = require('http');

class test {
  constructor(){
    this.a  = 10;
    //console.log(path.resolve());
  }
  init(){
    this.server = http.createServer(function(req, res){
      console.log(this.a);
    }).listen(1111);
  }
}


let t = new test();
t.init();
