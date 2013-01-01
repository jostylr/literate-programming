# Literate Programming

This is the third cycle of literate programming. In this cycle, we want to implement directives and subheading directives. We will not implement macros at this time. 


## So far (modified)

Each file can specify the leading character(s) for a substitution, but an underscore will be default. To create a file, use FILE: name at the beginning of a line. Then all code in that block will define the contents of that file. 

Use FILE name

Use substitutions _"heading title" for replacements. 

There was a substitution regex idea, but there is use in having convention:
 
    /\_\"([^"]*)\"/
    


## Capital letters

We will use all caps to signify directives. The all caps letter only matches if there is something to match. 

A directive is an all caps as first word on the line. 

    FILE lp.js

We also use constants in code. The patten is caps and periods(in middle). So 

    p {color: MOJO.RED}
    

The reg would be

    /[A-Z][A-Z\.]*[A-Z]/

## Runnable Code

One should also be able to run JavaScript code directly in the interpreter. I think a decent convention would be underscore backtick code  backtick.        

    _`javascript code`

The eval output (last evaluated value) is what is placed in the code to replace the backtick call.

Before evaling the code, the substitutions are run on this. So if one wants to run a code block: 

    _`_"javascript code block"`
    
Not pretty, but it offers some flexibility. I imagine, most of the time, it should be a little bit of code fragment that is typed directly. One could have a directive that RUNs setup code allowing this bit to just read off from that. 

## Multi-level substitutions

There may be need to run substitutions after a first pass or more. For example, compiling a jade template into html and then running the substitutions that put in the text of the template. 

In this case, I think multiple underscores could do the trick. 

Example:

    #example
        _"nav jade"
        #text
             __"markdown text"
    

## Line analysis

So we have three basic things that we might see in code that the compiler needs to do something about:

1. Substitutions
2. Constants
3. Evaling

In earlier versions, we have commenting. We will drop this from this version. It does not seem useful. Just do a find in the text. 

The function takes in a string for the code and returns a string if replacements happened or false if none happened.

We run through the code string, matching block name/js code block/constant. We note the location, get the replacement text, and continue on. We also keep a look out for multi-level, preparing to reduce the level. 

Once all matches are found, we replace the text and then return the array. 


    function oneSub (code, name, doc) {
        
        _"Max sub limit"
                
        code = doc.pre[name](code, doc); 

        var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|([A-Z][A-Z.]*[A-Z]))/g;
        var rep = [];
        var toRun, newCode, match;
        
        var blocks = doc.blocks;

        while (match = reg.exec(code) ) {
            
            //multi-level 
        
            if (match[2]) {
                // section
                if (blocks.hasOwnProperty(match[2])) {
                    _"Matching block, multi-level"
                    // do a one-level sub
                    newCode = blocks[match[2]].code.join("\n");
                    // we use or for the case of no subs
                    rep.push([match[0], oneSub(newCode, match[2], doc) || newCode]);
                }               
            } else if (match[3]) {
                // code
                _"Matching block, multi-level"
                toRun = fullSub(match[3]);
                rep.push([match[0], eval(toRun)]);

            } else {
                // constant
                if (constants.hasOwnProperty(match[4])) {
                  rep.push([match[0], constants[match[4]]]);
                }
            }

        }
        //do the replacements or return false
        if (rep.length > 0) {
            for (var i = 0; i < rep.length; i += 1) {
                code = code.replace(rep[i][0], rep[i][1]);
            }
            code = doc.post[name](code, doc); 
            return code; 
            
        } else {
            return false;
        }
    }
        
We need the function fullSub which runs through the code repeatedly until all substitutions are made. 

We have two hooks for pre and post processing of the joined code text. 

### Max sub limit

We need to regard against infinite recursion of substituting. We do this by having a maximum loop limit. 

        if (subtimes >= maxsub) {
            return false;
        } else {
            subtimes += 1;
        }

#### Initial subtimes

    var subtimes = 0;
    var maxsub = 1e5;


### The full substitution 

This is invoked with a FILE directive. Each file is processed fully. This is also what needs to be done for any eval'd code substitution blocks.

    function (name, doc) {
        var compiled = doc.blocks[name].code.join("\n");
            
        var newText = compiled;
        while(newText) {
            compiled = newText;
            newText = oneSub(compiled, name, doc);
        }
            
        return compiled;
    }

The objects pre and post are objects filled by the directives for pre and post compilation phases. 


### Matching block, multi-level

