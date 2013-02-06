# Literate Programming

"Its like writing sphagetti code then shredding the code into little pieces, throwing those pieces into a blender, and finally painting the paste onto an essay. Tasty!"

This is the sixth cycle of literate programming. Here we implement a more asynchronous environment, particularly during the compile stage. 

VERSION literate-programming | 0.6.0-pre


## Directory structure

The bulk of the work is in the node module. That has all the core weaving. It also hasthe ability to load other literate programs / directives which ties it currently to the file system. 

FILE lib/literate-programming_v6.js  | the lp module  | jshint | jstidy

---

The literate program compiler is activated by a command line program.


FILE bin/literate-programming_v6.js | cli | jshint

---

The standard README.

FILE README.md | readme | clean raw

---

The requisite package file for a npm project. 

FILE package.json | NPM package : json | jshint

---

A list of growing and shrinking items todo.

FILE TODO.md | todo  | clean raw

---

The MIT license as I think that is the standard in the node community. 

FILE LICENSE | license-mit  | clean raw

---

FILE blog.md | Blog doc | clean raw

## How to write a literate program

Use markdown. Each heading is a new block and can be referenced by using _"title". This substitution has more features, documented below. 

Within each block, one can write directives and/or initiate a type change in the coding blocks by starting a line with capital letters. 

For example, to say that a file should be saved from the block's text, one can write FILE filename type
where type states which named internal block to start with; it is optional if there is only one internal code block. 

In addition, a jump of two levels or more in the heading yields heading directives that pertain to just the parent block. All caps inside a code block is a constant and/or macro. 


### Runnable Code

One should also be able to run JavaScript code directly in the interpreter. I think a decent convention would be underscore backtick code  backtick.        

    _ `javascript code`

The eval output (last evaluated value) is what is placed in the code to replace the backtick call.

To eval long blocks of code (the above is limited to a single line), use the pipe syntax:  _"Some block||eval()"  

We use two pipes as the second part should be a type/name of codeblock if needed, e.g.,  _"Some block|js|eval()"  

Within the parenthetical can be an expression that should be evaluated to start the block. 

### Full pipe syntax

The substitution expression should be of the form "block name|internalname.ext|command(arg1, arg2)|commmand2(...)|..."

Examples:  _"Great:jack|marked",  _"Great:md",  _"Great|marked", _"Great:jack.md",  ":jack"  will load the internal block named jack


### Multi-level substitutions

There may be need to run substitutions after a first pass or more. For example, compiling a jade template into html and then running the substitutions that put in the text of the template. 

The number of underscores gives which loop number the substitution happens. In other words, for each loop iteration, one underscore is removed until only one is left at which point the substitution is made. 

Example:

    #example
        _"nav jade"
        #text
             __"markdown text"
    

## Structure

The program is structured into a module file and a command line file. 

The command line file's structure is in section "Cli" while the module file, which is the heart of the code and designed to work-in browser eventually, is in "LP module"


## The lp module

This module takes in a literate program as a string of markdown and possibly some options (not used yet). 

