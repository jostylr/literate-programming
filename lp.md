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

    var lp = litpro.prototype;

    lp.marked = _"marked";
    lp.marked.marked = marked;


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

## Events

This is where we document the major events and any generic actions to take. 

### New Doc 

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

    top.whens = {
        "marked done" :  gcd.when("marked done:"+place, "ready to stitch")
    };

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

    

### Doc text

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
    var res = marked(data, place, blocks, gcd);

    gcd.emit("marked done:"+place, res);
    


### Marked done

The event `"marked done:"+doc placement` is used for a .when which will emit
the "ready to stitch" event. 

    whens["marked done"] = gcd.when("marked done:" + place,
        "ready to stitch:" + place);

!!! this should be linked up to something!

### Ready to stitch

This tells us that the document has been parsed and any directives have had
their initial execution handled. Now we need to go through all the blocks and
stitch them together. 

They have all been queued with .whens to emit "sitching"+scope

Nothing needs to be done here. See header:new block and link switch:new child
block

### Stitching 

The stitching event signifies it is time to do the subsitutions. This is also
when we process the commands. 

We get the block, parse the commands (if any) for post stitching, and then
parse the block. Both will generally involve setting up .whens.  

    stitching --> parse code : docs

    var docs = this;
    var pieces = evObj.pieces; 

    _":get code block"

    _"parse commands"

    _"parse block"



[get code block]()

We take the pieces of the event and use them to grab the code block. block
will be the whole block, code will be the code block. That is an array which
should be joined together first.

Stitching should be called as stitching:doc place:heading block:child  where
the last scope is optional and is used for link blocks. 

    var block = docs[pieces[1]][pieces[2]];
    if (pieces[3]) {
        block = block.children[pieces[2]];
    }
    code = block.codecode.join("\n");

### command


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
            path : ['']
        };

        global.current = blocks[''] = {
            path : ['']
        };

        //load renderer codes
        ['heading', 'code', 'html', 'link', 'paragraph'].forEach(
            function (el) {
                rendered[el] = self[el](global);
            });
            
        _"irrelevant types"

        return renderer(text);


    }

### Headers

This creates a block and attaches relevant emit stuff. 

We are tracking the paths and the level will correspond to its placement in
the path. If it jumps levels, we just add some blank paths which will get
joined with "/". 

Due to switch links, we need to check whether the current has a parent or
not. If so, then we 

    function (global) {
        return function (text, level, raw) {
            var gcd = global.gcd;
            var current;
            var path = global.path;
            var place = global.place;

            while ( level <= path.length ) {
                path.pop();
            }

            while ( level > path.length + 1) {
                path.push('');
            }
             
            pathstr = path.join('/');
    
            blocks = global.blocks;
            if ( blocks.hasOwnProperty(pathstr) ) {
                global.curent = blocks[pathstr];
            } else {
        
                current = global.current = {
                    path : path.slice(),
                    scope : pathstr;
                };
                global.blocks[pathstr] = global.current;

                ":new block"
          
            } 
            
            return "";
        };
    }

[new block]() 

This contains all the event stuff needed when creating a new block. 

So what do we need to do with a block? When compile time is ready, we first
stitch the block together. Then we compile it, if there are any commands
acting on it (mainly switch links, but directives might add commands too). 

When the block is compiled, it should say so as we may have listeners
waiting for it.  

    var scope = ":" + place + ":" + 
        pathstr;
 
    gcd.when("ready to stitch:" + place, 
        "stitching" + scope
    );

    global.docs[place].whens.done.add("compiled" + scope); 



when stitched, emit "stitched:"+path, then a generic action of "compile" is
executed resulting in executing any commands on it. The commands should be
linked to each other. The order can be known and as one finishes, the next
one fires (once). Most blocks probably have no commands and will simply emit
"compiled:"+path when done. 

The "compiled:"+path  event can be listened for .when's of sections that
want to use the compiled version.  



### Code blocks

There should be a current block. If it has a code block already, concatenate. 

    function (global) {
        return function (code) {
            var current = global.current;

            if ( current.hasOwnProperty("raw") ) {
                current.raw.push(code);
            } else {
                current.raw = [code];
            }

            return "";

        };
    }

### Links

A link has complex behavior. It could be a new heading, a directive, or
nothing at all. 

A link is first asked if it is a directive. If it is, then we do an emit
saying so and return from the function. If not, then we store the link and
check it later at the end of a paragraph to see if is a header link. 


    function (global) {
        return function (href, title, text) {
            if (title) {
                title = title.replace(/&quot;/g, "\"").trim();
            } else {
                title = "";
            }
            _":is directive"
            global.clink = [href, title, text];
            return text;
        };
    }

[is directive]()

A directive is a title that starts with `name:` where name is a recognized
directive. Directives need to be known before marked parsing begins. 

