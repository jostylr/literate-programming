#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var Doc = require('../lib/literate-programming').Doc;

program
    .version('0.1')
    .usage('[options] <file>')
    .option('-d --dir <root>', 'Root directory for output')
    .option('-c --change <root>',  'Root directory for input')
    .option('-r --root <root>', 'Change root directory for both input and output')
    .option('-p --preview',  'Do not save the changes. Output first line of each file')
    .option('-f --free', 'Do not use the default standard library of plugins') 
;

program.parse(process.argv);

if ((! program.args[0]) ) {
    console.log("Need a file");
    process.exit();
}

var dir = program.dir || program.root; 
var indir = program.change || program.root;
var originalroot = process.cwd();
if (indir) {
    process.chdir(indir);
}

var md = fs.readFileSync(program.args[0], 'utf8');

var save = function (doc, dir) {
        process.chdir(originalroot);
        if (dir) {
            process.chdir(dir);
        }            
        var files = doc.files;
        var file, block, fname, compiled, text, litpro, headname, internal, fdoc;  
        var i, n = files.length;
        for (i=0; i < n; i+= 1) {
            file = files[i];
            fname = file[0];
            litpro = file[1][0];
            headname = file[1][1];
            internal = file[1][2];
            if (litpro) {
                        if (doc.repo.hasOwnProperty(litpro) ) {
                            fdoc = doc.repo[litpro];
                        } else {
                            doc.log(fname + " is trying to use non-loaded literate program " + litpro);
                            continue;
                        }
                    } else {
                        fdoc = doc;
                    }
                    if (headname) {
                        if (fdoc.blocks.hasOwnProperty(headname) ) {
                            block = fdoc.blocks[headname];
                        } else {
                            doc.log(fname + " is trying to load non existent block '" + headname + "'");
                            continue;
                        }
                    } else {
                        doc.log(fname + " has no block " + litpro + " :: " + headname);
                        continue;
                    }
            compiled = block.compiled; 
            text = fdoc.getBlock(compiled, internal, fname, block.name);
            text = fdoc.piping.call({doc:fdoc, block: fdoc.blocks[block.name], name:fname}, file.slice(2), text); 
            if (program.preview) {
                doc.log(fname + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
            } else {      
                fs.writeFileSync(fname, text, 'utf8');
                doc.log(fname + " saved");
            }
        }
    };
 
var doc = new Doc(md);

if (!program.free) {
    doc.standardPlugins = require('literate-programming-standard');
} else {
    doc.standardPlugins = {};
}
doc.addPlugins(doc.standardPlugins);
doc.parseLines().compile();

save(doc, dir); 

console.log(doc.logarr.join("\n"));