# [literate-programming-cli](# "version:2.0.0; Basic command line for literate-programming")

This is the command line portion of literate-programming. It depends on
literate-programming-lib. 


At the moment, at least, I am of the firm opinion that one should structure a
litpro directory as cache, build, src, lprc.js  as where you start. These
locations can be changed in the command line, but the idea is that you are at
the top, it all goes down. 

Any initially given filenames are read as is. This allows for shell
completion. It is a little odd in that command line is non-prefixed while
loading from within doc is prefixed. One can also specify starting files in
lprc.js by modifying args.file. 

## Directory structure

* [litpro.js](#cli "save: | jshint") The literate program compiler is activated by a command line program.
* [index.js](#module "save: | jshint") This is the module which can then be
  used for making further command line clients with other functionality.
* [test.js](#test-this "save: | jshint") This runs the test for this module. 
* [README.md](#readme "save:| raw ## README, !--- | sub \n\ #, # |trim ") The standard README.
* [package.json](#npm-package "save: | jshint") The requisite package file for a npm project. 
* [TODO.md](#todo "save: | raw ## TODO, !--- ") A list of growing and shrinking items todo.
* [LICENSE](#license-mit "save:  ") The MIT license as I think that is the standard in the node community. 
* [.npmignore](#npmignore "save: ")
* [.gitignore](#gitignore "save: ")
* [.travis.yml](#travis "save: ")


## Cli 

This is the command line client for literate programming. This contains all
the options for command line processing, but it comes without the standard
library of plugins. See plugins for how we deal with them.

It has different modes. The default is to take in one or more literate program
files and compile them, doing whatever they say to do, typically saving them.
There are options to specify the build and source directories. The defaults
are `./build` and `./src`, respectively, if they are present. If not present,
then the default is the directory where it is called. A root direcory can also
be specified that will change the current working directory first before doing
anything else. 

The other modes are preview and diff, both of which will not save over any
files.  


    #!/usr/bin/env node

    /*global process, require */

    var mod = require('./index.js');

    var args = mod.opts.parse();

    _":build stripping"

    var z = {};
    _":arg z"

    //console.warn("!!", args);

    var Folder = mod.Folder;
    
    Folder.inputs = args;
    Folder.z = z;

    //plugin-to-folder

    Folder.prototype.encoding = args.encoding;
    Folder.prototype.displayScopes = (args.scopes ? _"display scopes" :
        function () {} );


    Folder.lprc(args.lprc, args);

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

We add in the global Folder.z variable to encapsulate all the variable names,
but we also make those variables available to the args command. 

    args.other.forEach(function (arg) {
        var pair = arg.split(":");
        if (pair.length === 1) {
            args[pair[0]] = true;
        } else if (pair.length === 2) {
            args[pair[0]] = pair[1]; 
        } else {
            args[pair[0]] = pair.slice(1);
        }
        z[pair[0]] = args[pair[0]];
    });


## Module

This exports what is needed for the command client to use. 

The directories are a bit tricky. 


    /*global process, require, console, module*/

    var fs = require('fs');
    var path = require('path');
    var sep = path.sep;
    var Folder = require('literate-programming-lib');
    var mkdirp = require('mkdirp');
    var exec = require('child_process').exec;
    var diff = require('diff');
    var colors = require('colors/safe');
    var crypto = require('crypto');
    
    var root = process.cwd() + sep;

    _"preload"
    
    var opts = require("nomnom").
        options(_"cli options").
        script("litpro");

    Folder.lprc = _"lprc";

    module.exports.Folder = Folder;
    module.exports.opts = opts;



## Preload

We can prep the Folder object first and then later we will load the plugin stuff
that may want to modify these things. 
 
Actions pertain to gcd stuff. We can setup things before and it will get
applied. postInit takes the instance folder and allows one last bit of
something. For example, we could enable logging with the gcd. 



    var loader = _"actions:load file";

    Folder.actions = _"actions";

    _"new directives"

    _"new commands"

    _"formatters"
    
    Folder.exit = _":exit";

    Folder.process = _":process";

    Folder.checksum = _"checksum";

    Folder.folders = {};

    Folder.execseparator = "!*!";

    _"fcd"

    
[exit]()

The function to run on exiting. This actually is a function closure around the
event. 

    function () {
        var Folder  = this; 

         return function () {
            var build, folder, arr;
            var folders = Folder.folders; 
                

            for ( build in folders) {
                folder = folders[build];
                arr = folder.reportwaits();
                arr.push.apply(arr, folder.simpleReport());
                console.log(folder.reportOut());
                if ( arr.length) {
                    console.log( "## !! STILL WAITING\n./" + path.relative(root, build) +
                        "\n---\n" + arr.join("\n") + "\n\n");
                } else {
                    console.log( "## DONE\n./" + path.relative(root, build));
                }


                folder.checksum.finalSave();

                //console.log(folder, folder.gcd);
              

                folder.displayScopes();

                //console.log(gcd.log.logs().join('\n')); 
            }
        };
    }


[process]()

This is what happens after all the initiation and parsing of cli options. It
actually initiates the compiling. It receives the parsed arguments. 

Builds should be an array, but if manually overwritten, it could become a
string. We check for this and make it into an array if so.

    function (args) {
        var Folder = this;
        var builds = args.build;
        if (typeof builds === "string") {
            builds = [builds]; 
        }
        var build, folder, gcd, colon, emitname, i, n, j, m, k, o;
        var fcd = Folder.fcd;

        var diffsaver = _"diff:f";

        var outsaver = _"stdout:f";

        var stdinf = _":stdin";

        n = builds.length;
        for (i = 0; i < n; i += 1) {
            build = builds[i];
            folder = new Folder();
            Folder.folders[build] = folder;

            _":assign vars"
    
            _":checksum cache"
            
            _"stdout"

            _"diff"

            _":compile docs"


        }
    }
/
[assign vars]()

    folder.build = build;
    folder.src = args.src;
    gcd = folder.gcd;
    colon = folder.colon;
    folder.flags[path.relative(root, build)] = true;
    o = args.flag.length;
    for (k = 0; k < o; k+=1) {
        folder.flags[args.flag[k]] = true;
    }

[checksum cache]() 

    

    folder.checksum = Object.create(Folder.checksum);
    folder.checksum.data = {};
    folder.checksum.firstLoad(build, args.checksum);
            
[compile docs]()

This uses stdin if the args flag i is checked. If there are no files presented
and no input, then it tries to read project.md as the default

    m = args.file.length;
    if (m > 0) {
        for (j = 0; j < m; j += 1) {
            emitname = colon.escape(args.file[j]);
            gcd.emit("initial document:" +  emitname);
        }
    } else {
        if (! args.in) {
            emitname = colon.escape("project.md");
            gcd.emit("initial document:" + emitname);
        }
    }
    if (args.in) {
        fcd.cache("need standard input", "standard input read", stdinf(folder) );
    }
 
[stdin]()

This is a function that deals with standard input. It takes in folder in the
loop body and returns a function to be called on return.

    function (folder) {
        var gcd = folder.gcd;
   

        return function (data) {
            var err = data[0];
            var text = data[1];
            if (err) {
                gcd.log("Failure to load standard input or files" + err);
            } else {
               folder.newdoc("standard input", text);
            }
        };
    }




## Actions    

We have two basic actions, one for getting a requested document and one for
saving one.

    {"on" : [
        ["initial document", "read initial file"],
        ["need document", "read file"],
        ["file ready", "save file"],
        ["error", "report error"] ],
     "action" : [
        ["read initial file", function (data, evObj) {
            loader(data, evObj, "");
        }],
        ["read file", loader], 
        ["save file",  function(text, evObj) {
            var gcd = evObj.emitter;
            var folder = gcd.parent;
            var colon = folder.colon;
            var emitname = evObj.pieces[0];
            var filename = colon.restore(emitname);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fpath = folder.build;
            var p = path.parse(fpath + sep + filename);
            var fullname = p.dir + sep + p.base;
            var shortname = fullname.replace(root, "").replace(/^\.\//, '' );
            fpath = p.dir;

            var sha;
            if ( (sha = folder.checksum.tosave(shortname, text) ) ) {
                fs.writeFile(fullname, text, 
                    {encoding:encoding},  function (err) {
                    if (err) {
                        _":mkdirp";
                    } else {
                        _":success saving"
                    }
                });
            } else {
                folder.log("./" + shortname, "unchanged" );
                gcd.emit("file saved:" + emitname);  
            }
        }],
        ["report error", function (data, evObj) {
            console.log(evObj.ev + (data ? " INFO: " + data : "") );
        }] ]
    }

[success saving]()


    gcd.emit("file saved:" + emitname);  
    folder.log("./" + shortname, "saved" );
    folder.checksum.data[shortname] = sha; 

[mkdirp]()

This makes the directory if it does not exist. 

    mkdirp(fpath, function (err) {
        if (err) {
            gcd.emit("error:directory not makeable", fpath);
            gcd.emit("file not saved:" + emitname);
        } else {
            fs.writeFile(fullname, text, 
                {encoding:encoding},  function (err) {
                    if (err) {
                        gcd.emit("error:file not saveable",fullname);
                        gcd.emit("file not saved:" + emitname);
                    } else {
                        _":success saving"
                    }
                });
        }
    })


[load file]() 

     function (data, evObj, src) {
            var gcd = evObj.emitter;
            var folder = gcd.parent;
            var fcd = folder.Folder.fcd;
            var colon = folder.colon;
            var emitname = evObj.pieces[0];
            var filename = colon.restore(emitname);
            var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
            var fullname = ((typeof src === "string") ? src : folder.src + sep ) +
                 filename;
            fcd.cache(["read file:" + emitname, [fullname, encoding]], 
                "file read:" + emitname, function (data) {
                    var err = data[0];
                    var text = data[1];
                    if (err) {
                        gcd.emit("error:file not read:" + emitname, 
                            [fullname, err] );
                    } else {
                        folder.newdoc(emitname, text);
                    }

            });
     }

     
      
### FCD

This manages the folder communication dispatches. 

    Folder.fcd.on("read file", _":read file");
    Folder.fcd.on("read directory", _":directory");
    Folder.fcd.on("need standard input", _":standard input");
    Folder.fcd.on("exec requested", _":execute command");
    Folder.fcd.on("dir exec requested", _":dir execute");


[read file]() 

    function (data, evObj) {
       var fullname = data[0];
       var encoding = data[1];
       var emitname = evObj.pieces[0];
       var fcd = evObj.emitter;

        fs.readFile( fullname, {encoding:encoding},  function (err, text) {
            fcd.emit("file read:" + emitname, [err, text]);
        });
    }
    
[directory]() 

    function (fullname, evObj) {
       var emitname = evObj.pieces[0];
       var fcd = evObj.emitter;

        

        fs.readdir( fullname, function (err, text) {
            fcd.emit("directory read:" + emitname, [err, text]);
        });
    }


[standard input]()

Code largely taken from [sindresorhus](https://github.com/sindresorhus/get-stdin/blob/master/index.js) though it is basically also what is in the node docs.  


    function (data, evObj) {
        var fcd = evObj.emitter;

        var stdin = process.stdin;
        var ret = '';

        stdin.setEncoding('utf8');

        stdin.on('readable', function () {
            var chunk;


            while ( (chunk = stdin.read()) ) {
                ret += chunk;
            }

        });

        stdin.on('end', function () {
            fcd.emit("standard input read", [null, ret]);
        });

        stdin.on('error', function () {
            fcd.emit("standard input read", ["error", ret]);
        });
    }

[execute command]()

This is the cached form of a command line execution with incoming text. 

    function (data, evObj) {
        var fcd = evObj.emitter;
        var emitname = evObj.pieces[0];
        var cmd = data[0];
        var text = data[1];

        try {
            var child = exec(cmd, 
                function (err, stdout, stderr) {
                    fcd.emit("exec finished:" + emitname, [err || stderr, stdout]);
                });
            if (text) {
                child.stdin.write(text);
                child.stdin.end();
            }
        } catch (e) {
            fcd.emit("exec finished:" + emitname, [ e.name + ":" + e.message +"\n"  + cmd + 
             "\n\nACTING ON:\n" + text]);
        }
    }


[dir execute]() 


This is the cached form of a command line execution from a directive. 

    function (cmd, evObj) {
        var fcd = evObj.emitter;
        var fcdname = evObj.pieces[0];


        try {
            exec(cmd, 
                function (err, stdout, stderr) {
                    fcd.emit("dir exec done:" + fcdname, [err || stderr, stdout]);
                });
        } catch (e) {
            fcd.emit("dir exec done:" + fcdname, 
                [ e.name + ":" + e.message +"\n"  + cmd, '' ]);
        }
    }


[download]()
 
      
## Encodings

For more encodings, load up litpro-iconv-lite. The default is just node's
defaults: 

* 'ascii' - for 7 bit ASCII data only. 
* 'utf8' - Multibyte encoded Unicode characters. Many web pages and other document formats use UTF-8.
* 'utf16le' - 2 or 4 bytes, little endian encoded Unicode characters. Surrogate pairs (U+10000 to U+10FFFF) are supported.
* 'ucs2' - Alias of 'utf16le'.
* 'base64' - Base64 string encoding.
* 'hex' - Encode each byte as two hexadecimal characters.


[option]() 

    { 
        abbr : "e",
        default : "utf8",
        help : "default encoding to use. Defaults to utf8",
    }


## CLI Options

Here are the options for the nomnom parser. These get loaded first and then the
plugins can act on the parser as a second argument. The plugins should be able
to overwrite whatever they like in it though ideally they play nice. 

    {
        "file": {
            default : [],
            position : 0,
            list : true,
            help : "files to start with in compiling",
        }, 
        "encoding" : _"encodings:option",
        _":dir",
        _"checksum:cli options",
        "lprc": {
            abbr : "l",
            default : root + "lprc.js",
            transform : path.resolve, 
            help : "specify an alternate lprc.js file"
        }, 
        diff : {
            abbr: "d", 
            flag:true,
            help : "include to have diff only output, no saving"
        },
        out : {
            abbr : "o",
            flag : true,
            help : "save no file, piping to standard out instead"
        },
        flag : {
            abbr : "f",
            help : "flags to pass to use in if conditions",
            list : true,
            default : []
        },
        in : {
            abbr : "i",
            help : "Use standard input for a litpro doc",
            flag:true
        },
        other : {
            abbr : "z",
            help : "Other plugin key values",
            list : true,
            default : []
        },
        version : {
            abbr : "v", 
            flag : true,
            help : "version number",
            callback : function () {
                return "v._`g::docversion`";
            }
        },
        scopes: {
           flag : true,
           help : "Show all the values for the document. May help in debugging."
        }



    }


[dir]()

This sets up the default directories. 

    build : {
        abbr: "b",
        list: true,
        default : [root + "build"],
        transform : path.resolve, 
        help : "Specify the build directory." +
            " Specifying multiple builds do multiple builds." +
            " The build is passed in as a flag per build." 
        

    },
    src : {
        abbr: "s",
        default : root + "src",
        transform : path.resolve, 
        help: "Where to load inernally requested litpro documents from"
    }
    
### Display scopes

This is a function that displays the scopes. 

    function () {
        var folder = this;
        var str = '';
        Object.keys(folder.scopes).forEach(function (el) {
            str += el+ "::\n------\n";
            var scope = folder.scopes[el];
            Object.keys(scope).sort().forEach(
                function (v) {
                    str+= v + ": '" + scope[v] + "'\n* * *\n";
                });
            str += "\n------\n";
        });
        str = str.replace(/\n\n/g, "\n");
        console.log(str);
    }

May want to consider using https://www.npmjs.com/package/js-object-pretty-print

## LPRC

The plugins are managed by a lprc.js which should be located in the directory
that literate programming is invoked from.

The lprc.js file should return a function which is also what plugins should
do. They modify properties on Folder, namely commands, directives, and
actions. Actions are the gcd events that get applied upon folder creation.  

Modifying Folder.postInit allows for a function to process `this` on
instantiation. 


    function (name, args) {
        var Folder = this;

        try {
            require(name)(Folder, args);
        } catch (e) {
            
        }
    }
   

## New Commands

So here we define new commands that only make sense in command line context. 

    Folder.async("exec", _"execute");

    Folder.async("execfresh", _"execute:fresh");
    
    Folder.async("readfile", _"cmd readfile");

    Folder.async("readdir", _"cmd directory");

    Folder.async("savefile", _"cmd savefile");

    _"z"

* execute Executes a command line with the input being the std input?
* readfile, listdir

### execute

This executes a command on the command line, using the incoming text as
standard input and taking standard out as what should be passed along. 

This is of the form `|exec commandline and args, second one, ...` 

Since the command line uses the pipe character in the same way litpro does
(well, litpro uses the same pipe...) 

Think using grep (not that you would need that one).

This caches the command, sha1ing the incoming text and arguments; same text, same result is
the idea. 

    function (text, args, callback  ) {
        var doc = this;

        var cmd =  args.join(" | ");


        var shasum = crypto.createHash('sha1');

        shasum.update(text + "\n---\n" + cmd);
        var emitname = shasum.digest('hex');


        doc.parent.Folder.fcd.cache(
            ["exec requested:" + emitname, [cmd, text]],
            "exec finished:" + emitname,
            function (data) {
                var err = data[0];
                var stdout = data[1];

                callback(err, stdout);
            });
    }


[fresh]() 

This does not cache the command. 

    function (text, args, callback  ) {

        var cmd =  args.join(" | ");

        try {
            var child = exec(cmd, 
                function (err, stdout, stderr) {
                    callback(err || stderr , stdout);
                });
            if (text) {
                child.stdin.write(text);
                child.stdin.end();
            }
        } catch (e) {
            callback(e.name + ":" + e.message +"\n"  + cmd + 
             "\n\nACTING ON:\n" + text);
        }
    }

### Cmd Readfile

Since I can't decide if it should be input or arg1, if there is an arg1, then
that becomes the filename. Otherwise the input is the filename. arg2 is the
extension if present. 

    function (input, args, callback) {
        var doc = this;
        var colon = doc.colon;
        var folder = doc.parent;
        var filename = args[0] || input;
        var fullname = folder.src + sep + filename; 
        var encoding = args[1] || folder.encoding || "utf8";
        var emitname =  colon.escape(fullname);


        doc.parent.Folder.fcd.cache(
            ["read file:" + emitname, [fullname, encoding]],
            "file read:" + emitname,
            function (data) {
                var err = data[0];
                var text = data[1];
                callback(err, text);
            }
        );
    }

### Cmd Directory

This reads and returns a file listing for a directory. Just like the files, it
is relative to the src directory. The directory listing is cached; we assume
it is not changing during program execution. Due to the unordered nature of
this, we need to be okay with snapshots at any point. 


    function (input, args, callback) {
        var doc = this;
        var colon = doc.colon;
        var folder = doc.parent;
        var dirname = args[0] || input;
        var fullname = folder.src + sep + dirname; 
        var emitname =  colon.escape(fullname);

        doc.parent.Folder.fcd.cache(
            ["read directory:" + emitname, fullname],
            "directory read:" + emitname,
            function (data) {
                var err = data[0];
                var files = data[1];
                callback(err, files);
            }
        );
    }

### Cmd savefile

    function (text, args, callback) {
        var doc = this;
        var gcd = doc.gcd;

        var filename = doc.colon.escape(args[0]);
        if (args[1]) {
            gcd.scope(filename, args[1]); 
        }

        gcd.once("file saved:" + filename, function (err, data) {
            callback(err, data); 
        }); 

        gcd.emit("file ready:"+filename, text);
    }


## z

This retrieves the z-argument from the command line with the given name. 

    Folder.sync("z", _":fun");

We could create another function that would allow for more creative
constructions, such as `z? {}, msg, dude` which could construct an object with
key values msg and dude whose values are the flag values. At the current time,
I do not see the need. 

[fun]()

    function (input, args) {
        var z = this.Folder.z; 
        if (z.hasOwnProperty(args[0])) {
            return z[args[0]];
        } else {
            return input;
        }
    }

##### cdoc

    * **z** `z msg` will return the value in `msg` from the command line flag
      `-z msg:value`. If the value contains multiple colons, it is interpreted
      as an array and an array will be returned. 




## new directives

* execute which takes in a string as the title and executes, returning the
  output stored in the variable named in the link text. 
* readfile Read a file and store it. 

Desired: 
* download  Download something and store. Uses the cache
* downsave  Download and then save in a file. Uses the cache. Uses streams to
  do this quickly and efficiently. Think images.  

```
Folder.directives.exec = _"dir execute";
Folder.directives.execfresh = _"dir execute:fresh";
Folder.directives.readfile = _"dir readfile";
```


### Dir Execute


This is the directive for executing a command on the command line and storing
it in a variable. There is no piping to standard in. Think ls. 

Not really sure how useful this is. Thought it could be useful for things like
texing a document, but need a way to have directories more accessible. It might
be that one just does custom executions. But perhaps this serves as a useful
example. 
    
Piping of the standard output internally can be done by using the separator
`!*!`. If you happen to need that, you can overwrite Folder.execseparator.


`[name](# "exec:command line command")`

    function (args) {
        _":common | sub execfresh, exec"

        var fcdname = colon.escape(command); 

        var fcd = Folder.fcd;

        fcd.cache(["dir exec requested:" + fcdname, command],
            "dir exec done:" + fcdname, 
            function (data)  {
                var err = data[0];
                var stdout = data[1];
                if (err) {
                   gcd.emit("error:execute", [command, err]); 
                } else {
                    if (stdout) {
                        gcd.emit("text ready:" + emitname + colon.v + "sp", stdout);
                    }
                }
            }
        );
    }

[common]()

This is common to both exec and execfresh


    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon;
    Folder = doc.parent.Folder;
    var command = args.input;
    var separ = Folder.execseparator;
    var ind = command.indexOf(separ);
    var pipes = '';
    if (ind !== -1) {
        pipes = command.slice(ind + separ.length);
        command = command.slice(0,ind);
    }

    var name = colon.escape(args.link);
    var emitname = "execfresh:"+name;
    var f = function (data) {
        if (name) {
            doc.store(name, data);
        }
    };

    var start = doc.getBlock(args.href, args.cur);
    //console.log(pipes, emitname, start, command);

    doc.pipeDirSetup( pipes, emitname, f, start);  


        
[fresh]() 

This is the version that is not cached. 


`[name](# "execfresh:command line command")`


    function (args) {
        _":common"

        exec(command, function (err, stdout, stderr) {
            if (err) {
               gcd.emit("error:execute", [command, err, stderr]); 
            } else {
                if (stdout) {
                    gcd.emit("text ready:" + emitname + colon.v + "sp", stdout);
                }
                if (stderr) {
                    gcd.emit("error:execute output", [command, stderr]);
                }
            }
        });
    }


### Dir Readfile


This is the directive for reading a file and storing its text.  

`[var name](url "readfile:encoding|commands")`
   

    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var folder = doc.parent;
        var colon = doc.colon;
        var name = colon.escape(args.link);
        var filename = args.href; 
        var fullname =  folder.src + sep + 
             (args.loadprefix || '') + filename;
        var emitname = colon.escape(fullname);
        var cut = args.input.indexOf("|");
        var encoding = args.input.slice(0,cut);
        var pipes = args.input.slice(cut+1);
        var f = function (data) {
            if (name) {
                doc.store(name, data);
            }
        };
        var start = doc.getBlock(args.cur, args.cur);

        encoding = encoding.trim() || doc.parent.encoding || "utf8";

        doc.pipeDirSetup( pipes, emitname, f, start);  

        doc.parent.Folder.fcd.cache(
            ["read file:" + emitname, [fullname, encoding]],
            "file read:" + emitname,
            function (data) {
                var err = data[0];
                var text = data[1];
                if (err) {
                   gcd.emit("error:readfile", [filename, name, err]); 
                } else {
                    gcd.emit("text ready:" + emitname + colon.v + "sp", text);
                }
            }
        );
    }

## Checksum

This holds the checksums of 

    {
        firstLoad : _":first load",
        finalSave : _":final save",
        sha1sync : _":sha1 sync",
        tosave: _":to save",
        filename : '',
        dir : '',
        data : {} 
    }

[first load]()

This tries to read in the file. 

    function (dir, file) {
        var filename = dir + sep + file;
        var json, self = this;
        self.dir = dir;
        self.filename = filename;


        try { 
            mkdirp.sync(dir);
            json = fs.readFileSync(filename, {encoding:"utf8"});
            self.data = JSON.parse(json);
            self.filename = filename;
        } catch (e) {
            self.data = {};
        }
    }

[final save]()

Write out the 

    function () {
        var self = this;
            
        try {
            fs.writeFileSync(self.filename, JSON.stringify(self.data));
        } catch (e) {
            console.log("error:cache file not savable", [e.message, self.filename]);
        }
    }

[cli options]()

This is the object that handles the argument parsing options.

    checksum : {
        default : ".checksum",
        help: "A list of the files and their sha1 sums to avoid rewriting." +
            "Stored in build directory"
    }

[to save]()

Does it need saving?

    function (name, text) {
        var self = this;
        var data = self.data;

        var sha = self.sha1sync(text);

        if ( data.hasOwnProperty(name) &&
             (data[name] === sha) ) {
            return false; 
        } else {
            return sha;
        }
    }


[sha1 sync]()

    function (text) {
        var shasum = crypto.createHash('sha1');

        shasum.update(text);
        return shasum.digest('hex');
    }


[sha1 async]()


    var s = fs.ReadStream(filename);
    s.on('data', function(d) {
      shasum.update(d);
    });

    s.on('end', function() {
      var d = shasum.digest('hex');
      console.log(d + '  ' + filename);
    });

### Stdout

We also allow for standard output to be the result if that option is selected. 

All we need to do is replace the saving function with one that logs it to the
console. 

    if (args.out) {
       gcd.action("save file", outsaver); 
    }


[f]()

This simply logs the file. 


    function(text, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        var fpath = folder.build;
        var p = path.parse(fpath + sep + filename);
        var fullname = p.dir + sep + p.base;
        fpath = p.dir;
        
        folder.log("FILE: " + fullname + ":\n\n" + text +
                    "\n----\n");
    }


## Diff

This deals with the diffing. Instead of saving, we check to see if there are
differences and then report the differences. 

First we need to install it. 

    if (args.diff) {
        gcd.action("save file", diffsaver);
    }
 
[f]()
        
    function(text, evObj) {
        var gcd = evObj.emitter;
        var folder = gcd.parent;
        var colon = folder.colon;
        var emitname = evObj.pieces[0];
        var filename = colon.restore(emitname);
        var encoding = gcd.scope(emitname) || folder.encoding || "utf8" ;
        
        var fpath = folder.build;
        var p = path.parse(fpath + sep + filename);
        var fullname = p.dir + sep + p.base;
        var shortname = fullname.replace(root, "").replace(/^\.\//, '' );
        fpath = p.dir;

        if (folder.checksum.tosave(shortname, text) ) {
            if (folder.checksum.data.hasOwnProperty(shortname) ) {
                _":diff it"
            } else {
                folder.log(shortname, "diff new file", text); 
            }
        } else {
            folder.log(shortname , "diff unchanged");
        }
    }

[diff it]()

    fs.readFile(fullname, {encoding:encoding}, function (err, oldtext) {
        var result, ret; 
        if (err) {
            folder.warn("diff", "Could not read old file" + shortname + 
                " despite it being in the checksum file." );
        } else {
            ret = '';
            result = diff.diffLines(text, oldtext);
            result.forEach(function (part) {
                if (part.added) {
                    ret += colors.green(part.value);
                } else if (part.removed) {
                    ret += colors.red(part.value);
                }
            });
            //folder.log("Diff on " + shortname +":\n\n" + ret+ "\n----\n" );
            
            folder.log(diff.createPatch(shortname, oldtext, text, "old", "new"),
                "diff detected");
        }
    });

## Formatters

This is some custom formatters for the command line client

    var oneArgOnly = _":one arg";
    ["saved", "unchanged", "diff unchanged", "diff detected"].
        forEach(function (el) {
            Folder.prototype.formatters[el] = oneArgOnly;
        });
    Folder.prototype.formatters["diff new file"] = _":new file";
    

[one arg]()

This just lists the files that were saved. 

    function (list) {
        var ret = '';
        ret += list.map(
            function (args) {
                return args.shift();
            }).
            join("\n");
        return ret;
    } 

[new file]()

This has a filename and the text file. 

    function (list) {
        var ret = '';
        ret += list.map(
            function (args) {
                var fname = args.shift();
                var text = args.shift();
                return "### " + fname + "\n`````\n" + 
                    text + "\n`````";
            }).
            join("\n***\n");
        return ret;
    } 

## Test this

This uses the new test framework in which everything is done by setting up the
directories. 

Currently have it setup to ignore build and cache directories. So we need to
use other directory names for those. 

    /*global require */

    var tests = require('literate-programming-cli-test')("node ../../litpro.js",
        "hideConsole");

    tests.apply(null, [ 
        ["first",  "first.md second.md -s ."],
        ["build", "-b seen test.md; node ../../litpro.js -b seen/ test.md" ],
        ["checksum", "-b . --checksum awesome  project.md"],
        ["diff-change", "first.md; node ../../litpro.js -d second.md"],
        ["diff-static", "first.md; node ../../litpro.js -d second.md"],
        ["diff-new", "first.md; node ../../litpro.js -d second.md"],
        ["encoding", "-e ucs2 ucs2.md -b ."],
        ["files", "--file=first.md --file=second.md  third.md"],
        ["nofile", ""],
        ["nofilenoproject", "", _":no project"],
        ["badfiles", "", _":bad files"],
        ["flag", "-b dev; node ../../litpro.js -b deploy -f eyes"], 
        ["lprc", ""],
        ["stringbuild", ""],
        ["cmdread", ""],
        ["scopes", " --scopes"],
        ["args", "-z cache:cool"],
        ["z", ' -z "msg:Awesome work" -z arr:25:27:29 ']
        ].slice()
    );


* first. A basic test of reading other files and outputing something
* build. Checks that it correctly recognizes that things have not changed.
  Tests the -b command.
* checksum. Tests the ability to change name of checksum. It writes and reads
  from it.
* diff. This checks the diff option. 
* encoding. The encoding of files can be specified.
* files. Specifying multiple files.
* no file. No file specified should lead to project.md
* no file, no project. What happens if project.md does not exist?
* bad file. What happens if a file is to be loaded but it does not exist. 
* flags. A couple of flags to test that out.
* in. A standard input; may need to something fancy. 
* lprc. Checks use of lprc.js file
* out. Check that out saves to output and not to anywhere else.
* src. Check that we can have a different src directory. 
* default src. Check that the default src works as expected. 
* other. Check boolean, array, single value, a colon with nothing after it,
  and something that overwrites another argument.


[no project]()

This should handle the matching of the target given the different strings. 

    { "out.test" : function (canonical, build) {
            build = build.toString().replace(": no such file or directory, ", ", ");
            canonical = canonical.toString().replace(": no such file or directory, ", ", ");
            return build.trim() === canonical.toString().trim();
        }
    }

[bad files]()

Here we want to cut up the out.test file into separate lines, sort them and
compare, making sure the error line is a short comparison due to the end
issues. We also will use checksum to make sure only the files we want are
there. 

    {   "out.test" : tests.split(function (a, e) {
            return a.slice(0, 10) === e.slice(0,10);
        }),
        "build/.checksum" : tests.json
    }

[off](# "block:")

## README


 # literate-programming-cli   

This is the command line client module for literate-programming. The intent of
this one is to build the command line clients using this module as a baseline. 

To use the thin client, see [litpro](https://github.com/jostylr/litpro)  For a
more full client geared to web development, please see
[literate-programming](https://github.com/jostylr/literate-programming)

Install using `npm install literate-programming-cli`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 


 ## Flags

The various flags are

* -b, --build  The build directory. Defaults to build. Will create it if it
  does not exist. Specifying . will use the current directory. 
* --checksum This gives an alternate name for the file that lists the hash
  for the generate files. If the compiled text matches, then it is not
  written. Default is `.checksum` stored in the build directory.
* -d, --diff This computes the difference between each files from their
  existing versions. There is no saving of files.
* -e, --encoding Specify the default encoding. It defaults to utf8, but any
  encoding supported by node works. To have more encodings, use the plugin
  [litpro-iconv-lite](https://github.com/jostylr/litpro-iconv-lite) 
  To override the command lined behavior per loaded
  file from a document, one can put the encoding between the colon and pipe in
  the directive title. This applies to both reading and writing. 
* --file A specified file to process. It is possible to have multiple
  files, each proceeded by an option. Also any unclaimed arguments will be
  assumed to be a file that gets added to the list. 
* -f, --flag This passes in flags that can be used for conditional branching
  within the literate programming. For example, one could have a production
  flag that minimizes the code before saving. 
* -i, --in  This takes in standard input as another litpro doc to read from.
* -l, --lprc This specifies the lprc.js file to use. None need not be
  provided. The lprc file should export a function that takes in as arguments
  the Folder constructor and an args object (what is processed from the
  command line). This allows for quite a bit of sculpting. See more in lprc. 
* -o, --out This directs all saved files to standard out; no saving of
  compiled texts will happen. Other saving of files could happen; this just
  prevents those files being saved by the save directive from being saved. 
* -s, --src  The source directory to look for files from load directives. The
  files specified on the command line are used as is while those loaded from
  those files are prefixed. Shell tab completion is a reason for this
  difference. 
* -z, --other  This is a place that takes in an array of options for plugins.
  Since plugins are loaded after initial parsing, this allows one to sneak in
  options. The format is key:value. So `-z cache:cool` would set the value
  cache to cool.
* --scopes This shows at the end of the run all the variables and values that
  the document thinks is there. Might be useful for debugging purposes. 

 ## New Commands

* `exec cmd1, cmd2, ...` This executes the commands on the commandline. The
  standard input is the incoming input and the standard output is what is
  passed along. 
* `execfresh` Same as exec but no caching
* `readfile name` Reads in file with filename. Starts at source directory.
  This terminates old input and replaces with file contents.
* `readdir name` Generates a list of files in named directory. This generates
  an augmented array. 
* `savefile name, encoding` Saves the input into the named file using the
  encoding if specified. 

## New Directives

* `[name](# "exec:command line command")` Executes command line as a
  directive. Not sure on usefulness.
* `[var name](url "readfile:encoding|commands")` Reads a file, pipes it in,
  stores it in var name.  
* Save. Not new, but works to actually save the file on disk. 

 

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)

!---


## TODO

Most of these are done. New todo: review todo. 

test the command line functions; currently a manual process as need to write
new ones tha are not dynamic. I suppose can test using the echo function. 

preview, diff command mode


readfile, directory, writefile commands for use from a litpro doc.

maybe a built in watcher program, using nodemon?  
command line: read file, readdir, write file, file encodings, curling, 

split http stuff into own module and split testing into own module.

default litpro to project.md. add an option for toggling standard input. If
no project.md and no litpro, exit. 

plugins: jshint, jstidy, jade, markdown,

development versus deployment? Maybe manage it with different lprc files. So
default is development, but then one production ready, switch to lprc-prod.js
which could send to a different build directory. Also minify commands, etc.,
could be available in both, but changed so that in development they are a
passthru noop. 

testing. a module export that gives a nice test function that allows for easy
testing. 

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
      "keywords": ["literate programming"]
    }


## gitignore

    node_modules/
    /old/
    /build/
    /out.test
    /err.test
    /.checksum

## npmignore


    old
    build
    .checksum
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
    deps: checksum 0.1.1, colors 1.1.2, diff 1.4.0, 
        literate-programming-lib 2.0.0, mkdirp 0.5.1, 
        nomnom 1.8.1;
    dev: litpro-jshint 0.3.1, literate-programming-cli-test 0.5.1")

