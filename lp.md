# Literate Programming

"Its like writing sphagetti code then shredding the code into little pieces, throwing those pieces into a blender, and finally painting the paste onto an essay. Tasty!"

This is the sixth cycle of literate programming. Here we implement a more asynchronous environment, particularly during the compile stage. 

VERSION literate-programming | 0.6.0-pre


## Directory structure

The bulk of the work is in the node module. That has all the core weaving. It also hasthe ability to load other literate programs / directives which ties it currently to the file system. 

FILE "the lp module" lib/literate-programming.js   | jshint | jstidy

---

The literate program compiler is activated by a command line program.


FILE "cli" bin/literate-programming.js  | jshint

---

The standard README.

FILE "readme" README.md  | clean raw

---

The requisite package file for a npm project. 

FILE "NPM package : json" package.json  | jshint

---

A list of growing and shrinking items todo.

FILE "todo" TODO.md | clean raw

---

The MIT license as I think that is the standard in the node community. 

FILE "license-mit" LICENSE   | clean raw

---

FILE "Blog doc" blog.md | clean raw

## How to write a literate program

Use markdown. Each heading is a new heading block (hblock) and can be referenced by using _"title". This substitution has more features, documented below. 

Within each hBlock, one can write free form markdown explanatory text, directives, code lines, or initiate a new code block (cblock). 

* hblock is initiated by number signs at the beginnning of a line. 
* Directive is initiated by a block of at least 2 capital letters and a mixture of caps and dots. The rest of the line is taken as arguments to the directive function with a pipe being the delimiter.
* A new cblock is initiated with a caps if recognized or a .caps if not known. 
* cblock lines are recognized by 4 spaces. 

To reference a cblock, the full precise name, a cblock name, is  "litprodoc :: hblock : cblock.ext"  where all but hblock is optional. Also hblock.ext grabs the unnamed extension relevant to it. 

To use a cblock, use the substitution command  _"cblock name | commands ..."  where commands can do stuff on the code text and each pipes into the next. 

Examples:  _"Great:jack|marked",  _"Great:.md" or "Great.md",  _"Great|marked", _"Great:jack.md",  ":jack"  will load the internal block named jack

The FILE command is of the form FILE "cblock name"  filename | commands...  If the cblock name is missing, it uses the current cblock.

### Advice

1. Setup an hblock as a body of code, such as a funciton. Use the subcblocks to break that body into manageable chunks. Use new hblocks for new functions or for very important behavior. 
2. Write function blocks without punctuation so that they can be inserted in multiple ways. Put the punctuation after the substitution quote. 

### Runnable Code

You can run JavaScript code while compiling in at least two ways. One is by  _&#96;some code&#96; on a single line. The other way is to have a cblock and reference it with a pipe command that evals it, such as the `eval` command

The eval output (last evaluated value) is what is placed in the code to replace the backtick call.


### Multi-level substitutions

There may be need to run substitutions after a first pass or more. For example, compiling a jade template into html and then running the substitutions that put in the text of the template. 

The number of underscores gives which loop number the substitution happens. In other words, for each loop iteration, one underscore is removed until only one is left at which point the substitution is made. 

Example:

    #example
        _"nav jade"
        #text
             __"markdown text"
    


## The lp module

This module takes in a literate program as a string of markdown and an options object. 

It takes the string and makes a document that has the markdown parsed out into various compiled blocks. 

1. The parsing is down line-by-line. lineparser parses each line, adding the lines to each relevant block or creating new blocks or even retrieving/compiling other literate programs. 
2. After all literate programs have been loaded and parsed, then the compile phase starts. This is asynchronous and all the cblocks are compiled into the cblock property compiled. If a block is compiled, it has isCompiled set to true. 
3. Post-compile will send those compiled blocks into files as directed by the directives. 

This currently uses the filesystem to load external programs. This needs to be refactored.

JS  

    /*global require, module, process*/
    /*jslint evil:true*/

    var fs = require('fs');


    _"Utilities"


    var HBlock, Doc, repo = {plugins : {}, litpro :{} }; 



    _"Document constructor"

    _"HBlock constructor"

    module.exports.Doc = Doc;