It takes the string and makes a document that has the markdown parsed out into various blocks. The parsing is down line-by-line. The two main calls are `lineparser` which parses the lines, creating the document,  and the `makeFiles` command which will compile the blocks in the `files` array to a full string that can then be saved or whatever (that's what the command line does). 


This current uses the filesystem to load external programs. This needs to be refactored, but it will require some async rejiggering.

JS  

    /*global require, module, process*/
    /*jslint evil:true*/

    var fs = require('fs');


    _"Utilities"


    var Block, Doc, repo = {plugins : {}, litpro :{} }; 



    _"Document constructor"

    _"Block constructor"

    module.exports.Doc = Doc;


We also need a repository for files that are loaded up, both literate programs and plugins. The same repo will be seen in all instances of Doc; this prevents multiple uploading and parsing of the same file. I see no reason for not having it globally accessible. 



## Document parsing

Each literate program gets its own document style. It starts off life with lineparser. 

Each line is of one of four basic types:

1. Header. This signifies a new block. If it jumps in level by two or more levels, then it is considered an internal block instead of a new independent block. Thus, it is attached to the parent and is not seen from the outside. Think tests and examples. 
2. Code line. This is a line indented with 4 spaces (maybe a tab?) If that is true, it gets put into the code block of the current type. 
3. Directive/Type switch. If a line starts with all caps or a ., then it has the potential to be a directive (such as FILE command)  or a to switch the code block to a new type or name. What happens is very dependent on what is found there.  
4. Plain text. This just is for reading and gets put into a plain text block without it being useful, presumably. 

All lines in a block do get put into storage in order for safe-keeping (some raw output, for example, could be useful).

### Parse lines

This is the function that takes in a literate program, splits it into lines, and parses them, returning a structure for compilation. 

The Document consists mostly of blocks constructed by the Block constructor. The doc.processors is where the magic happens. 

This is largely synchronous. The directives can create hooks that prevent the compiling stage from beginning. The main cause of this is the LOAD directive. Those files will be loaded asynchronously and will register themselves as loading and prevent compilation until they are loaded. See the LOAD directive. The REQUIRE command is synchronous and will block until it is loaded. 

JS

    function () {
        var doc = this;
        var i, line, nn; 

        var lines = doc.litpro.split("\n");
        doc.cur.level = 0; 
        var n = lines.length;
        for (i = 0; i < n; i += 1) {
            line = lines[i];
            nn = doc.processors.length;
            for (var ii = 0; ii < nn; ii += 1) {
                if (doc.processors[ii](line, doc) ) {
                    doc.cur.full.push(line);
                    break;
                }
            }
        }

        _"Head parser:Remove empty code blocks"

        _":Check for compile time"

        return doc;
    }

Each processor, corresponding to the 4 types mentioned above, will check to see if the line matches its type. If so, they do their default action, return true, the line is stored in the full block for posterity, and the other processors are skipped. 


The substitution is to make sure the final block is also trimmed. 

JS Check for compile time

    if (Object.keys( doc.loading ).length === 0) {
        console.log("compile");
       doc.compile();
    } else {
        console.log(doc.loading);
    }


### Default processors

The processors array, a property of the Document, allows us to change the behavior of the parser based on directives. They should return true if processing is done for the line. The argument is always the current line and the doc structure. 

JS

    [ 
    _"Code parser", 
    _"Head parser", 
    _"Directives parser", 
    _"Plain parser" 
    ]



### Code parser


We look for 4 spaces of indentation. If so, it is code and we store it in the current block's code block for the current type. 

Note that tabs do not trigger a code block. This allows for the use of tabs for multiple paragraphs in a list. The tab then 4 indents does trigger code. That's where the insanity stops. 

JS

    function (line, doc) {
      var cur = doc.cur;
      var reg = /^(?: {4}|(?:\t {4}))(.*)$/;
      var match = reg.exec(line);
      if (match) {
        cur.code[cur.type].push(match[1]);
        return true;

      _":Add empty line"
        
      } else {
        return false;
      }
    }


Added the following clause to add empty lines to the code. Stuff before and after the code block is probably trimmed, but in between extra lines could be added. This was to enable blank lines being there which is important for markdown and other markup languages. 

JS Add empty line 

      } else if (line.match(/^\s*$/)  ) {
        var carr = cur.code[cur.type];
        if (carr && carr.length > 0 && carr[carr.length -1 ] !== "") {
            cur.code[cur.type].push(line);
        }
        return false; // so that it can be added to the plain parser as well




### Directives parser

A directive will be recognized as, at the start of a line, as all caps and a matching word. This may conflict with some uses, but it seems unlikely since if there is no matching directive, then the original is left untouched. 

A space in front would defeat the regex as well. Periods are also allowed. At least two capital letters are required.

A directive could also be a type switch command. This is either a recognized type or it should start with a period. While the post directive part of a directive is passed on freely to the directive function, the post type text should be of a specific form, namely,  a name for the section followed by a pipe string of commands, all of which is optional. 


The function takes in a line and the doc structure. It either returns true if a successful directive match/execution occurs or it returns false. The directives object is an object of functions whose keys are the directive names and whose arguments are the rest of the line (if anything) and the doc object that contains the processors and current block structure. 


JS

    function (line, doc) {

        _":period triggers match" 

      var reg = /^([A-Z][A-Z\.]*[A-Z])(?:$|\s+(.*)$)/;
      var options, name;
      match = reg.exec(line);
      if (match) {
        name = match[1].toLowerCase();
        if (doc.directives.hasOwnProperty(name)) {
            options = (match[2] || "").split("|").trim();
            doc.directives[name].call(doc, options);
            return true;
        } else if (doc.types.hasOwnProperty(name) ){
            doc.switchType(match[1], match[2]);
            return true;   
        } else {
            return false;
        }
      } else {
        return false;
      }
    }

The starting period for a type change trigger may or may not be followed by capitals. Any . starting a line will be interpreted as a type switch. 


JS period triggers match

      var fileext = /^\.([A-Z]*)(?:$|\s+(.*)$)/;
      var match = fileext.exec(line);
      if (match) {
        doc.switchType(match[1], match[2]); 
        return true;
      }



### Switch type 

Here is the function for switching the type of code block one is parsing. The syntax is the type (alread parsed and passed in) and then name of the block followed by pipes for the different functions to act on it. If there is no name, then use a pipe anyway. Examples:  `JS for running | run  ` or  `JS | hint`

Anything works for the name.

JS main

    function (type, options) {
        var doc = this;
        var cur = doc.cur;

        type = type.toLowerCase(); 
        if (typeof options === "undefined") {
            options = "";
        }
        options = options.split("|").trim();
        var name = options.shift();
        if (name) {
            name.trim();
            cur.type = name.toLowerCase()+"."+type;
        } else {
            cur.type = "."+type;
        }

        if (! cur.code.hasOwnProperty(cur.type) ) {
            cur.code[cur.type] = doc.makeCode();
        }

        var codearr = cur.code[cur.type];

        var passin = {doc:doc, block:cur, type:type, name:name, state:{}}; // for command stuff

        _":Parse options"

    }

JS Parse options

And now we work on get the options to parse. The syntax is an optional number to indicate when to process (0 for pre, 1+ for during, nothing for post), followed by whatever until parentheses, followed by optional arguments separated by commas. Examples: `0 marked (great, file)` and `marked` and `marked awesome(great)`

        
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

JS Add command

The setup is that the code array has a property named commands which is an associative array of arrays. Each array contains a function and an arguments array that will be used to work on the code (see Full Substition). The doc.commands object has the list of active functions that can be named and used. 

            if (match[1]) {
                ind = parseInt(match[1], 10);
            } else {
                ind = "Infinity";
            }

            if ( doc.commands.hasOwnProperty(funname) ) {
                
                if (codearr.commands.hasOwnProperty(ind) ) {
                    codearr.commands[ind].push([doc.commands[funname], funargs, passin]);
                }  else {
                   codearr.commands[ind] = [[doc.commands[funname], funargs, passin]];
                }             
            }


I toyed with categorizing the commands by type, but since the different transformations by change its type and it is even harder to figure out with the substituion pipes, it seems best to use a global namespace. 


### Head parser

We recognize a heading by the start of a line having '#'. 

For new global blocks, we use the heading string as the block name. We lower case the whole name to avoid capitalization issues (it was really annoying!)

JS

    function (line, doc) {
      var level, oldLevel, cur, name;
      var head = /^(\#+)\s*(.+)$/;
      var match = head.exec(line);
      if (match) {
        name = match[2].trim().toLowerCase();
        oldLevel = doc.level || 0;
        level = match[1].length;

        _":Remove empty code blocks"

        cur = new Block();
        cur.name = name;
        cur.type = doc.type;    
        cur.code[cur.type] = doc.makeCode();
                
        doc.blocks[name] = cur; 
        doc.cur = cur; 
        doc.level = level;
        doc.name = name;
        // new processors for each section
        doc.processors = [].concat(doc.defaultProcessors);
        
        return true;
      } 
      return false;
    }

In the above, we are defining the default processors again fresh. This prevents any kind of manipulations from leaking from one section to another. It could be a performance penalty, but probably not a big deal. Garbage collection should remove old processors. 

JS Remove empty code blocks

We do not want empty code blocks left. So we delete them just before we are going to move onto a new processing section. 

    var cname;
    var old = doc.cur; 
    for (cname in old.code) {
        if (old.code[cname].length === 0) {
            delete old.code[cname];
        }
    }


This suffered from having empty lines put into the code block. Solution: do not add empty lines in "code parser" unless there is a non-empty line of code before it. Has an issue that this does not apply to the final block as it refers to the previous block. 


### Plain parser

It means there is nothing special about the line. So we simply add it to the plain block because, why not?

JS
    function (line, doc) {
      doc.cur.plain.push(line);
      return true;
    }



## Constructors 

We have a few prototypes we use. The main one is the Doc constructor which is what a literate programming string gets turned into. 

We also create a Block object for each section of a literate program. Within that block, we have code blocks created which are augmented arrays and not a proper prototyped object. 

### Document constructor

JS

    Doc = function (md, options) {

        this.litpro = md; 
        this.blocks = {};
        this.cur = new Block();
        this.files = [];
        this.compiledFiles = {};
        this.logarr = [];
        this.subtimes = 0;
        this.type = ".";


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
        this.parseLines();  // which then initiates .compile().process().end(); 

        return this;
    };

    Doc.prototype.defaultIndent = "    ";

    Doc.prototype.maxsub = 1e5;

    Doc.prototype.oneSub = _"One cycle of substitution:main";
    Doc.prototype.fullSub = _"The full substitution";

    Doc.prototype.defaultProcessors = _"Default processors";

    Doc.prototype.switchType = _"Switch type:main";

    Doc.prototype.makeCode = _"Make code block";

    Doc.prototype.trimCode = [function (code) {
        return code.trim();
    }, [], {}];

    Doc.prototype.log = function (text) {this.logarr.push(text);};

    Doc.prototype.parseLines = _"Parse lines";

    Doc.prototype.getBlock = _"Get correct code block:main.js";
    
    Doc.prototype.compile = _"Compile time";

    Doc.prototype.addConstants = _":Make constants";

    Doc.prototype.wrapVal = _":Wrap values in function";

    Doc.prototype.piping = _"Pipe processor";

    Doc.prototype.addMacros = _":merge | substitute(OBJTYPE, macros)";

    Doc.prototype.addCommands = _":merge | substitute(OBJTYPE, commands)";

    Doc.prototype.addTypes = _":merge | substitute(OBJTYPE,types)";

    Doc.prototype.addDirectives = _":merge | substitute(OBJTYPE,directives)";

    Doc.prototype.addPlugins = _":add in plugins";

    Doc.prototype.process = _"Process files";

    Doc.prototype.end = _"End process";

JS Merge in options

In order to have more custom behavior, such as linking in behavior for visual editing, we want to be able to pass in options to the functions. 

We have just created the doc object. Now we take it and merge it in with the options object. 

    if (options) {
        var key;
        for (key in options) {
            this[key] = options[key];
        }
    }

JS Types

We use file extensions as keys and we provide the mime type for the kind which may be useful for CodeMirror and the IDE or for serving content directly from a server without files or ???

    {
        "" : "text/plain",
        css: "text/css"
    }    

JS Make constants

    function (obj) {
        var doc = this;
        var name;
        var newobj = {};
        for (name in obj) {
            newobj[name] = doc.wrapVal(obj[name]);
        }
        doc.addMacros(newobj);
    }

JS Wrap values in function

    function (val) {
        return function () {
            return val;
        };
    }


JS Merge

This handles adding properties to macros, commands, etc.. The value of OBJTYPE needs to be substituted in. 

    function (newobj) {
        var doc = this;
        var oldobj = doc.OBJTYPE;
        var name;
        for (name in newobj) {
            if (oldobj.hasOwnProperty(name) ) {
                doc.log("Replacing " + name);
            }
            oldobj[name] = newobj[name];
        }
    }

JS Add in plugins

This is laregly for loading the standard library. 

    function (plugobj) {
        var doc = this;
        if (!plugobj) {
            return false;
        }
        var type; 
        for (type in plugobj) {
            if ( (plugobj.hasOwnProperty(type)) && (typeof plugobj[type] === "function")) {
              plugobj[type](doc); //each one is responsible for modifying
            }
        }
        return true;
    }

JS Async structures

We need some storage structures for the async aspect of LOADing and compiling. 

The loading object will keep track of which files are loading and we will delete them when the file is loaded. When all are deleted, then the doc is ready to be compiled. 

The call array contains functions that should be called. It is last in, first out. 

We also need a function that will run the calls. 

        this.loading = {}; // for the LOAD and compile
        this.loaded = {}; // can reference this for external litpro by names. 
        this.waiting = {}; // place to put blocks waiting for compiling
        this.processing = {}; // place to put blocks waiting for processing
        this.call = [];  // a list of functions to call upon a resume



#### Doc commander

This takes in array of commands to execute on the code. Each element of the array is [function, args, calling object]

JS

    function (commands, code) {
        var i, n=commands.length, command; 
        for (i = 0; i < n; i += 1) {
            command = commands[i];
 
            code = command[0].call(command[2], code, command[1]);  //if performance is issue, check here
        }

        return code;
    }



#### Make code block

We need an array of the code lines and a property that holds any processing functions to use during the substitution phase.

JS

    function () {
        var doc = this;
        var ret = [];
        ret.commands = {0: [ doc.trimCode ]};
        return ret;
    }


#### Process files
    
Given array of name and text, save the file. dir will change the directory where to place it. This should be the root directory of all the files. Use the filenames to do different directories. 

JS

    function () {
        var doc = this;

        var files = doc.files;
        var cFiles = doc.compiledFiles = {};
        var file, block, fname, compiled, text, litpro, headname, internal, fdoc;  
        var i, n = files.length;
        for (i=0; i < n; i+= 1) {
            file = files[i];
            fname = file[0];
            litpro = file[1][0];
            headname = file[1][1];
            internal = file[1][2];
            _":check for block existence"
            compiled = block.compiled; 
            text = fdoc.getBlock(compiled, internal, fname, block.name);
            text = fdoc.piping.call({doc:fdoc, block: fdoc.blocks[block.name], name:fname}, file.slice(2), text); 
            cFiles[fname] = text;
        }

        _":Check for processing done"

        return doc;
    }


JS Check for block existence

First we check whether there is an external literate program trying to be used. We either assign it or doc to fdoc. Then we load up the block with headname. The internal block name is left to another portion. 

            if (litpro) {
                if (doc.repo.hasOwnProperty(litpro) ) {
                    fdoc = doc.repo[litpro];
                } else {
                    doc.log(fname + " is trying to use non-loaded literate program " + litpro);
                    continue;
                }
            } else {
                fdoc = doc;
            }
            if (headname) {
                if (fdoc.blocks.hasOwnProperty(headname) ) {
                    block = fdoc.blocks[headname];
                } else {
                    doc.log(fname + " is trying to load non existent block '" + headname + "'");
                    continue;
                }
            } else {
                doc.log(fname + " has no block " + litpro + " :: " + headname);
                continue;
            }


JS Check for processing done

    if (Object.keys( doc.processing ).length === 0 ) {
        doc.end();
    }   

#### End process

JS

    function () {
        
        var doc = this;
        var pc = doc.postCompile;
        var i, n = pc.length, fun, obj;
        for (i = 0; i < n; i += 1) {
            fun = pc[i][0];
            obj = pc[i][1];
            fun.call(doc, obj); 
        }

        return doc; 
    }

### Block constructor

This just creates a basic structore for a block that corresponds to a heading and the rest. The code property is the most useful and it is an object whose keys correspond to the name.type of each code block, each block being an array of lines as created in "Make code block".

JS

    Block = function () {

        this.code = {};
        this.full = [];
        this.plain = [];

        return this;
    };




## Compile Time

We now want to assemble all the code. This function takes in a parsed lp doc and compiles each block. It will visit each block and run the fullSub method. 

Most likely, most blocks will be called within another's block compile method, but that's okay as the result is stored and short circuits the loop. 

Originally, only blocks called by FILE were compiled, but with this approach it allows for experimental blocks to be compiled with linting/testing results before being folded into the main code. Another pipe directive such as `0 nocompile` could shortcircuit the compile phase. 

This checks to see if there are any files being loaded. As they finish, they will reduce the doc.loading and call compile.

JS

    function () {
        var doc = this;

        if (Object.keys( doc.loading ).length > 0) {
            return doc;
        }
        var blockname; 
        for (blockname in doc.blocks) {
            doc.fullSub(doc.blocks[blockname]);
        }

        _":Check for time to process"

        return doc;
    }

JS Check for time to process

    if (Object.keys( doc.waiting ).length === 0 ) {
        doc.process();
    }

### Get correct code block

Each compiled block has an associative array whose keys are internal names. They may be explicitly set, such as `JS main` becomes `main.js`.  But they might also be no name or even no extension. 

So this is a function that takes in a compiled block, the internal name and the requester's name and tries to find the right segment of text. 


We need to get the right block of text. First we check if there is a request from the file directive. If not, then see if we can get the extension.

1. internal is the full name and a good match. Safest _":jack.js"
1. Check if there is only one block. If so, return it. 
2. See if internal is a known extension. Check main.ext and .ext.  _":js". Would not match jack.js. Does work with no extension as well as internal would be "" and match type "".
3. internal is the name, but without extension. Common. See if requester's extension with name matches something. If not, try default extension and then ".". If none of that works, then see if anything matches the name.   _":jack"  becomes jack.js if looked at from cool.js block. Also checked is jack.
4. If all that fails, then loop through the keys trying to match text. Unpredictable.
5. If none of that works, then look for a key of main. 
6. If that fails, grab something.


JS main
    
    function (block, internal, requester, bname) {
        var doc = this;
    
        internal = internal.toLowerCase();
        requester = requester.toLowerCase();

        // an exact match! yay!
        if (block.hasOwnProperty(internal)) {
            return block[internal];
        }

        var keys = Object.keys(block);

        // just one key
        if (keys.length === 1) {
            return block[keys[0]];
        }

        // no code segments
        if (keys.length === 0) {
            return "";
        }

        if (doc.types.hasOwnProperty(internal)) {
            // main.js
            if (block.hasOwnProperty("main."+internal) ) {
                return block["main."+internal];
            }            
            // .js
            if (block.hasOwnProperty(internal) ) {
                return block["."+internal];
            }
        }

        _":filter internal"

        if (newkeys.length === 1) {
            return block[newkeys[0]];
        }

        if (newkeys.length === 0) {
            doc.log("Name not found: " + internal + " requested from " + requester + " of " + bname);
            return "";
        }

        //so we have multiple matches to internal (internal could be "")
        // get extension from requester

       var ext = (requester.split(".")[1] || "").trim().toLowerCase();

        _":filter ext"


        if (extkeys.length === 1) {
            return block[extkeys[0]];
        }

        var finalkeys;
        if (extkeys.length > 0 ) {
            finalkeys = extkeys;
        } else {
            finalkeys = newkeys;
        }

        _":Filter main"

        if (morekeys.length > 0) {
            return block[morekeys[0]];
        }

        // pick shortest one which could be the empty name
        return block[ finalkeys.sort(function (a,b) {
            if (a.length < b.length) {
                return -1;
            } else {
                return 1;
            } 
        })[0]];

    }

JS Filter internal


        // try and find a match for the internal
        var newkeys = keys.filter(function (val) {
            if (val.match(internal) ) {
                return true;
            } else {
                return false;
            }
        });


JS Filter ext

        var extkeys = newkeys.filter(function(val) {
            if (val.match(ext) ) {
                return true;
            } else {
                return false;
            }
        });

JS Filter main

        var morekeys = finalkeys.filter(function (val) {
            if (val.match("main") ) {
                return true;
            } else {
                return false;
            }
        });



### The full substitution 

This compiles a block to its fullly substituted values.

JS

    function fullSub (block) {
        var doc = this;
        var name ; 
        var  code={}, blockCode;


Check if already compiled. If so, return that.

        if (block.hasOwnProperty("compiled") ) {
            return block.compiled;
        } else {
            block.compiled = {};
        }

Cycle through the named code blocks, doing pre compiles


        for (name in block.code) {
            blockCode  = block.code[name];
            code[name] = blockCode.join("\n");
            if (blockCode.commands.hasOwnProperty(0) ) {
                code[name] = doc.commander(blockCode.commands[0], code[name]); 
            }
        
        }

Loop through all the names in each loop over substitution runs. This allows for subbing in at just the right moment.


            var counter = 0, go=1;
            while (go) {
                go = 0;
                counter += 1;
                for (name in code) {
                    go += doc.oneSub(code, name, block);

                    blockCode  = block.code[name];
                    
                    if (blockCode.commands.hasOwnProperty(counter) ) {
                        code[name] = doc.commander(blockCode.commands[counter], code[name]); 
                    }      
                }
            }
        
Loop through the names one more time to get any post compile directives. 


        for (name in code) {
            blockCode  = block.code[name];
                    
            if (blockCode.commands.hasOwnProperty("Infinity") ) {
                code[name] = doc.commander(blockCode.commands["Infinity"], code[name]); 
            }      
            block.compiled[name] = code[name]; 
        }


        return block.compiled;
    }

 

## One cycle of substitution

So we have three basic things that we might see in code that the compiler needs to do something about:

1. Substitutions
2. Constants
3. Evaling

This is a method of a doc; it takes in a string for the code and the current block. It returns a string if replacements happened or false if none happened.

We run through the code string, matching block name/js code block/constant. We note the location, get the replacement text, and continue on. We also keep a look out for multi-level, preparing to reduce the level. 

Once all matches are found, we replace the text in the code block. We use the custom rawString method on strings to avoid the customary [replacement string](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter) replacement semantics 

We return 1 if there was a replacement, 0 if not.

For evaling, no substitutions are done. It is just straight, one line code. If evaling a block is needed use _"block to run|eval"

JS main

    function oneSub (codeBlocks, name, block) {
        
        var doc = this;

        _":Max sub limit"
        

        var code = codeBlocks[name];


        var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|(?:([A-Z][A-Z.]*[A-Z])(?:\(([^)]*)\))?))/g;
        var rep = [];
        var match, ret, type, pieces, where, comp, lower, args, otherdoc, litpro, internal, state;
        _":vars indent code"

        var blocks = doc.blocks;

        while ( (match = reg.exec(code) ) !== null ) {
            _":Process a match"
        }

        //do the replacements or return false
        if (rep.length > 0) {
            for (var i = 0; i < rep.length; i += 1) {
                if (typeof rep[i][1] === "string" ) {
                  code = code.replace(rep[i][0], rep[i][1].rawString());
                } else {
                  doc.log( rep[i][0], rep[i][1]);
                  return 0;
                }
            }
            codeBlocks[name] = code; 

            return 1; 
            
        } else {
            return 0;
        }
    }
        
