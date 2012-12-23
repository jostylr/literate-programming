# Literate Programming

This is the third cycle of literate programming. In this cycle, we want to implement directives and subheading directives. We will not implement macros at this time. 


## So far

Each file can specify the leading character(s) for a substitution, but an underscore will be default. To create a file, use FILE: name at the beginning of a line. Then all code in that block will define the contents of that file. 

Use 
    FILE: name, regexp   
to specify a different substituion regex. The heading should be the first parenthetical group.

The default is the same as 
    /\_\"([^"]*)\"/

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

## Directives

We will implement more directives. Directives will be recognized as, at the start of a line, as all caps and a matching word. This may be conflict, but seems unlikely. A space would defeat the regex.
    function (line) {     
      var reg = /^([A-Z]+)\s+(.*)$/
      var match = ret.exec(line)
      if (match) {
        return [match[1], match[2]];
      } else {
        return false;
      }
    }

The function takes in a line and either returns [directive name, unparsed parameters] or false if no directive. 

* FILE already present; puts the code block and its substitutions in a file. regex?
* ADD take this code block and add it to another codeblock. Specify pre, post, and a possible priority level. 
* DEBUG Some debugging output code. 
* FIDDLE Something that allows one to specify different parameters and generate multiple compiles/runs or something. 
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


## Subsection Headings

Subsection headings refer to the higher level previous code block. One can write "#### Test"   (cap not matters) to write a test section for "## Great code".  This allows for the display of the markdown to have these sections hidden by default. 
Some possibilities as above, but also a doc type for writing user documentation. The literate programming is the developer's documentation, but how to use whatever can be written from within as well. 

By going two extra levels, we can recognize levels for testing and so forth without polluting the global namespace. Two levels could be those, such as examples, that should be for general review while three levels could be for edge case test cases, hidden by default. 

### Chunk headings

Parse out the section headings. These constitute "#+" followed by a name. Grab what follows. Parse code blocks indicated by 4 spaces in. One block per section reported, but can be broken up. Stitched together in sequence. 

To do this programmatically, we will split the whole text by newlines. At each line, analyze whether there is a "#" starting it--if so, get text after for name of section. At each line, check if there are four spaces. If so, add the line of code to the block. 

Each subheading is nested in the one above. So we need structures that hold the block and heading hierarchy.








* EXAMPLE  This makes the code block run as an example. There should be a dividing line between input and expected output. The difference between this and test is that an example should be readable and illuminating 

## Macros

A macro takes in some parameters and outputs some text. A macro is written in JavaScript and is evaluated by the server. This is a security risk for running other's code. 

A macro is initiated just as a substitution, but parentheses after it. The whole thing just gets eval'd.

So a macro such as _"check for undefined"('x')  would have 'x' thrown in and it is used in the code as a string. 

A main use case is in coding up documents, not programs. So this allows for the dynamic generation of static text. 

### Macro regex

