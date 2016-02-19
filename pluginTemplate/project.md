# [litpro-](# "version: 0.1.0 ; basic plugin structure. please change")

This implements 

If litpro is installed, run `litpro -b . project.md; npm install` initially.
After that, one can just run `litpro` and the lprc.js file will do what needs
to be done. 

This is designed to work with the 1.0 version of [literate-programming](https://github.com/jostylr/literate-programming).


## Directory structure

* [index.js](#index "save: |jshint") This is the file that is the module.
* [README.md](#readme "save: ") The standard README.
* [lprc.js](#lprc "save:| jshint") How to compile this file with litpro.
* [package.json](#npm-package "save: | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | raw ## Todo, ---") A list of growing and shrinking items todo.
* [LICENSE](#license "save:") The MIT license
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")
* [test.js](#test "save: |jshint") 


## Index

This is the module entry point.

    var MAIN = require('');

    module.exports = function (Folder, args) {

        var options = Folder.plugins.NAME =  {
            ....
        };

        _"cmds"

        _"directives"

        _"subcommand"

    };

    
### Cmds

These are the commands. Synchronous ones return a value to be transmitted
while asynchronous ones should call the callback with the value to return.

    Folder.sync("name", function(text, args, name) {

        
        return text;
    };


    Folder.async("aname", function(text, args, callback, aname) {


        callback(null, input);
    };


### Directives

These are our directives, if any.

`[link](href "directive:input")` each has an entry in the args except
directive. `args.cur` gives the current block's name.

Also of interest may be `doc.pipeDirSetup( pipes, emitname, f, start);` which
helps with having pipe commands if you need them. 

    Folder.directives.dname = function (args) {
        
    };
    


### Cmd with options

A tough problem with plugins is providing a way to have options plugged in
that can modify the flow. This is one methodology for dealing with it.  The
idea is to have different stages, say an init, first, second, ..., and exit.
This is in the context of having one, two, ... functions that process the text
sequentially. 

We have an init phase where data and crew can be manipulated before calling
any of the library functions. So this is where options can be created for an
object. Then each of the first, second, etc., starts off with a command from
the standard path. So maybe we initialize a set of functions in first, then we
parse the text in second, and then we render in third. After the standard one
works in a step, then the others can be run. The ordering is provided by the
args. Each function is provided with the data and crew variables where data is
intended to be the stuff being manipulated and returned while crew are somem
kind of helpers or options to the others. 

A lot of the details below would change, but this is a starting template. 

The term `standard` is special. That is the common flow. If it is not present
in the arguments, then it is put in 


        Folder.sync("md", function (text, args) {
            var doc = this;
            var data = {text: text};
            var crew = {};

            var actors = Object.create(doc.plugins.NAME);
            
            _":see if args is an object"
            
            if (args.indexOf("standard") === -1 ) {
                args.unshift("standard");
            }


            _":args | sub PLACE, init" 
            _":args | sub PLACE, first" 
            _":args | sub PLACE, second" 
            _":args | sub PLACE, third" 
            _":args | sub PLACE, exit" 

            return data.ret;
        });

        Folder.plugins.NAME = _":actors";


    };

[see if args is an object]()

If the argument is `{ ...}`, then the object gets added to the processor in
which case it gets labelled as `_#` where the number is the position of the
argument number.

If the object has key `_overwrite`, then that value will be used as the name.
This is helpful if one wants to overwrite a given object. 

Note this eval instead of JSON since the object values are functions. This
also means that it will have access to the environment. One can do immmediate
function evaluations as well.

So for example to overwrite standard but still use the first step, one could
do  

```ignore
{ _overwrite : standard, 
first: actors.standard.first,
second : function () {...}
}
```



    args.forEach( function (el, i) {
        var key, val;
        el = el.trim();
        if (el[0] === "{") {
            key = "\u005F"+i;
            try {
                val = eval("val = " +el);
            } catch (e) {
                console.error("Error in args", e, el);
                val = {};
            }
            if (val._overwrite) {
                key = doc.parameters(el, 0);
                key = val._overwrite;
                delete val._overwrite;
            }
            args[i] = key;
            actors[key] = val;

        }
        key = args
    });





[args]()

This runs over the arguments and tries to use any that modify any part of the
process. 

    args.forEach( function (el) {
        (actors[el].PLACE || noop)(data, crew, actors );
    });


[actors]()

An actor is an object whose keys say where the value that is a function should
be run. 

    {
        standard : _"standard", 
        widget : {
            init: _":init,
            first: _":first",
            third: _":third"
        },
        log : {
            init: _":init"
        }
    };



[standard]()

This does the main processing. 

    {
        first: function (data, crew) {
            crew.reader = new NAME.Parser(crew.parserOptions);
            crew.writer = new NAME.Renderer(crew.RendererOptions);
        },
        second : function (data, crew) {
            data.parsed = crew.reader.parse(data.text); 
        },
        third : function (data, crew) { 
            data.ret = crew.writer.render(data.parsed); 
        }
    }




[init]()

Let's say we want a non-standard something, say widget, that cuts out some
troublesome text and then we post it back in at the end. We could initialize
it with this.

    function (data, crew) {
        data.widget = [];
        crew.widgetsnip = function (match) {
            var w = data.widget;
            w.push(match);
            return "WIDGETSNIP"+(w.length-1);
        };
        crew.widgetunsnip = function (match, number) {
            return data.tex[parseInt(number, 10)];
        };
        crew.widgetreg = /!![^!]+!!/g;
        crew.widgetunreg = /WIDGET(\d+)/g;

    }

[first]() 

While our standard initializes its functions, we start chopping on the string
doing some replacements. 

    function (data, crew) {
        data.text = data.text.replace(crew.widgetreg, crew.widgetsnip);
    }


[third]()

    function (data, crew) {
        data.ret = data.ret.replace(crew.widgetunreg, crew.widgetunsnip);
    }

### Log

A quick log of the text. Can be used at any point to see the state of the
text. 

    


## lprc

This creates the lprc file for the plugin. Basically, it just says to run
project.md as the file of choice and to build it in the top directory.


    module.exports = function(Folder, args) {
    
        require('litpro-jshint')(Folder);

        if (args.file.length === 0) {
            args.file = ["project.md"];
        }
        args.build = ".";
        args.src = ".";


    };

## Test 

    /*global require */

    var tests = require('literate-programming-cli-test')(true, "hiddenConsole");

    tests( 
        ["*sample"]
    );

## Readme

This is the readme for the plugin.  

    # Commonmark

    This is a plugin for [literate-programming](https://github.com/jostylr/literate-programming). 
    
    Install `npm install litpro-commonmark` and then you can use this by requiring it in the lprc.js file.


    ## Example lprc.js

        module.exports = function (Folder) {
            require("litpro-commonmark")(Folder);
        }

    ## Example project.md

    This is a file you could run to generate some html using this. 

        _":sample"


[sample]() 

    Some nice text here. 


[tests/sample.md](# "save:") 

    :project.md
    # Sample MD

    We just want to create a simple document. 

        <html>
            <body>
                \_"content | md"
            </body>

    [simple.html](# "save:")

    ## Content

        I **love** markdown. Can't you tell?

        There are lots of plugins to use:

        * commonmark
        * marked
        * showdown
        * ...

        I went with commonmark because it has a spec!

    ---=simple.html    
    <html>
    <body>
    <p>I <strong>love</strong> markdown. Can't you tell?</p>
    <p>There are lots of plugins to use:</p>
    <ul>
    <li>commonmark</li>
    <li>marked</li>
    <li>showdown</li>
    <li>...</li>
    </ul>
    <p>I went with commonmark because it has a spec!</p>   
    </body>





## npm package

This should setup the npm file 


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
      "keywords": ["literate programming plugin"]
    }

## gitignore

Stuff not to include in git. Don't check in your modules.

The tests is excluded with the presumption of cli-test's format of `.md` files
that populate into test directories. We check in the files, but not the test
directories. 

    node_modules
    .checksum
    /tests/*/

    

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
    

[off](# "block:")

## Todo

Everything

---
[on](# "block:")

## License

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



[James Taylor](https://github.com/jostylr "npminfo: jostylr@gmail.com ; 
    deps: commonmark 0.18.1, merge 1.2.0  ; 
    dev: litpro 0.9.3, litpro-jshint 0.2.1,
    literate-programming-cli-test 0.5.1 ")

