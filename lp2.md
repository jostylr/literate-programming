# Literate Programming

This is the second cycle of literate programming. In this cycle, substituting code in as snippets will be the main goal to accomplish.

Each heading level defines a new namespace. As one searches for a name, it will go up the hierarchy. If it is outside the hierarchy, then proximity wins with a note of warning. 

Each file can specify the leading character(s) for a substitution, but an underscore will be default. To create a file, use FILE: name at the beginning of a line. Then all code in that block will define the contents of that file. 


## The Plan

Open the file to read and then read it, extract the list of names, extract the code blocks, piece them together, save file. 

1. Load modules
5. Save files
1. Load file
1. Get comment function
1. Directive execute
1. Chunk headings
4. DoSub
4. Make substitutions

OUT: js

## Chunk headings

Parse out the section headings. These constitute "#+" followed by a name. Grab what follows. Parse code blocks indicated by 4 spaces in. One block per section reported, but can be broken up. Stitched together in sequence. 

To do this programmatically, we will split the whole text by newlines. At each line, analyze whether there is a "#" starting it--if so, get text after for name of section. At each line, check if there are four spaces. If so, add the line of code to the block. 

Each subheading is nested in the one above. So we need structures that hold the block and heading hierarchy.

First we create the variables and the regexps.

    var lines, line, i, n, match, head, headlevel, code, name, directive,
        blocks = {}, fullblocks = {}, current = [], curfull = [],
        headcrumbs = [];
    lines = md.split("\n");
    n = lines.length;
    head = /^\s*(\#+)\s*(.+)$/;
    code = /^ {4}(.+)$/;
    directive = /^\s*([A-Z]+)\:\s*(.*)$/;

Now we loop over the lines. 

    for (i = 0; i < n; i += 1) {
      line = lines[i];
      match = head.exec(line);

If it is a heading, then we need to make the appropriate head crumb trail. If it is a deeper level, we add the current to the crumb. If it is at an equal or higher level, we get rid of them until it gets into the appropriate level. Add in blanks if the levels mismatch.

      if (match) {
        headlevel = match[1].length;
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

If not a head, then we need to add line to full block and then check if it is a code block or directive. If directive, it tries to execute the directive, passing in whatever follows as the first argument and then the current code block and current full block.  

      } else {
        curfull.push(line);
        match = code.exec(line);
        if (match) {
          current.push(match[1]);
        } else {
          match = directive.exec(line);
          if (match && (dire.hasOwnProperty(match[1]))) {
            dire[match[1]](match[2], current, curfull);
          }
        }
      }
    }



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


## Load modules

We need the filesystem module that is default installed.

    /*global require, process, console*/
    var fs = require('fs');

## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)
