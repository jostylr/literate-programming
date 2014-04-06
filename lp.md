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

    if (process.argv[2]) {
        gcd.makeLog(parseInt(process.argv[2]));
    } else {
        gcd.makeLog();
    }

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

    top.compileTime = gcd.when("doc parsed:"+place, "compile time");

    gcd.emit("doc text:"+place, top.raw);

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

## Doc text

Here we get the raw text and run it through marked. The whole parsing is done
synchronously. 

The relevant doc placement is the second scope. The action context is the
marked parser.

The pieces should be of the form `[#, doc text]` where the number is the docs
position of the doc under consideration.

Marked will parse the text, making blocks, storing them in the top block. It
will also queue the relevant event/when/action sequences. In particular, at
the end of a block:

* We set an action listener for compile time. When compile time is emitted,
  the action compiles the block. 
* For directives, we add "directive compiled:place:path:command" events on the
  .when for compile time. That is, we want directives to be dealt with before
  the compile phase. 
* For lone link headers with commands, we attach command listeners to the
  compile block. The sequence is "stitching done" followed by "compiling
  done", all scoped to block. The compiling done is queued with a .when that
  initially just waits for stitching done, but any commands for it to execute
  can be added to it as well.

Also to note is that any two blocks that compile to the same global path are
to be concatenated. This is a bit of a dodgy style, but it does allow some
flexibility. Note that this also implies the children of concatenating blocks
who have the same name will also be concatenated. Be warned. 

    doc text --> parse doc : marked
    
    var marked = this;
    var place = evObj.pieces[0];
    var top = evObj.scopes[place];

    var blocks = top.blocks = {};
    marked(data, place, blocks, gcd);

    
    //parse text

    gcd.emit("doc parsed:"+place);

## marked

So we use marked to parse the markdown. It cares about headers, code blocks,
and links. Everything else is ignored. The idea is that we will have three
functions, one for each of those cases.  They will all have access to a global
(in this parsing phase) function that is closed over it in creating the
functions.

We keep track of current state with the current property of global. It is an
object that becomes a block. It contains a heading and it contains an array of
code blocks under raw.  During compilation, raw gets stitched and then it gets
compiled if there are any commands acting on it. 


    function self (text, place, blocks, gcd) {
        var renderer = new self.marked.Renderer();
        var global = {
            place : place,
            blocks : blocks, 
            gcd : gcd,
            path : ['/']
        };

        global.current = blocks['/'] = {
            path:['/'], 
            raw: []
        };

        //load renderer codes
        ['heading', 'code', 'html', 'link', 'paragraph'].forEach(
            function (el) {
                rendered[el] = self[el](global);
            });
            
        _"irrelevant types"

    }

### Headers

This creates a block and attaches relevant emit stuff. 

We are tracking the paths and the level will correspond to its placement in
the path. Note that this expects levels not to jump. If it does 
 
    renderer.heading = function (text, level, raw) {
        var path = global.path, 
            current = global.current;

        while (level <= path.length-1) {
            path.pop();
        }

        
        console.log(text);
        current = blocks[text] = [];
        return "";
    };


### Code blocks

There should be a current block. If it has a code block already, concatenate. 

    function (code, current) {
        if ( current.hasOwnProperty("code") ) {
            current.code += code;
        } else {
            current.code = code;
        }
    }

### Links

A link has complex behavior. It could be a new heading

#### Irrelevant types

I am not sure why these are here, but it will give plain text responses to
highlighter stuff. I suppose it is for headers?  

    var plain = function (text) {
        return text;
    }; 

    ["strong", "em", "codespan", "del"].forEach(function (el) {
        renderer[el] = plain;
    });




    var marked = require('marked');
    var renderer = new marked.Renderer();
    var fs = require('fs');
    var blocks = {};

    var current = blocks._initial = [];

    renderer.code = function (code, language) {
        current.push(code);
    };

    renderer.html = function (text) {
        var pos;
        if (text.slice(0,5) === "<pre>") {
            pos = text.indexOf("</pre>");
            console.log("pre", text.slice(5, pos));
            current.push(text.slice(5, pos));
        }
    };

    var clink; 
    renderer.link = function (href, title, text) {
        if (title) {
            title = title.replace(/&quot;/g, "\"");
        } else {
            title = "";
        }
        clink = [href, title, text];
        return text;
    };




    renderer.paragraph = function (text) {
        if (text === clink[2]) {
            console.log("switch: ", clink);
        }
        clink = [];
        return "";
    };

    var file = fs.readFileSync("links.md","utf8");

    marked(file, {renderer:renderer});

    console.log(blocks);

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

