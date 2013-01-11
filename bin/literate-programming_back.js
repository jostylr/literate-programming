#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var lp = require('../lib/literate-programming');

program
    .version('0.1')
    .usage('[options] <file>')
    .option('-d --dir <root>', 'Root directory')
;

program.parse(process.argv);

if ((! program.args[0]) ) {
    console.log("Need a file");
    process.exit();
}

var dir = program.dir; 
var md = fs.readFileSync(program.args[0], 'utf8');


var save = function (files, dir) {
    if (dir) {
        process.chdir(dir);
    }
    for (var name in files) {
        // name, text
      console.log(name + " saved");
      fs.writeFileSync(name, files[name][0], 'utf8');
    }

};
 

var doc = lp.compile(md);
save(doc.compiled, dir); 

console.log(doc.log.join("\n\n"));