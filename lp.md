# [literate-programming](# "version:0.7.4")

"This is like writing spaghetti code then shredding the code into little pieces, throwing those pieces into a blender, and finally painting the paste onto an essay. Tasty!"

This file creates the literate program parser using the literate program parser (requires v 0.7+ to compile).  

A literate program is a series of chunks of explanatory text and code blocks that get woven together. The compilation of a literate program can grunt, after a fashion, as it weaves. 

Note that this is version 0.7 branch. It introduces a variety of changes, but it also marks the deprecation of CAPS directives/switch types. A future version will remove them but allow them to be used as a plugin.

## Directory structure

* [lib/literate-programming.js](#the-lp-module "save:   | jshint | jstidy") The bulk of the work is in the node module. That has all the core weaving. It also hasthe ability to load other literate programs / directives which ties it currently to the file system. 
* [bin/literate-programming.js](#cli "save: | jshint") The literate program compiler is activated by a command line program.
* [README.md](#readme "save:| clean raw") The standard README.
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save: | clean raw") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitgnore](#gitignore "save: ")


## How to write a literate program

Use markdown. Each heading is a new heading block (hblock) and can be referenced by using `_"title"`. This substitution has more features, documented below. 

Within each hBlock, one can write free form markdown explanatory text, directives, code lines, or initiate a new code block (cblock). 

* hblock is initiated by number signs at the beginning of a line. seText style works too. See [markdown syntax](#http://daringfireball.net/projects/markdown/syntax).
* Directive is initiated by a markdown link syntax with "dir:..." as part of the title. 
* A new cblock is initiated with a non-directive link at the beginning of a line.
* cblock lines are recognized by 4 spaces (not tabs). 

To reference a cblock, the full precise name, a cblock name, is  "litprodoc :: hblock : cblock.ext"  where all but hblock is optional. Also hblock.ext grabs the unnamed extension relevant to it. 

To use a cblock, use the substitution command  _"cblock name | commands ..."  where commands can do stuff on the code text and each pipes into the next. 

Examples:  _"Great:jack|marked",  _"Great:.md" or "Great.md",  _"Great|marked", _"Great:jack.md",  ":jack"  will load the internal block named jack

The save directive is used to save a file:

    [file.ext](#heading-name "save: cblock | commands")

If the heading name is missing, it uses the current cblock.

### Advice

1. Setup an hblock as a body of code, such as a function. Use the subcblocks to break that body into manageable chunks. Use new hblocks for new functions or for very important behavior. 
2. Write function blocks without ending (semicolon, comma) punctuation so that they can be inserted in multiple ways. Put the punctuation after the substitution quote. 
3. Use this for getting a good overview of flow control. Strip out the complicated, but easily identifiable chunks and focus on how the code flows. 

### Runnable Code

You can run JavaScript code while compiling in at least two ways. One is by  _&#96;some code&#96; on a single line. The other way is to have a cblock and reference it with a pipe command that evals it, such as the `eval` command

The eval output (last evaluated value) is what is placed in the code to replace the backtick call.


### Multi-level substitutions

There may be need to run substitutions after a first pass or more. For example, markdown segments could have snippets that need to be inserted after the markdown parser has run. See [logs.md](#https://github.com/jostylr/literate-programming/blob/master/examples/logs.md) for an example. 


## The lp module

This module takes in a literate program as a string of markdown and an options object. 

It takes the string and makes a document that has the markdown parsed out into various compiled blocks. 

1. The parsing is down line-by-line. lineparser parses each line, adding the lines to each relevant block or creating new blocks or even retrieving/compiling other literate programs. 
2. After all literate programs have been loaded and parsed, then the compile phase starts. This is asynchronous and all the cblocks are compiled into the cblock property compiled. If a block is compiled, it has isCompiled set to true. 
3. postCompile will send those compiled blocks into files as directed by the directives. 


[](# "js")

    /*global require, module, process*/
    /*jslint evil:true*/

    var fs = require('fs');
    var http = require('http');


    _"Utilities"


    var HBlock, Doc, repo = {plugins : {}, litpro :{} }; 



    _"Document constructor"

    _"HBlock constructor"

    module.exports.Doc = Doc;


The repo value is a repository for files that are loaded up, both literate programs and plugins. The same repo will be seen in all instances of Doc; this prevents multiple uploading and parsing of the same file. I see no reason for not having it globally accessible. 



## Document parsing

Each literate program gets its own document container. It starts off life with lineparser. 

Each line is of one of the following basic types:

1. Code line. This is a line indented with (possibly tabs followed by) 4 spaces. Stored in current cblock.
1. Header. This signifies the start of a new hblock and a new cblock. If it has a link in it, it will also see the directive link parser.
1. DEPRECATED Directive/Type switch. If a line starts with all caps or a ., then it has the potential to be a directive (such as FILE command)  or to create/switch the code block to a new type or name. What happens is very dependent on what is found there. The directive/switch can also be in a line syntax. It should be at the start of a line.  
1. Directive link syntax. 
1. Switch type link syntax.
1. Plain text. This just is for reading and gets put into a plain text block without it being useful, presumably.

All lines in a block do get put into storage. This allows for an hblock to be used in a raw output form.

### Parse lines

This is the function that takes in a literate program, splits it into lines, and parses them, returning a structure for compilation. 

The Document consists mostly of blocks constructed by the Hblock constructor. The doc.processors is where the magic happens. 

This is largely synchronous. The directives can create hooks that prevent the compiling stage from beginning. The main cause of this is the load directive. Those files will be loaded asynchronously and will register themselves as loading and prevent compilation until they are loaded. 

Because the require directive adds in functionality that might be used in the parsing phase, it is synchronous and will block until it is fully loaded. 


[](# "js")

    function () {
        var doc = this;
        var i, nn, original; 

        var lines = doc.litpro.split("\n");
        var n = lines.length;
        for (i = 0; i < n; i += 1) {
            doc.currentLine = original = lines[i];
            nn = doc.processors.length;
            for (var ii = 0; ii < nn; ii += 1) {
                if (doc.processors[ii](doc.currentLine, doc, original)) {
                    break;
                }
            }
            doc.hcur.full.push(original);
        }

        _"Head parser:Deal with old hblock"

        _":Check for compile time"

        return doc;
    }

Each processor, corresponding to the types mentioned above, will check to see if the line matches its type. If so, they do their default action, return true, the line is stored in the full block for posterity, and the other processors are skipped. The exception dre directive links that modify the line and allow further processing.

[Check for compile time](# "js")

Is it ready to be compiled yet? Mainly this will be waiting for load directives to finish.

    if (Object.keys( doc.loading ).length === 0) {
       doc.compile();
    }

### Default processors

The processors array, a property of the Document, is a sequence of parsers. They should return true if processing is done for the line. The argument is always the current line and the doc structure. 

You can mutate the processors array to have different behavior (presumably a directive). You can use document.defaultProcessors to get the original array. 

`Directives parser caps` will be removed in the future.

[](# "js")

    [ 
    _"Code parser",
    _"Directives parser link", 
    _"Head parser", 
    _"Directives parser caps", 
    _"Switch parser link",
    _"Plain parser" 
    ]



### Code parser


We look for 4 spaces of indentation. If so, it is code and we store it in the current block's code block for the current type. 

Note that tabs do not trigger a code block. This allows for the use of tabs for multiple paragraphs in a list. Any sequence of leading tabs followed by 4 spaces will trigger a code block. 

This also means that if one wants a code block that is not to be compiled, you can use tabs as long as it is not followed by 4 spaces. 

[](# "js")

    function (line, doc) {
      var hcur = doc.hcur;
      var reg = /^\t* {4}(.*)$/;
      var match = reg.exec(line);
      if (match) {
        hcur.cblocks[hcur.cname].lines.push(match[1]);
        doc.lastLineType = "code";
        return true;

      } else if (line.match(/^\s*$/)  ) {

        _":Add empty line"

        return false; // so that it can be added to the plain parser as well
        
      } else {
        return false;
      }
    }


Added the following clause to add empty lines to the code. Stuff before and after the code block is probably trimmed, but in between extra lines could be added. This was to enable blank lines being there which is important for markdown and other markup languages. 

[Add empty line](# "js")  

    var carr = hcur.cblocks[hcur.cname];
    if (carr && carr.lines.length > 0 && carr.lines[carr.lines.length -1 ] !== "") {
        hcur.cblocks[hcur.cname].lines.push(line);
    }


### Directives parser link

A directive can appear anywhere. This is a markdown link text that matches `[name](link "dire: options")`

where dire should be replaced with a valid directive. If you have a link title text with a colon, but the presumed directive does not match, then it is ignored except for a warning. The warning will be emitted if verbose is set. 

Double quotes need to be used for the title directive text. Single quotes can be used freely as far as lit pro is concerned. 

The function takes in a line and the doc structure. It either returns true if a successful directive match/execution occurs or it returns false. The directives object is an object of functions whose keys are the directive names and whose arguments are the rest of the line (if anything) and the doc object that contains the processors and current block structure. 

Directives may appear multiple times on a line (not recommended) and it may be on lines that have different roles. If a directive is matched, then the name is substituted in for the link. A leading backtick in front of the link syntax will prevent a match from occurring. 

This function always returns false so that further processing can occur. 

[](# "js")

    function (line, doc) {
        var reg = /\[([^\]]*)\]\s*\(([^")]*)"([^:"]*)\:(.*)"\s*\)/g;
        doc.currentLine = line.replace(reg, _":match function");
        return false;
    }

[match function](# "js")

First check whether a backtick is present. After prepping, check to see if there is a matching directive. 

        function (match, name, link, dir, options, offset, str) {
            if (str[offset-1] === "`") {
                return match; 
            }
            name = (name || "").trim();
            link = (link || "").toLowerCase().trim();
            dir = (dir || "").toLowerCase().trim();
            options = (options || "").toLowerCase().split("|").trim();
            if (doc.directives.hasOwnProperty(dir) ) {
                doc.directives[dir].call(doc, options, name, link);
                doc.lastLineType = "directive";
                return name;
            } else {
                doc.log("Directive link with no known directive:" + line, 1);
                return match;
            }
        }


### Head parser

We recognize a heading by the start of a line having '#'. We ignore any '#' found at the end of the line (this is the replace at the end of heading). 

We will also recognize a seText underline heading by the combination of a line consisting of only '=' or '-' that is preceded by a line of type plain text.

For new global blocks, we use the heading string as the block name. We lower case the whole name to avoid capitalization issues (it was really annoying!)

[](# "js")

    function (line, doc) {
      var hcur, heading;
      var head = /^(\#+)\s*(.+)$/;
      var match = head.exec(line);
      var setext = /^(=+|-+)\s*$/;
      var matchse = setext.exec(line);
      if (match) {
        heading = match[2].trim().toLowerCase().replace(/(\#+)$/, '').trim();
      } else if (matchse ) {
        if (doc.lastLineType === "text") {
            heading = doc.hcur.plain.pop().trim().toLowerCase();
        }
      }
      if (heading) {

        _":Deal with old hblock"

        hcur = new HBlock();
        hcur.cname = doc.type;    
        hcur.cblocks[hcur.cname] = doc.makeCode(cname);

                
        _":repeated heading block"
        hcur.heading = heading;
        doc.hblocks[heading] = hcur; 
        doc.hcur = hcur; 
        
        doc.lastLineType = "heading";
      } 
      return false;
    }


[Repeated heading block](# "js") 

If a heading block is repeated, then we increment it to make it different; this is the style used by github for markdown documents. One should not have repeated blocks, but if one wants to, then...


    var count;
    if (doc.hblocks.hasOwnProperty(heading) ) {
        count = 1;
        while (doc.hblocks.hasOwnProperty(heading+" "+count)) {
            count += 1;
        }
        heading = heading+" "+count;
        doc.log("Repeated; New header: " +heading);
    }


[Deal with old hblock](# "js") 

We need to run any waiting functions on the hblock and cblock. Then we remove empty code blocks. 

    var cname;
    var waiting, f;
    var oldh = doc.hcur; 
    if (oldh) {
        _":run hblock waiting"
        
        var cblock = oldh.cblocks[oldh.cname];
        _"switch type:run cblock waiting"

        _":remove empty cblocks"
    }

[remove empty cblocks](# "js")

This suffered from having empty lines put into the code block. This may be rather inefficient, but empty lines seemed to creep in. So we join them all and if it is just whitespace, then we delete the codeblock. Sorry to all the [whitespace](http://compsoc.dur.ac.uk/whitespace/) languages!

    for (cname in oldh.cblocks) {
        if (oldh.cblocks[cname].lines.join("").match(/^\s*$/) ){
            delete oldh.cblocks[cname];
        }
    }


[run hblock waiting](# "js") 

It is possible via the define directive (and maybe others in the future) to run stuff when the hblock is switched. We look for a waiting array and then call the given functions in the context of the doc. 

    if (oldh.waiting) {
        waiting = oldh.waiting;
        while (waiting.length > 0) {
            f = waiting.pop();
            if (typeof f === "function") {
                f.call(doc);
            } else {
                doc.log("Error. Expected function in waiting list of hblock " + oldh.heading);
            }
        }
    } 


### Directives parser caps

DEPRECATED.  This will be moved into an option to activate. 

A directive will be recognized as, at the start of a line, as all caps and a matching word. This may conflict with some uses, but it seems unlikely since if there is no matching directive, then the original is left untouched. 

A space in front would defeat the regex as well. Periods are also allowed. At least two capital letters are required.

A directive could also be a code block create/switch command. This is either a recognized type or it should start with a period. 

The function takes in a line and the doc structure. It either returns true if a successful directive match/execution occurs or it returns false. The directives object is an object of functions whose keys are the directive names and whose arguments are the rest of the line (if anything) and the doc object that contains the processors and current block structure. 


[](# "js")

    function (line, doc) {

        _":period triggers match" 

      var reg = /^([A-Z][A-Z\.]*[A-Z])(?:$|\s+(.*)$)/;
      var options, name;
      match = reg.exec(line);
      if (match) {
        doc.log("Syntax deprecated. Rewrite: " + line, 1);
        name = match[1].toLowerCase();
        if (doc.directives.hasOwnProperty(name)) {
            options = (match[2] || "").split("|").trim();
            doc.directives[name].call(doc, options);
            doc.lastLineType = "directive";
            return true;
        } else if (doc.types.hasOwnProperty(name) ){
            doc.switchType(match[1], match[2]);
            doc.lastLineType = "type switch";
            return true;   
        } else {
            return false;
        }
      } else {
        return false;
      }
    }

The starting period for a type change trigger may or may not be followed by capitals. Any . starting a line will be interpreted as a type switch. 


[period triggers match](# "js") 

      var fileext = /^\.([A-Z]*)(?:$|\s+(.*)$)/;
      var match = fileext.exec(line);
      if (match) {
        doc.switchType(match[1], match[2]); 
        return true;
      }



### Switch parser link


A switch to a new code block will be recognized as, at the start of a line, a markdown link syntax: `[cname](whatever "ext | ..."). In the extremely unlikely event that you need to avoid matching, put a space or something at the start of the line if your link must be at the beginning of a line.  As long as a link is at the beginning of the line with nothing else other than spaces, it will cause a switch of the cblock. 

Double quotes need to be used for the title directive text. Single quotes can be used freely within the double quotes as far as lit pro is concerned. 

The function takes in a line and the doc structure. It either returns true if a successful switch  match/execution occurs or it returns false. 

[](# "js")

    function (line, doc) {

      var reg = /^\[([^\]]*)\]\s*\(([^")]*)(?:"([^"].*)")?\s*\)\s*$/;
      var options, name, link, title, type;
      var match = reg.exec(line);
      if (match) {
        name = (match[1] || "").toLowerCase().trim();
        link = (match[2] || "");
        title = (match[3] || "");
        options = title.split("|").trim();
        type = options.shift() || "";
        doc.switchType(name, type, options);
        doc.lastLineType = "type switch";
        return true;   
      } else {
        return false;
      }
    }




### Switch type 

Here is the function for switching the type of code block one is parsing. The syntax is the type (alread parsed and passed in) and then name of the block followed by pipes for the different functions to act on it. Even without a code name, the commands are initiated with a pipe. Examples:  `[for running](# "js  | jshint") ` or  `[](# "JS | jshint")` or  `[](# "| jshint")` or even just `[](#)`

Because of the change to link syntax and how it was coded before, this function has two separate use cases, distinguished by number of arguments.

If a cblock with that name already exists, it will switch to it and then add the lines of code. If not, it creates a new one with that name. 

[main](# "js") 

    function (a, b, c)  {
        var name, type, options;
        var doc = this;
        var hcur = doc.hcur;
        var cname; 

        var cblock, waiting, f; 
        cblock = hcur.cblocks[hcur.cname];
        _":run cblock waiting"

        if (arguments.length === 2) {
            type = a.toLowerCase(); 
            options = (b || "").split("|").trim();
            name = options.shift();
            if (name) {
                cname = name.toLowerCase()+"."+type;
            } else {
                cname = "."+type;
            }
        } else { 
            name = a.toLowerCase();
            type = b.toLowerCase() || doc.type; 
            options = c;
            if (name) {
                cname = name.toLowerCase()+"."+type;
            } else {
                cname = "."+type;
            }


        } 


        hcur.cname = cname;

        if (! hcur.cblocks.hasOwnProperty(cname) ) {
            hcur.cblocks[cname] = doc.makeCode(cname);
        }

        var codearr = hcur.cblocks[cname];

        _":Parse options"

    }


[Parse options](# "js") 

And now we work on getting the options to parse. The syntax is an optional number to indicate when to process (0 for pre, 1+ for during, nothing for post), followed by whatever until parentheses, followed by optional arguments separated by commas. Examples: `0 marked (great, file)` and `marked` and `marked awesome(great)`

        
        var funname, ind, funargs, match, funreg = /^(\d*)\s*([^(]+)(?:\(([^)]*)\))?$/;
        var i, n = options.length, option;
        for (i = 0; i < n; i += 1) {
            option = options[i].trim();
            match = option.match(funreg);
            if (match === null ) {
                doc.log("Failed parsing (" + name +" ): " + option);
                continue;
            }

            funname = match[2].trim();

            if (match[3]) {
                funargs = match[3].split(",").trim();
            } else {
                funargs = [];
            }

            _":Add command"
        }

[Add command](# "js") 

The setup is that the code array has a property named commands which is an associative array of arrays. Each array contains a function and an arguments array that will be used to work on the code (see Full Substition). The doc.commands object has the list of active functions that can be named and used. 

            if (match[1]) {
                ind = parseInt(match[1], 10);
            } else {
                ind = "Infinity";
            }

            if ( doc.commands.hasOwnProperty(funname) ) {
                
                if (codearr.commands.hasOwnProperty(ind) ) {
                    codearr.commands[ind].push([doc.commands[funname], funargs]);
                }  else {
                   codearr.commands[ind] = [[doc.commands[funname], funargs]];
                }             
            }


[run cblock waiting](# "js") 

We need to see if there are any functions hanging around to execute when the cblock switches. 

We use the swtichWaiting identifier instead of waiting as the waiting array is for the functions waiting for compilation -- very important. 

    
    if (cblock && cblock.hasOwnProperty("switchWaiting")) {
        waiting = cblock.switchWaiting;
        while (waiting.length > 0) {
            f = waiting.pop();
            if (typeof f === "function") {
                f.call(doc);
            } else {
                doc.log("Error. Expected function in waiting list of cblock " + cname);
            }
        }
        delete cblock.switchWaiting; 
    } 






### Plain parser

It means there is nothing special about the line. So we simply add it to the plain block because, why not?

[](# "js")
    function (line, doc) {
        doc.hcur.plain.push(line);
        if (line.match(/^\s*$/) ) {
            doc.lastLineType = "empty line";
        } else {
            doc.lastLineType = "text";
        }
      return true;
    }



## Constructors 

We have a few prototypes we use. The main one is the Doc constructor which is what a literate programming string gets turned into. 

We also create an Hblock object for each section of a literate program. Within that block, we have code blocks created which are objects with a lines array and a few other properties. See [Make Code](#make-code). 

The most important part to understand of the structure is that doc.hblocks is an object with the heading names pointing to the relevant hblock. And that each hblock has a cblocks property with the various code blocks. And those code blocks carry the lines as well as information about being compiled. 

### Document constructor

The first Hblock is stored under the name firstHblock. It contains whatever happens before the first heading. 

We attach a lot of functionality to a doc via the prototype. 

[](# "js")

    Doc = function (md, options) {

        this.litpro = md; 
        this.hblocks = {};
        this.hcur = this.hblocks.firstHblock = new HBlock();
        this.actions = {};
        this.logarr = [];
        this.subtimes = 0;
        this.type = "";



        _":Async structures"

        this.types = _":Types"; 

        this.directives = _"Directives";

        this.commander = _"Doc commander";
        this.commands = _"Core doc commands";

        this.macros = {};

        this.repo = repo; // defined in module scope; 

        this.processors = [].concat(this.defaultProcessors);
      

        _":Merge in options"


        this.addPlugins(this.standardPlugins);
        this.addPlugins(this.plugins);
        this.parseLines();  // which then initiates .compile().process().end(); 



        return this;
    };

    Doc.prototype.defaultIndent = "    ";

    Doc.prototype.oneSub = _"One cycle of substitution:main";
    Doc.prototype.oneSub.callback = true; 

    Doc.prototype.fullSub = _"The full substitution";

    Doc.prototype.defaultProcessors = _"Default processors";

    Doc.prototype.switchType = _"Switch type:main";

    Doc.prototype.makeCode = _"Make code block";

    Doc.prototype.trimCode = [function (code) {
        return code.trim();
    }, []];

    Doc.prototype.log = function (text, flag) {this.logarr.push([text, flag]);};
    Doc.prototype.logpop = function () {return this.logarr.pop();};

    Doc.prototype.parseLines = _"Parse lines";

    Doc.prototype.getcblock = _"Get correct code block:main.js";
    
    Doc.prototype.compile = _"Compile time";
    
    Doc.prototype.addConstants = _":Make constants";

    Doc.prototype.wrapVal = _":Wrap values in function";

    Doc.prototype.piping = _"Pipe processor";

    Doc.prototype.addMacros = _":merge | substitute(OBJTYPE, macros)";

    Doc.prototype.addCommands = _":merge | substitute(OBJTYPE, commands)";

    Doc.prototype.addTypes = _":merge | substitute(OBJTYPE,types)";

    Doc.prototype.addDirectives = _":merge | substitute(OBJTYPE,directives)";

    Doc.prototype.addPlugins = _":add in plugins";

    Doc.prototype.processActions = _"Process actions";

[Merge in options](# "js") 

In order to have more custom behavior, such as linking in behavior for visual editing, we want to be able to pass in options to the functions. 

We have just created the doc object. Now we take it and merge it in with the options object. 

    if (options) {
        var key;
        for (key in options) {
            this[key] = options[key];
        }
    }

[Types](# "js") 

We use file extensions as keys and we provide the mime type for the kind which may be useful for CodeMirror and the IDE or for serving content directly from a server without files or ???

    {
        "" : "text/plain",
        css: "text/css"
    }    

[Make constants](# "js") 

A constant is a macro. Thus, we wrap each constant in a function that will return the value. The obj is a wrapper so that multiple constants can be defined at once. 

If it is a single argument, then it is an object of key:value. If it is two arguments, then it is key, val.

    function (a,b) {
        var doc = this;
        var name, obj;
        if (arguments.length === 1) {
            var newobj = {};
            obj = a;
            for (name in obj) {
                newobj[name] = doc.wrapVal(obj[name]);
            }
            doc.addMacros(newobj);
        } else if (arguments.length === 2) {
            doc.addMacros(a, doc.wrapVal(b));
        }
    }

[Wrap values in function](# "js") 

    function (val) {
        return function () {
            return val;
        };
    }


[Merge](# "js") 

This handles adding properties to macros, commands, etc.. The value of OBJTYPE needs to be substituted in. 

    function (newobj, value) {
        var doc = this;
        var oldobj = doc.OBJTYPE;
        var name;
        if (arguments.length === 2) {
            name = newobj.toLowerCase().trim();
            if (oldobj.hasOwnProperty(name) ) {
                doc.log("Replacing " + name, 1);
            }
            oldobj[name] = value;
        } else {
            for (name in newobj) {
                name = name.toLowerCase().trim();
                if (oldobj.hasOwnProperty(name) ) {
                    doc.log("Replacing " + name, 1);
                }
                oldobj[name] = newobj[name];
            }
        }
    }

[Add in plugins](# "js") 

This is for loading plugins (lprc, require).

0. If exports has a property called litpro, use that. This is to allow for the modules to serve other uses to. 
1. If exports is a function, run that. 
2. If it is an array, iterate over it and run those functions. 
3. If it is an object, iterate over that and run the functions. 

---

    function (plugobj) {
        var doc = this;
        if (!plugobj) {
            return false;
        }
        if (plugobj.hasOwnProperty("litpro") ) {
            plugobj = plugobj.litpro;
        }

        if (typeof plugobj === "function") {
            plugobj(doc);
            return true;
        }

        var i, n;
        if (Array.isArray(plugobj) ) {
            n = plugobj.length;
            for (i = 0; i < n; i += 1) {
                if (typeof plugobj[i] === "function") {
                    plugobj[i](doc);
                } 
            }
            return true;
        }

        var type; 
        for (type in plugobj) {
            if ( (plugobj.hasOwnProperty(type)) && (typeof plugobj[type] === "function")) {
              plugobj[type](doc); //each one is responsible for modifying
            }
        }
        return true;
    }

[Async structures](# "js") 

We need some storage structures for the async aspect of LOADing and compiling. 

The loading object will keep track of which files are loading and we will delete them when the file is loaded. When all are deleted, then the doc is ready to be compiled. 

        this.loading = {}; // for the LOAD and compile
        this.loaded = {}; // can reference this for external litpro by names. 
        this.waiting = {}; // place to put blocks waiting for compiling


#### Doc commander

This takes in an array of commands to execute on the code. Each element of the array is [function, args, calling object]

If a function is doing a callback (calling out to some external resource or something), then it needs to set the callback flag to true and it has responsibility for calling next with the compiled code as argument. No callback means the commands can/should ignore it all.

When it is all done, the final function is called with the passin object and passed the code object. The passin object allows for whatever is stashed there to be offloaded by default if we want to do that. 

[](# "js")

    function (commands, code, passin, final) {
        var i=0, n=commands.length; 
        if (!passin.lengths) {
            passin.lengths = [];
        }
        var next = function (code) {
            if (code) {
                passin.lengths.push([i, code.length]);
            } else {
                passin.lengths.push([i,0]);
            }

            if ( i < n) {
                var command = commands[i];
                i += 1; // prime it for next loop
                if (command[0].callback) {
                    code = command[0].call(passin, code, command[1], next);
                } else {
                    code = command[0].call(passin, code, command[1]);
                    next(code); 
                    return null;
                }
            } else {

                // all done
                final.call(passin, code);
                return null;
            } 
        };

        next (code);  // begin!

        return null;
    }



#### Make code block

We need an array of the code lines and a property that holds any processing functions to use during the substitution phase. Might want to make this a constructor some day. 

[](# "js")

    function (cname) {
        var doc = this;
        return {
            lines : [],
            commands : {0: [ doc.trimCode ]},
            isCompiled : false,
            compiled : "",
            waiting : [],
            cname : cname
        };
    }



#### Process actions
    
Actions are functions that act on a compiled block of text. Mainly this would be saving the compiled text to a file, but it could be other actions as well. 

Each action should have an object of the form

* f: function that is to be called
* a path to the cblock in the form of litpro, heading, cname 
* fullname : reference
* msg : for unfinished business
* pipe: an array of pipes to act on the compiled text first
* state : whatever state variables need to be passed. For files, this is {indent : false}


[Main](# "js") 

    function () {
        var doc = this;
        var type;

        var actions = doc.actions;
        var action, hblock, cblock, litpro, headname, cname, fdoc, go;

        var goFact = _":the go function to pass for waiting";

        var aname;
        for (aname in actions) {
            action = actions[aname];
            litpro = action.litpro;
            headname = action.heading;
            cname = action.cname || "";
            _":check for block existence"

            type = (action.type || "" ).trim(); 
            cblock = fdoc.getcblock(hblock, cname, type);
            if (cblock === false) {
                fdoc.piping.call({doc:fdoc, hblock: hblock, cblock: {}, name:action.filename, state : action.state, action:action, star:action.star}, action.pipes || [], hblock.full.join("\n"), action.f);
            } else {
                go = goFact({doc:fdoc, hblock: hblock, cblock: cblock, name:action.filename, state : action.state,  action:action});
                cblock.waiting.push(go);
            }
        }
    }

[The go function to pass for waiting](# "js")  

We generate a function to sit patiently waiting for compilation.

    function (passin) {
        return function (text) {
            fdoc.piping.call(passin, passin.action.pipes || [], text, action.f);
        };
    }

    

[Check for block existence](# "js") 

First we check whether there is an external literate program trying to be used. We either assign it or doc to fdoc. Then we load up the block with headname. The code block name is left to another portion. 

            if (litpro) {
                if (doc.repo.hasOwnProperty(litpro) ) {
                    fdoc = doc.repo[litpro];
                } else {
                    doc.log("Trying to use non-loaded literate program " + litpro);
                    _":End action"
                }
            } else {
                fdoc = doc;
            }
            if (headname) {
                if (fdoc.hblocks.hasOwnProperty(headname) ) {
                    hblock = fdoc.hblocks[headname];
                } else {
                    doc.log("Trying to load non existent block '" + headname + "'");
                    _":End action"

                }
            } else {
                doc.log("No block " + litpro + " :: " + headname);
                _":End action"
            }
 
[End action](# "js") 

    doc.log(action.msg);
    delete actions[action.msg];
    continue;


### HBlock constructor

This just creates a basic structore for a block that corresponds to a heading and the rest. The cblocks property is the most useful and it is an object whose keys correspond to the name.type of each code block, each block containing an array of lines as created in "Make code block".

[](# "js")

    HBlock = function () {

        this.cblocks = {};
        this.full = [];
        this.plain = [];

        return this;
    };




## Compile Time

We now want to assemble all the code. This function takes in a parsed lp doc and compiles each block. It will visit each block and run the fullSub method. 

Most likely, many cblocks will call other cblocks that are not compiled. But that is okay as they can wait. 

This also is where the files are loaded into the waiting array of the called compile block. As soon as the block is compiled the file it is associated with gets saved. 

[](# "js")

    function () {
        var doc = this;

        var heading, cblocks, cname;
        for (heading in doc.hblocks) {
            cblocks = doc.hblocks[heading].cblocks;
            for (cname in cblocks) {
                doc.waiting[heading+":"+cname] = true;
            }
        }

        doc.processActions();

        for (heading in doc.hblocks) {
            doc.fullSub(doc.hblocks[heading]);
        }

        doc.postCompile.call({doc:doc}, "");

        return doc;
    }



### Get correct code block

Each compiled block has an associative array whose keys are cnames. They may be explicitly set, such as `[main](# "js")` becomes `main.js`.  But there might also be no name or no extension. 

So this is a function that takes in a compiled hblock, the cname, and a possible extension (if coming from a file save request). It tries to find the right compiled block and returns that. 


We need to get the right block of text. First we check if there is a request from the file directive. If not, then see if we can get the extension.

1. internal is the full name and a good match. Safest _":jack.js"
1. Check if there is only one block. If so, return it. 
2. See if internal is a known extension. Check main.ext and .ext.  _":js". Would not match jack.js. Does work with no extension as well as internal would be "" and match type "".
3. internal is the name, but without extension. Common. See if requester's extension with name matches something. If not, try default extension and then ".". If none of that works, then see if anything matches the name.   _":jack"  becomes jack.js if looked at from cool.js block. Also checked is jack.
4. If all that fails, then loop through the keys trying to match text. Unpredictable.
5. If none of that works, then look for a key of main. 
6. If that fails, grab something.


[main](# "js")
    
    function (hblock, cname, ext) {
        var doc = this;
        ext = ext || ""; // only relevant in compiling file type
        var cblocks = hblock.cblocks;


        if (!cblocks) {
            if (cname) {
                doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
            }
            return false; 
        }

        cname = cname.toLowerCase();

        // an exact match! yay!
        if (cblocks.hasOwnProperty(cname)) {
            return cblocks[cname];
        }

        var keys = Object.keys(cblocks);

        // just one key
        if (keys.length === 1) {
            if (keys[0].match(cname) ) {
                return cblocks[keys[0]];
            } else {
                if (cname) {


                    doc.log("1 Key, no match in " + hblock.heading + " The request was for " + cname);
                }
            return false;                
            }
        }

        // no code segments
        if (keys.length === 0) {
            if (cname) {
                doc.log("Code length 0 in " + hblock.heading + " The request was for " + cname);
            }
            return false;
        }

        if (doc.types.hasOwnProperty(cname)) {
            // main.js
            if (cblocks.hasOwnProperty("main."+cname) ) {
                return cblocks["main."+cname];
            }            
            // .js
            if (cblocks.hasOwnProperty(cname) ) {
                return cblocks["."+cname];
            }
        }

        _":filter internal"

        if (newkeys.length === 1) {
            return cblocks[newkeys[0]];
        }

        if (newkeys.length === 0) {
            doc.log("Name not found: " + cname + " of " + hblock.heading);
            return false;
        }

        //so we have multiple matches to cname (cname could be/ probably is "")
        // use extension ext if it has anything.

        _":filter ext"


        if (extkeys.length === 1) {
            return cblocks[extkeys[0]];
        }

        var finalkeys;
        if (extkeys.length > 0 ) {
            finalkeys = extkeys;
        } else {
            finalkeys = newkeys;
        }

        _":Filter main"

        if (morekeys.length > 0) {
            return cblocks[morekeys[0]];
        }

        // pick shortest one which could be the empty name
        return cblocks[ finalkeys.sort(function (a,b) {
            if (a.length < b.length) {
                return -1;
            } else {
                return 1;
            } 
        })[0]];

    }

[Filter internal](# "js")


        // try and find a match for the internal
        var newkeys = keys.filter(function (val) {
            if (val.match(cname) ) {
                return true;
            } else {
                return false;
            }
        });


[Filter ext](# "js") 

        var extkeys = newkeys.filter(function(val) {
            if (val.match(ext) ) {
                return true;
            } else {
                return false;
            }
        });

[Filter main](# "js")

        var morekeys = finalkeys.filter(function (val) {
            if (val.match("main") ) {
                return true;
            } else {
                return false;
            }
        });



### The full substitution 

This compiles a block to its fullly substituted values.

[](# "js")

    function fullSub (hblock) {
        var doc = this;
        var cname, cblock, compiling = {} ; 
        var cblocks= hblock.cblocks;

        var final; 

        var prune = _":prune";

        var next = _":Next function";

        final = _":Final function";

        _":Compiling status prep"

        _":Run next"
    }


[Compiling status prep](# "js") 

We create a call object for next and commands, etc. We prune the lines first, removing any blank lines at the beginning or end. 

    for (cname in cblocks) {
        cblock = cblocks[cname];
        cblock.compiled = prune(cblock.lines).join("\n");
        compiling[cname] = {status : 0, 
                cblock : cblock,
                commands : cblock.commands || [],
                hblock : hblock,
                next : next,
                final: final,
                doc : doc,
                name : cname,
                fullname : hblock.heading +":" + cname, 
                state : {indent: false},
                lengths : [cblock.compiled.length]
        };
    }


[Run next](# "js") 

    for (cname in compiling) {
        compiling[cname].next(cblocks[cname].compiled); 
    }



[Next function](# "js") 

This is where the magic happens. It should always be called on the block being compiled as the this object.

Depending on the status, it either will execute oneSub to further compile it after any pre/mid-processing commands or it will execute the final function after the post-process. 

    function (code) {
        var passin = this;
        var cblock = passin.cblock;
        if (code.length !== 0 ) {
            cblock.compiled = code;
        } 
        var doc = passin.doc;
        var commands;


        if (passin.status === "done") {
            return;
        }

        if (passin.status === "compiled") {
            // run post commands, final
            commands = cblock.commands["Infinity"] || [];
            doc.commander(commands, code, passin, final);
        } else {
            commands = cblock.commands[passin.status] || [];
            passin.status += 1;
            commands.push( [doc.oneSub, []] );
            // run commands
            doc.commander(commands, code, passin, next); 
        }

    }

[Final function](# "js") 

This is where all the cleanup happens. 

We store the compiled block and then we remove it from the waiting area. The waiting area also has an array of blocks that are waiting for this one to be compiled. 

One added to a waiting list, it should be a block with a go method. 

    function (code) {
        var passin = this;
        var doc = passin.doc;
        var cblock = passin.cblock;
        var fullname = passin.fullname;


        cblock.isCompiled = true;
        passin.status = "done";
        cblock.compiled = code; // make sure the compiled code is there
        var waiting = cblock.waiting || []; 
        while (waiting.length > 0 ) {
            (waiting.shift()) (code); // runs the go function
        }

        delete doc.waiting[fullname];

    }

[Prune](# "js") 

We need to remove empty blank lines at the beginning or end. We do this by creating a new array. 

    function (arr) {
        var begin, barr =[], earr= [], end, n = arr.length;
        for (begin = 0; begin < n; begin += 1) {
            if (arr[begin] === "" ) {
                continue;
            } else if (arr[begin].match(/^\s+$/)) {
                barr.push(arr[begin].slice(1));
            } else {
                break;
            }
        }
        for (end = n-1; end > -1; end -= 1) {
            if (arr[end] === "" ) {
                continue;
            } else if (arr[end].match(/^\s+$/)) {
                earr.push(arr[end].slice(1));
            } else {
                break;
            }
        }
        return barr.concat(arr.slice(begin, end+1), earr.reverse());
    }



## One cycle of substitution

So we have three basic things that we might see in code that the compiler needs to do something about:

1. Substitutions
2. Constants
3. Evaling

This is kept in the doc object, but it is invoked on an object that contains:  doc, topblock, code, name, fullname, next, final, commands.  See "The full substitution: next function". The arguments are the code and the function to call for callbacks. 


We run through the code string, matching block name/js code block/constant. We note the location, get the replacement text, and continue on. We also keep a look out for multi-level, preparing to reduce the level. 

Once all matches are found, we replace the text in the code block. We use the custom rawString method on strings to avoid the customary [replacement string](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter) replacement semantics 

The substitutions may become asynchronous. 

For evaling, no substitutions are done. It is just straight, one line code. If evaling a block is needed use _"block to run|eval"



[main](# "js") 

    function oneSub (code, ignore, done) {
    
        var passin = this;
        var cblock = passin.cblock;
        var doc = passin.doc;        
        var hblock = passin.hblock;

        var reg =  /(?:(\_+)(?:(?:\"([^"*][^"]*)\")|(?:\`([^`]+)\`))|(?:([A-Z][A-Z.]*[A-Z])(?:\(([^)]*)\))?))/g;
 
        var rep = [];
        var match, lower, args, ext;
        var names, temp, reqhblock, otherdoc, pipes, fullname, gotcblock, macro;

 
        var next, final, go, preprep, pushrep; 

        next = _":next match";

        final = _":ready to replace";

        go = passin.go = _":go substituting next";

        preprep = _":do some indenting";

        pushrep = _":push it on rep";


        next("first");
            
    }

[Next match](# "js") 

This keeps going while there are matches executing. We are using closures in a big way here.

    function () {
        if ( (match = reg.exec(code) ) !== null ) {
            _"Processing a substitution match"
        } else {
            final("from next"); 
        }

    }


[Ready to replace](# "js")

All the substitutions have been obtained and we are ready to do the replacing. We are using the closured variable rep. 

    function () {

        //do the replacements or return false
        if (rep.length > 0) {
            for (var i = 0; i < rep.length; i += 1) {
                code = code.replace(rep[i][0], rep[i][1].toString().rawString());
            }
            cblock.compiled = code; 
        } else {
            passin.status = "compiled";
            // cblock.compiled = code; 
        }
        done.call(passin, cblock.compiled); 
    }

[go substituting next](# "js")

This function hangs out in doc.waiting just hoping to get a bit of code to continue the compiling of the cblock. 

    function (reptext) {
        delete passin.gocall;
        doc.piping.call(passin, pipes, reptext, preprep);
    }

[do some indenting](# "js") 


We want to have an automated indentation of code that is intelligent. If we have something like `argh = _"cool"` then the first line is not indented, but the rest of the lines are indented by an additional 4 spaces (or doc.defaultIndentation). If we have ` _"cool" ` then all lines use the indentation of _"cool".

But it can be overwriten with the explicit indent command. No arguments lead to no indentation.

The code is a closure variable to the original code text that we are going to sub into. ret is the bit under consideration that will be inserted.  

    function (ret) {
        var passin = this;        
        var ind, linetext, middle, space, spacereg = /^(\s*)/;
        if (!passin.state.indent) {
            ind = match.index-1;
            while (ind > 0 ) {
                if (code[ind] === "\n") {
                    break;
                } else {
                    ind -= 1;
                }

            }
            if (ind === 0 || ind === match.index-1) {
                // no indent
            } else {
                linetext = code.slice(ind+1, match.index);
                space = linetext.match(spacereg); 
                if (space[1].length === linetext.length ) {
                    //all spaces
                    middle = space[1];
                } else {
                    middle = space[1] + doc.defaultIndent;
                }
                ret = ret.replace(/\n/g, "\n"+middle);
            }
        }
        pushrep(ret);

    }


[push it on rep](# "js") 

Presumably this needs to execute the next step

Added trim to make sure new blank lines after

    function (ret) {
        rep.push([match[0], ret]);
        next("rep pushed");
    }
        

### Processing a substitution match


When we have a match requiring a substitution, we call fullSub which will run all of the compile cycles for what is called. 

The match could match a substitution block `match[2]`, an eval block `match[3]`, or a macro `match[4]`.  For a substitution block, it could either be external or local. 

We allow for "block name.ext" to mean "block name:.ext"

For each valid match, we add a replacement string on the array rep for replacement after all matches have been analyzed. 
We are splitting the first part of the command as `external lit program :: heading block name : internal name . type`

Experimenting with ? syntax. So if the first part of a sub has `?` possibly followed by something, then the code block is optional (Generally a template thing), and the stuff that follows is the substitution. Nothing means nothing is inserted. 

The go function is used to keep coming back to the block after the subbing. When the go thinks all is done, it calls next to do the next match. 


[](# "js")


    if (match[2]) {
        _":cblock substitution"
    } else if (match[3] ) {
        _":eval backticks"
    } else {
        _":macro call"
    }


[eval backticks](# "js") 

This is pretty simple. We take the stuff in the backticks and eval it. The output is the replacement string. If evalling for side effects, make the last statement an empty string.

There is no async mechanism for this call.

The purpose of the eval is more for authoring documents with data that may need to get recompiled. Complicated analysis should be in its own block. 

    _":Matching block, multi-level"

    rep.push([match[0], eval(match[3])]);
    next("eval");
    return null;


[macro call](# "js") 

A macro is a function, even if it is being used to simply return a constant value. This lowercases the macro name and preps the arguments. Then if the macro exists, it will run it, possibly in an async fashion

    lower = match[4].toLowerCase();
    args = (match[5]|| "").split(',').trim();
    if (doc.macros.hasOwnProperty(lower)) {
        macro = doc.macros[lower];
        if (macro.callback) {
            doc.macros[lower].call(passin, args, pushrep); //the macro should call the second argument: pushrep
        } else {
         rep.push([match[0], doc.macros[lower].apply(passin, args)]);
         next("macro");
         return null; 
        }
    } else {
        next("no macro");
        return null;
    }

A macro will be called with the passin object. It can have a callback flag. 

[cblock substitution](# "js") 

Here we need to do the fancy dancing for star substitution. Essentially, if a star substtution is requested, we replace the hblock with a copy of the star block, but with all "*:..." replaced with the hblock name. Then we send it on its merry way. 

The idea is to create a new hblock that will have _"*..." replaced with _"litpro::heading..."  Then we can just use the usual substitution which is good. 

So we need get the star block, copy it, replace it, and then we should be good. 

For templating, no cblocks for the insertion, please.

Since question mark template cannot be detected in gotcblock.


    pipes = match[2].split("|").trim();
    fullname = pipes.shift().toLowerCase(); 
    
    names = {fullname: fullname};
    var insert;

    temp = fullname.split("*");

    if (temp.length === 2) {
        insert = temp[0];    
        temp = temp[1];
    } else {
        temp = temp[0];
    }

    _":parse fullname"

    _":get relevant hblock"

    gotcblock = doc.getcblock(reqhblock, names.cname); 

    if (gotcblock === false) {
        if (typeof passin.question !== "undefined") {
            gotcblock = {
                isCompiled : true,
                compiled : passin.question
            };
            doc.logpop();
        } else {
            doc.log("No cblock found with givename:" + names.cname);
            next();
            return null;
        }
    } 
    
    _":Matching block, multi-level"
    

    // do star replacement
    var newcb, newhb;
    if (insert) {
        newcb = doc.makeCode();
        newcb.lines = gotcblock.lines.map(function (el) {
            return el.replace(/_"\*([^"]*)"/g, '_"'+insert+'$1"');
        });
        newhb = new HBlock();
        newhb.heading = fullname;
        newhb.cblocks[names.heading] = newcb;
        doc.hblocks[newhb.heading] = newhb;
        doc.fullSub(newhb);
        gotcblock = newcb;
    }


    if (passin.gocall) {
        doc.log("go called again", passin.gocall, names.fullname, gotcblock.cname);
    } else {
        passin.gocall = names.fullname;
        if (gotcblock.isCompiled) {
            go(gotcblock.compiled);
        } else {
            gotcblock.waiting.push(go);
        }
    }


[Parse fullname](# "js") 

We will put all parsed bits into `names`. The temp variable will the bits that have yet to be parsed. 

We start to check whether this is a star substitution call. If so, we split the star into two pieces as the template may very well be in an exteranl litpro document. But we will not worry about cblocks for templates or extensions. The data will be stored in the names object under a new object called star. 

We get any reference to an external litpro document. This is the "::".  Next, we check to see if there is no ":". If so, we check for a "."; the last period starts the extension and becomes the cname. If there is a ":", then that becomes the cname. 

passin.question is there to deal with possible non-existent blocks. It is something to check for.


    passin.question = temp.split("?")[1];
    temp = temp.split("::").trim();
    if (temp.length === 1) {
        names.litpro = "";
        temp = temp[0];
    } else {
        names.litpro = temp[0];
        temp = temp[1];
    }
    // no ":"
    if (temp.indexOf(":") === -1) {
        if ( (ext = temp.lastIndexOf(".") ) !== -1 ) {
            // has a period indicating extension
            names.cname  = temp.slice(ext);
            names.heading = temp.slice(0, ext);
        } else {
            names.cname = "";
            names.heading = temp;
        }
    } else {
        temp = temp.split(":").trim();
        names.cname = temp[1];
        names.heading = temp[0];
    }


[Get relevant hblock](# "js") 

We have the names object and now we use it to get an hblock to then get the cblock. 

    if (names.litpro) {
        if (doc.repo.hasOwnProperty(names.litpro) ) {
            otherdoc = doc.repo[names.litpro];
            if (otherdoc.hblocks.hasOwnProperty(names.heading) ) {
                reqhblock = otherdoc.hblocks[temp]; 
            } else {
                doc.log("No such block " + names.heading + " in literate program " + names.litpro);
                next("no block");
                return null;
            }
        } else {
            doc.log("No such literate program loaded: " + names.litpro);
            next("no litpro");
            return null;
        }
    } else {
        // this doc
        if (names.heading) {
            if (doc.hblocks.hasOwnProperty(names.heading) ){
                reqhblock = doc.hblocks[names.heading];
            } else {
                // no block to substitute; ignore
                next("no block to sub");
                return null;
            }
        } else {
            // use the code already compiled in codeBlocks ?: looks like using current?
            reqhblock = hblock;
        }                    
    } 



[Matching block, multi-level](# "js")

There is a match, but the level is not yet ready  for full substitution

    if (match[1] && match[1].length > 1) {
        rep.push([match[0], match[0].slice(1)]);
        next("multilevel");
        return null;
    }



### Pipe processor

This will process the pipe commands. 

A pipe command will be any non-parenthetical (and non-pipe) string of characters followed by an optional set of parentheses with arguments to be passed in. 

If there is such a command, it is invoked with a this object of {doc, block, name, callback} where name is the name.type of the sub-code block in block. Its arguments are the stuff in parentheses split on commas. 

This is a very simple setup which hopefully will suffice for most needs. 

[](# "js") 
    
    function (pieces, code, final){

        var doc = this.doc;
        var passin = this;

        var com, cmatch, funname, funargs, comreg = /^\s*([^(]+)(?:\(([^)]*)\))?$/, comarr;

        comarr = [];


        while (pieces.length >0) {

            com = pieces.shift();

            cmatch = com.match(comreg);


            if (com === null) {
                doc.log("No match " + com);
                continue;
            }

            funname = cmatch[1].trim();

            if (cmatch[2]) {
                funargs = cmatch[2].split(",").trim();
            } else {
                funargs = [];
            }


            if ( doc.commands.hasOwnProperty(funname) ) {
                comarr.push([doc.commands[funname], funargs]);
            } else {
                doc.log("Issue with " + com);
            }
        }

        doc.commander(comarr, code, passin, final); 

        return null; 
    }



## Recommendations

### Functions 

A lot of the literate programming for JavaScript might involve creating functions. One could just write it as 

    function name (parameters) {
      code
    }

in some code block. Let's say it is in section highfun

And then later on we could import them into some other control structure by using

    var fun = _"highfun";

or one could write

    var funobj = {
      fun : _"highfun",
    };

Note that we do want the heading to be inlined for this though one could write it on separate lines. 


### Loops

One can also take out the innards of a loop and replace it with a heading block. This allows one to see better the flow of the surrounding code without having to invoke a function on every loop (which can be both a performance penalty and a bit awkward (say if break or continue are required). 



## Directives


Create the object that holds the directives. It will contain object names for any directives that need to be instituted. Each of the values should be a function that takes in the material on the line post-command and the doc (as this) which gives access to the current block and name. 

The parser is in "Directives parser".  It passes the options after splitting and trimming them as pipes. 

We use lower case for the keys to avoid accidental matching with macros. 

    { 
        "file" : _"File directive",
        "save" : _"Save directive",
        "version" : _"Version directive",
        "load" : _"The load directive:main",
        "require" : _"Require directive",
        "set" : _"Set Constant directive",
        "define" : _"Define directive"
    }


### File directive
     
DEPRECATED

The command is `FILE "litpro :: block name : internal name" fname.ext | commands...` where fname.ext is the filename and extension to use. 

The quoted part is optional. Its omission means that one should use the current code block.

The rest of the options are pipe commands that get processed 

    function (options) {
        var doc = this; 
        var heading, cname, fullname, litpro, filename, temp; 

        _":Split Quotes"

        if (!filename ) {
            doc.log("No file name for file: " _":Msg");
            return false;
        }
        if (!fullname ) {
            litpro = "";
            heading = doc.hcur.heading;
            cname = doc.hcur.cname;
        } else {

            _":Parse out quoted name"
        }

        var type = filename.split(".");
        if (type.length > 1) {
            type = type[type.length-1];            
        } else {
            type = "";
        }

        doc.actions["File not saved: " + filename] = {
            f: _":the action function",
            litpro: litpro,
            heading : heading,
            cname : cname, 
            pipes: options.slice(1),
            filename : filename,
            msg : "File not saved: " + filename,
            state : {indent : false},
            type: type
        };
    }

[The action function](# "js") 


This should receive the passin object as this which will contain the action object. The argument is the text.

All postCompile functions should expect a passin object with a text from compiling. 

    function (text) {
        doc.postCompile.call(this, text);
    }

[Split quotes](# "js") 

    temp = options[0].split('"').trim();
    if (temp.length === 1) {
        // no quotes presumably
        filename = temp[0];
        fullname = "";
    } else if (temp.length === 3) {
        filename = temp[2];
        fullname = temp[1];
    } else {
        //error
        doc.log('Error in File Directive specification. Please use: "block name" filename.ext | to specify the input and output. ' _":Msg");
        return false;
    }


[Parse out quoted name](# "js") 

First splite out on "::" to get external literate program name and then split on ":" to get heading/cname split. Fill in reasonable defaults as one can; abort if it doesn't make sense. 

    fullname = fullname.toLowerCase();
    //litpro :: fullname
    temp = fullname.split("::").trim();
    if (temp.length === 1) {
        litpro = "";
    } else {
        litpro = temp[0];
        fullname = temp[1];
    }

    // heading : cname
    temp = fullname.split(":").trim();
    heading = temp[0];
    cname = temp[1] || "";
    if (!heading && litpro) {
        doc.log("Need block name for external program." _":Msg" );
        return false;
    }

    if (heading && !cname) {
        //check for a period
        if ( (temp = heading.indexOf(".")) !== -1 ) {
            cname = heading.slice(temp); 
            heading = heading.slice(0,temp);
        }
    }

    if (! heading) {
        //current block
        heading = doc.hcur.heading;
        cname = cname || doc.hcur.cname;
    }


[Msg](# "js") 
Just a snippet of code I keep writing for reporting error location.

    +options.join[" | "]+","+ doc.hcur.heading



### Save directive
     
The command is `[fname.ext](#block-name "save_ sub block name | commands...")` where fname.ext is the filename and extension to use and _ should be a colon.

If the hash has no text after it, then use the current code block. 

The rest of the options are pipe commands that get processed.

To maintain compatibility with more of the directives that do not use name or link, the options comes first. 

Unlike file, we do not support using the top block from a different file. Most likely that use case was from lack of templates. To allow file directives to directly access templates, we allow for the syntax `[..](.. "save_ *templateblock...")` where underscore is colon.

When this is detected, a fake block is created and queued. It consists of a simple line of substitution which allows all the templating magic to happen. The issue with trying to deal with templates at this point is that being a directive, it is being setup before all the blocks have been parsed. I think. 


    function (options, filename, link) {

        var doc = this; 
        var heading, cname, litpro=""; 

        if (!filename ) {
            doc.log("No file name for saving: " + filename + link + options.join("|") );
            return false;
        }

        var type = filename.split(".");
        if (type.length > 1) {
            type = type[type.length-1];            
        } else {
            type = "";
        }

        heading = (link || "").slice(1).replace(/-/g, " ").toLowerCase();

        cname = options.shift();

        if (! heading) {
            //current block
            heading = doc.hcur.heading;
            cname = cname || doc.hcur.cname;
        }

        var newcb, newhb;
        if (cname[0] === "*") {
            newcb = doc.makeCode();
            newcb.lines = ['_"'+heading+cname+options.join("|")+'"'];
            newhb = new HBlock();
            newhb.heading = heading+cname;
            newhb.cblocks[filename] = newcb;
            doc.hblocks[newhb.heading] = newhb;
            heading = newhb.heading;
            cname = filename;
        } 


        doc.actions["File not saved: " + filename] = {
            f: _":the action function",
            litpro: litpro,
            heading : heading,
            cname : cname, 
            pipes: options,
            filename : filename,
            msg : "File not saved: " + filename,
            state : {indent : false},
            type: type
        };
    }

[The action function](# "js") 


This should receive the passin object as this which will contain the action object. The argument is the text.

All postCompile functions should expect a passin object with a text from compiling. 

    function (text) {
        doc.postCompile.call(this, text);
    }





### The load directive

This is to load other literate programs. It loads them, compiles them, and stores the document in the global repo where it can then be accessed using   _"name::block : internal | ..."  where the name is the name given to the literate program (full filename by default).  The format is either 

* `[shortname](whatever "load:file | save list...")`
* `[shortname](github link "load: |...")`
* `[shortname](somelink "load: |...")`

That is, it first checks to see if the load directive is followed by something. If so, that is the file location to go to. If there is nothing there, then it checks to see if it is a github link to a master branch. If so, then it grabs the location from there and loads it locally. This is ideal in that the link will take someone to the repo remote, but still facilitates local development. The final form is to just load something over the network. If you really want it loaded remotely via a github link, then you can put `!!` after the load link.  

!!Http loading not done yet

This will load the file asynchronously. The callback parses the document and upon its completion, checks to see if there are any files to be loaded. If so, then it puts a callback in the call array of the new doc to keep checking with a reference to the original document. If no files are being loaded, then it will remove itself from the load array and call the old doc's function to check for proceeding.

We use doc.repo[name] as an array of those trying to load the file. Once loaded, they become the parents of the new doc along with any other docs calling it later on. 

The filterCompileFiles option is an array for list which files of the `save` directive in the lit pro to save. The default is to save them all. THIS IS NOT IMPLEMENTED, as far as I know. But 

[Main](# "js")
 
    
    function (options, name, link) {
        var doc = this,
            fname, 
            ind;

        fname = options.shift();

        if (arguments.length === 3) {
            if (fname === "!!") {
                fname = link;
            } else if (!fname) {
                _":check for github"
            } 
        } else {
            name = options.shift();
        }

        _":verify fname name"
        _":Already encountered"

        var file;
        var callback = _":load data";

        if (fname.slice(0,4) === "http") {
            _":request remote"
        } else {
            file = fs.readFile(fname, 'utf8', callback);
        }
        return true;
    }

[Check for github](# "js")

We first match by whether it contains github.com  (note the . is probably an any character).  Then we are presuming that if it is and it is the master branch, then we can get the local file from what follows `master/`.  If none of that pans out, the link becomes the file name and a network call is probably called for. 

This could probably be improved with some more information (such as the repo name, branch, whatever) but I think this gets the 90% of cases and the rest can use an explicit fname. 

    if (link.search("github.com") !== -1) {
        ind = link.search("master/");
        if (ind !== -1) {
            fname = link.slice(ind+7);
        } else {
            fname = link;
        }
    } else {
        fname = link;
    }

[verify fname name](# "js")

    if (! fname) {
        doc.log("Error in LOAD. Please give a filename " + options.join(" | ") );
        return false;            
    }

    if (!name) {
        name = fname;
    }


[request remote](# "js")

Need to figure this out. typeof http is to just shut up jshint about not using http.
    

    callback({ message: "http requests not done yet"}, typeof http);


[load data](# "js")

    function (err, data) {
        var tempdoc, tempname, newdoc, i, n, par;
        if (err) {
            doc.log("Issue with LOAD: " + fname + " " + name + " " + err.message );
            par = doc.repo[fname];
            delete doc.repo[fname] ;

            n = par.length;
            for (i = 0; i < n; i += 1) {
                tempdoc = par[i][0];
                tempname =  par[i][1];
                delete tempdoc.loading[tempname];
                // may want to abort instead?
                _"Parse lines: check for compile time" 
            }
        } else {
            par = doc.repo[fname];
            newdoc = doc.repo[name] = (new Doc(data, {
                standardPlugins : doc.standardPlugins,
                postCompile : doc.postCompile,
                filterCompileFiles: options, 
                parents : par,
                fromFile : fname
            }));
            n = par.length;
            for (i = 0; i < n; i += 1) {
                tempdoc = par[i][0];
                tempname =  par[i][1];
                delete tempdoc.loading[tempname];
                tempdoc.loaded[tempname] = newdoc;
                _"Parse lines: check for compile time"
            }
            
        }
    }



[Already encountered](# "js")

If it is an array in the repo, then that is a list of docs LAODing it, but the file has not yet returned. We load up the current doc and its name for this file. 

If it is not an array, then it should be a Doc and we load the current doc into the parents array. The requesting doc need not wait for compilation of the new document since blocks that depend on it will wait. All we needed from the parsed document was knowing the existence of the blocks.


    var newdoc;
    if ( doc.repo.hasOwnProperty(fname) ) {
        if (Array.isArray(doc.repo[fname]) ) {
            // loading
            doc.repo[fname].push([doc, name]);
            doc.loading[name] = true;
        } else {
            // already loaded
            newdoc = doc.repo[fname];
            doc.loaded[name] = newdoc;
            newdoc.parents.push([doc, name]);
        }
        return true; 
    } else {
        // never seen before
        doc.repo[fname] = [[doc, name]];
        doc.loading[name] = true;
    }



### Require directive

This is to load up macros, commands, and directives.

The file should be a node module that exports functions that take in the doc and do something to it. 
The syntax is `[whatever](somelink "require: filename | entry ? | ...")

The main thing is to add in the filename for require and you are good to go. I like require and that means local. 

The `entry` part is a list of the names that you might want imported/run. If nothing is supplied, then all exposed bits are used.

We use `doc.addPlugins` to load the file in no options. See that for options. 

The plugin is the same setup as the lprc load:  

0. If we have entries, then just use those entries if they exist, running anything that is a function. This is done here. 
0. If exports has a property called litpro, use that. 
1. If exports is a function, run that. 
2. If it is an array, iterate over it and run those functions. 
3. If it is an object, iterate over that and run the functions. 

Got it? 


    function (options) {
        var doc = this;
        var name = options.shift();
        if (! name) {
            doc.log("Error in REQUIRE. Please give a module filename " + options.join(" | ") );
            return false;            
        }
        var bits;
        try {
            if (name[0] === "/") {
                name = process.cwd()+name;
            }
            bits = require(name);
        } catch (e) {
            doc.log("Issue with REQUIRE: " + name + " " + options + " " + e.message );
            return false;
        }
        var bit;
        if (options.length === 0) {
            doc.addPlugins(bits);
        } else {
            var i, n = options.length;
            for (i = 0; i < n; i += 1) {
                bit = options[i];
                _":bit check and run"
            }
        }
    }

[bit check and run](# "js") 

    if ( (bits.hasOwnProperty(bit)) && (typeof bits[bit] === "function")) {
      bits[bit](doc); //each one is responsible for modifying
    }




### Version directive


Version control directive for the literate program. Generally at the base of the first intro block. This would be useful for setting up a npm-like setup. 

    function (options, docname) {
        var doc = this;

        if (arguments.length === 3) {
            doc.addConstants({docname: (docname || ""), 
                docversion : (options[0] || "0.0.0"),
                ghuser: (options[1] || "")
            });
        } else {
            doc.addConstants({docname: (options[0] || ""), 
                docversion : (options[1] || "0.0.0")});
        }
    }



### Set Constant directive

Here we set constants as macros. If NAME is the name of a macro, either NAME or NAME() will return the value

    function (options, name) {
        var doc = this,
            value;

        if (arguments.length === 3) {
            name = (name || "").toLowerCase();
        } else {
            name = (options.shift() || "").toLowerCase();
        }
        if (options.length >= 1) {
            value = options.join("|"); // a hack to undo pipe splitting--loses whitespacing
        } 
        if (name && value) {
            doc.addConstants(name, value);
        } else {
            doc.log("Error with SET directive. Need ");            
        }
    }

### Define directive

This is where we can implement directives, commands, macros, or other in a file. While rare, this gives us a great deal of power in compiling. 

The syntax is `[name](#whatever "define: type | path | when")` where the name is the name of the directive/command/macro or whatever for the other and the type should be one of directive, command, macro, eval. The path is optional and if present will dictate an alternate cblock to use. Note that the cblock must have already been seen and there are no substiutions. The when is either "now", "h", or "c" meaning to use it now, or when a new hblock is used, or when a new cblock is used. 

Defaults:  type = macro if there is a name, eval otherwise. when = h

    function (options, name) {
        var doc = this;
        var hcur = doc.hcur;
        var type, path, when, cblock, code;

        if (arguments.length === 3) {
            type = options.shift() || ( name ? "macro" : "eval");
            path = options.shift();
            when = options.shift() || ("h");
        } else {
            name = options.shift();
            type = "macro";
            when = "now";
        }
        if (type !== "eval" && (!name) ) {
            doc.log("Error with DEFINE directive. Need a name.");
            return false; 
        }

        name = (name || "").toLowerCase().trim(); 
        var execute = _":execute when ready";

        if (when === "now") {
            execute();
        } else if (when === "h") {
            if (!hcur.waiting) {
                hcur.waiting = [];
            }
            hcur.waiting.push(execute);
        } else if (when === "c") {
            cblock = hcur.cblocks[hcur.cname];
            if (!cblock.hasOwnProperty("switchWaiting")) {
                cblock.switchWaiting = [];
            }
            cblock.switchWaiting = [];
        }

    }

[execute when ready](# "js")

This is the execution code. It first gets the appropriate cblock based on path. If no path, then the current cblock at the time of calling is used. Then it evals it and plugs in to the right place. 

    function () {
        var bits, block, cblock, cname; 

        if (path) {
            bits = path.split(":");
            block = bits[0];
            cblock = bits[1];
            if (block) {
                if (doc.hblocks.hasOwnProperty(block) ) {
                    block = doc.hblocks[block];
                    _":get cblock from block"
                } else {
                    doc.log("Error with DEFINE directive. Block " + block + " requested, but did not exist at the requested time." + type + path + when);
                    return false;
                }
            } else if (cblock) {
                block = hcur;
                _":get cblock from block"
            } else {
                doc.log("Error with DEFINE directive. Path " + path + " is not understood");
                return false;
            }

        } else {
            code = hcur.cblocks[hcur.cname].lines.join("\n");
        }           


        var f;
        if (type !== "eval") {
            eval("f="+code);
            switch (type) {
                case "macro":
                    doc.addMacros(name, f);
                break;
                case "command" :
                    doc.addCommands(name, f);
                break;
                case "directive" :
                    doc.addDirectives(name, f);
                break;
                default : 
                    doc.log("Error in DEFINE directive. Type unknown: " + type);
            }
        } else {
            eval(code);
        }
    }

[get cblock from block](# "js")

    if (block.cblocks.hasOwnProperty(cblock) ) {
        code = block.cblocks[cblock].lines.join("\n");
    } else {
        for (cname in block.cblocks) {
            if (cblock.indexOf(cname) !== -1) {
                code = block.cblocks[cname].lines.join("\n");
                break;
            }
        }
        if (!code) {
            doc.log("Error with DEFINE directive. Code block " +path+ " not found.");
        }
    }



## Core doc commands



     { "eval" : _"Eval",
        "nocompile" : _"No Compile",
        "raw" : _"Raw",
        "clean raw" : _"Clean Raw",
        "indent" : _"Indent", 
        "log" : _"Log",
        "substitute" : _"Substitute",
        "stringify" : _"Stringify"
    }


### Eval

The eval function will use a function to protect var declarations from polluting the global scope. It does not prevent global access. Maybe a "use strict" version, but need to experiment and think of use case need. 

We throw into that environment the variables options, inputs, and program to allow for interactive constructs in the code. doc is also available though probably should not be used. But could be useful for some debugging purposes, I suppose. State object also available.

[](# "js")

    function (code, options) {
        var doc = this.doc;
        var state = this.state;
        // just cli environment? 
        var program;
        program = this.program || {};
        var inputs;
        inputs = doc.inputs || [];
        options = options || [];
        try {
            state.obj = eval("(function(){"+code+"})()");
            if (typeof state.obj === "undefined") {
                return "";
            } else {
                return state.obj.toString();
            }
        } catch(e) {
            doc.log("Eval error: " + e + "\n" + code);
            return "";
        }
    }

### Indent 

To be able to indent the code in the final production (for appearance or say in Python), we can use this function. It takes two possible arguments: first line indent and rest indent. If just one number, it applies to the rest.


If no argument, then 

[](# "js")

    function (code, options) {

        var begin, middle;
        if (options.length === 2) {
            begin = Array(parseInt(options[0],10)+1).join(" ");
            middle = "\n"+Array(parseInt(options[1],10)+1).join(" ");
        } else if (options.length === 1) {
            begin = "";
            middle = "\n"+Array(parseInt(options[0],10)+1).join(" ");
        } else {
            this.state.indented = true;
            return code;
        }
        code = begin+code.replace("\n", middle);
        this.state.indented = true;
        return code;
    }

### Substitute

This method will replace macro values with the given values. So  `substitute(A, 1, B, fred)` would replace A with 1 and B with fred.

Actually, the way it is written, it need not be in the macro form. In fact, it is a regular expression! 

    function (code, options) {
        var i, n = options.length, reg;
        for (i = 0; i < n; i += 2) {
            if (!options[i+1]) {
                break; // should only happen if n is odd
            }
            reg = new RegExp(options[i], "g"); // global replace
            code = code.replace(reg, options[i+1]);
        }
        return code; 
    }


### Log

This allows one to output the compiled code of a block to the doc log and probably to console log evenutally. Optional argument of a first line name. The default is the name.type


[](# "js")

    function (code, options) {
        var doc = this.doc;
        var name = this.name;
        if (options[0]) {
            doc.log(options[0]+"\n"+code);
        } else {
           doc.log(name + ":\n" + code);
        }
        return code;
    }



### No Compile

This prevents the compilation of the block. Mostly used with 0 in front to avoid problematic compilation. It does this by returning an empty string. Pretty simple. 

    function () {
        return "";
    }

### Raw

This returns the joined text of the full block. Probably called by another block. 

    function () {
        var hblock = this.hblock;

        return hblock.full.join("\n");
    }

### Clean Raw

This is like raw, but it removes any Directives, and it removes one space from the start of a line that would otherwise match a directive or header. 

    function () {
        var hblock = this.hblock;
        var full = hblock.full;
        var i, n = full.length, ret = [], line;
        for (i = 0; i < n; i += 1) {
            line = full[i];
            if (line.match(/^(?:\#|\.[A-Z]|[A-Z]{2})/) ) {
                continue;
            }
            if (line.match(/^ (?:\#|[A-Z.]|\=|\-)/) ) {
                ret.push(line.slice(1));
            } else {
                ret.push(line);
            }
        }
        return (ret.join("\n")).trim();
    }


### Stringify 

If one is trying to insert a long text into a JavaScript function, it can have issues. So here is a little helper command that will split new lines, escape quotes, and then put it out as an array of strings joined with new lines.

[](# "js")

    function (code) {
        code = code.replace(/\\/g, '\\\\');
        code = code.replace(/"/g, '\\' + '"');
        var arr = code.split("\n");
        var i, n = arr.length;
        for (i = 0; i < n; i += 1) {
            arr[i] = '"' + arr[i] + '"';
        }
        code = "[" + arr.join(",\n")  + '].join("\\n")';
        return code;
    }

## Utilities

Here we define some utility functions: 

    _"String Trim"
    _"Raw String"
    _"Array Trim"
    _"Object Keys"


### String Trim

This was lifted from JavaScript the Definitive Guide: 

    // Define the ES5 String.trim() method if one does not already exist.
    // This method returns a string with whitespace removed from the start and end.
    String.prototype.trim = String.prototype.trim || function() {
       if (!this) return this;                // Don't alter the empty string
       return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
    };

### Array Trim 

Trims all objects with a trim function in an array and returns a copy. Mainly used here for post-split cleanup.

    Array.prototype.trim = Array.prototype.trim || function () {
        var ret = [];
        var arr = this;
        var i, n = arr.length;
        for (i = 0; i < n; i += 1) {
            if (typeof arr[i].trim === "function") {
                ret[i] = arr[i].trim();
            }
        }
        return ret; 
    };

### Raw String

This code is for dealing with using replace with arbitrary strings. The dollar sign has special meaning in replacement strings. Since $$ is used for implementing math mode, its use in a replacement string leads to problems. But the return value from a function in a replacement string does not have this problem. Thus, I augmented the String type to have a method, rawString which produces a function that returns the string. 

    String.prototype.rawString = String.prototype.rawString || function () {
        var ret = this;
        return function () {return ret;};
    };

### Object Keys

Found at [SO](http://stackoverflow.com/questions/18912/how-to-find-keys-of-a-hash)

Note this is on Object, not Object.prototype to avoid enumeration issues. 

    if(!Object.keys) {
        Object.keys = function(o){
           if (o !== Object(o)) {
              throw new TypeError('Object.keys called on non-object');
            }
           var ret=[],p;
           for(p in o) {
                if(Object.prototype.hasOwnProperty.call(o,p)) {
                    ret.push(p);
                }
            }
           return ret;
        };
    }


## Cli 

This is the command line file. It loads the literate programming document, sends it to the module to get a doc object, and then sends the file component to the save command. 

By default, it loads the standard plugins in literate-programming-standard. This can be turned off with the -f command line option. All loaded literate programs inherit this decision. 

postCompile is a an array of arrays of the form [function, "inherit"/"", dataObj]

    #!/usr/bin/env node

    /*global process, require, console*/
    /*jslint evil:true*/
    var program = require('commander');
    var fs = require('fs');
    var Doc = require('../lib/literate-programming').Doc;
    var path = require('path');


    _"Command line options"

    var postCompile; 

    _"Post Compile function"


    if (program.preview) {
        postCompile.push([_"Preview files", {}]);
    } else if (program.diff) {
        postCompile.push([_"Diff files", {dir:dir}]);
    } else {
        postCompile.push([_"Save files", {dir: dir}]);
    }

    var standardPlugins, plugins; 

    if (!program.free) {
        standardPlugins = require('literate-programming-standard');
        _"check for lprc file"
    } else {
        standardPlugins = {};
    }

    if (!program.quiet) {
        postCompile.push([_"Cli log", {}]);
    }

    postCompile.push([_"Action cleanup", {}]);

    var doc = new Doc(md, {
        standardPlugins : standardPlugins,
        plugins : plugins,
        postCompile : postCompile, 
        parents : null,
        fromFile : null,
        inputs : inputs,
        program : program,
        verbose : verbose
    });


    _"On exit"



#### Post Compile function

This takes in a text and is called in the context of a passin object. 

[](# "js")

    postCompile = function (text) {
        var passin = this;
        var doc = this.doc;
        var steps = doc.postCompile.steps;
        var i = 0; 
        var next = _":Next function";
        next(text); 
    };
    
    postCompile.push = _"Post Compile function:push";

    postCompile.steps = [];

[Push](# "js") 

    function (arr) {
        this.steps.push(arr);
    }

[Next function](# "js") 

    function(text) {
        if (i  < steps.length) {
            var step = steps[i];
            i+= 1;
            step[0].call(passin, text, next, step[1]);
        } else {
            // done
        }

    }


#### Action cleanup

We need to delete the associated action after it is done. 

    function (text, next) {
        var doc = this.doc;
        try {
            delete doc.actions[this.action.msg];
        } catch (e) {
        }
        next(text);
    }

#### Save Files 


    function (text, next, obj) {
        var passin = this;
        var doc = passin.doc;
        if (passin.action && passin.action.filename) {
            var fname = passin.action.filename;

            process.chdir(originalroot);
            if (obj.dir) {
                process.chdir(dir);
            }            
            var cb = _":Callback ";

            fs.writeFile(fname, text, 'utf8', cb);
        } else {
            next(text);
        }
    }

[Callback Factory](# "js") 

Information about what happened with the file writing and then next is called. 

    function (err) {
        if (err) {
            doc.log("Error in saving file " + fname + ": " + err.message);
        } else {
            doc.log("File "+ fname + " saved");
        }
        next(text);
    }


#### Preview files

This is a safety precaution to get a quick preview of the output. 

    function (text, next) {
        var passin = this;
        var doc = passin.doc;
        if (passin.action && passin.action.filename) {
            var fname = passin.action.filename;
            doc.log(fname + ": " + text.length  + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
        }
        next(text);
    }


#### Diff files

This is to see the changes that might occur before saving the files. 

Currently not working

    function (text, next, obj) {        
        var passin = this;
        var doc = passin.doc;
        var fname = passin.action.filename;

        process.chdir(originalroot);
        if (obj.dir) {
            process.chdir(dir);
        }

        doc.log(fname + " diff not activated yet ");
        next(text);
    }



### Cli log

This is where we report the logs. 

    function (text, next) {
        var doc = this.doc;
        var logitem;
        var i, n = doc.logarr.length;
        for (i = 0; i < n; i += 1) {
            logitem = doc.logarr.shift();
            if ( (logitem[1] || 0) <= doc.verbose) {
                console.log(logitem[0] );
            } 
        }
        next(text);
    }

### Check for lprc file

An lprc file is a JavaScript file that contains various plugin type stuff. This allows one to define it once for a project and then all the litpro programs can use it. Probably better than the require directive. 

There should be just one such file 

To find it, we start with the cwd and look for such files in each parent directory. 

This can be made more complicated if there is a reason to do so, but I think a single plugin file for a project is probably sufficient. There is always require. 


[](# "js: ife")

    var original = process.cwd();
    var files;

    var matchf = function (el) {return el.match("lprc.js");};

    var current;
    plugins = {};
    var bits = original.split(path.sep);
    var lead = ( original[0] === path.sep) ? path.sep : "";
    do {
        current = lead + path.join.apply(path, bits);
        files = fs.readdirSync(current);
        files = files.filter(matchf);
        if (files.length === 1 ) {
            plugins = require(current+path.sep+files[0]);
            break;
        } else {
            bits.pop();
        }
    } while (bits.length > 0);





### Command line options

Here we define what the various configuration options are. 

The preview option is used to avoid overwriting what exists without checking first. Eventually, I will hookup a diff view. There might also be a test-safe mode which runs the tests and other stuff and will not save if they do not pass. 

Added ability to pass in arguments to the literate program. It is in the array variable inputs.

    program
        .version('DOCVERSION')
        .usage('[options] <file> <outdir> <arg1> ...')
        .option('-o --output <root>', 'Root directory for output')
        .option('-i --input <root>',  'Root directory for input')
        .option('-r --root <root>', 'Change root directory for both input and output')
        .option('-p --preview',  'Do not save the changes. Output first line of each file')
        .option('-f --free', 'Do not use the default standard library of plugins') 
        .option('-d --diff', 'Compare diffs of old file and new file')
        .option('-e --extension <ext>', 'requires a ext as extension for the file')
        .option('--verbose', 'Full warnings turned on')
    ;

    program.parse(process.argv);

    if ((! program.args[0]) ) {
        console.log("Need a file");
        process.exit();
    }


    var dir = program.dir || program.root || program.args[1] || process.cwd(); 
    var indir = program.change || program.root || process.cwd();
    var originalroot = process.cwd();
    if (indir) {
        process.chdir(indir);
    }

    var verbose = program.verbose || 0;

    if (program.extension) {
        if (program.args[0].substr(program.extension.length) !== program.extension.length) {
            console.log("Requires extension: " + program.extension);
            process.exit();
        }
    }

    var md;
    try {
        md = fs.readFileSync(program.args[0], 'utf8');
    } catch (e) {
        console.log("Not readable file " + program.args[0]);
        md = ""; 
    }

    var inputs =  program.args.slice(2);

#### On exit

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



## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)

Also of invaluable help with all of this is [RegExpr](http://www.regexper.com/)

## README


literate-programming
 ====================

Write your code anywhere and in any order with as much explanation as you like. literate-programming will weave it all together to produce your project.

This is a modificaiton of and an implementation of [Knuth's Literate Programming](http://www-cs-faculty.stanford.edu/~uno/lp.html) technique. It is perhaps most in line with [noweb](http://tex.loria.fr/litte/ieee.pdf). 

It uses markdown as the basic document format with the code to be weaved together being delimited by each line having 4 spaces as is typical for markdown. Note that it requires spaces but not tabs. This allows one to use tabs for non lit pro code blocks as well as paragraphs within lists. 

It can handle any programming language, but has some standard commands useful for creating HTML, CSS, and JavaScript. 

 ## Installation

This requires [node.js](http://nodejs.org) and [npm](https://npmjs.org/) to be installed. Then issue the command:

    npm install -g literate-programming

 ## Using

From the command line:

    literate-programming <file.md>

This will process the literate program in `file.md` and produce whatever output files are specified in the program. 

Use `literate-programming -h`  for command flag usage, including specifying the root output directory.

It can also be used as an executable program; see [primes.md](https://github.com/jostylr/literate-programming/blob/master/examples/primes.md) for an example program of this kind.   

 ## Example

Let's give a quick example. Here is the text of sample.md

    # Welcome

    So you want to make a literate program? Let's have a program that outputs all numbers between 1 to 10.

    Let's save it in file count.js

    [count.js](#Structure "save:")

    ## Structure 

    We have some intial setup. Then we will generate the array of numbers. We end with outputting the numbers. 

        var numarr = [], start=1, end = 11, step = 1;

        _"Loop"

        _"Output"

    ## Output 

    At this point, we have the array of numbers. Now we can join them with a comma and output that to the console.

        console.log("The numbers are: ", numarr.join(", ") );

    ## Loop

    Set the loop up and push the numbers onto it. 

        var i;
        for (i = start; i < end; i += step) {
            numarr.push(i);
        }


And it can be run from the command line using `node count.js`

There are more [examples](https://github.com/jostylr/literate-programming/tree/master/examples), but for a non-trivial example, see the [literate program](https://github.com/jostylr/literate-programming/blob/master/lp.md) that compiles to literate-programming.


 ## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level, either atx # or seText underline ) demarcates a full block. Code blocks within a full block are the bits that are woven together. 

 ### Code Block

Each code block can contain whatever kind of code, but there are three special syntaxes: 

1. `_"Block name"` This tells the compiler to compile the block with "Block name" and then replace the _"Block name" with that code.
2. ``_`javascript code` ``  One can execute arbitrary javascript code within the backticks, but the parser limits what can be in there to one line. 
3. `MACROS` all caps are for constants or macro functions that insert their output in place of the caps. 

For both 1 and 3, if there is no match, then the text is unchanged. One can have more than one underscore for 1 and 2; this delays the substitution until another loop. It allows for the mixing of various markup languages and different processing points in the life cycle of compilation. See [logs.md](https://github.com/jostylr/literate-programming/blob/master/examples/logs.md) for an example. 

 ### Directive

A directive is a command that interacts with external input/output. Just about every literate program has at least one save directive that will save some compiled block to a file. 

The syntax for the save directive is 

    [file.ext](#name-the-heading "save: named code block | pipe commands")  

where file.ext is the name of the file to save to,  name-the-heading is the heading of the block whose compiled version is being saved (spaces in the heading get converted to dashes for id linking purposes), `save:` is the directive to save a file, `named code block` is the (generally not needed) name of the code block within the heading block, and the pipe commands are optional as well for further processing of the text before saving. 

For other directives, what the various parts mean depends, but it is always 

    [some](#stuff "dir: whatever")  

where the `dir` should be replaced with a directive name. 

 ### Pipes

One can also use pipes to pipe the compiled text through a command to do something to it. For example, `_"Some JS code | jshint"`  will take the code in block `some JS code` and pipe it into jshint to check for errors; it will report the errors to the console. We can also use pipe commands in a save directive:  `FILE "Some JS code" code.js | jstidy` will tidy up the code before storing it in the file `code.js`.

 ### Named Code Block

Finally, you can use distinct code blocks within a full block. 

Start a line with link syntax that does not match a directive. Then it will create a new code block with the following data [code name](#link "type | pipes"). All parts are optional. The link is not used and can be anything. The minimum is  [](#)  to make a new (unnamed) code block. 

Example: Let's say in heading block Loopy we have [outer loop](# "js") at the start of a line. Then it will create a code block that can be referenced by _"Loopy:outer loop".

 ## Nifty parts of writing literate programming

* You can have your code in any order you wish. 
* You can separate out flow control from the processing. For example,

        if (condition) {
            _"Truth"
        } else {
            _"Beauty"
        }
    
    The above lets you write the if/else statement with its logic and put the code in the code blocks `truth` and `beauty`. This can help keep one's code to within a single screenful per notion. 
* You can write code in the currently live document that has no effect, put in ideas in the future, etc. Only those on a compile path will be seen. 
* You can "paste" multiple blocks of code using the same block name. This is like DRY, but the code does get repeated for the computer. You can also substitute in various values  in the substitution process so that code blocks that are almost the same but with different names can come from the same root structure. 
* You can put distracting data checks/sanitation/transformations into another block and focus on the algorithm without the use of functions (which can be distracting). 
* You can use JavaScript to script out the compilation of documents, a hybrid of static and dynamic. 

I also like to use it compile an entire project from a single file, but a literate program can load external files thus allowing one to split a project into any kind of setup desired. 

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE)



## TODO

Convert to event-style async. This should allow for easier hooking into the process. Create directives that allow eventing and hooking, somewhat along the lines of the define directive. 


Make sure missing blocks don't cause problems. 

Add in a toggle to enable immediate console logging from doc.log calls. 

Make sure non-existent blocks do not hang program (cname). More generally, make sure that looped references (alice calls bob, bob calls alice) do not hang program; emit doc.log problem and move on. Also have a check at the end for ready to compile docs. This should allow for saving of files that are fine and the hung up files do not get saved. 

Deal with line spacing. 

Deal with empty file -- a better reporting mechanism. 

Implement a ! tracking. Put ! at the beginning of a line--the number of marks is the level of severity of the issue. 

Add in an opt-out for file saving or a rerouting... Add to Version the ability to set various boolean flags, such as dev, deploy, ..., add an environment directive to set those things. 

Implement a literate program testing example. Also a dev, deploy version. Realized one could have a lit pro that is just a shell for files, etc., calling in the big thing. 

More docs.

Have some more preview/testing options. Maybe an abort on failed test/jshint kind of stuff and/or a diff viewer. npm diff seems popular. 


Make a proper parser of commands, directives that allows for nested parentheticals, quotes, commas, escapes
 

Using  VARS to write down the variables being used at the top of the block. Then use _"Substitute parsing:vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

 ## IDE

An in-browser version is planned. The intent is to have it be an IDE for the literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...


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
        "node": ">0.6"
      },
      "dependencies":{
        "literate-programming-standard" : ">=0.1.0",
        "commander" : "~1.1.1"
      },
      "devDependencies" : {
        "literate-programming" : "~0.7.3"
      },
      "scripts" : { 
        "prepublish" : "node ./node_modules/literate-programming/bin/literate-programming.js lp.md",
        "compile" : "node ./node_modules/literate-programming/bin/literate-programming.js lp.md"
      },
      "keywords": ["literate programming"],
      "preferGlobal": "true",
      "bin": {
        "literate-programming" : "bin/literate-programming.js"
      }
    }


## gitignore

    node_modules
    temp

## npmignore


    archive
    test
    examples
    ghpages
    fixed_examples
    temp
    node_modules
    *.md

## LICENSE MIT


The MIT License (MIT)
Copyright (c) 2013 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Change Log

v.0.7.4  Added extension restriction for use with live reload plugin

v.0.7.3 Added ability to specify output directory as a second argument after file. 

v.0.7.1 Added the ability to have a (single) plugin file called lprc.js. logs.md now uses it as an example. 

v.0.7.0 

Implemented link syntax for directives and type switching.

Implemented templates using asterisk notation. 

Added a postCompile function to have postCompile actions even if no file is being saved. 

Implemented being able to use a literate program directly as a command line program. See primes.md

Updated docs to reflex new syntax.

v.0.6.1

Implemented using underlines for headings per markdown spec.

v.0.6.0

_"Load directive"  Set it up so that LOAD works asynchronously. Multiple LOADs are handled. The property doc.loading holds which documents are being loaded. 

_"Cli"  Set it up so that saving, file loading,... is a function passed into the doc. This allows for a much more flexible setup

_"Doc constructor" Make it so that constructing the document parses it and compiles it and saves it. The passed in options can overwrite the behavior. There can be a callback issued once everything is done. 

_"Compile time" Make it async. Each call to a block either pulls in the compiled bit or queues up the current block. Need to store state. 

_"Process files" is a part of the document constructor. Everything about a "file" will be created and stored in compiledFiles. Now deprecated. 

_"Process actions" replaced files. This gives a stronger plugin feel. See the section for what should be in an action. These wait for the compiled code block to be compiled and then execute. 

_"Save Files", _"Preview Files", _"Diff Files"  all do their job acting on compiledFiles. 

_"Doc commander", _"Pipe Processor" have been converted to supporting asynchronous callbacks. 