The regex looks for 2 underscores and some stuff in a parenthses. The parenthetical cannot have parentheses. 

    var macroreg = /\_\_([^"]+)\(([^)]+)\)/;



##### Examples

A troublesome thing in JavaScript is knowing if something is defined or not. So let's say we want to check for it being defined and supply a default value: 

    __undefined("y", 2)

And the macro undefined could be 

  function (name, val) {
    return "if (typeof "+name+' === "undefined") { 'y = 2;}
  }

  
### Types

* TEST Give some input, write down expected output, and something about running it. 

## Parse lines

We create a function that takes in a literate program, splits it into lines, and parses them, returning a structure fur compilation. 

The structure consists of blocks that are themselves objects with an array of code lines, an array of the full lines, an array of any direct descendants, any subdirectives, and then any other properties object. 

    function (lp) {
      var i, line; 
      var firstblock = [];
      var doc = {
        blocks : {},
        cur : _"Current structure"
      };
      var lines = md.split("\n");
      doc.cur.level = 0; 
      var n = lines.length;
      for (i = 0; i < n; i += 1) {
        line = lines;
        code(line, doc) ||
        head(line, doc) || 
        directive(line, doc) ||
        plain(line, doc);
      }
      return doc;
    }

So we need to define four functions dealing with each type of object. They act on the doc object as necessary and will return true if successfully matched, short-circuiting the rest. 

### Current structure

We have an array of code lines, the array of full lines, direct escendants, sub directive headings, and properties

    {
      code : [],
      full : [],
      desc : [],
      subdire : [],
      prop : {}
    }

### Code parse 

We look for 4 spaces of indenation. If so, it is code and we store it in the current code block. Alternative pathways are handled elsewhere by replacing cur.code with something else and restoring it as necessary.

    function (line, doc) {
      var code = /^ {4}(.+)$/;
      match = code.exec(line);
      if (match) {
        doc.cur.full.push(line);
        doc.cur.code.push(match[1]);
        return true;
      } else {
        return false;
      }
    }

Done. 

##### TESTFUN

PREP : doc = {cur: {full : [], code : []}}
IN: "    some code;", doc
RUN:
OUT: true
CHECK : doc === {cur: {full : ["    some code;"], code : ["some code;"]}}


### Head parse

We recognize a heading by the start of a line having '#'. We count the number of sharps, let's call it level. The old level is oldLevel.

If level = oldLevel +1, then we have a new subsection of code. It will be a descendant of the old section, but it will also appear for free access. 

If level > oldLevel +2, then this is a Heading Directive and we try to match it with a directive. It feeds directly into the oldLevel section and is not globally visible. 

If level <= oldLevel then it pops up as a new subsection as a descendant at the earliest previous level of lower number. 

For new global blocks, we use the heading string as the block name. 

    function (line, doc) {
      var match, level, oldLevel, cur, old;
      var head = /^(\#+)\s*(.+)$/;
      match = head.exec(line);
      if (match) {
        match[2] = match[2].trim();
        oldLevel = doc.level || 0;
        level = match[1].length;
        cur = _"Current structure";
        old = doc.curBlock;

If directive, we do something different entirely. We cut out early with a return. 

        if (level >= oldLevel +2) {
          headDirective(match[2], cur, doc); 
          return true;
        }

First we check if this will be a descendant of another block. If so, we go up the parent chain looking for a parent whose level is lower than level. Once found, that is the old to proceed with. 

        if (level <= oldLevel) {
          doc.level = level;
          parent = old.parent; 
          while (old.parent && parent.level >= level) {
            old = old.parent;
          }

Old is now set and we move on to get everything going. 



        while (headlevel <= headcrumbs.length) {
          headcrumbs.shift();
        }
        while (headlevel > headcrumbs.length + 1) {
          headcrumbs.unshift("");
        }
        headlevel += 1; 
        headcrumbs.unshift(match[2]);
        current = blocks[match[2]] = [];

We will also assemble the full block as well. 

        curfull = fullblocks[match[2]] = [];
      }

    }

 NOT DONE   

### Directive parse

If directive, it tries to execute the directive, passing in whatever follows as the first argument and then the current code block and current full block.  

    funciton (line, doc) {
     var directive = /^\s*([A-Z]+)\:\s*(.*)$/;
          match = directive.exec(line);
          if (match && (dire.hasOwnProperty(match[1]))) {
            dire[match[1]](match[2], current, curfull);
          }

    }
  
NOT DONE

### Plain parse

This is a default. It means there is nothing special about the line. So we simply add it to the current full block.

    function (line, doc) {
      doc.cur.full.push(line);
      return true;
    }

Done.

## The Program

Open the file to read and then read it, extract the list of names, extract the code blocks, piece them together, save file. 

    _"Load modules"
    _"Save files"
    _"Load file"
    _"Get comment function"
    _"Directive execute"
    _"Chunk headings"
    _"DoSub"
    _"Make substitutions"


FILE: lp3.js

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


FILE: lp3Doc.md

### Further information on literate programming






## Directive execute


Create the object dire. It will contain object names for any directives that need to be instititued. For now, just FILE which adds to the files list. It has an optional regex string for matching substitutions. 

    var files = {};

    var dire = {
      FILE : function (options, code, full) {
        var reg = /^([a-zA-z0-9\/.]+)(?:\s*\,\s*(\S+))?/;
        var match = reg.exec(options);
        if (match) {
          var filename = match[1],
              sub = (match[2]) ? (new RegExp(match[2])) : /\_\"([^"]+)"/;
          files[filename] = [sub, code, full, typeComment(filename)];
        } else {
            console.log("error", options);
        }
      }
    };

The default regex matches _"heading name"  It replaces the whole line that it appears on. This is code block insertion.


## Get comment function

We need parse the type of file and then get the comment function associated with it. The markdown comment is nothing since the only way is HTML, but that could appear in some markdowns? Need to test in tumblr. 

    var fileTypes = { 
      js : function (type, name) {
        return "//"+type+" "+name+"\n";
      },
      html : function (type, name) {
        return "<!--"+type+" "+name+"!-->\n";
      },
      css : function (type, name) {
        return "/*"+type+" "+name+"*/\n";
      },
      md : function (type, name) {
        return ""; 
      },
      none : function (type, name) {
        return ""; 
      }
    };

    var typeComment = function (filename) {
      var dots = filename.split(".");
      var type = dots[dots.length -1];
      return fileTypes[type] || fileTypes.none;
    };


## Make substitutions

We now want to assemble all the code. At this point in the code, we have the files object which is of the form:

filename: [regex to match, code blocks array, full lines array]

So the plan is to go through each item in files. For every heading requested, grab the code, make substitutions, and then assemble. 

    var fname, file;
    for (fname in files) {
      file = files[fname];
      save(fname, doSub(file[0], file[1], fname, file[3]).join("\n"));
    }

The save command will save the text block to the filename. 



### DoSub

Here we implement the doSub command. 

The doSub command takes in substitute block and the code lines array. It should go through each line and if it matches a heading regexp, then the line is replaced with that new code block. 


We use comment and name to create comments in the code delimiting where the substitutions are. 

    var doSub = function doSub (sub, code, name, comment) {
      var i, n = code.length, line, match, blockname,
          ret = [comment("begin", name)] , newLines;
      for (i = 0; i < n; i += 1) {
        line = code[i];
        match = sub.exec(line);
        if (match) {
          blockname = match[1];
          if (blocks.hasOwnProperty(match[1])) {
            newLines = doSub(sub, blocks[blockname], blockname, comment); 
            ret = ret.concat(newLines);
          } else {
            console.log("no matching block name", blockname, line);
            ret.push(line);
          }


If it is not a substitution line, then we just add it on to the array.

        } else {
          ret.push(line);
        }

      } // end for
      ret.push(comment("end", name));
      return ret;
    };


## Load file

Get the filename from the command line arguments. It should be third item in [proccess.argv](http://nodejs.org/api/process.html#process_process_argv).  

No need to worry about async here so we use the sync version of [readFile](http://nodejs.org/api/fs.html#fs_fs_readfilesync_filename_encoding).

    var filename, md;
    filename = process.argv[2];
    md = fs.readFileSync(filename, 'utf8');

And now we want to strip the filename of its extension to use it for saving.

    filename  = filename.substring(0, filename.lastIndexOf('.'));

## Save files
    
Given name and text, save the file. 

    var save = function (name, text) {
          fs.writeFileSync(name, text, 'utf8');
    };


Done.


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

    /*global require, process, console*/
    var fs = require('fs');

## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)