We also need a repository for files that are loaded up, both literate programs and plugins. The same repo will be seen in all instances of Doc; this prevents multiple uploading and parsing of the same file. I see no reason for not having it globally accessible. 



## Document parsing

Each literate program gets its own document style. It starts off life with lineparser. 

Each line is of one of four basic types:

1. Header. This signifies a new hblock. 
2. Code line. This is a line indented with (possibly a tab followed by) 4 spaces. Stored in cblock.
3. Directive/Type switch. If a line starts with all caps or a ., then it has the potential to be a directive (such as FILE command)  or to create/switch the code block to a new type or name. What happens is very dependent on what is found there.  
4. Plain text. This just is for reading and gets put into a plain text block without it being useful, presumably.

All lines in a block do get put into storage in order for safe-keeping (some raw output, for example, could be useful).

### Parse lines

This is the function that takes in a literate program, splits it into lines, and parses them, returning a structure for compilation. 

The Document consists mostly of blocks constructed by the Hblock constructor. The doc.processors is where the magic happens. 

This is largely synchronous. The directives can create hooks that prevent the compiling stage from beginning. The main cause of this is the LOAD directive. Those files will be loaded asynchronously and will register themselves as loading and prevent compilation until they are loaded. See the LOAD directive. The REQUIRE command is synchronous and will block until it is loaded. 