JS Max sub limit

We need to regard against infinite recursion of substituting. We do this by having a maximum loop limit. 

        if (doc.subtimes >= doc.maxsub) {
            doc.log("maxed out", block.name);
            return false;
        } else {
            doc.subtimes += 1;
        }


JS Process a match

When we have a match requiring a substitution, we call fullSub which will run all of the compile cycles for what is called. 

The match could match a substitution block `match[2]`, an eval block `match[3]`, or a macro `match[4]`.  For a substitution block, it could either be external (`where`) or local.

For each valid match, we add a replacement string on the array rep for replacement after all matches have been analyzed. 
We are splitting the first part of the command as `external lit program :: heading block name : internal name . type`


    internal = ''; litpro = '';
    if (match[2]) {
        
        //split off the piping
        pieces = match[2].split("|").trim();
        where = pieces.shift().toLowerCase(); 

        if (where) {
            where = where.split("::").trim();
            if (where.length === 1) {
                where = where[0];
            } else {
                litpro = where[0];
                where = where[1];
            }
            where = where.split(":").trim();
            if (where.length === 1) {
                where = where[0];
            } else {

                internal = where[1];
                where = where[0];
            }
            if (litpro) {
                _":other documents"
            } else {
                // this doc
                if (where) {
                    if (doc.blocks.hasOwnProperty(where) ){
                        _":Matching block, multi-level"
                        comp = doc.fullSub(blocks[where]);
                    } else {
                        // no block to substitute; ignore
                        continue;
                    }
                } else {
                    // use the code already compiled in codeBlocks
                    _":Matching block, multi-level"
                    comp = codeBlocks;
                }                    
            }
        } else {
            // use the code already compiled in codeBlocks
            _":Matching block, multi-level"
            comp = codeBlocks;
        }
            
        _":Substitute parsing"

        _":indent code"

        rep.push([match[0], ret]);
                       
    } else if (match[3]) {
        // code
        _":Matching block, multi-level"
        
        rep.push([match[0], eval(match[3])]);

    } else {
        // constant
        lower = match[4].toLowerCase();
        args = (match[5]|| "").split(',').trim();
        if (doc.macros.hasOwnProperty(lower)) {
          rep.push([match[0], doc.macros[lower].apply(doc, args)]);
        }
    }



