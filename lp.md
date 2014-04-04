# Literate-Programming

This compiles markdown text into programs and other stuff. 

## Files

* [index.js](#basic-structure "save: | jshint") This is the main file that
  does the compiling.
* [newex/emit.js](#simple-example "save:emit based| jshint") An emit based
  test.
* [newex/call.js](#simple-example "save:callback based| jshint") An emit
  based test.

## Simple example

This will be a simple use case examplei

[emit based]()

    var litpro = require("../index.js");

    var doc = litpro(),
        gcd = doc.gcd;

    gcd.makeLog();

    gcd.on("doc compiled", function (data, evObj) {
        console.log(data["another block"]);
    });

    gcd.emit("new doc", "# example \n some stuff \n\n    code\n\n"+
        '## another block\n\n more stuff\n\n    _"example"');

    process.on("exit", function () {
        console.log(gcd.log.logs());
    });

[callback based]()

    var litpro = require("../index.js");

    var doc = litpro("# example \n some stuff \n\n    code\n\n"+
        '## another block\n\n more stuff\n\n    _"example"', 
        function (data) {
            console.log(data["another block"]);
        });


## Basic structure

Our export is a doc constructor. 

Its arguments are the text to compile, options in constructing the compilation
functions, and a callback to ring back when all done. This is all asynchronous
which implies that the return value is useless. The callback should expect the
doc as the second argument; the first is, by node convention, any error object
that is generated. 

The options argument is an object. Its `merge` key object will be merged with
a "prototyped" object that is attached to the doc object. The options object
will get passed on in prototype form for any other documents that are being
compiled. It may have other features; see [options](#options).

We also will require the following modules: marked, fs, event-when. The object
gcd is the event dispatcher.

    var marked = require('marked');
    var fs = require('fs');
    var EventWhen = require('event-when');


    var litpro = function me (md, options, callback) {
        if ( !(this instanceof me) ) {
            return new me(md, options, callback);
        }

        var doc = this,
            gcd = doc.gcd = new EventWhen(),
            docs = doc.docs = [];

        gcd.doc = doc;

        _":check types"

        _"new doc|oa"


        if (options !== null) {
            gcd.emit("options received", options);
        }

        if (md !== null) {
            gcd.emit("new doc", [md, callback]);
        }

        return false;
    };

litpro.prototype = {
_"prototype",
init : _"initialization"
};

    module.exports = litpro;



[check types]()

This is a courtesy. Since each argument type is distinct, we can rearrange at will. 

    var arr = [md, options, callback];
    md = options = callback = null;
    arr.forEach(function (el) {
        switch (typeof el) {
            case "string" : 
                md = el;
            break;
            case "function" :
                callback = el;
            break;
            case "undefined" :
            break;
            default : 
                options = el;
        }
    });

## New Doc 

When a new piece of text is added to be parsed, we want to create the doc
block and then emit the doc text event.

    new doc --> add doc : docs

    var top = {};
    if (typeof data === "string") {
        top.raw = data;
    } else if ( Array.isArray(data) ) {
        if (typeof data[0] === "string") {
            top.raw = data[0];
            gcd.on("doc compile", data[1]);
         }
    }

    var docs = this;

    docs.push(top);
    var place = docs.length - 1;
    
    gcd.scope(place, top);

    gcd.emit("doc text:"+place);

    // just fake
    var repeat = {
        raw : 'me = _"example"',
        compiled: "me = code"
    };

    gcd.emit("doc compiled", {
        "example" : {raw : "code", compiled: "code"},
        "another block" : repeat,
        "example/another block" : repeat
    });



## On action 

To smoothly integrate event-action workflows, we want to take a block, using
the first line for an on and action pairing. 

Then the rest of it will be in the function block of the action. 

    function (code) {
        var lines = code.split("\n");
    
        var top = lines.shift().split("-->");
        var event = top[0].trim();
        var actcon = top[1].split(":");
        var action = actcon[0].trim();
        var context = (actcon[1] || "").trim();
        
        var ret = 'gcd.on("' + event + '", "' + action + 
            '"' + (context ? (', ' + context) : '') + ");\n\n";

       ret += 'gcd.action("' +  action + '", ';
       ret += 'function (data, evObj) {\n        var gcd = evObj.emitter;\n';
       ret += '        ' + lines.join('\n        ');
       ret += '\n    }\n);';
       
       return ret;
    }

[oa](#on-action "define: command | | now")