JS

    function () {
        var doc = this;
        var i, line, nn; 

        var lines = doc.litpro.split("\n");
        var n = lines.length;
        for (i = 0; i < n; i += 1) {
            line = lines[i];
            nn = doc.processors.length;
            for (var ii = 0; ii < nn; ii += 1) {
                if (doc.processors[ii](line, doc) ) {
                    doc.hcur.full.push(line);
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
       doc.compile();
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

Note that tabs do not trigger a code block. This allows for the use of tabs for multiple paragraphs in a list. Any sequence of leading tabs followed by 4 spaces will trigger a code block. 

This also means that if one wants a code block that is not to be compiled, you can use tabs as long as it is not followed by 4 spaces. 

JS

    function (line, doc) {
      var hcur = doc.hcur;
      var reg = /^\t* {4}(.*)$/;
      var match = reg.exec(line);
      if (match) {
        hcur.cblocks[hcur.cname].lines.push(match[1]);
        return true;

      _":Add empty line"
        
      } else {
        return false;
      }
    }


Added the following clause to add empty lines to the code. Stuff before and after the code block is probably trimmed, but in between extra lines could be added. This was to enable blank lines being there which is important for markdown and other markup languages. 

JS Add empty line 

      } else if (line.match(/^\s*$/)  ) {
        var carr = hcur.cblocks[hcur.cname];
        if (carr && carr.lines.length > 0 && carr.lines[carr.lines.length -1 ] !== "") {
            hcur.cblocks[hcur.cname].lines.push(line);
        }
        return false; // so that it can be added to the plain parser as well




### Directives parser

A directive will be recognized as, at the start of a line, as all caps and a matching word. This may conflict with some uses, but it seems unlikely since if there is no matching directive, then the original is left untouched. 

A space in front would defeat the regex as well. Periods are also allowed. At least two capital letters are required.

A directive could also be a code block create/switch command. This is either a recognized type or it should start with a period. 

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

Anything works for the name except pipes.

JS main

    function (type, options) {
        var doc = this;
        var hcur = doc.hcur;
        var cname; 

        type = type.toLowerCase(); 
        if (typeof options === "undefined") {
            options = "";
        }
        options = options.split("|").trim();
        var name = options.shift();
        if (name) {
            name.trim();
            cname = name.toLowerCase()+"."+type;
        } else {
            cname = "."+type;
        }
        hcur.cname = cname;

        if (! hcur.cblocks.hasOwnProperty(cname) ) {
            hcur.cblocks[cname] = doc.makeCode(cname);
        }

        var codearr = hcur.cblocks[cname];

        _":Parse options"

    }

JS Parse options

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

JS Add command

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




### Head parser

We recognize a heading by the start of a line having '#'. 

For new global blocks, we use the heading string as the block name. We lower case the whole name to avoid capitalization issues (it was really annoying!)

JS

    function (line, doc) {
      var hcur, heading;
      var head = /^(\#+)\s*(.+)$/;
      var match = head.exec(line);
      if (match) {
        heading = match[2].trim().toLowerCase();

        _":Remove empty code blocks"

        hcur = new HBlock();
        hcur.heading = heading;
        hcur.cname = doc.type;    
        hcur.cblocks[hcur.cname] = doc.makeCode(cname);

                
        doc.hblocks[heading] = hcur; 
        doc.hcur = hcur; 
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
    var oldh = doc.hcur; 
    if (oldh) {
        for (cname in oldh.cblocks) {
            if (oldh.cblocks[cname].lines.length === 0) {
                delete oldh.cblocks[cname];

            }
        }
    }


This suffered from having empty lines put into the code block. Solution: do not add empty lines in "code parser" unless there is a non-empty line of code before it. Has an issue that this does not apply to the final block as it refers to the previous block. 


### Plain parser

It means there is nothing special about the line. So we simply add it to the plain block because, why not?

JS
    function (line, doc) {
      doc.hcur.plain.push(line);
      return true;
    }



## Constructors 

We have a few prototypes we use. The main one is the Doc constructor which is what a literate programming string gets turned into. 

We also create a Block object for each section of a literate program. Within that block, we have code blocks created which are augmented arrays and not a proper prototyped object. 

### Document constructor

JS

    Doc = function (md, options) {

        this.litpro = md; 
        this.hblocks = {};
        this.chur = new HBlock();
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
    Doc.prototype.oneSub.callback = true; 

    Doc.prototype.fullSub = _"The full substitution";

    Doc.prototype.defaultProcessors = _"Default processors";

    Doc.prototype.switchType = _"Switch type:main";

    Doc.prototype.makeCode = _"Make code block";

    Doc.prototype.trimCode = [function (code) {
        return code.trim();
    }, []];

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
        this.processing = 0; // Tracks status of processing. 
        this.call = [];  // a list of functions to call upon a resume



#### Doc commander

This takes in array of commands to execute on the code. Each element of the array is [function, args, calling object]

If a function is doing a callback (calling out to some external resource or something), then it needs to set the callback flag to true and it has responsibility for calling next with the compiled code as argument. No callback means the commands can/should ignore it all.

When it is all done, the final function is called with the passin object and passed the code object. The passin object allows for whatever is stashed there to be offloaded by default if we want to do that. 

JS

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

JS

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


#### Process files
    
Given array of name and text, save the file. dir will change the directory where to place it. This should be the root directory of all the files. Use the filenames to do different directories. 

The piping call may lead to asynchronous callbacks. See pipe processing. The final function will store the processed text and call the end function if all of the text has been processed. Note there is no guarantee as to which file will be the last one to be fully processed. 

JS Main

    function () {
        var doc = this;
        var type;

        var files = doc.files;
        var cFiles = doc.compiledFiles = {};
        var file, hblock, fname, text, litpro, headname, cname, fdoc;  
        var i, n = files.length, passin;
        var final = _":Final function for doc commander";
        doc.processing = n;

        //console.log(files);

        for (i=0; i < n; i+= 1) {
            file = files[i];
            fname = file[0];
            litpro = file[1][0];
            headname = file[1][1];
            cname = file[1][2] || "";
            _":check for block existence"
            type = (fname.split(".")[1]  || "" ).trim(); //assuming no other period in name
            text = fdoc.getBlock(hblock, cname, type).compiled;
            passin = {doc:fdoc, hblock: hblock, name:fname, state : {indent : false}};
            fdoc.piping.call(passin, file.slice(2), text, final  )  ;
        }

        return doc;
    }

JS  Final function for doc commander


    function (text) {
        var doc = this.doc;
        var fname = this.name;
        cFiles[fname] = text;
        doc.processing -= 1;
        _":Check for processing done"
    }

    

JS Check for block existence

First we check whether there is an external literate program trying to be used. We either assign it or doc to fdoc. Then we load up the block with headname. The internal block name is left to another portion. 

            if (litpro) {
                if (doc.repo.hasOwnProperty(litpro) ) {
                    fdoc = doc.repo[litpro];
                } else {
                    doc.log(fname + " is trying to use non-loaded literate program " + litpro);
                    doc.processing -= 1;
                    continue;
                }
            } else {
                fdoc = doc;
            }
            if (headname) {
                if (fdoc.hblocks.hasOwnProperty(headname) ) {
                    hblock = fdoc.hblocks[headname];
                } else {
                    doc.log(fname + " is trying to load non existent block '" + headname + "'");
                    doc.processing -= 1;
                    continue;
                }
            } else {
                doc.log(fname + " has no block " + litpro + " :: " + headname);
                doc.processing -= 1;
                continue;
            }


JS Check for processing done

    if (doc.processing < 1 ) {
        doc.end();
    }   

#### End process

This handles outputting the doc.log if requested. And whatever else. 

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

### HBlock constructor

This just creates a basic structore for a block that corresponds to a heading and the rest. The cblocks property is the most useful and it is an object whose keys correspond to the name.type of each code block, each block containing an array of lines as created in "Make code block".

JS

    HBlock = function () {

        this.cblocks = {};
        this.full = [];
        this.plain = [];

        return this;
    };




## Compile Time

We now want to assemble all the code. This function takes in a parsed lp doc and compiles each block. It will visit each block and run the fullSub method. 

Most likely, many cblocks will call other cblocks that are not compiled. But that is okay as they can wait. 

This checks to see if there are any files being loaded. As they finish, they will reduce the doc.loading and call compile.

JS

    function () {
        var doc = this;

        var heading, cblocks, cname;
        for (heading in doc.hblocks) {
            cblocks = doc.hblocks[heading].cblocks;
            for (cname in cblocks) {
                doc.waiting[heading+":"+cname] = true;
            }
        }


        for (heading in doc.hblocks) {
            doc.fullSub(doc.hblocks[heading]);
        }

        return doc;
    }



### Get correct code block

Each compiled block has an associative array whose keys are cnames. They may be explicitly set, such as `JS main` becomes `main.js`.  But they might also be no name or even no extension. 

So this is a function that takes in a compiled hblock, the cname, and a possible extension (if coming from a file save request). It tries to find the right compiled block and returns that. 


We need to get the right block of text. First we check if there is a request from the file directive. If not, then see if we can get the extension.

1. internal is the full name and a good match. Safest _":jack.js"
1. Check if there is only one block. If so, return it. 
2. See if internal is a known extension. Check main.ext and .ext.  _":js". Would not match jack.js. Does work with no extension as well as internal would be "" and match type "".
3. internal is the name, but without extension. Common. See if requester's extension with name matches something. If not, try default extension and then ".". If none of that works, then see if anything matches the name.   _":jack"  becomes jack.js if looked at from cool.js block. Also checked is jack.
4. If all that fails, then loop through the keys trying to match text. Unpredictable.
5. If none of that works, then look for a key of main. 
6. If that fails, grab something.


JS main
    
    function (hblock, cname, ext) {
        var doc = this;
        ext = ext || ""; // only relevant in compiling file type
        var cblocks = hblock.cblocks;

        if (!cblocks) {
            doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
            return {compiled:"", isCompiled : true};
        }

        cname = cname.toLowerCase();

        // an exact match! yay!
        if (cblocks.hasOwnProperty(cname)) {
            return cblocks[cname];
        }

        var keys = Object.keys(cblocks);

        // just one key
        if (keys.length === 1) {
            return cblocks[keys[0]];
        }

        // no code segments
        if (keys.length === 0) {
            doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
            return {compiled:"", isCompiled : true};
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
            return {compiled:"", isCompiled : true};
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

JS Filter internal


        // try and find a match for the internal
        var newkeys = keys.filter(function (val) {
            if (val.match(cname) ) {
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

    function fullSub (hblock) {
        var doc = this;
        var cname, cblock, compiling = {} ; 
        var cblocks= hblock.cblocks;

        var final; 

        var next = _":Next function";

        final = _":Final function";

        _":Compiling status prep"

        _":Run next"
    }


JS Compiling status prep

We create a call object for next and commands, etc. 

    for (cname in cblocks) {
        cblock = cblocks[cname];
        cblock.compiled = cblock.lines.join("\n");
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


JS Run next

    for (cname in compiling) {
        //console.log("Starting " + compiling[cname].fullname);
        compiling[cname].next(cblocks[cname].compiled); 
    }



JS Next function

This is where the magic happens. It should always be called on the block being compiled as the this object.

Depending on the status, it either will execute oneSub to further compile it after any pre/mid-processing commands or it will execute the final function after the post-process. 

    function (code) {
        var passin = this;
        var cblock = passin.cblock;
        if (code.length !== 0 ) {
            cblock.compiled = code;
        } else {
            console.log("ERROR: Blank code", passin.fullname);
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

JS Final function

This is where all the cleanup happens. 

We store the compiled block and then we remove it from the waiting area. The waiting area also has an array of blocks that are waiting for this one to be compiled. 

One added to a waiting list, it should be a block with a go method. 

    function (code) {
        var passin = this;
        var doc = passin.doc;
        var cblock = passin.cblock;
        var fullname = passin.fullname;


//        cblock.compiled = code; 
        cblock.isCompiled = true;
        passin.status = "done";
        var waiting = cblock.waiting || []; 
        //console.log(waiting, passin.fullname);
        while (waiting.length > 0 ) {
            (waiting.shift()) (code); // runs the go function
        }
        //console.log("DONE", fullname);

        delete doc.waiting[fullname];

        // check for other waiting
        if (Object.keys( doc.waiting ).length === 0 ) {
            doc.process();
        } 
               //console.log(passin.fullname, " ---- ", cblock.compiled.length, passin.status); 

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



JS main

    function oneSub (code, ignore, done) {
    
        var passin = this;
        var cblock = passin.cblock;
        var doc = passin.doc;        
        var hblock = passin.hblock;

        var reg =  /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|(?:([A-Z][A-Z.]*[A-Z])(?:\(([^)]*)\))?))/g;
 
        var rep = [];
        var waiting = false;
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

JS Next match

This keeps going while there are matches executing. We are using closures in a big way here.

    function () {
        //console.log("Next called", passin.fullname, ( match ? match.index : "--"), passin.status);
        if ( (match = reg.exec(code) ) !== null ) {
            _"Processing a substitution match"
        } else {
            final("from next"); 
        }

    }


JS  Ready to replace

All the substitutions have been obtained and we are ready to do the replacing. We are using the closured variable rep. 

    function () {

        //console.log("final called", passin.status, passin.fullname, rep.length);
        //do the replacements or return false
        if (rep.length > 0) {
            for (var i = 0; i < rep.length; i += 1) {
                if (typeof rep[i][1] === "string" ) {
                  code = code.replace(rep[i][0], rep[i][1].rawString());
                } else {
                    // error
                  console.log("ERROR in replacing:", rep[i][0], rep[i][1]);

                  code = code.replace(rep[i][0], "");
                }
            }
            cblock.compiled = code; 
        } else {
            passin.status = "compiled";
            // cblock.compiled = code; 
        }
        done.call(passin, cblock.compiled); 
    }

JS go substituting next

This function hangs out in doc.waiting just hoping to get a bit of code to continue the compiling of the cblock. 

    function (reptext) {
        //console.log("substituting", passin.gocall, " into ", passin.fullname, " --- ", reptext.length);
        delete passin.gocall;
        doc.piping.call(passin, pipes, reptext, preprep);
    }

JS do some indenting


We want to have an automated indentation of code that is intelligent. If we have something like `argh = _"cool"` then the first line is not indented, but the rest of the lines are indented by an additional 4 spaces (or doc.defaultIndentation). If we have ` _"cool" ` then all lines use the indentation of _"cool".

But it can be overwriten with the explicit indent command. No arguments lead to no indentation.

The code is a closure variable to the original code text that we are going to sub into. ret is the bit under consideration that will be inserted.  

    function (ret) {
        var passin = this;        
        var ind, linetext, middle, space, spacereg = /^(\s*)/;
        if (!passin.state.indent) {
            if (!match) {
                //console.log(ret, rep);
                //console.log(passin, ret);
            }
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


JS push it on rep

Presumably this needs to execute the next step

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


The go function is used to keep coming back to the block after the subbing. When the go thinks all is done, it calls next to do the next match. 


JS 


    if (match[2]) {
        //console.log(match[2]);
        _":cblock substitution"
    } else if (match[3] ) {
        _":eval backticks"
    } else {
        _":macro call"
    }


JS eval backticks

This is pretty simple. We take the stuff in the backticks and eval it. The output is the replacement string. If evalling for side effects, make the last statement an empty string.

There is no async mechanism for this call.

    _":Matching block, multi-level"

    rep.push([match[0], eval(match[3])]);
    next("eval");
    return null;


JS macro call

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

JS cblock substitution


    pipes = match[2].split("|").trim();
    fullname = pipes.shift().toLowerCase(); 
    
    _":parse fullname"

    _":get relevant hblock"

    gotcblock = doc.getBlock(reqhblock, names.cname); 

    if (passin.gocall) {
        console.log("go called again", passin.gocall, names.fullname, gotcblock.cname);
    } else {
        passin.gocall = names.fullname; 
        if (gotcblock.isCompiled) {
            //console.log("about to gather ", names.fullname, " --- ", gotcblock.compiled.length);
            go(gotcblock.compiled);
        } else {
            //console.log("gonna wait for ", names.fullname, " --- ", gotcblock.cname, gotcblock.waiting.length, passin.fullname);
            //console.log(gotcblock.waiting.length);
            gotcblock.waiting.push(go);
        }
    }

JS Parse fullname

We will put all parsed bits into `names`. The temp variable will the bits that have yet to be parsed. 

First we get any reference to an external litpro document. This is the "::".  Next, we check to see if there is no ":". If so, we check for a "."; the last period starts the extension and becomes the cname. If there is a ":", then that becomes the cname. 

    names = {fullname: fullname};

    temp = fullname.split("::").trim();
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


JS Get relevant hblock

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
                _":Matching block, multi-level"
                reqhblock = doc.hblocks[names.heading];
            } else {
                // no block to substitute; ignore
                next("no block to sub");
                return null;
            }
        } else {
            // use the code already compiled in codeBlocks
            _":Matching block, multi-level"
            reqhblock = hblock;
        }                    
    } 




JS Matching block, multi-level

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

JS 
    
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
        "version" : _"Version directive",
        "load" : _"The load directive:main",
        "require" : _"Require directive",
        "set" : _"Set Constant directive",
        "define" : _"Define Macro directive"
    }


### File directive
     
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

        doc.files.push( [filename, [litpro, heading, cname]].concat(options.slice(1)));
    }

JS Split quotes

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


JS Parse out quoted name

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


JS Msg
Just a snippet of code I keep writing for reporting error location.

    +options.join[" | "]+","+ doc.hcur.heading


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
        var hcur = doc.hcur;
        var code;
        var fname = options.shift().toLowerCase();
        if (!fname) {
            doc.log("Error with DEFINE directive. Need a name.");
            return false; 
        }
        code = hcur.code[hcur.cname].join("\n");
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
    var Doc = require('../lib/literate-programming').Doc;

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


    new Doc(md, {
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
            text = files[fname] || "";
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


    var dir = program.dir || program.root || process.cwd(); 
    var indir = program.change || program.root || process.cwd();
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

Write your code anywhere and in any order with as much explanation as you like. literate-programming will weave it all together to produce your project.

This is a modificaiton of and an implementation of [Knuth's Literate Programming](http://www-cs-faculty.stanford.edu/~uno/lp.html) technique. It is perhaps most in line with [noweb](http://tex.loria.fr/litte/ieee.pdf). 

It uses markdown as the basic document format with the code to be weaved together being delimited by each line having 4 spaces as is typical for markdown. 

It can handle any programming language, but has some standard commands useful for creating HTML, CSS, and JavaScript. 

 ## Installation

This required [node.js](http://nodejs.org) and [npm](https://npmjs.org/) to be installed. Then issue the command:

    npm install -g literate-programming

 ## Using

From the command line:

    literate-programming <file.md>

This will process the literate program in `file.md` and produce whatever output files are specified in the program. 

Use `literate-programming -h`  for command flag usage, including specifying the root output directory.  

 ## Example

Let's give a quick example. Here is the text of sample.md

    # Welcome

    So you want to make a literate program? Let's have a program that outputs all numbers between 1 to 10.

    Let's save it in file count.js

    FILE "Structure" count.js

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

Running it through literate-programming produces count.js: 

    var numarr = [], start=1, end = 11, step = 1;

    var i;
    for (i = start; i < end; i += step) {
        numarr.push(i);
    }

    console.log("The numbers are: ", numarr.join(", ") );

And it can be run from the command line using `node count.js`

There are more [examples](https://github.com/jostylr/literate-programming/tree/master/examples), but for a non-trivial example, see the [literate program](https://github.com/jostylr/literate-programming/blob/master/lp.md) that compiles to literate-programming.

See the full documentation

 ## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level) demarcates a full block. Code blocks within a full block are the bits that are woven together. 

 ### Code Block

Each code block can contain whatever kind of code, but there are three special syntaxes: 

1. `_"Block name"` This tells the compiler to compile the block with "Block name" and then replace the _"Block name" with that code.
2. ``_`javascript code``  One can execute arbitrary javascript code within the backticks, but the parser limits what can be in there to one line. 
3. `MACROS` all caps are for constants or macro functions that insert their output in place of the caps. 

For both 1 and 3, if there is no match, then the text is unchanged. One can have more than one underscore for 1 and 2; this delays the substitution until another loop. It allows for the mixing of various markup languages and different processing points in the life cycle of compilation.

 ### Directive

Outside of a code block, if a line starts with all caps, this is potentially a directive. For example, the `FILE` directive takes the name of a code block in quotes, a file name following it and it will save the compiled block to the file. 

 ### Pipes

One can also use pipes to pipe the compiled text through a command to do something to it. For example, `_"Some JS code | jshint"`  will take the code in block `some JS code` and pipe it into jshint to check for errors; it will report the errors to the console. We can also use pipe commands in a FILE directive:  `FILE "Some JS code" code.js | jstidy` will tidy up the code before storing it in the file `code.js`.

 ### Named Code Block

Finally, you can use distinct code blocks within a full block. Start a line with the file type in all caps followed by the code block's name, such as  `JS outer loop` in a block with heading `Loopy` and then reference it by _"Loopy : outer loop". This also works for the quoted name in a FILE directive. 

If the extension is unknown, start the line with `.` followed by all caps for the type. 


 ## Nifty parts of writing literate programming

* You can have your code in any order you wish. 
* You can separate out flow control from the processing. For example,

    if (condition) {
        _"Truth"
    } else {
        _"Beauty"
    }

* The above lets you write the if/else statement with its logic and put the code in the code blocks `truth` and `beauty`. This can help keep one's code to within a single screenful per notion. 
* You can write code in the currently live document that has no effect, put in ideas in the future, etc. Only those on a compile path will be seen. 
* You can "paste" multiple blocks of code using the same block name. This is like DRY, but the code does get repeated. You can also substitute in various values  in the substitution process so that code blocks that are almost the same but with different names can be coming from the same root structure. 
* You can put distracting data checks/sanitation/transformations into another block and focus on the algorithm without the use of functions (which can be distracting). 
* You can use JavaScript to script out the compilation of documents, a hybrid of static and dynamic. 

I also like to use it compile an entire project from a single file, but a literate program can load external files thus allowing one to split a project into any kind of setup desired. 

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

_"Doc commander", _"Pipe Processor" have been converted to supporting asynchronous callbacks. 