There is a match, but the level is not yet ready  for full substitution

                    if (match[1] && match[1].length > 1) {
                        rep.push([match[0], match[0].slice(1)]);
                        continue;
                    }


## Recommendations

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

## Directives parser

We will implement more directives. Directives will be recognized as, at the start of a line, as all caps and a matching word. This may be conflict, but seems unlikely. A space in front would defeat the regex. Periods are also allowed as in constants. At least two capital letters are required.

    function (line, doc) {     
      var reg = /^([A-Z][A-Z\.]*[A-Z])\s*(.*)$/;
      var match = reg.exec(line);
      if (match) {
        if (directives.hasOwnProperty(match[1])) {
            directives[match[1]](match[2], doc);
            return true;
        } else {
            return false;
        }
      } else {
        return false;
      }
    }

The function takes in a line and the doc structure. It either returns true if a successful directive match/execution occurs or it returns false. The directives object is an object of functions whose keys are the directive names and whose arguments are the rest of the line (if anything) and the doc object that contains the processors and current block structure. 


## Subsection Headings

Subsection headings refer to the higher level previous code block. One can write "#### Test"   (cap not matters) to write a test section for "## Great code".  This allows for the display of the markdown to have these sections hidden by default. 
Some possibilities as above, but also a doc type for writing user documentation. The literate programming is the developer's documentation, but how to use whatever can be written from within as well. 

By going two extra levels, we can recognize levels for testing and so forth without polluting the global namespace. Two levels could be those, such as examples, that should be for general review while three levels could be for edge case test cases, hidden by default. 

## Chunk headings

Parse out the section headings. These constitute "#+" followed by a name. Grab what follows. Parse code blocks indicated by 4 spaces in. One block per section reported, but can be broken up. Stitched together in sequence. 

To do this programmatically, we will split the whole text by newlines. At each line, analyze whether there is a "#" starting it--if so, get text after for name of section. At each line, check if there are four spaces. If so, add the line of code to the block. 

Each subheading is nested in the one above. So we need structures that hold the block and heading hierarchy.


## Parse lines

We create a function that takes in a literate program, splits it into lines, and parses them, returning a structure for compilation. 

The structure consists of blocks that are themselves objects with an array of code lines, an array of the full lines, an array of any direct descendants, any subdirectives, and then any other properties object. 

    function (lp) {
      var i, line, nn; 
      var doc = {
        blocks : {},
        cur : _"Current structure",
        defaultProcessors : _"Default processors",
        files : [],
        pre : {}, 
        post : {}
      };
      doc.processors = [].concat(doc.defaultProcessors);
      var lines = md.split("\n");
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
      return doc;
    }

So we need to define four functions dealing with each type of object. They act on the doc object as necessary and will return true if successfully matched, short-circuiting the rest. 

### Current structure

We have an array of code lines, the array of full lines, sub directive headings, and properties

    {
      code : [],
      full : [],
      subdire : [],
      prop : {}
    }


### Default processors

The processors array allows us to change the behavior of the parser based on directives. They should return true if processing is done for the line. The argument is always the current line and the doc structure. 

    [ 
    _"Code parser", 
    _"Head parser", 
    _"Directives parser", 
    _"Plain parser" 
    ]


### Code parser

We look for 4 spaces of indentation. If so, it is code and we store it in the current code block. Alternative pathways are handled elsewhere by replacing cur.code with something else and restoring it as necessary.

    function (line, doc) {
      var code = /^ {4}(.+)$/;
      var match = code.exec(line);
      if (match) {
        doc.cur.code.push(match[1]);
        return true;
      } else {
        return false;
      }
    }



### Head parser

We recognize a heading by the start of a line having '#'. We count the number of sharps, let's call it level. The old level is oldLevel.

If level <= oldLevel +1, then we have a new subsection of code.

If level >= oldLevel +2, then this is a Heading Directive and we try to match it with a directive. It feeds directly into the oldLevel section and is not globally visible. 

