#!/usr/bin/env node

/*global process, require, console*/

var mod = require('literate-programming-cli');

var Folder = mod.Folder;

var opts = mod.opts;


var args = opts.parse();

Folder.lprc(args.lprc, args);

require('litpro-jshint')(Folder, args);

Folder.cache.firstLoad(args.cache, args.cachefile);

Folder.process(args);

process.on('exit', Folder.exit());