We store them in doc.directives which is prototyped on a standard set of
directives. The execute directive command will load it. It might be possible
to make this a bit more direct. 

    var com = title.match(/^(\w)+\s*\:\s*(.*)$/);
    if (com && global.gcd.docs.directives.hasOwnProperty(com[1]) {
        gcd.emit("directive found:"+com[1]+":"+current.scope, com[2]);
        return text;
    }



### HTML

This is to deal with pre. The pre tag is for code content that should not be
compiled. We will stick in a pre array on the current block. 

    function(global) {

        return function (text) { 
            var current = global.current;
            var pos;
            if (text.slice(0,5) === "<pre>") {
                pos = text.indexOf("</pre>");
                if (current.pre) {
                    current.pre.push(text.slice(5, pos));
                } else {
                    current.pre = [text.slice(5, pos)];
                }
            }
        };

    }

### Paragraph

The paragraph is just to find out whether a link was the whole paragraph or
not. It is otherwise ignored.

    function (global) {

        return function (text) {
            var parent;
            var clink = global.clink;
            if (text === clink[2]) {
                _":switch link"
            }
            clink.splice(0,3);
            return "";
        };
    
    }

[switch link]()

What about just having children blocks for these? So we just 

This switches the link. What this means is it creates a new block with a
parent entry. The path is the same as the parent with `:link text` appended.
That is, it is not another level. 

clink is of the form `[href, title, text]`. For switching, the text is what
the new path is. Title can be parsded for commands. href has no rule. 

    
    if ( global.current.hasOwnProperty("parent") ) {
        parent = global.current.parent;
    } else {
        parent = global.current;
    }
    
    if ( ! parent.hasOwnProperty("children") ) {
       parent.children = {}; 
    }

    var text = clink[2];
    if (children.hasOwnProperty(text) ) {
        global.current = children[text];
        if ( clink[1]) {
            if ( global.current.hasOwnProperty("commands") ) { 
                global.current.commands += "|" + clink[1];
            } else {
                global.current.commands = clink[1];
            }
    } else {

        global.current = children[text] = {
            parent : parent, 
            name : clink[2]
        }
        if (clink[1]) {
            global.current.commands = clink[1];
        }

        _":new child block"
    
    }

[new child block]()

This will be similar, but different than, the new block. Specifically, this
assumes the parent block is stored in its scope and it uses the child scope
to get itself from that parent scope. It also has commands that might need to
be parsed and executed. 

When the block is compiled, it should say so as we may have listeners
waiting for it.  

So the stitching 
    
    place = global.place;
    var scope = ":" + place + ":" + 
        pathstr + ":" + text;
 
    gcd.when("ready to stitch:" + place, 
        "stitch" + scope
    );

    global.docs[place].whens.done.add("compiled" + scope); 


During stitching, the commands can be parsed as well. So when the command
parsing is done and the stitching is done, then we execute the "ready to
compile" event. After compiliing, the block emits "compiled" + scope 


### Irrelevant types

I am not sure why these are here, but it will give plain text responses to
highlighter stuff. I suppose it is for headers?  

    var plain = function (text) {
        return text;
    }; 

    ["strong", "em", "codespan", "del"].forEach(function (el) {
        renderer[el] = plain;
    });


## parse block

We use str.indexOf("_", last)  where last was the end of the last stitch
block to get to the next possible one. Once we get to the "_", then we start
parsing by character. As we move along, we create an array of 
[plain text, ,
plain text, ,
...
]
We have a series of commands to parse the code through and then we insert the
result into the position of the array. When all done, we join them into a
single code block. 

indenting is a default command and it uses the \n spaces to figure out indent
of the plain text. 



## parse commands

This should process until each pipe. A sequence of events would be:
"sitching done:scope"
"ready for command:scope:c1:command"
"command finished:scope:c1:command"
"ready for command:scope:c2:command"
...
So each command has a .when of (command finishing:scope:cN:command, 
ready for command:scope:c2.command)

They also all add the finished to the .when for "done".

This is a quick hack version. We 

    function (comstring, scope) {
        
        var coms = split("|");

        coms.forEach(function (el, index) {
            if 
        });

    }


## todo 

command argument syntax. process it character by character, emitting as
something interesting happens. 

to get the string in a stitching context, process it looking for end
charcter(s) or backslashes. 

Use : for link headings, use something else for the block hierarchy. I think
that should be separate. 

## path syntax

name  look at highest matching level of that name
./name  look at highest matching level of name within current as parent
(path)/name  use path as starting point for search.
(path):name  will look for a subsection of name within the specified path. 
../name  will look for name within the ancestors, closest match works. 
ab/cd  will first find ab and then look for cd as descendant.

## On action 

To smoothly integrate event-action workflows, we want to take a block, using
the first line for an on and action pairing. 

Then the rest of it will be in the function block of the action. 

The syntax is  `event --> action : context` on the first line and the rest
are to be used as the function body of the handler associated with the
action. The handler has signature data, evObj. 


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

