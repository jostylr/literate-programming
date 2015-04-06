# [literate-programming](# "version:0.9.0; A literate programming compile script. Write your program in markdown. ")

"This is like writing spaghetti code then shredding the code into little
pieces, throwing those pieces into a blender, and finally painting the paste
onto an essay. Tasty!"

This file creates the literate program parser using the literate program
parser. Currently it uses the old version to compile. 

A literate program is a series of chunks of explanatory text and code blocks
that get woven together. The compilation of a literate program can grunt,
after a fashion, as it weaves. 

This version is the precursor to version 1, which I intend to be the stable
version going forward. 



## Directory structure

* [index.js](#index "save: |jshint") This is the file that runs this. It is a
  thin layer on top of the command line module and putting in various litpro
  plugins. 
* [README.md](#readme "save:| raw ## README, !--- | sub \n\ #, # ") The standard README.
* [lprc.js](#lprc "save:| jshint") This contains the options of how to compile
  this using the new version. Not currently used. 
* [package.json](#npm-package "save: | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | raw ## TODO, !--- ") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save: ") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")
* [test.js](#tests "save: | jshint")

# Index 

We need to require the command line plugin and some litpro plugins. 

    #!/usr/bin/env node

    /*global process, require, console*/

    var mod = require('literate-programming-cli');

    var opts = mod.opts;

    var args = opts.parse();
    
    _":build stripping"

    _":arg z"

    var Folder = mod.Folder;

    Folder.prototype.encoding = args.encoding;

    Folder.lprc(args.lprc, args);
    
    _"litpro plugins"

    Folder.process(args);

    process.on('exit', Folder.exit());


[build stripping]()

The goal is to remove a trailing slash from the file names. 

    args.build = args.build.map(function (el) {
        if (el.slice(-1) === "/") {
            return el.slice(0, -1);
        } else {
            return el;
        }
    });


[arg z]()

This is the other option parsing. So we will reiterate over it. We split on
the colon. If there is no second colon, then we treat it as a boolean flag.
To pass in multiple values, use more colons. 

Example  `-z papers:dude:great:whatever` will translate into creating
`args.papers = ['dude', 'great', 'whatever']`

    args.other.forEach(function (arg) {
        var pair = arg.split(":");
        if (pair.length === 1) {
            args[pair[0]] = true;
        } else if (pair.length === 2) {
            args[pair[0]] = pair[1]; 
        } else {
            args[pair[0]] = pair.slice(0);
        }
    });



## litpro plugins


    require('litpro-jshint')(Folder, args);
    require('litpro-commonmark')(Folder, args);

## lprc

This creates the lprc file for this project. Basically, it just says to run
lp.md as the file of choice and to build it in the directory 

    module.exports = function(Folder, args) {

        if (args.file.length === 0) {
            args.file = ["lp.md"];
        }
        args.build = ".";
        args.src = ".";

        require('litpro-jshint')(Folder, args); 

        Folder.directives.version = function (args) {
            var doc = this;
            var colon = doc.colon;

            var ind = args.input.indexOf(";");

            doc.store(colon.escape("g::docname"), 
                args.link.trim());
            doc.store(colon.escape("g::docversion"),
                args.input.slice(0, ind).trim());
            doc.store(colon.escape("g::tagline"), 
                (args.input.slice(ind+1).trim() || "Tagline needed" ) );

        };
    };

## Tests

We got tests

    /*global require */

    var tests = require('literate-programming-cli-test')("node ../../index.js");

    tests(
        ["fizzbuzz", "fizzbuzz.md"],
        ["fence", "-b . fence.md"]
    );


## References

I always have to look up the RegEx stuff. Here I created regexs and used their [exec](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp/exec) method to get the chunks of interest. 

[MDN RegExp page](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp)

Also of invaluable help with all of this is [RegExpr](http://www.regexper.com/)


[off](# "block:")

## README


 # literate-programming   

Write your code anywhere and in any order with as much explanation as you
like. literate-programming will weave it all together to produce your project.

This is a modificaiton of and an implementation of 
[Knuth's Literate Programming](http://www-cs-faculty.stanford.edu/~uno/lp.html)
technique. It is
perhaps most in line with [noweb](http://tex.loria.fr/litte/ieee.pdf). 

It uses markdown as the basic document format with the code to be weaved
together being delimited by each line having 4 spaces as is typical for
markdown. Note that it requires spaces but not tabs. This allows one to use
tabs for non lit pro code blocks as well as paragraphs within lists. GitHub
flavored code fences can also be used to demarcate code blocks. 
    

It can handle any programming language, but has some standard commands useful
for creating HTML, CSS, and JavaScript. 

 ## Installation

This requires [node.js](http://nodejs.org) and [npm](https://npmjs.org/) to be
installed. Then issue the command:

    npm install -g literate-programming

 ## Using

From the command line:

    literate-programming <file.md>

This will process the literate program in `file.md` and produce whatever
output files are specified in the literate program. 

Use `literate-programming -h`  for command flag usage, including specifying
the root output directory.

It can also be used as an executable program; see
[primes.md](https://github.com/jostylr/literate-programming/blob/master/examples/primes.md)
for an example program of this kind.   

 ## Example

Let's give a quick example. Here is the text of sample.md

    # Welcome

    So you want to make a literate program? Let's have a program that outputs
    all numbers between 1 to 10.

    Let's save it in file count.js

    [count.js](#Structure "save:")

    ## Structure 

    We have some intial setup. Then we will generate the array of numbers. We
    end with outputting the numbers. 

        var numarr = [], start=1, end = 11, step = 1;

        _"Loop"

        _"Output"

    ## Output 

    At this point, we have the array of numbers. Now we can join them with a
    comma and output that to the console.

        console.log("The numbers are: ", numarr.join(", ") );

    ## Loop

    Set the loop up and push the numbers onto it. 

        var i;
        for (i = start; i < end; i += step) {
            numarr.push(i);
        }


And it can be run from the command line using `node count.js`

There are more
[examples](https://github.com/jostylr/literate-programming/tree/master/examples),
but for a non-trivial example, see the 
[literate program](https://github.com/jostylr/literate-programming/blob/master/lp.md)
that compiles to literate-programming.


 ## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level, either atx # or
seText underline ) demarcates a full block. Code blocks within a full block
are the bits that are woven together. 

 ### Code Block

Each code block can contain whatever kind of code, but there are three special
syntaxes: 

1. `_"Block name"` This tells the compiler to compile the block with "Block
   name" and then replace the _"Block name" with that code.
2. ``_`javascript code` ``  One can execute arbitrary javascript code within
   the backticks, but the parser limits what can be in there to one line. 
3. `MACROS` all caps are for constants or macro functions that insert their
   output in place of the caps. Note that if you have `MACRO(_"something")`
   then the current version does not parse `_"something"` as a code block.
   This will hopefully get fixed along with being able to use code blocks in
   commands. This applies even if `MACRO` does not match so it is a bug, not a
   feature :(  To fix this, put a space between `MACRO` and the parenthesis. 

For both 1 and 3, if there is no match, then the text is unchanged. One can
have more than one underscore for 1 and 2; this delays the substitution until
another loop. It allows for the mixing of various markup languages and
different processing points in the life cycle of compilation. See
[logs.md](https://github.com/jostylr/literate-programming/blob/master/examples/logs.md)
for an example. 

 ### Directive

A directive is a command that interacts with external input/output. Just about
every literate program has at least one save directive that will save some
compiled block to a file. 

The syntax for the save directive is 

    [file.ext](#name-the-heading "save: named code block | pipe commands")  

where file.ext is the name of the file to save to,  name-the-heading is the
heading of the block whose compiled version is being saved (spaces in the
heading get converted to dashes for id linking purposes), `save:` is the
directive to save a file, `named code block` is the (generally not needed)
name of the code block within the heading block, and the pipe commands are
optional as well for further processing of the text before saving. 

For other directives, what the various parts mean depends, but it is always 

    [some](#stuff "dir: whatever")  

where the `dir` should be replaced with a directive name. 

 ### Pipes

One can also use pipes to pipe the compiled text through a command to do
something to it. For example, `_"Some JS code | jshint"`  will take the code
in block `some JS code` and pipe it into jshint to check for errors; it will
report the errors to the console. We can also use pipe commands in a save
directive:  `FILE "Some JS code" code.js | jstidy` will tidy up the code
before storing it in the file `code.js`.

 ### Named Code Block

Finally, you can use distinct code blocks within a full block. 

Start a line with link syntax that does not match a directive. Then it will
create a new code block with the following data `[code name](#link "type |
pipes")`. All parts are optional. The link is not used and can be anything. The
minimum is  `[](#)`  to make a new (unnamed) code block. 

Example: Let's say in heading block Loopy we have `[outer loop](# "js")` at the
start of a line. Then it will create a code block that can be referenced by
_"Loopy:outer loop".

 ## Nifty parts of writing literate programming

* You can have your code in any order you wish. 
* You can separate out flow control from the processing. For example,

        if (condition) {
            _"Truth"
        } else {
            _"Beauty"
        }
    
    The above lets you write the if/else statement with its logic and put the
    code in the code blocks `truth` and `beauty`. This can help keep one's
    code to within a single screenful per notion. 
* You can write code in the currently live document that has no effect, put in
  ideas in the future, etc. Only those on a compile path will be seen. 
* You can "paste" multiple blocks of code using the same block name. This is
  like DRY, but the code does get repeated for the computer. You can also
  substitute in various values  in the substitution process so that code
  blocks that are almost the same but with different names can come from the
  same root structure. 
* You can put distracting data checks/sanitation/transformations into another
  block and focus on the algorithm without the use of functions (which can be
  distracting). 
* You can use JavaScript to script out the compilation of documents, a hybrid
  of static and dynamic. 

I also like to use it to compile an entire project from a single file, pulling
in other literate program files as needed. That is, one can have a
command-and-control literate program file and a bunch of separate files for
separate concerns. But note that you need not split the project into any
pre-defined ways. For example, if designing a web interface, you can organize
the files by widgets, mixing in HTML, CSS, and JS in a single file whose
purpose is clear. Then the central file can pull it all in to a single web
page (or many).

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE)

!---



[on](# "block:")

## TODO

Eliminate both macros and eval code by doing `_"|command..."`. So this has no
code block feeding in (empty string into that bit of command part), but
otherwise works like all the other filter stuff. Just a single execute
context. For evaling, include an eval command. 

The quote-code block takes care of including code that does not get compiled.
Want to include tabs for having code blocks. Also want to allow lists to be
fine. Also, probably haven't implemented hanging indented paragraphs. 

So need modes for the parser: If first line of block is not indented code or
code fence,
then no code block parsed until next \n\n block. But we do need to scan for
directives. We also want to keep track of list mode. Be aware of different
item markers. If in list mode, code should be indented 8 spaces. And we can
have sublists (just keeping adding levels).

Need a way for commands to pause the execution of that pathway. Then async
should be doable. 

---

Need to document every single syntax bit. Eliminating macros in favor of
javascript code that has access to a "global" namespace. So instead of
GEOGEBRA, one could have _`geogebra` and somewhere we could have _`geogebra =
"http://geogebra.org"` or `[geogebra](# "define: http://geogebra.org")`  which
would take the name and associate with the value. The define directive could
be done anywhere and would be seen before any code evaluation in the cblocks
while the other one would need to have order taken care of it (tricky,
possibly). In the define, allow  eval(...) to execute code to create the
value. We could also have access to other docs globals using
_docs.docname.varname 

Use marked to parse the document. Write a custom parser for the
substitutions/commands. 

Convert to event-style async. This should allow for easier hooking into the
process. Create directives that allow eventing and hooking, somewhat along the
lines of the define directive. 


Make sure missing blocks don't cause problems. 

Add in a toggle to enable immediate console logging from doc.log calls. 

Make sure non-existent blocks do not hang program (cname). More generally,
make sure that looped references (alice calls bob, bob calls alice) do not
hang program; emit doc.log problem and move on. Also have a check at the end
for ready to compile docs. This should allow for saving of files that are fine
and the hung up files do not get saved. 

Deal with line spacing. 

Deal with empty file -- a better reporting mechanism. 

Implement a ! tracking. Put ! at the beginning of a line--the number of marks
is the level of severity of the issue. 

Add in an opt-out for file saving or a rerouting... Add to Version the ability
to set various boolean flags, such as dev, deploy, ..., add an environment
directive to set those things. 

Implement a literate program testing example. Also a dev, deploy version.
Realized one could have a lit pro that is just a shell for files, etc.,
calling in the big thing. 

More docs.

Have some more preview/testing options. Maybe an abort on failed test/jshint
kind of stuff and/or a diff viewer. npm diff seems popular. 


Make a proper parser of commands, directives that allows for nested
parentheticals, quotes, commas, escapes
 

Using  VARS to write down the variables being used at the top of the block.
Then use _"Substitute parsing:vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

 ## IDE

An in-browser version is planned. The intent is to have it be an IDE for the
literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from
http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of
documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...

!---

## NPM package

The requisite npm package file. 


    {
      "name": "_`g::docname`",
      "description": "_`g::tagline`",
      "version": "_`g::docversion`",
      "homepage": "https://github.com/_`g::gituser`/_`g::docname`",
      "author": {
        "name": "_`g::authorname`",
        "email": "_`g::authoremail`"
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/_`g::gituser`/_`g::docname`.git"
      },
      "bugs": {
        "url": "https://github.com/_`g::gituser`/_`g::docname`/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/_`g::gituser`/_`g::docname`/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">=0.10"
      },
      "dependencies":{
        _"g::npm dependencies"
      },
      "devDependencies" : {
        _"g::npm dev dependencies"
      },
      "scripts" : { 
        "test" : "node test.js"
      },
      "keywords": ["literate programming plugin"]
    }

    
## gitignore

    node_modules
    temp

## npmignore


    archive
    test
    travis.yml
    examples
    ghpages
    fixed_examples
    temp
    node_modules
    *.md
    mon.sh


## Travis

A travis.yml file for continuous test integration!

    language: node_js
    node_js:
      - "0.10"



## LICENSE MIT


    The MIT License (MIT)
    Copyright (c) _"g::year" _"g::authorname"

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.


## Change Log
v0.9.0 Switched to using the new library. 

v0.8.4 Made it so that all loaded files wait until all files are loaded before
compiling. 

v.0.8.0 Added code fencing by doing a simple switch on the parsing. 

v.0.7.5 fixing what was done in 0.7.4 to actually work. A little too hasty.

v.0.7.4  Added extension restriction for use with live reload plugin

v.0.7.3 Added ability to specify output directory as a second argument after file. 

v.0.7.1 Added the ability to have a (single) plugin file called lprc.js.
logs.md now uses it as an example. 

v.0.7.0 

Implemented link syntax for directives and type switching.

Implemented templates using asterisk notation. 

Added a postCompile function to have postCompile actions even if no file is
being saved. 

Implemented being able to use a literate program directly as a command line
program. See primes.md

Updated docs to reflex new syntax.

v.0.6.1

Implemented using underlines for headings per markdown spec.

v.0.6.0

_"Load directive"  Set it up so that LOAD works asynchronously. Multiple LOADs
are handled. The property doc.loading holds which documents are being loaded. 

_"Cli"  Set it up so that saving, file loading,... is a function passed into
the doc. This allows for a much more flexible setup

_"Doc constructor" Make it so that constructing the document parses it and
compiles it and saves it. The passed in options can overwrite the behavior.
There can be a callback issued once everything is done. 

_"Compile time" Make it async. Each call to a block either pulls in the
compiled bit or queues up the current block. Need to store state. 

_"Process files" is a part of the document constructor. Everything about a
"file" will be created and stored in compiledFiles. Now deprecated. 

_"Process actions" replaced files. This gives a stronger plugin feel. See the
section for what should be in an action. These wait for the compiled code
block to be compiled and then execute. 

_"Save Files", _"Preview Files", _"Diff Files"  all do their job acting on
compiledFiles. 

_"Doc commander", _"Pipe Processor" have been converted to supporting
asynchronous callbacks. 



[James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: literate-programming-cli 0.8.4, litpro-jshint 0.1.0,
    litpro-commonmark 0.2.1; 
    dev: literate-programming-cli-test 0.3.0 ")


