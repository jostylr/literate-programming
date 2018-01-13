# [litpro](# "version:2.0.0; Minimal command line for literate-programming")

This is the command line portion of literate-programming. It depends on
literate-programming-lib. 


At the moment, at least, I am of the firm opinion that one should structure a
litpro directory as cache, build, src, lprc.js  as where you start. These
locations can be changed in the command line, but the idea is that you are at
the top, it all goes down. 

Any initially given filenames are read as is. This allows for shell
completion. It is a little odd in that command line is non-prefixed while
loading from within doc is prefixed. One can also specify starting files in
lprc.js by modifying args.files. 

## Directory structure

* [litpro.js](#cli "save: |jshint ") The literate program compiler is activated by a command line program.
* [lprc.js](#lprc "save: |jshint") This will define the jshint command
* [test.js](#test "save: |jshint ") The testing file. 
* [README.md](#readme "save:| raw ## README, !--- | sub \n\ #, # |trim ") The standard README.
* [package.json](#npm-package "save: | jshint ") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | raw ## TODO, !--- ") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save:  ") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")


Reading file into cli

[cli](node_modules/literate-programming-cli/litpro.js "readfile:| 
    sub ./index.js, literate-programming-cli ")


## lprc

This imports the jshint command and starts that the build directory is the
current one and the default file to process is this one. 

    /*global module, require */
    module.exports = function(Folder, args) {

        if (args.file.length === 0) {
            args.file = ["project.md"];
        }
        args.build = ".";
         args.src = ".";

        require('litpro-jshint')(Folder, args);

    };


## Test

This just has one test currently. This should pass the same tests as
literate-programming-cli.  Just need to make sure it is hooked up correctly. 


    /* global require */
    var tests = require('literate-programming-cli-test')("node ../../litpro.js");

    tests( 
        ["first",  "first.md second.md -s ."]
    );





[off](# "block:")

## README


 # litpro 

This is the thin command-line client for
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
It contains the minimal functionality for literate programming, but it does
not have any other modules such as jshint included in it. For a fat client,
check out
[literate-programming](https://github.com/jostylr/literate-programming)

Install using `npm install litpro`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write `litpro` then use
`npm install -g litpro`.

 ## Example usage

 Save the following code to file `project.md` and run `litpro project.md`.

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


For more on the document format, see 
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).

 ## Documentation

For more information, see the 
[documentation book](https://leanpub.com/literate-programming-md) 
which is free to read online or available for purchase as a PDF. 

Some particularly useful syntax sections are: 

*  [command-line flags](https://leanpub.com/literate-programming-md/read#leanpub-auto-command-line-1)
* [directives](https://leanpub.com/literate-programming-md/read#leanpub-auto-directives-1)
* [commands](https://leanpub.com/literate-programming-md/read#leanpub-auto-commands-1)
* [subcommands](https://leanpub.com/literate-programming-md/read#leanpub-auto-subcommands-1)
 

 ## Use and Security

This thin client is envisioned to be a developer dependency for projects using
it. Thus one would install it via npm's json package system along with any
litpro plugins. 

The only caveat to this is that it is inherently unsecure to compile literate
program documents. No effort has been made to make it secure. Compiling a
literate program using this program is equivalent to running arbitrary code on
your computer. Only compile from trusted sources, i.e., use the same
precautions as running a node module. 
 

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)

!---


## TODO


!---

[on](# "block:")

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
      "license": "MIT", 
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
        "test" : "node ./test.js"
      },
      "keywords": ["literate programming"],
      "bin": {
        "litpro" : "./litpro.js"
      }
    }


## gitignore

    node_modules
    /build
    /cache
    /.checksum


## npmignore


    old
    build
    .checksum
    cache
    tests
    test.js
    travis.yml
    node_modules
    *.md


## Travis

A travis.yml file for continuous test integration!

    language: node_js
    node_js:
      - "node"
    sudo: false



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





by [James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: literate-programming-cli 2.0.0 ;
    dev: litpro-jshint 0.3.1, 
        literate-programming-cli-test 0.5.1")


