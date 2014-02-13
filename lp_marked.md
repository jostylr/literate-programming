# Literate Programming

Literate programming is the idea that we should write code to be read and understood by others. The idea is to take the reader on the thought process of the author. This can be hard, but it can also be very useful. 

This project uses markdown to write up the document. Code blocks are what gets compiled; code spans are not used. Headings demarcate blocks, but lone links can create subdivisions within that. Substitutions are done by `_"block name"` with arbitrary JavaScript being executed with `_&#96;code&#96;`.  Links can be used to to give directives, such as to save a file. And that's largely it. 

With this structure, one can create arbitrary paths through the code. You can split a single compiled file over multiple literate program documents or place multiple compiled files into a single document. You can manage a whole project from a single literate program document. You can use it as a preprocessor, linter, validator, postprocessor, minifier, pusher, whatever you want. 

It has an extensible plugin system which allows you to add in functionality. Enjoy!

This document creates the core js file that yields the function that compiles. It takes in a document, options  and returns an object with all the blocks, compiled blocks, etc.  The function itself has constructors attached to it to make custom instances. You can also override many of its methods. 

## Files 

* [v8/index.js](#basic-structure "save: | jshint") This is the main file that does the compiling. 
* [v8/test.js](#tests "save: |jshint") This is a start of a test protocol for this version. 

## Complete Syntax

This uses marked to compile the markdown with a default setting of [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown). So if it thinks something is, for example, a heading, then it is.

### Stitching Syntax

This covers the syntax which is about sewing together chunks of code. 

* All headers create a new block, called an hblock. There is a default hblock called _default. Levels are irrelevant. Style is irrelevant. Links will have their text attribute used (possibly combined with the surrounding text). 
* Code blocks are the pieces that get sewn together. They are associated with a particular hblock (or subhblock). Code blocks within the same (sub)hblock level get sewn together in the order of appearance. 
* A paragraph with a single link and nothing else triggers a new subhblock. This is like an hblock except it can only be accessed with hblock:subhblock (put their respective names there). That is, it is a form of namespacing.
* All other blocks are ignored except for any inline texts that trigger something (links). 
* The only inline text that triggers behavior is a link. These are the directives. 

Inside a code block, you can substituet in a cblock by using the syntax `_"hblock"` or `_"hblock:subhblock"`. This will then replace the whole underscore quote stuff with the appropriate block. If the block does not exist at all, then it is left untouched. If the block exists but has no code, then the quoted region is replaced with the empty string. 

### Conversion Syntax.

As we sew together the code, we can run code on the code. This may be something simple like a transformation (marked to html), a linter (jshint), substitutions, eval'ing some code, etc.

To work this awesome magic, we have commands and directives. When subbing a block, we can add in pipes followed `command[arg1, ...]`  The square brackets are optional

It has the format `[name](#link "directive: ...")`. Depending on the directive, the link or name may be used. Also after the colon, what is relevant depends on the directive, but it will be parsed as `:arg1,arg2,..|command(args) | command(args) | ...`  Commands should be javascript variable names while args will be either treated as text or they could be JavaScript 


## Basic structure

Our export is a doc "constructor". It is in quotes since it is not actually a constructor in the sense of `new`, but what it does is to create a compiled document with all the blocks compiled and sewn together. 

Its arguments are the text to compile, options in constructing the compilation functions, and a callback to ring back when all done. This is all asynchronous which implies that the return value is useless. The callback should expect the doc as the second argument; the first is, by node convention, any error object that is generated. 

The options argument is an object. Its `merge` key object will be merged with a "prototyped" object that is attached to the doc object. The options object will get passed on in prototype form for any other documents that are being compiled. It may have other features; see [options](#options).

We also will require the following modules: marked, fs, event-when. The object gcd is the event dispatcher.

    var marked = require('marked');
    var fs = require('fs');
    var EventWhen = require('event-when');

    var proto = {
        _"prototype",
        init : _"initialization"
    };


    var litpro = function (md, options, callback) {
        var doc = Object.create(proto),
            gcd = doc.gcd = new EventWhen();

        _":check types"

        _":done event setup"

        doc.init(md, options);

        gcd.emit("initialized", doc);

        // just for testing
        gcd.emit("doc ready");

        return false;
    };


    module.exports = litpro;

[done event setup]()

The callback could be a function (standard expectation) or it could be an event-when object. In that case, we will use the provided event object for all events and assume the event "doc finished" event has some action attached. 

The doneTrack object is available to add to if/when more documents are to be parsed. When each one finishes, they can emit "doc parsed". 

    doc.gcd = gcd = new EventWhen(); 
    doc.docTracker = gcd.when("doc ready", function () {
        callback(null, doc);
    });
    gcd.on("error", function (err) {
        callback(err, doc);
    });

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
            default : 
                if (el) {
                    options = callback;
                }   
        }
    });
    if (!callback) {
        return "provide a callback function or event";
    }
    if (!options) {
        options = {};
    }
    if (!md) {
        md = "";
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
    markedOptions : {}

### Event setup

We go through the events and add them to gcd. We have in options moreEvents and lessEvents as possibilities 

### Options

This is where the options behaviors are located

    _":merge"

[merge]()

Any keys in the merge object of options will get directly merged into the doc object. The instance properties of hblocks, etc., will overwrite this, but the merge can overwrite all of the prototype properties, of course.

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
* Multiple headings no longer create separate hblocks. They add on to what is there. Also subheading switches can be switched back and forth. 
* The total text is no longer tracked. Only code blocks produce output. Thus, no raw commands. This is a good thing as the raw stuff was a little awkward. But it did enable self-documentation of literate-programming. So instead we will use `<pre>` tags. Any pre tag block will be added to the code blocks array of an hblock but with no processing of the code. It will just be straight as it is. HTML within the pre tag may be processed as such on GitHub while being in the raw output of this. So I suggest avoing it. You can use code fences if you like to write whatever HTML. 

New stuff: 

* `_"name:* | ..."` will run each subhblock through the set of pipes and then concatenate them in the order of writing and that will be the output.
* `_"*:name"` is not new, but a late edition of the previous setup. This is used for boilerplate stuff, say in section boiler. Then if we use a block `_"h:*boiler"`, we plugin h in for `*` in the boiler block when compiling. Kind of. If there is a `"*:"` not matched, then it remains, which can be used for another boilerplate. 
* `_"h:s[arr syntax]` would be for viewing the separate codeblocks in the (sub)hblock as a set of array elements. The syntax `+` will concatenate them with `..` being the full step. Examples:   `[2+5]` yields a single block consisting of the second and fifth, `[2..5+7]` yields a concatenation of 2, 3, 4, and 5. How is this useful? Maybe you have a function with some initialization code, some debugging code, and then the actual function. You could arrange it as actual, intialization, debugging and then in development you do `[2+3+1]` while in production you do `[2+1]`. If you want access to the array itself, this can be accessed in the commands under cblock.arr ??
* Commands should have access to the hblock name and subhblock name as well as the array of codeblocks, the concatenated one, and the raw text. 




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