# Fat Client

This is the fat literate programming client, full batteries included. The
batteries largely pertain to web development and may grow in time. 

Currently, it includes markdown converter, pugs (formerly jade), postcss and
autoprefixer, jshint, (minimizers, beautifiers). 

It avoids anything that involves compiling to install. Otherwise, this is
quite a liberal package and issues are welcome to include new batteries. 


## Files

Most of this is adding in the plugins and running full tests. 

### Load


### Save

* [../](# "cd: save") It all goes in the main directory. 
* [index.js](#cli "save:|jshint ")
* [README.md](# "save: | raw ## README, ---! | sub \n\ #, \n# |trim 
    | sub COMDOC, _'comdoc | .join \n'  ") The standard README.
* [convert.md](# "save: | raw ## Converting, --! | sub \n\ #, # |trim")
* [test.js](#test "save: |jshint ") The testing file. 
* [](# "cd: save")


### h5

The h5 headings can be used in a special way. Here we initialize

* [comdoc](#cdoc "h5: ")


## Cli 

This is the command line client for literate programming. This contains all
the options for command line processing and it comes with the standard
library of plugins. 

It has different modes. The default is to take in one or more literate program
files and compile them, doing whatever they say to do, typically saving them.
There are options to specify the build and source directories. The defaults
are `./build` and `./src`, respectively, if they are present. If not present,
then the default is the directory where it is called for src? but for build,
it is created. A root direcory can also
be specified that will change the current working directory first before doing
anything else. 

The other modes are preview and diff, both of which will not save over any
files.  


    #!/usr/bin/env node

    /*global process, require */

    var mod = require('literate-programming-cli');

    var args = mod.opts.parse();

    _":build stripping"

    _":arg z"

    //console.warn("!!", args);

    var Folder = mod.Folder;
    
    Folder.inputs = args;

    var merge = Folder.merge;
    _"plugin to Folder"

    Folder.prototype.encoding = args.encoding;
    Folder.prototype.displayScopes = (args.scopes ? _"display scopes" :
        function () {} );
    

    Folder.lprc(args.lprc, args);

    Folder.prototype.stdin = args;

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

## Plugin to Folder

This is where the fat comes in. 

    _"jshint"

    _"pug"

    _"md"

    _"cheerio"
    
    _"postcss"

    _"tidy"
    
    _"minify"

 

# JShint

This checks for JS problems. 

This is the module entry point. It adds the commands jshint and the directive
jshint which loads options and globals.

    var jshint = require('jshint').JSHINT;
    Folder.plugins.jshint = {
        options: {unused: true},
        globals: [],
        clean : false
    } ;
    Folder.sync("jshint", _"jshint command");
       


##### cdoc

    * **jshint** This takes the input and runs it through JSHint. The command
      is of the form 
      `js stuff | jshint options, globals, shortname, print clean`. 
      
      * The options is an object that corresponds to the [options that JShint
      accepts](http://jshint.com/docs/options/); you can use a subcommand to
      create the options object if you like.  Default is unused:true, else is
      their defaults. 
      * Globals is an array of global
      names; if they can be written over, pass in `name:true` instead of
      `name`. 
      * Shortname is the shortname to present in understanding what is being
        jshinted. Otherwise, it does its best to give you a cryptic but
        informative name. 
      * If the fourth argument is a boolean, `t()` or `f()` will do it,  then
        that toggles whether to print the message that it all went smoothly or
        not, respectively. The default is to not print it.
      * You can override the defaults repeatedly by modifying the
        `Folder.plugins.jshint` object with the names: `options`, `globals`, and
        `clean`.  

### jshint command

The only thing we add is the jshint command. This takes an incoming text and
hints it. The first argument, if present, is a JSON object of options. The 

    function (input, args, name) {
        
        var doc = this;
        var options, globals;

        var log = [], err, i, lines, line,
            globhash, file, ind, shortname;

        var plug = doc.plugins.jshint;

        _":options"

        jshint(input, options, globhash);


        var data = jshint.data();


        _":generating the logs"

        _":report logs"

        return input;
    }



[report logs]()

    if (log.length > 0 ) {
        doc.log ("!! JSHint:" + shortname+"\n"+log.join("\n"));
    } else {
        if (args[3] || plug.clean) {
            doc.log("JSHint CLEAN: " + shortname);
        }
    }

[options]() 

We can get options from the plugins.jshint object as well as from the
arguments. We are opinionated in setting unused to true. 

Globals are ultimately an object that has a bunch of true/false properties. If
true, then they can be written too. There is also some blacklist property, but
I am not sure where that gets put so ignoring it. 


    options = merge(true, plug.options, args[0] || {});

    globals = plug.globals.concat(args[1] || []);

    if (args[2]) {
       file = '';
       shortname = args[2];
    } else {
        ind = name.indexOf(":");
        file = name.slice(0, ind);
        shortname = name.slice(ind +1, 
            name.indexOf(doc.colon.v, ind) );
    }

    globhash = {};
    globals.forEach( function (el) {
        var bits; 
        bits = el.trim().split(":");
        bits[1] = bits[1] === "true";
        globhash[bits[0].trim()] = bits[1];
    });

    

 

[generating the logs]()


    lines = input.split("\n");
    for (i = 0; i < jshint.errors.length; i += 1) {
       err = jshint.errors[i];
       if (!err) {continue;}
       if (err.reason.indexOf("is defined but never used.") !== -1) {
           continue; //this is covered elsewhere. 
       }
       line = lines[err.line-1];
       if (line.trim().length < 4) {
            line = "\n---\n" + lines.slice(err.line-2, err.line+1).join("\n") + 
                "\n---\n";     
       }
       log.push("E "+ err.line+","+err.character+": "+err.reason +
            "  "+ line.trim());
    }
    if (data.hasOwnProperty("implieds") ) {
        for (i = 0; i < data.implieds.length; i += 1) {
            err = data.implieds[i];
            log.push("Implied Gobal "+ err.line+": "+err.name +
                "  "+ lines[err.line[0]-1].trim());
     }            
    }
    if (data.hasOwnProperty("unused") ) {
        for (i = 0; i < data.unused.length; i += 1) {
            err = data.unused[i];
            log.push("Unused "+ err.line+": "+err.name +
            "  "+ lines[err.line-1].trim());
     }            
    }



## Pug    

pug converts the pug syntax into html. It is mainly used for structures as
opposed to content. `pug text...|pug`

    var pug = require('pug');
    Folder.plugins.pug = {pretty:true};

    Folder.sync("pug" , function (code, args) {
        var options = merge(true, this.plugins.pug, args);
        return pug.render(code, options); 
    });

##### Doc

    * **pug** This transforms the incoming text by using the 
    [pug, formerly jade, transformation engine](https://pugjs.org). 
      Pass in an object as first argument for
      options. The defaults are currently used except `pretty:true`.  


## Md

This uses markdown-it.

Because a new renderer is being made with the change of options and behavior
is modified with uses, these should all be done not inline. The only choices
inline is choosing the name (arg0), and toggling on, off the pre/post
processors.

The default is to process math and literate snippets. 


    var mdit = require('markdown-it');
    
    var mddefault = {
        html:true,
        linkify:true
    };
    

    Folder.plugins.md = {
        req : mdit,
        def: mdit(mddefault),
        options: mddefault,
        prepost : [_":litpro subbing", _":math subbing"]
    };

    Folder.sync( "md", function (code, args) {
        var plug = this.plugins.md;
        var html, rend;
        rend = plug[args[0]] || plug.def;
        var post = [];
        plug.prepost.forEach(function (el, ind) {
            var temp;
            if (args[ind+1] !== false) {
                temp = el(code);
                post.push(temp[1]);
                code = temp[0];
            }
        });
        html = rend.render(code);
        post.forEach(function (el) {
            html = el(html);
        });
        return html;
    });


[litpro subbing]()

We can create an option that does literate programming substituting before
rendering and then replacing it. 

The comment html is to ensure that the markdown does not wrap something else
around it. I hope. This requires `html:true` presumably. 


    function litsub (code) {
        var snips = [];
        var masklit = function (match) {
            snips.push(match);
            return "<!--LITSNIP" + (snips.length-1) + "-->";
        };

        var rep = function (match, num) {
            return snips[parseInt(num, 10)];
        };
        
        var undo = function (html) {
            var reg = /<\!\-\-LITSNIP(\d+)\-\->/g; 
            return html.replace(reg, rep);
        };
    
        var lit = /(?:\\|\\\d*)?\_+(\"[^"]+\"|\`[^`]+\`|\'[^']\')/g;
        code = code.replace(lit, masklit);
        return [code, undo];
    }

[math subbing]()

We want to replace the math expressions to avoid markdown processing of random
parts. Our syntax will be `` `x^2 + 3 < 5`$ `` and gets rendered by katex into
html which is then subbed in after the markdown processing. We also use code
fences for display math, the dollar sign comes after the first fence, where
the language goes. Actually, we have if the dollar sign is inside the first
set of backticks, then it is display, if it is outside after the second set,
then it is inline. No spaces allowed in either case between the backtick and
dollar sign. So this does allow display to happen for inline code and inline
to happen for fenced code. This does mean that a dollar sign next to a
backtick is will almost surely trigger this though a space will stop that. 

    function mathsub (code) {
        var snips = [];
        var maskinline = function (match, ignore, math) {
            snips.push("\\(" + math + "\\)" );
            return "<!--MATHSNIP" + (snips.length-1) + "-->";
        };
        
        var maskdisp = function (match, ignore, math) {
            snips.push("\\[" + math + "\\]" );
            return "<!--MATHSNIP" + (snips.length-1) + "-->";
        };

        var rep = function (match, num) {
            return snips[parseInt(num, 10)];
        };
        
        var undo = function (html) {
            var reg = /<\!\-\-MATHSNIP(\d+)\-\->/g; 
            return html.replace(reg, rep);
        };
    
        var inline = /(\`+)([^`]+)\1\$/g;
        code = code.replace(inline, maskinline);
        var display = /(\`+)\$([^`]+)\1/g;
        code = code.replace(display, maskdisp);
        return [code, undo];
    }

[with katex]()

Ignored for now as the rendered html is very verbose. 

    function mathsub (code) {
        var snips = [];
        var options = {
           throwOnError: false,
           display : false
        };
        var maskmath = function (match, ignore, math) {
            console.log("DEBUG0", match, ignore, math);
            snips.push(katex.renderToString(math, options));
            return "<!--MATHSNIP" + (snips.length-1) + "-->";
        };

        var rep = function (match, num) {
            return snips[parseInt(num, 10)];
        };
        
        var undo = function (html) {
            var reg = /<\!\-\-MATHSNIP(\d+)\-\->/g; 
            return html.replace(reg, rep);
        };
    
        var inline = /(\`+)([^`]+)\1\$/g;
        code = code.replace(inline, maskmath);
        var display = /(\`+)\$([^`]+)\1/g;
        options.display = true;
        code = code.replace(display, maskmath);
        return [code, undo];
    }


##### Cdoc

    * **md** This takes the input as markdown and puts out html. The first
      argument is an optional string naming the renderer to use. The other
      arguments should be booleans, namely, `f()`, if one does not want
      preprocessing/post to occur. The default preprocessors, in order, are
      literate programming subs and math subs rendering to katex. 
      
      To create a renderer, you can use Folder.plugins.md.req as the markdoan
      object and then render it per the instructions (an options object
      `req(options).use(...)`. This is all best done in the lprc.js file.
      Store the rendered under the preferred name in plugins.md.
     
      See the logs test directory and its lprc.js. 


## Cheerio

Cheerio takes in html and can do replacements on it, like jQuery does. The
syntax is  `html... | cheerio selector, method, args to method...`

    var cheerio = require('cheerio');
    Folder.plugins.cheerio = {
        req: cheerio
    };

    Folder.sync( "cheerio" , function(code, args) {
        var selector = args.shift(); 
        var method = args.shift();
        var $ = cheerio.load(code);
        var el$ = $(selector);
        try {
           el$[method].apply(el$, args);
           return $.html();
        } catch (e) {
            this.log("Problem with cheerio: " + selector + "," + 
                method + "," + args.join(","));
            return code;
        }
    });

There is a special function of replacement where the arguments are paired to
be a selector and the html replacement. This is like the standard sub command.

    Folder.sync( "ch-replace" , function(code, args) {
        var selector, replacement;
        var n = args.length;
        var $ = cheerio.load(code);
        var i;
        for (i = 0; i < n; i += 2) {
            selector = args[i];
            replacement = args[i+1];
            $(selector).replaceWith(replacement);
        }
        return $.html();
    });


##### cdoc

    * **cheerio** This gives access to the cheerio module, a lightweight node
      version of jQuery-esque without the overhead of jsdom. It can't do
      everything, but it does most things: 
      [cheeriojs](https://github.com/cheeriojs/cheerio). To use, the incoming
      text is the html doc to modify, the first argument is the selector, the
      second the method, and then the arguments to the method, e.g., 
      `somehtml | cheerio h2.title, .text, Hello there!`
    * **ch-replace** This is a convenience method for cheerio. This will use
      the first argument as a selector and the second argument as a
      html replacement. 


## Postcss

This uses postcss to work its magic on the incoming text. The plugins should
be loaded here; right now it is just autoprefixer. Then it can be used as
`css...|postcss cmd1, cmd2, ...`  

    var postcss      = require('postcss');
    
    Folder.commands.postcss = function (input, args, name) {
        var doc = this;
        var pc = doc.plugins.postcss; 
        var cmds = [];
        if ( (typeof input !== "string") || (input === '') ) {
            doc.gcd.emit("text ready:" + name, input);
            return;
        }
        args.forEach(function (el) {
            if (typeof pc[el] === "function" ) {
                cmds.push(pc[el]);
            }
        });
        postcss(cmds).process(input).then(function (result) {
            result.warnings().forEach(function (warn) {
                doc.log(warn.toString());
            });
            doc.gcd.emit("text ready:" + name, result.css);
        }).catch(function (error) {
            doc.log(error.toString());
        });
    };

    Folder.plugins.postcss = {
        req : postcss,
         autoprefixer : require('autoprefixer')
    };


##### cdoc 

    * **postcss** This takes incoming text and runs it through postcss. To do
      something useful, you need to have the arguments be the commands to use.
      At the moment, the only one shipping with this is autoprefixer, but
      others are likely to be added (minimizers and fixers, in particular).
      You can add them yourself by, in lprcs.js, saying (installing cssnano as
      example)
      `Folder.plugins.postcss[cssnano] = require('cssnano');` and ensuring
      that the cssnano module is installed in npm. 
     
## tidy

This creates the web-tidy command using js-beautify. Why the name change? Cause
its shorter. 

    var tidy = require("js-beautify");

    Folder.plugins.tidy = {
        js : {
           "indent_size": 4, 
           "jslint_happy": true 
        },
        css: {},
        html :{}
    };

    Folder.sync("tidy", _":fun");
    


[fun]()

    function (code, args) {
        var type = args[0];
        var options = args[1] || {};
        var plug = this.plugins.tidy;

        if (! plug.hasOwnProperty(type) ) {
            type = "js";
        }
        
        code = tidy[type](code, merge(true, plug[type], options ));  

        return code;
    }

##### cdoc

    * **tidy** This uses [js-beautify](https://www.npmjs.com/package/js-beautify)
    The first argument is the type:  js, css, or html. The second argument are
    options that get merged with the defaults. The js has a default of
    `indent_size` of 4 and `jslint_happy` true. An unrecognized first argument
    (or none) will default to js. 


## Minify

This combines three different minimizers into a single command. 

    var jsmin = require("uglify-js").minify;
    var cssmin = require("clean-css");
    var htmlmin = require("html-minifier").minify;

    Folder.plugins.minify = {
        js : {},
        css : {},
        html : {}
    };

    Folder.sync("minify", _":fun");

[fun]() 

    function (code, args) {
        var type = args[0];
        var options = args[1] || {};
        var plug = this.plugins.minify;

        if (! plug.hasOwnProperty(type) ) {
            type = "js";
        }
        
        options = merge(true, plug[type], options);

        switch (type) {
            case 'js' : 
                options.fromString = true; 
                code = jsmin(code, options);
            break;
            case 'css' : 
                code = new cssmin(options).minify(code);
                if (args[2] !== true) {
                    code = code.styles; 
                }
            break;
            case 'html':
                code = htmlmin(code, options);
            break;
        }

        return code;
    } 
    

##### cdoc

    * **minify** The first argument says the type of minifier: js, css, and
      html. js is the default if the first argument is not realized. The
      second argument is an object of options that get passed in. This uses
      uglify-js, clean-css, and 
      [html-minifier](https://www.npmjs.com/package/html-minifier), 
      respectively. For css, the
      second argument can be a boolean indicating whether to pass on the
      results object (if true, `t()` ) or just the css output text (default). 


## More ideas

directive: js-bench, arguments are different code blocks to test, the incoming text is
the test setup, split on say, \n===\n between args and maybe \n---\n between
name, pre, post. The bit between js-bench: ... |  could be a toggle of off,
log, or a filename to save the results. use jsperf or something

directive: js-test, use tape, and setup environment, results, with \n---\n
setup. 

[off](# "block:")

## README


 # literate-programming  [![Build Status](https://travis-ci.org/jostylr/literate-programming.png)](https://travis-ci.org/jostylr/literate-programming)
 

This is the fat command-line client for
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
It contains the full functionality for literate programming, including useful
commands such as jshint included in it. For a thin client,
check out
[litpro](https://github.com/jostylr/litpro)


Full documentation:  [Literate Programming, MD: How to Treat and Prevent Software Project Mess](https://leanpub.com/literate-programming-md)

This is not done being fully baked, hence v0.9. But this does represent a
significant break from 0.8.4.  You can take a look at convert.md for some
observations of mine as I converted from the old version to the new. 

Install using `npm install literate-programming`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write
`literate-programming` then use `npm install -g literate-programming`.

The library has a full listing of the syntax, commands, and directives. Here
we list the flags and new commands and directives. 

 ## Example usage

 Save the following code to file `project.md` and run `literate-programming project.md`.

    # Welcome

    So you want to make a literate program? Let's have a program that outputs
    all numbers between 1 to 10.

    Let's save it in file count.js

    [count.js](#Structure "save: | jshint")

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

## Documentation

For more information, see the [documentation book](https://leanpub.com/literate-programming-md) which is free to read online or available for purchase as a PDF. 

Some particularly useful syntax sections are: 

*  [command-line flags](https://leanpub.com/literate-programming-md/read#leanpub-auto-command-line-1)
* [directives](https://leanpub.com/literate-programming-md/read#leanpub-auto-directives-1)
* [commands](https://leanpub.com/literate-programming-md/read#leanpub-auto-commands-1)
* [subcommands](https://leanpub.com/literate-programming-md/read#leanpub-auto-subcommands-1)
 


 ## Use and Security

It is inherently unsecure to compile literate
program documents. No effort has been made to make it secure. Compiling a
literate program using this program is equivalent to running arbitrary code on
your computer. Only compile from trusted sources, i.e., use the same
precautions as running a node module. 
 

 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)

---!


[on](# "block:")

## Test

The first test determines that it is hooked up correctly. This should pass the
same tests as literate-programming-cli.  Just need to make sure it is hooked
up correctly. 

Then we have tests to specifically test each of the command and directives. 

We also have integration tests, many of which come from the old version. In
addition to the usual directory items, it also has an "old" directory for each
one to allow comparison of the old version and new version. This may be of
help for those adapting to the new version. 



    /* global require */
    var tests = require('literate-programming-cli-test')("node ../../index.js");

    var files = [["first",  "first.md second.md -s ."],
        ["testpro",  "period.md testpro.md -s ."],
        ["primes",  "primes.md -s . -z primes:20"],
        ["sample", "sample.md -s ."],
        ["template", "templating.md simpletemp.md -s ."],
        ["blackwhitehats", "blackwhitehats.md -s ."],
        ["cinnamon", "cinnamon.md -s ."],
        ["fence", "fence.md -s ."],
        ["jstidy", "jstidy.md -s ."],
        ["fizzbuzz", "fizzbuzz.md -s ."],
        ["matrix", "matrix.md -s ."],
        ["logs", "logs.md -s ."],
        ["cheerio", "cheers.md -s ."],
        ["integrated", "integrated.md -s ."]];
    tests.apply(null,  files.slice());

### test gitignore

This needs to go into each directory in tests.

    node_modules
    /build
    /cache
    /.checksum
    /err.test
    /out.test

Need to think of a better way of propagating one file to multiple
destinations. 

* [../tests/](# "cd: save")
* [first/.gitignore](# "save:")
* [testpro/.gitignore](# "save:")
* [primes/.gitignore](# "save:")
* [sample/.gitignore](# "save:")
* [template/.gitignore](# "save:")
* [blackwhitehats/.gitignore](# "save:")
* [cinnamon/.gitignore](# "save:")
* [fence/.gitignore](# "save:")
* [jstidy/.gitignore](# "save:")
* [fizzbuzz/.gitignore](# "save:")
* [matrix/.gitignore](# "save:")
* [logs/.gitignore](# "save:")
* [cheerio/.gitignore](# "save:")
* [integrated/.gitignore](# "save:")
* [](# "cd: save"



[off](# "block:)

## Converting

Are you coming from the old version? There are syntax differences. Here we
list a few tips to help the process. 

Old way: `| clean raw"`  takes the raw text of the section and makes it
cleaned up New way: New version does not see the commentary text. So we need
to act on the document itself. We also don't want the blocks to get evaluated
which automatically happens in this version. So we place directives to turn
off that feature: `[off](# "block:")` turns off block reading,  
`[on](# "block:")` turns it back on. We then need to do the snippet cutting:  
`| raw ## README, !---- | sub \n\ #, \n# |trim`
Raw says to take the raw document and
cut between the two given pieces. We still shift the headings to not be read
as heading and the sub puts it back. 

Moving towards a conventional setup of  setup.md containing project files to
be put in home directory (package.json and lprc.js for example) using `litpro
-b . setup.md` then one can do `npm install` and then do `litpro` to process
`project.md` which then calls the other files. 

Convert substitute(...) to sub. In VIM:  `:%s/substitute(\([^)]\+\))/sub \1/g`

Boilerplate. Old syntax, rather wonky, was to use * to indicate a template to
fill in. New version has the compile command. So instead of `float tests*test
template` we would have `_"test template | compile float tests"` All the minor
sections in the template are required, but they can be empty. Instead of the *
in front of the minor, escape the underscore. `_"*:code"` --> `\_":code"`
While the asterisk notation is, in some sense, nicer, the async nature of the
new version made it problematic. 

Beware of h5 and h6 headers; they fill a new role. Reduce the number of hashes. 

Minor blocks should now best be in the form `[name]()`  They can appear
anywhere; it is the form that matters. Alternatively, `[name](# ": | ...")`
can be used if there are pipe transformations desired. The key is the leading
colon and having a name.

The old setup had minors that could have an extension between `: |` and that
would become part of the name. That is not present in the new one. It was not
really needed. Also minors can be referred to in the hash -- just use the
colon as one would, e.g. `[logs.htm](#structure "Save: main")` becomes 
`[logs.htm](#structure:main "Save: ")`

Blocks cannot refer to each other without problems as they will mutually wait
for each other.

Fencing of code blocks follows commonmark syntax. Be careful about lists too. 

To eval code directly, one can use `| eval _"some code"`. The incoming text is
in the variable `text` and that variable is what the outgoing text is recorded
as. 

We no longer can evaluate the blocks in terms of where we are in the command
input stage. This was always confusing, anyway. Instead use backslashes and
the compile command. 

To access the arguments called by the command line, one can do
`doc.parent.stdin[whatever property]` and one can create whatever property by
doing `- z prop:val`

The two things above allow one to have the literate program directly doing
computations instead of just creating a script that can be called. No real
reason for this, I suppose, but hey, it works. 

No replacement for 

```
\_"*:expected|heading"
## Heading

    function () {
        return this.hblock.heading.split("*")[0]; 
    }

 [heading](#heading "define: command | | now")
```


  ## Break with previous versions

This is a complete rewrite. The syntax is simplified so that only the ``_`code
block| function | functionn` `` syntax is needed. Leave off the code block to
just start using functions (leave the pipe). The code block in that syntax
need not be a code block, but could be a user-defined variable name,

Another break in the syntax is the switch link. This was a link that was on a
line by itself. It was a kind of heading, one that would make a quick separate
code block under the same heading. I find it convenient. But in trying to
match the general parsing of markdown programs, I am moving towards using a
professional markdown parser that would make it difficult to recognize the
positioning of a link, but trivial to parse one.  So the switch link will be a
link whose title quote starts with a colon. So an empty directive. It can
still be positioned as always.  Also can implement it so that if the
parenthetical is completely empty, then that is a switch. I noticed that that
is what I often do. 

For header purposes, a link's square bracket portion will be returned to the
surrounding block.

Also headers will have a way to be modified based on their levels. 
I have never used levels 5 and 6, for example.
As an example, one could have level 5 headers for tests, docs, and examples,
that could then be compiled and run bey selecting those headers.  Not sure yet. 

Also, there is no tracking of the non-significant text. So for example, raw
will not work in the same way. It was always a bit of a hack and now it will
be more so. There can be easily a plugin that will search for the heading and
cut the rest, etc.

Multiple substitute cycles are no longer supported. I always found it hard to
reason about it and it greatly simplifies the code. If you need that
functionality, it probably is workable with substitutes and the variable
storage introduced. 

The compiled blocks are stored as variables. We can store arbitrary variable
names and so potentially can conflict with block names. You have been warned.
It is all "global" scope though you can use syntax to kind of scope it. Well,
actually we are scoped to the documents, that is `docname::..` gives another
scope which the var setting respects. 

Another break is that block names need to match. There is the main block which
has no minor associated with it and then there are the minors of the block. If
you want the minor commands on the main, then start the code line with `[](#
":|...")` where the colon is there to indicate a minor directive, but with no
name and no extension, this will signal the main block. Note that this will
overwrite whatever was in the main code block, if anything. Once a block
(minor or not) is switched from, it cannot be added to later. Trust me, this
is a good thing. 


--!

[on](# "block:")

    