JS Matching block, multi-level

There is a match, but the level is not yet ready  for full substitution

                    if (match[1] && match[1].length > 1) {
                        rep.push([match[0], match[0].slice(1)]);
                        continue;
                    }


JS Substitute parsing


Either the substitution specifies the name.type to insert or we use the current name's type to pull an unnamed bit from the same text. If nothing, we continue. 
 
    internal = (internal || "").trim();
    ret = doc.getBlock(comp, internal, name || "", block.name); 
    state = {};
    ret =  doc.piping.call({doc:doc, block:block, name: where+(type|| ""), state:state}, pieces, ret );



JS Other documents

This is how to pull in blocks from other literate programs.

    if (doc.repo.hasOwnProperty(litpro) ) {
        otherdoc = doc.repo[litpro];
        if (otherdoc.blocks.hasOwnProperty(where) ) {
            comp = otherdoc.blocks[where].compiled; 
        } else {
            doc.log("No such block " + where+ " in literate program " + litpro);
            continue;
        }
    } else {
        doc.log("No such literate program loaded: " + litpro);
        continue;
    }



JS vars indent code

    var ind, linetext, middle, space, spacereg = /^(\s*)/;

JS indent code

We want to have an automated indentation of code that is intelligent. If we have something like `argh = _"cool"` then the first line is not indented, but the rest of the lines are indented by an additional 4 spaces (or doc.defaultIndentation). If we have ` _"cool" ` then all lines use the indentation of _"cool".

