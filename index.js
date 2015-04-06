#!/usr/bin/env node

/*global process, require, console*/

var mod = require('literate-programming-cli');

var opts = mod.opts;

var args = opts.parse();

args.build = args.build.map(function (el) {
    if (el.slice(-1) === "/") {
        return el.slice(0, -1);
    } else {
        return el;
    }
});

args.other.forEach(function (arg) {
    var pair = arg.split(":");
    if (pair.length === 1) {
        args[pair[0]] = true;
    } else if (pair.length === 2) {
        args[pair[0]] = pair[1]; 
    } else {
        args[pair[0]] = pair.slice(0);
    }
});

var Folder = mod.Folder;

Folder.prototype.encoding = args.encoding;

Folder.lprc(args.lprc, args);

require('litpro-jshint')(Folder, args);
require('litpro-commonmark')(Folder, args);

Folder.process(args);

process.on('exit', Folder.exit());
