#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var Doc = require('../lib/literate-programming_v6').Doc;

program
    .version('0.1')
    .usage('[options] <file>')
    .option('-o --output <root>', 'Root directory for output')
    .option('-i --input <root>',  'Root directory for input')
    .option('-r --root <root>', 'Change root directory for both input and output')
    .option('-p --preview',  'Do not save the changes. Output first line of each file')
    .option('-f --free', 'Do not use the default standard library of plugins') 
    .option('-d -diff', 'Compare diffs of old file and new file')
    .option('-s -saveall', 'Save all externally literate program files as well')
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

var postCompile = [];

//postCompile.push([function (doc) {console.log(doc);}, {}]);

if (program.preview) {
    postCompile.push([function () {
            var doc = this;
            var files = doc.compiledFiles;
            var fname, text;
            for (fname in files) {
                text = files[fname];
                console.log(fname + ": " + text.length  + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
            }
        }, {}]);
} else if (program.diff) {
    postCompile.push([function (obj) {
            var doc = this;
            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }  
            var files = doc.compiledFiles;
            var fname;
            for (fname in files) {
                console.log(fname + " diff not activated yet ");
            }
        }, {dir:dir}]);
} else if (program.saveAll) {
    postCompile.push([function (obj) {
            var doc = this;
            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }            
            var files = doc.compiledFiles;
            var fname;
            var cbfact = function (fname) {
                    return function (err) {
                        if (err) {
                            console.log("Error in saving file " + fname + ": " + err.message);
                        } else {
                            console.log("File "+ fname + " saved");
                        }
                    };
                };
            for (fname in files) {
                fs.writeFile(fname, files[fname], 'utf8', cbfact(fname));
            }
        
        }, {dir: dir}, "inherit"]);
} else {
    postCompile.push([function (obj) {
            var doc = this;
            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }            
            var files = doc.compiledFiles;
            var fname;
            var cbfact = function (fname) {
                    return function (err) {
                        if (err) {
                            console.log("Error in saving file " + fname + ": " + err.message);
                        } else {
                            console.log("File "+ fname + " saved");
                        }
                    };
                };
            for (fname in files) {
                fs.writeFile(fname, files[fname], 'utf8', cbfact(fname));
            }
        
        }, {dir: dir}]);
}

var standardPlugins; 

if (!program.free) {
    standardPlugins = require('literate-programming-standard');
} else {
    standardPlugins = {};
}

if (!program.quiet) {
    postCompile.push([function () {
            var doc = this;
            console.log(doc.logarr.join("\n"));
        }, {}, "inherit"]);
}

var doc = new Doc(md, {
        standardPlugins : standardPlugins,
        postCompile : postCompile, 
        parents : null,
        fromFile : null
});