#!/usr/bin/env node

/*global process, require */

var mod = require('./index.js');

var args = mod.opts.parse();

args.build = args.build.map(function (el) {
    if (el.slice(-1) === "/") {
        return el.slice(0, -1);
    } else {
        return el;
    }
});

var z = {};
args.other.forEach(function (arg) {
    var pair = arg.split(":");
    if (pair.length === 1) {
        args[pair[0]] = true;
    } else if (pair.length === 2) {
        args[pair[0]] = pair[1]; 
    } else {
        args[pair[0]] = pair.slice(1);
    }
    z[pair[0]] = args[pair[0]];
});

//console.warn("!!", args);

var Folder = mod.Folder;

Folder.inputs = args;
Folder.z = z;

//plugin-to-folder

Folder.prototype.encoding = args.encoding;
Folder.prototype.displayScopes = (args.scopes ? function () {
    var folder = this;
    var str = '';
    Object.keys(folder.scopes).forEach(function (el) {
        str += el+ "::\n------\n";
        var scope = folder.scopes[el];
        Object.keys(scope).sort().forEach(
            function (v) {
                str+= v + ": '" + scope[v] + "'\n* * *\n";
            });
        str += "\n------\n";
    });
    str = str.replace(/\n\n/g, "\n");
    console.log(str);
} :
    function () {} );


Folder.lprc(args.lprc, args);

Folder.process(args);

process.on('exit', Folder.exit());