For new global blocks, we use the heading string as the block name. 

    function (line, doc) {
      var level, oldLevel, cur, name;
      var head = /^(\#+)\s*(.+)$/;
      var match = head.exec(line);
      if (match) {
        name = match[2].trim();
        oldLevel = doc.level || 0;
        level = match[1].length;
        cur = _"Current structure";

        _"Directive heading"
        
        // new code block
        
        doc.blocks[name] = cur; 
        doc.cur = cur; 
        doc.level = level;
        doc.name = name;        
        doc.pre[name] = function (code, doc) {return code;};
        doc.post[name] = function (code, doc) {return code;};
        // new processors for each section
        doc.processors = [].concat(doc.defaultProcessors);
        
        return true;
      } 
      return false;
    }

In the above, we are defining the default processors again fresh. This prevents any kind of manipulations from leaking from one section to another. It could be a performance penalty, but probably not a big deal. Garbage collection should remove old processors. 


#### Directive heading

Here we want to change the current block to take the current part, but it needs to be added to the parent's subdire

        if (level >= oldLevel +2) {
            level = oldLevel; 
            doc.cur = cur; 
            doc.blocks[doc.name].subdire.push(cur);
            return true;
        }


### Plain parser

This is a default. It means there is nothing special about the line. So we simply add it to the current full block.

    function (line, doc) {
      doc.cur.full.push(line);
      return true;
    }

## The Program

Open the file to read and then read it, parse the lines,  piece them together, save file. 

    /*global require, process, console*/

    _"Load modules"


    _"Utility Trim"
    
    var save = _"Save files";
    
    var directives = _"Directives";

    var constants = {};
    
    _"Load file"
    var lineparser = _"Parse lines";
        
    var doc = lineparser(md);
    
    _"Initial subtimes"
    
    var oneSub = _"Line analysis";
    var fullSub = _"The full substitution";
    
    var makeFiles = _"Make files";
    
    makeFiles(doc);



FILE lp3.js
JS.TIDY
JS.HINT

## The Docs

Here we write the basic docs for the user.

    lp3 is the third iteration of the literate programming attempt by jostylr. It handles multiple files, substitutions, macros, and subheading directives. 

    To run this, the basic command is

        node lp3.js file.md
    
    where file.md is the literate program to be parsed.

    The literate program has multiple sections that get weaved together. 

    _"Directives Doc"

    _"Substitution Doc"

    _"Subheading directives Doc"

    _"Further information on literate programming"


 //FILE: lp3Doc.md

### Further information on literate programming






## Directives


Create the object that holds the directives. It will contain object names for any directives that need to be instituted. Each of the values should be a function that takes in the material on the line post-command and the doc which gives access to the current block and name. 


    { 
        "FILE" : _"File directive",
        "JS.TIDY" : _"JS tidy",
        "JS.HINT" : _"JS hint"
    }


### File directive
     
The command is `FILE fname.ext` where fname.ext is the filename and extension to use. 

    function (options, doc) {
        options = options.trim();
        doc.files.push([options, doc.name]);
    }

### JS tidy

Run the compiled code through JSBeautify 

    function (options, doc) {
       var post = doc.post[doc.name];
       doc.post[doc.name] = function (code, doc) {
           code = post(code, doc);
           return beautify(code, options ||{ indent_size: 2, "jslint_happy": true } );
       };
    }
   

### JS hint

Run the compiled code through JSHint and output the results to console.

    function (options, doc) {
       var post = doc.post[doc.name];
       doc.post[doc.name] = function (code, doc) {
           code = post(code, doc);
           jshint(code, options ||{ } );
           var log = [], err;
           for (var i = 0; i < jshint.errors.length; i += 1) {
               err = jshint.errors[i];
               log.push(err.line+","+err.character+": "+err.reason);
           }
           console.log(log.join("\n"));
           return code;
       };
    }


### NPM module

Take in module name and place a global require variable at top of


## Make files

We now want to assemble all the code. This function takes in a parsed lp doc and uses the files array to know which files to make and how to weave them together. 

So the plan is to go through each item in files. Call the full substitute method on it and then save it. 

    function (doc) {
        var files = doc.files;
        var fname, blockname, text;
        for (var i = 0; i < files.length; i  += 1) {
            fname = files[i][0];
            blockname = files[i][1];
            text = fullSub(blockname, doc);
            save(fname, text);
        }
    }

The save command will save the text block to the filename. 




## Load file

Get the filename from the command line arguments. It should be third item in [proccess.argv](http://nodejs.org/api/process.html#process_process_argv).  

No need to worry about async here so we use the sync version of [readFile](http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_encoding).

    var filename, md;
    filename = process.argv[2];
    md = fs.readFileSync(filename, 'utf8');


## Save files
    
Given name and text, save the file. 

    function (name, text) {
          fs.writeFileSync(name, text, 'utf8');
    }


## Utility Trim

This was lifted from JavaScript the Definitive Guide: 

    // Define the ES5 String.trim() method if one does not already exist.
    // This method returns a string with whitespace removed from the start and end.
    String.prototype.trim = String.prototype.trim || function() {
       if (!this) return this;                // Don't alter the empty string
       return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
    };


## Load modules

We need the filesystem module that is default installed.

    var fs = require('fs');
    var beautify = require('js-beautify').js_beautify;
    var jshint = require('jshint').JSHINT;

## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)


## Directive Implementation

* FILE already present; puts the code block and its substitutions in a file. regex?
* ADD take this code block and add it to another codeblock. Specify pre, post, and a possible priority level. 
* DEBUG Some debugging output code. 
* RETURN returns control to other code block
* LOAD give file name, location, section to import, version number. Create a literate program manager kind of thing like npm. Have tests that run to make sure compatible. Could do latest if it passes and works back until working version or something. 
* MODULE grab a module from a repository:  install command, link to repo/other comments
* COMMAND write a command line snippet that will be run. SECURITY problem. 
* VERSION gives a version label to the section. Semantics is the version number followed by any comments about it. 
* AFTER/BEFORE/REPLACE takes in section name, regex string to match and will place the code block after the match/before the match/instead of the match respectively. It will do 


### JavaScript Directives

* VARS A list of the variables for the snippet of interest. This is mainly to deal with loop variables. 
* HEREVARS places the variables of a section there. It can be a comma separated list of headings; the vars will be placed in that order.
* SET/TEST/RESULT is a test code for snippets. SET will set variable values for multiple tests, TEST will then run the snippet and RESULT checks it. 

In all of these a parenthetical right after the term will link it to that section. Otherwise, it relates to the current code block section. 

TEST for example could have some code above it (with substitutions) and then TEST will create one (many) tests of that code block. To get back to the rest of the code block, use RETURN. 

### Directives object

    { 
      ADD : _"Add",
      DEBUG : _"Debug",
      FIDDLE : _"Fiddle",
      RETURN : _"Return",
      LOAD : _"Load",
      MODULE : _"Module",
      REQUIRE : _"Require",
      VERSION : _"Version
    }
    

### Load 

The load directive allows one to load another literate program. This means one has to specify a location (file system or url), a version number, and a section heading to start the grabbing/compiling. One should detect looping, with failure as the probable result. 

MODULE npm, semver, [semver](https://github.com/isaacs/node-semver)

    
##### DOC

The LOAD directive is of the form LOAD: (section heading), (path or URL), (number and dots for version as in [npm's versioning](https://npmjs.org/doc/json.html#version) )

What it does is find the literate program specified, check versioning/tests, compile the code, and leave it as an otherwise normal block in the named section. 

In the file, there can be a directive about versions. There can be multiple versions.

##### EXAMPLE

Let's assume there is an example.md literate program with a section "Test Me". Then in a descriptive fashion, we would wax on about what we are using and why and whatever. Then the directive:

    LOAD: "Test Me", https://github.com/jostylr/literateprogramming/lp1.md, 4.2 
 
"Test Me" should have a directive VERSION:4.2

Then we could write some test code to confirm the behavior. 

### Add

Take this code block and add it to another codeblock. Specify pre, post, and a possible priority level. 

    function (params, current) {
      params = params.split(',');
      var block = params[0];
      var type = params[1];
      if ( (type !== "pre") && (type !== "post") ) {
        error(current, type);
      }
      var number = params[2] || 1;
      number = parseFloat(number);
      if (blocks.hasOwnProperty(block) ) {
        blocks[block][type].push([number, current]);
      } else {
        blocks[block] = [];
      }
    }


##### DOC

The format is  `ADD: "block name", "pre|post", "?#"`  where we are adding the current block to the given block name. We put it before/after depending on pre/post. If there is a number, then the larger it is, the further away from the given code block it is relative to other adders. A default of 1 is assumed. 


### Debug

This is a place that can input debugging code.

    function (params, current) {
      if (debug) {

      }
    }


* DEBUG Some debugging output code. 
* FIDDLE Something that allows one to specify different parameters and generate multiple compiles/runs or something. 
* RETURN returns control to other code block
* LOAD give file name, location, section to import, version number. Create a literate program manager kind of thing like npm. Have tests that run to make sure compatible. Could do latest if it passes and works back until working version or something. 
* MODULE different than LOAD. It loads a npm module or whatever is specfied. 
* REQUIRE is a marker for where to place modules for that section of code. All MODULEs are placed at that point, in the order they are seen.
* VERSION gives a version label to the section. Semantics is the version number followed by any comments about it. 


