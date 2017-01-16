# [literate-programming](# "version:0.10.0; Fat command line for literate-programming")

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

* [../](# "cd: save")
* [lprc.js](#lprc "save: |jshint") This will define the jshint command
* [package.json](#npm-package "save: | jshint ") The requisite package file for a npm project. 
* [LICENSE](#license-mit "save:  ") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")
* [](# "cd: save")


## lprc

This imports the jshint command and starts that the build directory is the
current one and the default file to process is this one. 

    /*global module, require */
    module.exports = function(Folder, args) {

        if (args.file.length === 0) {
            args.file = ["project.md"];
        }

        args.src = ".";

        require('litpro-jshint')(Folder, args);

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
        "node": ">=4.0"
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
        "literate-programming" : "./index.js"
      }
    }
 

## gitignore

    node_modules
    /build
    /cache
    /.checksum


## npmignore


    build
    .checksum
    cache
    tests
    test.js
    travis.yml
    *.md


## Travis

A travis.yml file for continuous test integration!

    language: node_js
    node_js:
      - "node"
      - "4.0"
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
    deps: literate-programming-cli 1.1.1, jshint 2.9.4,
       postcss 5.2.8, autoprefixer 6.6.0, pug 2.0.0-beta6,
       markdown-it 8.2.2, cheerio 0.22.0, js-beautify 1.6.7,
       html-minifier 3.2.3, clean-css 3.4.23, uglify-js 2.7.5,
       csv 1.1.0, date-fns 1.24.0, lodash 4.17.4, he 1.1.0   ;
    dev: litpro-jshint 0.3.1, 
        literate-programming-cli-test 0.5.1, 
        markdown-it-anchor 2.6.0")

