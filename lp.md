# Literate Programming

Literate programming is the idea that we should write code to be read and
understood by others. The idea is to take the reader on the thought process of
the author. This can be hard, but it can also be very useful. 

This project uses markdown to write up the document. Code blocks are what gets
compiled; code spans are not used. Headings demarcate blocks, but lone links
can create subdivisions within that. Substitutions are done by `_"block name"`
with arbitrary JavaScript being executed with `_&#96;code&#96;`.  Links can be
used to to give directives, such as to save a file or create a compile
command. And that's largely it. 

With this structure, one can create arbitrary paths through the code. You can
split a single compiled file over multiple literate program documents or
compile one document into many different files of various types.  You
can manage a whole project from a single literate program document. You can
use it as a preprocessor, linter, validator, postprocessor, minifier, pusher,
whatever you want. 

It has an extensible plugin system which allows you to add in functionality.
Enjoy!

This document creates the core js file that yields the function that compiles.
It takes in a document, options  and returns an object with all the blocks,
compiled blocks, etc.  The function itself has constructors attached to it to
make custom instances. You can also override many of its methods.

[literate-programming](# "version:0.8.0-pre")

## Goals for v0.8

1. Truly asynchronous processing. So it is easy to fetch from the web, use an
   external program, etc.  In particular, loading from github should be made
   very easy.
2. Better markdown parsing to allow for code fences. Mainly for syntax and
   convenience. 
3. Better parsing/executing of commands to allow for pulling in other blocks
   into the commands as arguments. Also facilitating code in the commands as
   well. 
4. Easy plugin system. Other than the weaving and subsituting, most commands
   should be in a plug-in, with the ones I think are very much needed being in
   a standard-plug-in setup.

## Path to

create tracer bullets -- load document, marked parse, send it through simple
command parser,  stitch together, output compiled. 

## Files 

* [index.js](#basic-structure "save: | jshint") This is the main file that
  does the compiling. 
* [test/test.js](#tests "save: |jshint") This is a start of a test protocol
  for this version. 
* [package.json](#npm-package "save: json  | jshint") The requisite package
  file for a npm project. 
* [LICENSE](#license-mit "save: | clean raw") The MIT license as I think that
  is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")

## Complete Syntax

This uses marked to compile the markdown with a default setting of [GitHub
Flavored Markdown](https://help.github.com/articles/github-flavored-markdown).
So if it thinks something is, for example, a heading, then it is.

While this does not use a lot of markdown syntax (most of it is for formatting
for reading the program), it is useful to have a clear markdown parser that
should interpret everything the same way as GitHub where these documents are
likely to be hosted.

### Stitching Syntax

This covers the syntax which is about sewing together chunks of code. 

* All headers create a new block, called a block. There is a default block
  called _default. Style is irrelevant. 
* Lower levels (more hashes) will create a nested structure. One can then
  create parental hierarchies. If two headings have the same name, then the
  highest level becomes the global refrence. If two headings tie for that
  honor, then the first one becomes the global standard bearer. You shouldn't
  rely on that. You should only use repeat headers (such as doc) when it will
  be clear from the parent-child relation which one you want.
* Links at the beginning of a line also signal the start of a block. It is
  only visible by parent-child relation. It can use the title attribute for
  compiling instructions. This should be really only for short snippets. Its
  level will be 1/2 level lower than its parent. 
* Parent-child relation is a series of colons. If the lead character is a
  colon, then it looks for a descendant of the parent for matching. If
  multiple names match, the highest level matches (first one wins if multiple
  of that).  There are also some wildcharacter matches, such as `*` matching
  all (yielding a list) or `?` which yields the first match. External
  documents are considered one big block and the given name when loading (or
  its own header) will give parent-child relation. The file separator from
  path, `/` or `\` will indicate a direct child rather than a general
  descendant. A direct child is a descendant whose level is within one of the
  parent. 
* Code blocks are the pieces that get sewn together. They are associated with
  a particular block. Code blocks within the same block level get sewn
  together in the order of appearance. 
* All other markdown syntax is ignored except for any inline texts that trigger
  something (links). 
* The only inline text that triggers behavior is a link. These are the
  directives. 

Inside a code block, you can substitute `_"block"` or `_"block:subblock"`,
etc. This will then replace the whole underscore quote stuff with the
appropriate block. If the called for block does not exist at all, then it is left
untouched. If the block exists but has no code, then the quoted region is
replaced with the empty string.



### Conversion Syntax.

As we sew together the code, we can run code on the code. This may be
something simple like a transformation (markdown to html), a linter (jshint),
substitutions, eval'ing some code, etc.

To work this awesome magic, we have commands and directives. When subbing a
block, we can add in pipes followed `command[arg1, ...]`  The square brackets
are optional

It has the format `[name](#link "directive: ...")`. Depending on the
directive, the link or name may be used. Also after the colon, what is
relevant depends on the directive, but it will be parsed as
`:arg1,arg2,..|command(args) | command(args) | ...`  Commands should be
javascript variable names while args will be either treated as text or they
could be JavaScript 


## New vision

All headings and switch links create a block. This block has its level (an
extra half level for
a switch link), a parent, and the code. No more hblock vs. cblock. The blocks will
have two potential ways to be accessed: directly from the global level (if no
conflicting block names occur) and via parent-child relationships. 

Maybe a single colon will be direct descendant while two colons indicate general descendant. 

## Another start in this

So this is another attempt at flushing out the new way. So fundamentally, the
return object should be able to compile more bits of text. 

`.append` could add text to the current document and recompile
`.add` could add a new structure to compile with some way of referencing the
rest. 
`.run` can run the compile structure. 
`.compiled` could list the compiled blocks
`.gcd` is the event-when object and one add listeners, etc., to it. 

Events. 
"text received" -> "parse text"

as each block is parsed, attach once an emit function that emits
"block parsed:path" with data of the block object
The path is the path of the block in the document starting with the root: 
root#/heading/subheading..../# where the last numbering only occurs if there
are multiple paths that are the same --- avoid that.

This should be exceuted on "document parsed:#"
the root is the root of all the paths from this document. it is just the order
number of the document being attached to the document. 

Reacting to "block parsed" should be the "compile block" action. This will
take in the block data and try to compile it. When done, it emits "block
compiled:p path".  If it needs to wait for a block q, it creates a .when that
will track "block compiled:q path" where the q path is expanded into an
absolute reference based on the path syntax; it should be first checked if the
q path is already compiled (if so, just use it). It does this for all blocks
that it needs to wait for. The .when emits a "needed blocks compiled:path"
which is then repsponded to by doing the subsitution. If there are commands,
then we queue up the commands on another .when that will emit "commnds
done:path" The commands are executed by emitting "command:namecommand:path:p#"
with the data of the block and action would be "executing [commandname]". Note
that the number part is used to distinguish multiple paths. This is needed for
the listener? .when would track faithfully anyway. Each successive command
will listen for a "command done:name:path:p#"

Note that the data in the .when should be all we need to make the
substitutions at the end of the commands. Need to see how to link the
replacement place with the vlaue. 

Can do something similar with the eval stuff. Probably same .when as the
commands. 

Maybe simplify further and think of the compiling of the blocks as just a
command. Want to support blocks in command arguments...

As each block is parsed, "block compiled:path" is added to a .when that will
fire "doc compiled:#". 

doc.blocks is a function that will parse the path language to grab any desired
blocks. 

Need to also be very clear about how to override retrieval methods for other
documents. Probably actions named "retrieve file", "retrieve webpage", "run
script" ... is
there something else? Also the "evaluate code" should be an action that can be
overwritten for security. And perhaps all of that should be by default and
activated with an option, say running the function .trust() vs. .secure(). In
the secure version, it would output as log all eval statements. retrieving
files and webpages should be relatively safe as long as nothing is being
executed. Those methods need to be overwritten due to different environments
(browser vs node). 

Each block consists of the raw code, the compiled block (if done),
dependents(?), and the sublist of blocks. The sublist consists of the full
relative path as well as the block name with repeats being sorted by level
followed by first in being used. 


## Simple example

This will be a simple use case examplei

[emit based]()

    var litpro = require("../index.js");

    var doc = litpro(),
        gcd = doc.gcd;

    gcd.makeLog();

    gcd.on("doc compiled", function (data, evObj) {
        console.log(doc.blocks("another block"));
    });

    gcd.emit("add doc", "# example \n some stuff \n\n    code\n\n"+
        '## another block\n\n more stuff\n\n    _"example"');

    process.on("exit", function () {
        gcd.logs();
    });

[callback based]()

    var litpro = require("../index.js");

    var doc = litpro("# example \n some stuff \n\n    code\n\n"+
        '## another block\n\n more stuff\n\n    _"example"', function () {
            console.log(doc.blocks("another block"));
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
            gcd = doc.gcd = new EventWhen();

        gcd.doc = doc;

        _":check types"

        _"event setup"

        if (options !== null) {
            gcd.emit("options received", options);
        }

        if (md !== null) {
            gcd.emit("add doc", [md, callback]);
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

### Event Setup

Here we setup the event-action flow as well as scopes

It starts with a new doc being added. We use the scope docs to store a new doc
and its structures. Once added, then it needs to be parsed. We use the scope
marked for marked options that might need to be passed into marked. Otherwise,
we parse it using marked. 

Marked parses purely sequentially, no eventing. It builds the basic blocks and
path structure. Just quicker that way and saner. It loads up emit
announcements for compile time, to be emitted by "compile doc" in response to
doc parsed:# where # denotes the docs location.

Each compile time event calls compile block. 

    function () {
        var events, event, scopes, scope;

        events = {
            "new:docs" : "add doc",
            "doc text:marked" : "parse doc",
            "doc parsed" : "compile doc",
            "compile time" : "compile block",


        };

        for (event in events) {
            gcd.on(event, events[event]);
        }

        scopes = {
            "marked" : {},
            "docs" : [],

    }


### Initialization

We want to set the instance properties here. This includes merging in the options as well as storing the text and options. Our 


    function (md, options) {
        var doc = this,
            gcd = doc.gcd,
            key;

        doc.md = md;
        doc.options = options;

        _"options"


The compile phase is about filling out hblocks[heading] with subhblocks and their cblocks. 

Some paths:  `_"head"` goes to `hblocks[head]._default` and `_"head:sub"` goes to `hblocks[head].sub`.

When a code block is found, then an hblock is created with the current heading and current subheading. If they already exist, they are used, of course. If there is no explicit heading (initial chunk) or no explicit subheading (after each heading), then the key is the empty string, naturally. Yes, this works. 

        doc.hblocks = {
        };

        doc.current = {
            heading : "",
            subheading : ""
        };

        _"event setup"
    }

### Prototype

This is where we load up all the common methods that will be acting on doc and friends. 

marked will be invoked with `(text, markedOptions)`.

    marked : marked,
    markedOptions : {},
    commandParser : _"command parser"




#### Done calls callback

The callback could be a function (standard expectation) or it could be an
event-when object. In that case, we will use the provided event object for all
events and assume the event "doc finished" event has some action attached. 

The doneTrack object is available to add to if/when more documents are to be
parsed. When each one finishes, they can emit "doc parsed". 

    doc.gcd = gcd = new EventWhen(); 
    doc.docTracker = gcd.when("doc ready", function () {
        callback(null, doc);
    });
    gcd.on("error", function (err) {
        callback(err, doc);
    });

### Event setup

We go through the events and add them to gcd. We have in options moreEvents and lessEvents as possibilities 

### Options

This is where the options behaviors are located

    _":merge"

[merge]()

 Done calls callback of options will get directly merged into the doc object.
 The instance properties of hblocks, etc., will overwrite this, but the merge
 can overwrite all of the prototype properties, of course.

    if (options.merge) {
        for (key in options.merge) {
            doc[key] = options[key];
        }
    }


[events]()

The events

[f]()

This is a function that takes in the doc and can do anything to it. Hopefully never needed.

    if (typeof options.f === "function") {
        f(doc, options);
    }



## Non-Backwards Compatibility Break

There are a few things that I am throwing out of literate programming. Some of it is because of syntax issues, some of it is because of underused/confusing stuff. 

* No parentheses around arguments in commands. This is because of a conflict with the link syntax of parentheses triggering behaviors. Basically `")` or `](` will cause issues. The best is to not use parentheses. So square brackets are used throughout for consistency. This will be an unpleasant conversion. Hence the parentheses syntax will be supported for legacy reasons only. Also, it works without issues in block substitutions. Just the link syntax is a dodgy use case though even that is fine if you stay away from all quotes.  
* Using blocks as arguments is allowed! 
* Macros are dropped. Instead the block eval can be used. 
* Switch syntax is `[cname](#whatever "command[arg1, ...] | ...")` There is no name or extension before the first command. If you want an extension, use gfm's codefences. 
* There is no multiple runs through a block `[](# "MD| 1 marked ")` and `__whatever`.  Now everything is run through just once in its initial compile phase. For other manipulations, use the commands. For example, `[](# "marked | sub[BOGUS, _"whatever"] ")` with BOGUS being something in the text. 
* The total text is no longer tracked. Only code blocks produce output. Thus, no raw commands. This is a good thing as the raw stuff was a little awkward. But it did enable self-documentation of literate-programming. So instead we will use `<pre>` tags. Any pre tag block will be added to the code blocks array of an hblock but with no processing of the code. It will just be straight as it is. HTML within the pre tag may be processed as such on GitHub while being in the raw output of this. So I suggest avoing it. You can use code fences if you like to write whatever HTML. 

New stuff: 

* `_"name:* | ..."` will run each subhblock through the set of pipes and then concatenate them in the order of writing and that will be the output.
* `_"*:name"` is not new, but a late edition of the previous setup. This is used for boilerplate stuff, say in section boiler. Then if we use a block `_"h:*boiler"`, we plugin h in for `*` in the boiler block when compiling. Kind of. If there is a `"*:"` not matched, then it remains, which can be used for another boilerplate. 
* `_"h:s[arr syntax]` would be for viewing the separate codeblocks in the (sub)hblock as a set of array elements. The syntax `+` will concatenate them with `..` being the full step. Examples:   `[2+5]` yields a single block consisting of the second and fifth, `[2..5+7]` yields a concatenation of 2, 3, 4, and 5. How is this useful? Maybe you have a function with some initialization code, some debugging code, and then the actual function. You could arrange it as actual, intialization, debugging and then in development you do `[2+3+1]` while in production you do `[2+1]`. If you want access to the array itself, this can be accessed in the commands under cblock.arr ??
* Commands should have access to the hblock name and subhblock name as well as the array of codeblocks, the concatenated one, and the raw text. 
* Maybe some command such as `scan[doc]` that can gather all sections of the document that have a subheading of doc. This could be in order with heading as well. Maybe it makes more sense to replace the boilerplate `*` with `?` indicating a single name. And then `*+:doc` could be to scan through the headings looking for those with doc sections. The `+` says to concatenate. Without the `+`, it would send on an array to the pipes, similar to the array syntax. 

## Directive Thoughts

* Having version default to using the first block title. This allows using the directive without the link appearing. 

## Random thoughts

* Add ability to read from standard input. Should be real easy. This allows
  one to execute buffer in vim. 

## Tests

This is a start for tests. 

    var litpro = require('./index.js');

    var log = function (err, doc) {
        if (err) {
            console.log("error", err);
            return false;
        }
        var keys = Object.keys(doc);
        keys = keys.filter(function (el) {
            if (["gcd", "docTracker"].indexOf(el) !== -1) {
                return false;
            } else {
                return true;
            }
        });
        keys.forEach(function(key) {
            console.log(key, ":", doc[key]);
        });
    };


    litpro("#hi", log);


## NPM package

The requisite npm package file. 

[](# "json") 

    {
      "name": "DOCNAME",
      "description": "A literate programming compile script. Write your program in markdown.",
      "version": "DOCVERSION",
      "homepage": "https://github.com/jostylr/literate-programming",
      "author": {
        "name": "James Taylor",
        "email": "jostylr@gmail.com"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/jostylr/literate-programming.git"
      },
      "bugs": {
        "url": "https://github.com/jostylr/literate-programming/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT"
        }
      ],
      "main": "lib/literate-programming.js",
      "engines": {
        "node": ">0.10"
      },
      "dependencies":{
          "marked": "^0.3.2",
          "event-when": "^0.6.0"
      },
      "devDependencies" : {
      },
      "scripts" : { 
        "test" : "node ./test/test.js"
      },
      "keywords": ["literate programming"],
      "bin": {
        "literate-programming" : "bin/literate-programming.js"
      }
    }

## gitignore

    node_modules
    temp

## npmignore


    test
    travis.yml
    examples
    ghpages
    fixed_examples
    node_modules
    trouble
    *.md


## Travis

A travis.yml file for continuous test integration!

    language: node_js
    node_js:
      - "0.10"



## LICENSE MIT


The MIT License (MIT)
Copyright (c) 2013 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

