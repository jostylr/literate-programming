#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var lp = require('./lib/literate-programming');

program
    .version('0.1')
    .option('-d --dir', 'Root directory')
    .parse(process.argv);

program.root = dir;


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
 
var filename = process.argv[2];
if (!filename) {
    console.log("Usage: litpro file-to-compile optional:directory-to-place-result");
    process.exit();
}
var dir = process.argv[3];
var md = fs.readFileSync(filename, 'utf8');

var doc = lp.compile(md);
save(doc.compiled, dir); 

console.log(doc.log.join("\n\n"));