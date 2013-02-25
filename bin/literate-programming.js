#!/usr/bin/env node

/*global process, require, console*/
var program = require('commander');
var fs = require('fs');
var Doc = require('../lib/literate-programming').Doc;

program
    .version('0.6.0')
    .usage('[options] <file>')
    .option('-o --output <root>', 'Root directory for output')
    .option('-i --input <root>',  'Root directory for input')
    .option('-r --root <root>', 'Change root directory for both input and output')
    .option('-p --preview',  'Do not save the changes. Output first line of each file')
    .option('-f --free', 'Do not use the default standard library of plugins') 
    .option('-d -diff', 'Compare diffs of old file and new file')
;

program.parse(process.argv);

if ((! program.args[0]) ) {
    console.log("Need a file");
    process.exit();
}

var dir = program.dir || program.root || process.cwd(); 
var indir = program.change || program.root || process.cwd();
var originalroot = process.cwd();
if (indir) {
    process.chdir(indir);
}

var md = fs.readFileSync(program.args[0], 'utf8');

var postCompile; 

postCompile = function (text) {
    var passin = this;
    var doc = this.doc;
    var steps = doc.postCompile.steps;
    var i = 0; 
    var next = function(text) {
            if (i  < steps.length) {
                var step = steps[i];
                i+= 1;
                step[0].call(passin, text, next, step[1]);
            } else {
                // done
            }
        
        };
    next(text); 
};

postCompile.push = function (arr) {
        this.steps.push(arr);
    };

postCompile.steps = [];

if (program.preview) {
    postCompile.push([function (text, next) {
            var passin = this;
            var doc = passin.doc;
            var fname = passin.action.filename;
            doc.log(fname + ": " + text.length  + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
            next(text);
        }, {}]);
} else if (program.diff) {
    postCompile.push([function (text, next, obj) {        
            var passin = this;
            var doc = passin.doc;
            var fname = passin.action.filename;
        
            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }
        
            doc.log(fname + " diff not activated yet ");
            next(text);
        }, {dir:dir}]);
} else {
    postCompile.push([function (text, next, obj) {
            var passin = this;
            var doc = passin.doc;
            var fname = passin.action.filename;
        
            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }            
            var cb = function (err) {
                    if (err) {
                        doc.log("Error in saving file " + fname + ": " + err.message);
                    } else {
                        doc.log("File "+ fname + " saved");
                    }
                    next(text);
                };
        
            fs.writeFile(fname, text, 'utf8', cb);
        }, {dir: dir}]);
}

var standardPlugins; 

if (!program.free) {
    standardPlugins = require('literate-programming-standard');
} else {
    standardPlugins = {};
}

if (!program.quiet) {
    postCompile.push([function (text, next) {
            var doc = this.doc;
            var i, n = doc.logarr.length;
            for (i = 0; i < n; i += 1) {
                console.log(doc.logarr.shift() );
            }
            next(text);
        }, {}]);
}

postCompile.push([function (text, next) {
        var doc = this.doc;
        delete doc.actions[this.action.msg];
        next(text);
    }, {}]);

var doc = new Doc(md, {
    standardPlugins : standardPlugins,
    postCompile : postCompile, 
    parents : null,
    fromFile : null
});

process.on('exit', function () {
    if (Object.keys(doc.waiting).length > 0 ) {
        console.log("The following blocks failed to compile: \n",  Object.keys(doc.waiting).join("\n "));
    } 
    if (Object.keys(doc.actions).length > 0 ) {
        console.log("The following actions failed to execute: \n",  Object.keys(doc.actions).join("\n "));
    } 

    var fdoc, fdocname;
    for (fdocname in doc.repo.litpro) {
        fdoc = doc.repo.litpro[fdocname]; 
        if (Object.keys(fdoc.waiting).length > 0 ) {
            console.log("The following blocks in "+fdocname+" failed to compile: \n",  Object.keys(fdoc.waiting).join("\n "));
        } 
        if (Object.keys(fdoc.actions).length > 0 ) {
            console.log("The following actions in "+fdocname+" failed to execute: \n",  Object.keys(fdoc.actions).join("\n "));
        }
    } 
});