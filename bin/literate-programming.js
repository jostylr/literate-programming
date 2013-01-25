#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var Doc = require('../lib/literate-programming').Doc;

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

var save = function (doc, dir) {
    if (dir) {
        process.chdir(dir);
    }
    var files = doc.files;
    var file, block, fname, compiled, text;  
    var i, n = files.length;
    for (i=0; i < n; i+= 1) {
        file = files[i];
        block = doc.blocks[file[1]];
        fname = file[0]
        if (block) {
            compiled = block.compiled; 
            text = doc.getBlock(compiled, file[2], fname, block.name);
            fs.writeFileSync(fname, text, 'utf8');
            doc.log(fname + " saved");
        } else {
            doc.log("No block "+file[1] + " for file " + fname);
        } 
    }
};
 
var doc = (new Doc(md)).parseLines().compile();

save(doc, dir); 

console.log(doc.logarr.join("\n"));