But it can be overwriten with the explicit indent command. No arguments lead to no indentation. 

    if (!state.indent) {
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

### Pipe processor

This will process the pipe commands. 

A pipe command will be any non-parenthetical (and non-pipe) string of characters followed by an optional set of parentheses with arguments to be passed in. 

If there is such a command, it is invoked with a this object of {doc, block, name} where name is the name.type of the sub-code block in block. Its arguments are the stuff in parentheses split on commas. 

This is a very simple setup which hopefully will suffice for most needs. 

JS 
    
    function (pieces, code){

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
                comarr.push([doc.commands[funname], funargs, passin]);
            } else {
                doc.log("Issue with " + com);
            }
        }

        var ret = doc.commander(comarr, code); 
        return ret;

    }



###### Example

awe is already done and so it can be fed into marked immediately and consumed.

cool gets markedup before the first substitution and then the eq is substituted in and in the second round it all is done. 

long takes three loops to compile. in the first loop, it is marked. in the second loop, long gets equation subbed in. in the third loop, it is installed. 

so the piping can process post compiled while the command switch can compile pre and during. 

HTML snip

    <p class="awesome">_":awe|marked"/p>
    <p> class="lesscool">__":cool"</p>
    <p> class="long">___":long"</p>

MD awe 

    great work **dude**

MD cool marked(0)

    totally rad _":eq"

MATH eq 

    \[\sin(x^2)*\int_5^8 \]

MD long marked(1)

    nearly done __":eq"




So we may need delayed substitutions as well here.

HTML snip

    <p>Continuing the previous snip</p>

###### Example

HTML

    <p class="cool">Need some cool color</p>

CSS

    p.cool {color:blue}

HTML jack

    <p>not called</p>

CSS jack
    p {color:red}

HTML

    <p>Also in original block.</p>

This should be a good format. Let's say it is in a section called cool. Then we can get it by _"cool"; this will pull in the HTML in an html block while it will pull in CSS in a CSS block. Any other type will pull in nothing.  But we could add in _"cool:.css"  to pull in the css block. or _"cool:jack" to get jack. If multiple jacks, then  _"cool:jack.css". Space after pipe optional. So no pipes in name.  If we had a mark down section to convert to html, then we could do _"cool:.md|marked"  Any number of processors are possible. 



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
        "version" : _"Version directive",
        "load" : _"The load directive:main",
        "require" : _"Require directive",
        "set" : _"Set Constant directive",
        "define" : _"Define Macro directive"
    }


### File directive
     
The command is `FILE fname.ext | litpro :: block name : internal name | commands...` where fname.ext is the filename and extension to use. 

The rest of the options are pipe commands that get processed 

    function (options) {
        var doc = this; 
        var headname, internalname, litpro, arr, name; 
        if (options[0] === "") {
            doc.log("No file name for file: "+options.join[" | "]+","+ doc.name);
            return false;
        } else {
            if (!options[1]) {
                options[1] = doc.name;
            } 
            name = options[1].toLowerCase();
            arr = name.split("::").trim();
            if (arr.length === 1) {
                litpro = "";
                name = arr[0] || doc.name;
            } else {
                litpro = arr[0] || "";
                name =arr[1] || doc.name; 
            }
            arr = name.split(":").trim();
            headname = arr[0] || doc.name;
            internalname = arr[1] || "";  
            options[1] = [litpro, headname, internalname];
            doc.files.push(options);            
        }
    }


### The load directive

This is to load other literate programs. It loads them, compiles them, and stores the document in the global repo where it can then be accessed using   _"name::block : internal | ..."  where the name is the name given to the literate program (full filename by default).  The format is  LOAD file | shortname 


This is being converted to async. Load the file async. The callback will parse the document and upon its completion, check to see if there are any files to be loaded. If so, then it puts a callback in the call array of the new doc to keep checking with a reference to the original document. If not files are being loaded, then it will remove itself from the load array and call the old doc's function to check for proceeding. If it is not 

We use doc.repo[name] as an array of those trying to load the file. Once loaded, they become the parents of the new doc along with any other docs calling it later on. 

The filterCompileFiles option is an array for list which files of the FILE in a lit pro to save using the inherited save function from the parent document. 

JS Main
 
    
    function (options) {
        var doc = this;
        var fname = options.shift();
        if (! fname) {
            doc.log("Error in LOAD. Please give a filename " + options.join(" | ") );
            return false;            
        }
        var name = options.shift();
        if (!name) {
            name = fname;
        }
        _":Already encountered"
        var file, i, n, par; 
        file = fs.readFile(fname, 'utf8', function (err, data) {
            var tempdoc, tempname, newdoc;
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
        });
        return true;
    }

JS Already encountered

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
        doc.repo[name] = [doc, name];
        doc.loading[name] = true;
    }



### Require directive

This is to load up macros, commands, and directives.

The file should be a node module that exports functions that take in the doc and do something to it. 

 
 REQUIRE file  | entry | entry ...


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
            for (bit in bits) {
                _":bit check and run"            
            }
        } else {
            var i, n = options.length;
            for (i = 0; i < n; i += 1) {
                bit = options[i];
                _":bit check and run"
            }
        }
    }

JS bit check and run

    if ( (bits.hasOwnProperty(bit)) && (typeof bits[bit] === "function")) {
      bits[bit](doc); //each one is responsible for modifying
    }




### Version directive


Version control directive for the literate program. Generally at the base of the first intro block. This would be useful for setting up a npm-like setup. 

    function (options) {
        var doc = this;

        doc.addConstants({docname: (options[0] || ""), 
                docversion : (options[1] || "0.0.0")});
    }

     
### Set Constant directive

