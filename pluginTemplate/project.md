# [litpro-name](# "version: 0.1.0")

This is a template file for writing plugins for literate-programing.

Run `literate-programming -b . project.md` initially. After that, one can
just run `literate-programming` and the lprc.js file will do what needs to be
done. 

This is designed to work with the 1.0 version of literate-programming.

## Directory structure

* [index.js](#index "save: |jshint") This is the file that runs this. It is a
  thin layer on top of the command line module and putting in various litpro
  plugins. 
* [README.md](#readme "save:| clean raw") The standard README.
* [lprc.js](#lprc "save:| jshint") This contains the options of how to compile
  this using the new version. Not currently used. 
* [package.json](#npm-package "save: json  | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | clean raw") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save: | clean raw") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")

## Index

This is the primary file that will be read. It should export a function that
takes in the Folder and args. Typically, one would add commands and directives
to Folder, after requiring any other modules. 


    module.exports = function(Folder, args) {

        // following examples as templates

    };


### Sync Commands

These are the simplest. The return value is used to continue the flow. They
have access to incoming text and the comma separated arguments.

        Folder.sync("cmd", function (input, args, name) {
            var doc = this;
            
            //do stuff with input (in text) and the pipe arguments

            return value;
        });

### Async Command

Call the callback. It has typical node signature of err, value.

        Folder.async("cmdasync", function (input, args, callback, name) {
            var doc = this;

            //do stuff with input and pipe arguments
            // when async done, call callback with err, value 
        
            // no return value

        });

### Raw Command

Do whatever you like, but to continue on, you need to have the text ready
event for the passed in name.

        Folder.commands.cmdraw = function (input, args, name, command) {
            var doc = this;
            var gcd = doc.gcd;

            // stuff

            gcd.emit("text ready:" + name, value);
        }

### Directives

This allows you to create a directive. There are no shortcuts. The cache
allows one to call expensive arguments (such as reading files) and cache them
across folders. The pipes is an example of how to have the command argument
processing familiar with substitutions. It can be convenient, for example with
save commands. 

        Folder.directives["dir words"] = function (args) {
            var doc = this;
            var gcd = doc.gcd;

            var linktext = args.link;
            var titlepostcolon = args.input;
            var href = args.href;
            var currentheading = args.cur;
            var directive = args.directive;

            //do stuff. returns are ignored.

            //cache example

            doc.parent.Folder.fcd.cache(
                ["starting event", startingData],
                "expected response event",
                function (data) {
                    var fcd = this;

                    //you can emit gcd events via closures

                    return value;
                }, 
                "event emitted with return value to fcd"
            );

            //pipes example
    
            // allowing stuff before first pipe to be some other use
            pipes = title.slice(title.indexOf("|")).trim(); 
            var emitname = "something unique";
   
                if (pipes) {
                    pipes += '"';
                    f = function (data) {
                        //do something with computed data
                        // such as doc.store(linktext, data);
                    };
                    gcd.once("text ready:" + emitname, f);
                    doc.pipeParsing(pipes, 0, '"', emitname, blockForMinors);
                    gcd.emit("text ready:" + emitname + colon.v + "0", prePipeResult );
                } else {
                    //do something with prePipe Result
                    //such as doc.store(linktext, perPipeResult);
                }
            }

## lprc

This creates the lprc file for the plugin. Basically, it just says to run
project.md as the file of choice and to build it in the top directory.


    module.exports = function(Folder, args) {

        if (files.length === 0) {
            args.files = ["project.md"];
        }
        args.build = ".";
        args.src = ".";

    }

## Readme

This is the readme for the plugin.  

    # Stuff

    This is a plugin for [literate-programming](https://github.com/jostylr/literate-programming). Install that and then you can use this by requiring it in the lprc.js file. 


## npm package

This should setup the npm file 


    {
      "name": _"docname",
      "description": "A literate programming compile script. Write your program in markdown.",
      "version": _"docversion",
      "homepage": "https://github.com/jostylr/literate-programming",
      "author": {
        "name": '_"authorname"',
        "email": '_"authoremail"'
      },
      "repository": {
        "type": "git",
        "url": "git://github.com/_`gituser`/_`docname`.git"
      },
      "bugs": {
        "url": "https://github.com/_`gituser`/`docname`/issues"
      },
      "licenses": [
        {
          "type": "MIT",
          "url": "https://github.com/_`gituser`/`docname`/blob/master/LICENSE-MIT"
        }
      ],
      "main": "index.js",
      "engines": {
        "node": ">=0.10"
      },
      "dependencies":{
      },
      "devDependencies" : {
      },
      "scripts" : { 
        "test" : "node ./test/test.js"
      },
      "keywords": ["literate programming plugin"],
    }

## gitignore

Stuff not to include in git. Don't check in your modules.

    node_modules

    

## npmignore

npm does not need to see your tests or your litpro code. Submit the js stuff!
Despite the `*.md`, your readme file will be seen. 

    tests
    test.js
    travis.yml
    ghpages
    node_modules
    *.md
    

## Travis

You write tests, right? 


    language: node_js
    node_js:
      - "0.10"
      - "iojs"
      - "0.12"
    

## todo

Whatever you nee to do. 

## License

    The MIT License (MIT)
    Copyright (c) 2013 James Taylor

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


