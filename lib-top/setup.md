# [literate-programming-lib](# "version:2.0.0; A literate programming compiler. Write your program in markdown. This is the core library and does not know about files.")

This creates the core of the literate-programming system. It is a stand-alone
module that can be used on its own or with plugins. It can run in node or the
browser via browserify.

The basic idea is that the text is fed to it already and then it parses it. It
is event based and so to have it do something, one has to connect up the
events. 

A literate program is a series of chunks of explanatory text and code blocks
that get woven together. The compilation of a literate program can grunt,
after a fashion, as it weaves. 

## Save

* [../](# "cd: save")
* [lprc.js](#lprc "save:|jshint") The litpro config file. 
* [package.json](#npm-package "save: | jshint") The requisite package file for a npm project. 
* [LICENSE](#license-mit "save:") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")
* [](# "cd: save")

## lprc

This is compiled by litpro and uses the following lprc.js file

    /*global module, require*/ 
    module.exports = function(Folder, args) {

        //require('litpro-jshint')(Folder, args);
        Folder.plugins.jshint.clean = true;


    };


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
      "keywords": ["literate programming"]
    }


## gitignore

    node_modules
    temp
    /.checksum
    /build
    old

## npmignore


    tests
    test.js
    travis.yml
    ghpages
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
    deps: event-when 1.6.1, commonmark 0.27.0, string.fromcodepoint 0.2.1;
    dev: tape 4.6.3, litpro-jshint 0.3.1")