Here we set constants as macros. If NAME is the name of a macro, either NAME or NAME() will return the value

    function (options) {
        var doc = this;
        if (options.length >= 2) {
            var name = options[0].toLowerCase();
            var newc = {};
            newc[name] = options.slice(1).join("|"); // a hack to undo pipe splitting--loses whitespacing
            doc.addConstants(newc);
        } else {
            doc.log("Error with SET directive. Need exactly 2 arguments.");
        }
    }

### Define Macro directive

This is where we implement defining macros in the literate program. This may be rare. Probably they are already defined in a load-in file. The setup will be that the macro will be that there is exactly one code block in the section, it is already done, and we use that as the code of the function. 

Note DEFINE should be at the end of the section. No substitutions as this is all done before compilation which is what allows the macros to be useful. It can appear anywhere, however, as parsing is unaffected by this. 

Example:   `DEFINE darken`  and in the code block above it is a function and only a function. The `this` is the document object. 

    function (options) {
        var doc = this;
        var cur = doc.cur;
        var code;
        var fname = options.shift().toLowerCase();
        if (!fname) {
            doc.log("Error with DEFINE directive. Need a name.");
            return false; 
        }
        code = cur.code[cur.type].join("\n");
        var macrof;
        eval("macrof="+code);
        var newm = {};
        newm[fname] = macrof;
        doc.addMacros(newm);
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



JS

    function (code) {
        try {
            this.state.obj = eval("(function(){"+code+"})()");
            if (typeof this.state.obj === "undefined") {
                return "";
            } else {
                return this.state.obj.toString();
            }
        } catch(e) {
            this.doc.log("Eval error: " + e + "\n" + code);
            return "";
        }
    }

### Indent 

To be able to indent the code in the final production (for appearance or say in Python), we can use this function. It takes two possible arguments: first line indent and rest indent. If just one number, it applies to the rest.


If no argument, then 

JS

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


JS

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
        var block = this.block;

        return block.full.join("\n");
    }

### Clean Raw

This is like raw, but it removes any Directives, and it removes one space from the start of a line that would otherwise match a directive or header. 

    function () {
        var block = this.block;
        var full = block.full;
        var i, n = full.length, ret = [], line;
        for (i = 0; i < n; i += 1) {
            line = full[i];
            if (line.match(/^(?:\#|\.[A-Z]|[A-Z]{2})/) ) {
                continue;
            }
            if (line.match(/^ (?:\#|[A-Z.])/) ) {
                ret.push(line.slice(1));
            } else {
                ret.push(line);
            }
        }
        return (ret.join("\n")).trim();
    }


### Stringify 

If one is trying to insert a long text into a JavaScript function, it can have issues. So here is a little helper command that will split new lines, escape quotes, and then put it out as an array of strings joined with new lines.

JS 

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
    var program = require('commander');
    var fs = require('fs');
    var Doc = require('../lib/literate-programming_v6').Doc;

    _"Command line options"

    var postCompile = [];

    //postCompile.push([function (doc) {console.log(doc);}, {}]);

    if (program.preview) {
        postCompile.push([_"Preview files", {}]);
    } else if (program.diff) {
        postCompile.push([_"Diff files", {dir:dir}]);
    } else if (program.saveAll) {
        postCompile.push([_"Save files", {dir: dir}, "inherit"]);
    } else {
        postCompile.push([_"Save files", {dir: dir}]);
    }

    var standardPlugins; 

    if (!program.free) {
        standardPlugins = require('literate-programming-standard');
    } else {
        standardPlugins = {};
    }

    if (!program.quiet) {
        postCompile.push([_"Cli log", {}, "inherit"]);
    }


    var doc = new Doc(md, {
            standardPlugins : standardPlugins,
            postCompile : postCompile, 
            parents : null,
            fromFile : null
    });



#### Save Files 


    function (obj) {
        var doc = this;
        process.chdir(originalroot);
        if (obj.dir) {
            process.chdir(dir);
        }            
        var files = doc.compiledFiles;
        var fname;
        var cbfact = _":Callback Factory";
        for (fname in files) {
            fs.writeFile(fname, files[fname], 'utf8', cbfact(fname));
        }

    }

JS Callback Factory

Information about what happened with the file writing. 

    function (fname) {
        return function (err) {
            if (err) {
                console.log("Error in saving file " + fname + ": " + err.message);
            } else {
                console.log("File "+ fname + " saved");
            }
        };
    }


#### Preview files

This is a safety precaution to get a quick preview of the output. 

    function () {
        var doc = this;
        var files = doc.compiledFiles;
        var fname, text;
        for (fname in files) {
            text = files[fname];
            console.log(fname + ": " + text.length  + "\n"+text.match(/^([^\n]*)(?:\n|$)/)[1]);
        }
    }


#### Diff files

This is to see the changes that might occur before saving the files. 

Currently not working

    function (obj) {
        var doc = this;
        process.chdir(originalroot);
        if (obj.dir) {
            process.chdir(dir);
        }  
        var files = doc.compiledFiles;
        var fname;
        for (fname in files) {
            console.log(fname + " diff not activated yet ");
        }
    }



### Cli log

This is where we report the logs. 

    function () {
        var doc = this;
        console.log(doc.logarr.join("\n"));
    }

### Command line options

Here we define what the various configuration options are. 

The preview option is used to avoid overwriting what exists without checking first. Eventually, I will hookup a diff view. There might also be a test-safe mode which runs the tests and other stuff and will not save if they do not pass. 

    program
        .version('0.1')
        .usage('[options] <file>')
        .option('-o --output <root>', 'Root directory for output')
        .option('-i --input <root>',  'Root directory for input')
        .option('-r --root <root>', 'Change root directory for both input and output')
        .option('-p --preview',  'Do not save the changes. Output first line of each file')
        .option('-f --free', 'Do not use the default standard library of plugins') 
        .option('-d -diff', 'Compare diffs of old file and new file')
        .option('-s -saveall', 'Save all externally literate program files as well')
    ;

    program.parse(process.argv);

    if ((! program.args[0]) ) {
        console.log("Need a file");
        process.exit();
    }


    var dir = program.dir || program.root; 
    var indir = program.change || program.root;
    var originalroot = process.cwd();
    if (indir) {
        process.chdir(indir);
    }

    var md = fs.readFileSync(program.args[0], 'utf8');




## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)

Also of invaluable help with all of this is [RegExpr](http://www.regexper.com/)

## README


literate-programming
====================

Write a program using markdown to write out your thoughts and the bits of code that go with those thoughts. This program weaves the bits together into usable fiels. 

 ## Installation

    npm install -g literate-programming

 ## Using

The command installed is literate-programming and it has some command flags and one primary argument which is the markdown document containing the program, or at least the structure of the project. 

    literate-programming sample.md 

will create the files specified in sample.md

 ### Command flags

-o --output < root> : Root directory for output
-i --input < root> : Root directory for input
-r --root < root> : Change root directory for both input and output
-p --preview : Do not save the changes. Output first line of each file
-f --free : Do not use the default standard library of plugins
-d -diff : Compare diffs of old file and new file


 ## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level) demarcates a full block. Any code blocks within a full block are concatenated together and are the code portion of the block. 

Each code block can contain whatever kind of code, but there are three special syntaxes (space between underscore and quote should not be present; it is there to avoid processing): 

1. _ "Block name" This tells the compiler to compile the block with "Block name" and then replace the _ "Block name" with that code.
2. _ `javascript code`  One can execute arbitrary javascript code within the backticks, but the parser limits what can be in there to one line. This can be circumvented by having a block name substitution inside the backticks. 
3. CONSTANTS/MACROS all caps are for constants or macro functions that insert their output in place of the caps. 

For both 1 and 3, if there is no match, then the text is unchanged. One can have more than one underscore for 1 and 2; this delays the substitution until another loop. It allows for the mixing of various markup languages and different processing points in the life cycle of compilation.

Outside of a code block, if a line starts with all caps, this is potentially a directive. For example, the `FILE` directive takes the name of a file and it will compile the current block and save it to a file. 

If a heading level jumps down by two or more levels (say level 2 going to level 4), then this is also a potential directive. It allows for the use of a TEST section, for example, that can automatically run some tests on a compiled block.

 ## Nifty parts of writing literate programming

You can write code in the currently live document that has no effect, put in ideas in the future, etc. Only those on a compile path will be seen. 

You can have your code in any order you wish. 

You can "paste" multiple blocks of code using the same block name. 

You can put distracting data checks/sanitation/transformations into another block and focus on the algorithm without the use of functions (which can be distracting). 

You can use JavaScript to script out the compilation of documents, a hybrid of static and dynamic. 

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE)

## Blog Doc

I wrote a [program](https://github.com/jostylr/literate-programming) that implements [Knuth's literate-program](http://literateprogramming.com/)  idea.

The motto is: "Its like writing sphagetti code then shredding the code into little pieces, throwing those pieces into a blender, and finally painting the paste onto an essay. Tasty!"

 ## Installation

To install and run, you currently need to install [node/npm](nodejs.org). Then you can do `npm install -g literate-programming`. This installs a command line function which will take in a literate markdown program and produce the files of a "program". 

 ## Basic Use Case

Writing programs is the original reason. You can write the idea, reasoning, and code all in one document. More importantly, one can break the code up into any sensible blocks that you like and reorder them. One can also do various substitutions and run them through commands that can make doing annoying things less so. 

Perhaps the most important part is to be able to have diffrent levels of structure to the code. It is, in some ways, an outlining tool. Programming in JavaScript involves a number of different flow controls, such as loops and conditionals. With literate programming, one can write the overall flow in one block, leaving informative names for the stuff that should be done in the various parts. As an example: 

    if (UNDEFINED(retirement) ) {
        _"Send Money Book"
    } else {
        _"Contribute to fund"
    }

So in that block, we use an UNDEFINED macro which expands to  `typeof retirement === "undefined"`  (a bit of annoying JS var checking)  and then we do two different things, which refer to other code blocks, one of which might look like:

    JS Contribute to fund

        contribution = retirement.amount / years;
        myaccount.transfer(retirement.account, contribution);

Either section of code could come first. Indeed, a big advantage of literate programming is that one can write anything anywhere. Yes, languages allow some reordering of the code by using functions, but in literate programming, any line can be written anywhere. There is no having to create a file or find a file or figure out which file something goes in. One just starts writing. And then later on, one can link it all up again. 

Another great feature is that one can create whole new portions of code without invalidating the program in the meantime. I often found that while adding something, the program would become unusable. Here, just do not link the code until it is ready. One can lint it, test it, and inspect it all before throwing it into the normal code. 

 
 ## Other Prospective Uses. 

Moving a little beyond programming, one could create webpages or whole websites from a single or a few literate programming documents. One needs to be careful with mingling of concerns, but this gives the power of decision to authors. Right now, one has to write separate html, css, javascript, and server-side code files. Depending on the need, it may make more sense to break it into widgets. So if we wanted to code up a little chat widget, we could write the  html structure, a little css, a little javascript and ajaxy thing going to the server-side where the relevant logic is implemented. All of this, including the server code, could be done in one file instead of buried in four files filled with irrelevant material from the rest of the website. This literate program module could then extract all those code bits and place them in whatever files one needed them placed. 

We could also write documents in this fashion. When writing an article, for example, one could write down a bunch of ideas and facts that would not go into the published article, but it might be nice to keep them around. And if someone really wanted to get more on your article, you could send them the literate program which would have all of that in it. You could also write multiple articles from one document, say a teaser article,  a more in-depth article, and even a chapter of a book. It keeps together relevant ideas. 

A blog is another use for this setup. I envision a blog literate program setup to be organized by categories as the separate files. Each blog entry would be in the file of its category. This is an evolution of the static website generators. One could even use it to style the different categories differently, if one wished to do so. 

As part of the writing, one could also create material dynamically while compiling the literate program. So instead of doing computations and copying/pasting results, one could put the computations in the literate program, run the program, and generate a compiled document with fresh computations. Something like this already exists for special uses, such as [Sweave](http://www.stat.uni-muenchen.de/~leisch/Sweave/),  but this would allow the use for any combination of programming and document generation needed. 

For me, this is about having control over my flow of work. I can collect everything in one place, in any order desired, labelled in any fashion I desire.

 ## Examples

The biggest example to date is the [literate-programming module](https://github.com/jostylr/literate-programming/blob/master/lp5.md) itself. I wrote it in such a way that it compiles itself. That took a bit of effort, but it gave me the instant feedback I needed to get the syntax right (I hope). 

A sample document is in examples/logs.md. It compiles to a html fragment for adding to a blog engine and to an html document for a stand-alone viewing.  It produces a table of factorials using JavaScript written in the document itself; the document's JavaScript generates an array and then the common command htmltable parses that array into an HTML table.

There hopefully will also be an example of a literate program that computes something (say factorials) and a separate literate program that runs tests on the various code bits. 

 ## Experience So Far and Prospects

I have enjoyed writing a non-trivial program in literate programming fashion. I found myself able to follow the flow of the program much more readily. I also found that as I was adding bits "to just get it working", I would split off chunks to somewhere else to maintain understanding the strucuture. A good rule of thumb is that a block of code should fit comfortably in the screen. 

I do intend to create a browser-based IDE. This will help, but I have been surprised at how easy it is to navigate already with nothing but a plain text editor. The find command works wonders. I generally have unqiue snippets of code or use the block names. 

Since my editor thinks the document is markdown, I have had no syntax highlighting or other goodies. But I find this is not really a problem. With focused chunks of code, it seems fairly easy to write code and keep it in human-RAM. But I do look forward to using an editor that will understand the relevant syntax and highlight it for me. 

There are a few other things to work on, notably the ability to declare whether to push production code or just do dev code. I want pretty much all my steps to be codified in the literate program itself as much as possible. 

Another thing I am looking forward to in the IDE is the ability to have special values that I could adjust in some intelligent fashion. So for example, a macro such as  RANGE(x, 5, 10, 1, 7)  to mean that the variable x could take on values from 5 to 10 with a step of 1 and a default of 7. And then in the IDE, there could be a slider associated with x and one could see the impact of the value on the compiled output. There would be a save command that could then write down the value to be used and a suitable history developed. Or a macro of GRID(x, 5, 10) that might make a editable spreadsheet grid 5x10 whose values are put into a matrix-array and then assigned to x. These would be powerful notions, inspired by [Bret Victor](http://worrydream.com/)

By the way, this document is also in the literate programming document. If I wanted to, I could pull in example code from the document itself, ensuring that it stayed up-to-date. 

 ## Futher reading

For more on literate programming, I recommend this question on [SO](http://stackoverflow.com/questions/2545136/is-literate-programming-dead)

I particularly like the quote that the only people who use lit pro are those that develop a system to do so. Why not? This is about someone taking over their development flow. Perhaps someone will use this, but if not, well, it works for me to make awesome stuff -- I hope. 



 ## Documentation

Write a markdown document. See the [syntax](http://daringfireball.net/projects/markdown/). What we use is the headings with number signs to indicate new text blocks and the 4-space indents to indicate code blocks within a text block. 

Each heading will be parsed as the name of the text block and is key to referencing. You should not use `| :`. 

 ### Text Block

Within a text block, there are directives and types as possible special commands. Both involve capital letters and/or periods. 


 #### Directives
A directive has the form of  `DIRECTIVE arg1 | arg2 | ...`  where the args used depend on the directive. It can have periods in the middle to allow for a kind of name-scoping. 

Example:  `FILE package.json | NPM package : json | jshint`  at the beginning of a line. 

 #### Type

A type is `TYPE  code block name | # command1(arg1, arg2, ...) | command2 ....`  where the TYPE should be a known type, such as JS, or an unknown one using a period: `.NEW`. The code block name should be descriptive but it should not contain `| :`  Commands can be, with white space, anything except `| ( `, but they can also be followed by optional arguments with the parentheticals being optional if there are no arguments. The arguments are plain text passed into the command; no `| , )`  

Example: `JS Wrap values in function`  says it is a JS block with name `Wrap values in function`

The # in front of the command is optional. If not there, the command is invoked after all substitutions are made. If a 0 is there, then it is invoked before any substitutions are made. A positive integer says which loop of the substitution cycle it should be applied to. 

Example: `MD main |1 marked`  says to invoke the marked function on the code block named main after 1 cycle of substitution. In this instance, it is hiding conflicting markup from the marked function. To do this, one needs 2 or more underscores so that the substituion is done after the initial marking. 

 #### Breaking Code Blocks

 One can intersperse text and code freely. The line parser adds any code line to the current code block. A TYPE switch creates a new code block and further code will be added to that one. 

 A new textblock creates a new code block associated with that textblock. 

 ### Code Block

In the code block, there are code block substitutions, evaluated code, and macro substitutions. 

Each underscore substitution can be longer than one underscore in front. The number of underscores corresponds to which loop of the substitution cycle it will come in to play. This is useful for hiding conflicting markup.

 #### Block Substitutions

A code block substitution is of the form `_"litpro :: text block name : code block name . type  | command(arg1, arg2) | ... `  

The litpro is the literate program name that has been LOADed. If omitted (and the ::) then it defaults to the current doc which is the usual case. 

The text block name can pick out any defined text block. If omitted, it defaults to the current one. 

The code block name refers to just the code blocks in the selected text block. If omitted, then eithr `main` or an unamed code block is pulled. The optional type will be used to distinguish multiple code blocks with the same name or no name. For example, in one textblock, one might define little bits of html, css, and js with three external text blocks pulling them in. 

An entirely empty name could be a problem. At least use a :. 

After the name is a series of optional commands using pipes. They will be applied to the final compiled code block, in sequence, each command receiving the code block and being able to share a state object in the `this`. 

See [literate-programming-standard](https://github.com/jostylr/literate-programming-standard) for information on commonly available commands and developing a command. 
 
 #### Evaluated Code

An eval'd line is _ &#x60;code&#x60;  (md uses backtick to highlight inline code so it is rather hard to display.  This should be written on a single line. The code will get evaluated and its result will replace the sub bit. 


 #### Macro Substitutions

All caps will trigger a macro lookup. This has potential conflicts, but is also remniscent of constants in programming languages. If there is no match, then nothing is done. 

A macro can be a value or a function. Actually, values are wrapped to be a function too.

Example `JQUERY(1.8.0)`  could produce the script tag pointing to the Google CDN for 1.8.0.  If one used `JQUERY` alone, it could default to 1.9.0. One has to define the macro to do this. 

Defining it requires a new text block and a code block written out with just a function as content. After it is done, use the directive `DEFINE name` No substitutions are made in this code block as it is used before such subsitutions are done. This is how one would define the JQUERY macro. 

            function (v) {
            return '<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/' + 
            (v || '1.9.0') + '/jquery.min.js"></script>';
        }

     DEFINE jquery


 ## Default Directives

1. FILE -- Saves a compiled block to a file
2. LOAD -- Loads another literate program
3. REQUIRE -- Loads in plugins via npm module require
4. VERSION -- A way to define the version of your document; defines the macros VERSION and VNAME
5. DEFINE -- Define a macro function
6. SET -- Set a macro name to a constant value.

You can also define your own directives; see [literate-programming-standard](https://github.com/jostylr/literate-programming-standard)


## TODO

Add in an opt-out for file saving or a rerouting... Add to Version the ability to set various boolean flags, such as dev, deploy, ..., add an environment directive to set those things. 

Implement a literate program test example. Also a dev, deploy version. Realized one could have a lit pro that is just a shell for files, etc., calling in the big thing. 

More docs.

Make it async. so track the status and be able to abort/restart. Plan is to use a doc.status to indicate the phase (initial, parsing, compiling, done). The parsing phase just needs to track the line it is currently on. The compiling phase should have a queue object of blocks not yet attempted to be compiled and then any block that needs to wait (A) on something (B) should register itself (A) with that other thing (B) to trigger its (A) compile when (B) all done compiling. Also need a way to restart a compile of a block when whatever it was waiting for is done. Wrap all that into a nice asyncy function (like doc.resume or something).  I guess we can just queue up the objects initially, loop over them, and no need to break. Everything will just happen automagically with callbacks once it is all primed. Pretty sweet. The load directive for other lit programs can also be asynced. The existence of the file gets noted and no compiling should happen until all parsing is done on all loaded documents. But after that, the different compiles can all go crazy as they just queue themselves willy-nilly. 

Have some more preview/testing options. Maybe an abort on failed test/jshint kind of stuff and/or a diff viewer. npm diff seems popular. 


Think about get code block. If no name specified, look for unnamed code blocks. So while type of caller would be relevant if multiple unnamed blocks of different types, it would not be relevant if there is an unnamed block. A typical case seems to be a main block that is not labeled and then named ones below. Of course with a browser IDE depending on type, this may change. 


Think about piping. Maybe have a pipe(blockname) that sees each line as a pipe. 

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

JSON 

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
      "keywords": ["literate programming"],
      "preferGlobal": "true",
      "bin": {
        "literate-programming" : "bin/literate-programming.js"
      }
    }



## LICENSE-MIT


The MIT License (MIT)
Copyright (c) 2013 James Taylor

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


## Change Log

v.0.6.0

_"Load directive"  Set it up so that LOAD works asynchronously. Multiple LOADs are handled. The property doc.loading holds which documents are being loaded. 

_"Cli"  Set it up so that saving, file loading,... is a function passed into the doc. This allows for a much more flexible setup

_"Doc constructor" Make it so that constructing the document parses it and compiles it and saves it. The passed in options can overwrite the behavior. There can be a callback issued once everything is done. 

_"Compile time" Make it async. Each call to a block either pulls in the compiled bit or queues up the current block. Need to store state. 

_"Process files" is a part of the document constructor. Everything about a "file" will be created and stored in compiledFiles

_"Save Files", _"Preview Files", _"Diff Files"  all do their job acting on compiledFiles. 