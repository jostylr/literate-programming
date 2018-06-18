# Literate Programming Library

This creates the core of the literate-programming system. It is a stand-alone
module that can be used on its own or with plugins. It can run in node or the
browser via browserify.

The basic idea is that the text is fed to it already and then it parses it. It
generates promises in the stitching, using await and async. It requires
runtimes that are okay with that. 

A literate program is a series of chunks of explanatory text and code blocks
that get woven together. The compilation of a literate program is not just
weaving code blocks, but managing the entire input and output cycle of a
project, including linting, testing, minimizing.

The command line client is in a set of separate modules.


## Directory structure

### Load

These are loaded from the src directory.

* [events](events.md "load:") Some of the events that get emitted. It would be
  good to get more there. 
* [commonmark](commonmark.md "load:") This is where the markdown document is parsed
  into events using commonmark. 
* [stitching](stitching.md "load:") This is where we stitch all the pieces
  together.
* [logs](logs.md "load:") This is where the log functions and storage of logs
  is handled. 
* [directives](directives.md "load:") The default directives. 
* [commands](commands.md "load:") The default commands.
* [subcommands](subcommands.md "load:") The default subcommands.
* [matrix](matrix.md "load:") This implements 2d tables
* [tests](tests.md "load:") This the setup for our tests. 
* [debugging](debugging.md "load:") Woefully inadequate, but a start. 
* [requires](requires.md "load:") This has a few utility functions in it. 

### Save

These are the relevant project files for understanding the library.


* [../](# "cd: save")
* [index.js](#structure-of-the-module "save:  | jshint ") This is the
  compiler.
* [test.js](#tests:: "save: | jshint") The test runner.
* [README.md](#readme "save:| raw ## README, !---- | sub \n\ #, \n# |
     sub COMDOC, _'commands::doc' | trim ") The standard README.
* [](# "cd: save")



## Structure of the module

The module exports a function that takes in a text and an optional options
object. This function is asynchronous. It returns an object with a variety of
objects, but the most important being the folder object which is the virtual
folder directory of the outputs, namely with keys that are filenames (urls)
and the text content. 

To call a literate programming process on a text, we can use the following: 

    const lp$ = require('literate-programming-lib');
    const res = await lp$(text, {save: somesaveprocess, read:
    somereadingprocess});
    Object.keys(res.folder); //produces list of all files
    res.save(); // saves the folder


The parsing starts with commonmark processing the text. While the commonmark
parsing itself is synchronous, the directives encountered can be fundamentally 
asynchronous. So we do awaits for the directives. 

After the parsing is done, we then do the compile phase, which is also
potentially asynchronous. Note that parsing of other literate files may be
called into action while doing the compiling. 

To be environment agnostic, the lp function has hooks for saving and reading,
but does not implement them. That is done at another level. They should both
by asynchronous functions where save takes in the folder object and saves all
the files in there and the read function takes in a string
(filename/url/directory name/doc store in db; there is a convention here) and
outputs an object of texts with keys (typically it will be one key, the one
that matches  the filename text, but if a directory, it would produce all the
files). The cli-module has one set of conventions for this, the browser
another.


## Index 

This is the node index file 


    const commonmark = require('commonmark');

    const lp$ = async function (text = '', options = {}) {

        
        _"options"

        const scopes = {};

        const parser = _"commonmark::"

        const compiler = _"

        

    };
    
    module.exports = lp$;
            
 

## Folder

This is what can be saved for the browser directly, pulling in bluebird and
commonmark scripts

    var apply = _"events::apply";

    var Folder = _"folder constructor";

    Folder.requires = {};
    var clone = Folder.requires.clone = _"requires::clone";
    var typeit = Folder.requires.typeit = _"requires::typeit";
    var merge = Folder.requires.merge = _"requires::merge";
    
    Folder.comments = {};
    
    Folder.prototype.parse = _"commonmark::";

    Folder.prototype.newdoc = _"Make a new document";

    Folder.prototype.colon = _"colon";

    Folder.prototype.join = "\n";

    _"logs::"
   
    Folder.prototype.indicator = "\u2AF6\u2AF6\u2AF6";

    Folder.prototype.convertHeading = _"events::convert heading";
    
    _"commands::folder prototype"

    Folder.prototype.uniq = Folder.requires.unique =
        _"requires::unique counter";

    _"stitching::folder prototype"

    // communication between folders, say for caching read in files
    Folder.fcd = new EvW(); 

    Folder.postInit = function () {}; //a hook for plugin this modification
    Folder.plugins = {};
    Folder.leaders = ['.', '-', '#', '*'];
    Folder.dash = {};
    Folder.booleans = _"subcommands::booleans";

    _"debugging::"

    Folder.commands = _"Commands::";
    
    _"directives::folder prototype"
    Folder.directives = _"Directives::";

    Folder.subCommands = _"Subcommands::";

    Folder.defSubCommand =_"Subcommands::Attach Subcommands";

    var Doc = Folder.prototype.Doc = _"doc constructor";

    _"stitching::"
 
    _"commands::more" 



## folder constructor
This is the container that contains a bunch of related docs if need be and
allows them to communicate to each other if need be. It is also where
something like the read and write methods can be defined. It is likely only
one will be used but in case there is a need for something else, we can do
this.

Some things such as how to take in input and put out output are needed to be
added. The internal basic compiling is baked in though it can be overwritten.

We have a default scope called `g` for global.

    function (actions) {
        actions = actions || Folder.actions;
        //var parent = this;

        var gcd = this.gcd = new EvW();
        //.when will preserve initial, not emitted order
        gcd.initialOrdering = true; 
        
        // this is for handling file loading
        var fcd = this.fcd = new EvW();
        fcd.folder = this; // so it can issue warnings, etc.
        
        this.docs = {};
        this.scopes = { g:{} };
        
        this.commands = Folder.commands;
        this.directives = Folder.directives;
        this.subCommands =Folder.subCommands;
        this.reports = {};
        this.recording = {};
        this.stack = {};
        this.reporters = Folder.reporters;
        this.plugins = Folder.plugins;
        this.leaders = Folder.leaders;
        this.dash = Folder.dash;
        this.booleans = Folder.booleans;
        this.flags = {};
        this.comments = Folder.comments;
        this.Folder = Folder;
        _"debugging::var tracking:initialize"
        this.logs = _"logs::diagnostics";

        _"events::done when"
        
        gcd.parent = this;

        _"events::"

        if (actions) {
            apply(gcd, actions);
        }

        Folder.postInit(this);
        
        _"debugging::var tracking:report"

        return this;
    }


## Doc constructor

This is the constructor which creates the doc structures. 

The emitter is shared within a folder, each document is scoped using its
filename location. The doc structure is just a holding object with none of its
own methods. 

To have event/action flows different than standard, one can write scoped
listeners and then set `evObj.stop = true` to prevent the propagation upwards.


    function (file, text, parent, actions) {
        this.parent = parent;
        var gcd = this.gcd = parent.gcd;
        this.Folder = Folder;

        this.file = file; // globally unique name for this doc

        parent.docs[file] = this;

        this.text = text;

        this.blockOff = 0;
        
        this.levels = {};
        this.blocks = {'^' : ''}; //an empty initial block in case of headless
        this.heading = this.curname = '^';
        this.levels[0] = text;
        this.levels[1] = '';
        this.levels[2] = '';


        
        this.vars = parent.createScope(file);

        this.commands = parent.commands;
        this.directives = parent.directives;
        this.subCommands = parent.subCommands;
        this.comments = parent.comments; 
        this.colon = parent.colon; 
        this.join = parent.join;
        _"logs::doc"
        this.cmdworker = this.parent.cmdworker;
        this.compose = this.parent.compose;
        this.scopes = this.parent.scopes;
        this.subnameTransform = this.parent.subnameTransform;
        this.indicator = this.parent.indicator;
        this.wrapAsync = parent.wrapAsync;
        this.wrapSync = parent.wrapSync;
        this.wrapDefaults = parent.wrapDefaults;
        this.uniq = parent.uniq;
        this.sync = Folder.sync;
        this.async = Folder.async;
        this.defSubCommand = Folder.defSubCommand;
        this.dirFactory = parent.dirFactory;
        this.plugins = parent.plugins;
        this.leaders = parent.leaders;
        this.dash = parent.dash;
        this.booleans = parent.booleans;
        this.convertHeading = parent.convertHeading;
        this.normalize = Folder.normalize;
    
        if (actions) {
            apply(gcd, actions);
        }

        return this;

    }



### Example of folder constructor use

This is an example that roughly sketches out what to pass in to constructor
and then what to do.

    folder = new Folder({
        "on" : [ 
            ["need document", "fetch document"],
            ["document fetched", "compile document"],
            ["file compiled, "write file"]
           ],
        "action" : [
            ["fetch document", function (file, evObj) {
                var gcd = evObj.emitter;
                 readfile(file, function (err, text) {
                    if (err) {
                        gcd.emit("document fetching failed:"+file, err);
                    } else {
                        gcd.parent[file] = text;
                        gcd.emit("document fetched:"+file);
                    }
               });
           ],
           ["compile document", function (text, evObj) {
              var gcd = evObj.emitter;
              var filename = evObj.pieces[0];
              var doc folder.docs[filename] = new Doc(text);
              gcd.emit("need parsing:"+filename);
           }];
        ]
        .....
    });
    
    folder.gcd.emit("need document", filename);



## colon

This is about the colon stuff. Colons are used in event-when for separating
events; this is convenient. But colons are also used for minor blocks as well
as present in protocols and what not. So if we use those unescaped, then the
colons will create separate events. This is not good. So we escape colons to
triple colons which hopefully is visible to most as a triple colon. Don't know
of any use of them so that should be good too. 

This defines the colon which we use internally. To escape the colon or
unescape, we define methods and export them. 


    {   v : "\u2AF6",
        escape : function (text) {
             return (typeof text === "string") ? 
                text.replace(/:/g,  "\u2AF6") : text;
        },
        restore : function (text) {
            return (typeof text === "string") ? 
                text.replace( /[\u2AF6]/g, ":") : text;
        }
    }

## Make a new document 

This takes in a file name, text, and possibly some more event/handler actions. 

    function (name, text, actions) {
        var parent = this;

        var doc = new parent.Doc(name, text, parent, actions);
        
        try {
            parent.parse(doc);
        } catch (e) {
            doc.log("Markdown parsing error. Last heading seen: " + 
                doc.curname);       
        }

        return doc;

    }



## Globals

This is a simple command that takes in a set of variable names and produces
the appropriate syntax. 

    function (input, args) {
        var globals = _":list | objectify 
        | eval _":json"  ";
        var ret = '';
        args.forEach(function (el) {
            ret += (globals[el] || 'var ' + el +';') + '\n';
        });
        return ret;
    }

[globals](# "define:")

[list]()

Some commonly used variables. 

    doc : var doc = this;
    gcd : var gcd = this.gcd;
    typeit : var typeit = this.Folder.requires.typeit;
    colon : var colon = this.colon.v;
    colesc : var colesc = this.colon.escape;
    normalize : var normalize = this.parent.Folder.normalize;
    leaders : var leaders = this.leaders;
    

[json]()

    var obj = text;
    var newobj = {};
    Object.keys(obj).forEach(function (el) {
        newobj[el] = obj[el];
    });
    text = JSON.stringify(newobj);

## Check

This checks that the odd arguments satisfy the second argument operator
condition with the third argument being what ought to be, i.e., `type, string`
should be of type string. 

    function (input, args) {
        var ret, err;
        var i, n = args.length, vname, op, cond;
        err = function (msg) {
            return 'doc.error(here, ' + msg + ', input, args);';
        };
        for (i = 0; i< n; i += 3) {
           vname = args[i];
           op = args[i+1];
           cond = args[i+2];
           if (op === "is") {
                ret += "if (!(typeit(" + vname + ", '" + cond + "' ) ) ) {";
                ret += err(vname + " should be of type " + cond);
                ret += "return; }";
           }
        }
        return ret;
    }

[check](# "define: ")


[off](# "block:")

## README


 # literate-programming-lib   [![Build Status](https://travis-ci.org/jostylr/literate-programming-lib.png)](https://travis-ci.org/jostylr/literate-programming-lib)

Write your code anywhere and in any order with as much explanation as you
like. literate-programming will weave it all together to produce your project.

This is a modificaiton of and an implementation of 
[Knuth's Literate Programming](http://www-cs-faculty.stanford.edu/~uno/lp.html)
technique. It is
perhaps most in line with [noweb](http://tex.loria.fr/litte/ieee.pdf). 

It uses markdown as the basic document format with the code to be weaved
together being markdown code blocks.  GitHub flavored code fences can also be used 
to demarcate code blocks. In particular, [commonmark](http://commonmark.org/)
is the spec that the parsing of the markdown is used. Anything considered code
by it will be considered code by literate programming. 

This processing does not care what language(s) your are programming in. But it
may skew towards more useful for the web stack. 

This is the core library that is used as a module. See 
[-cli](https://github.com/jostylr/literate-programming-cli)  for the command
line client. The [full](https://github.com/jostylr/literate-programming)
version has a variety of useful standard
plugins ("batteries included").

 ## Installation

This requires [node.js](http://nodejs.org) and [npm](https://npmjs.org/) to be
installed. See [nvm](https://github.com/creationix/nvm) for a recommend
installation of node; it allows one to toggle between different versions. This
has been tested on node.js .10, .12, and io.js.  It is basic javascript and
should work pretty much on any javascript engine. 

Then issue the command:

    npm install literate-programming-lib

Since this is the library module, typically you use the client version install
and do not install the lib directly. If you are hacking with modules, then you
already know that you will want this in the package.json file. 

 ## Using as a module

You can use `Folder = require('literate-programming-lib');` to get 
a constructor that will create what I think of as a folder.
The folder will handle all the documents and scopes and etc.  

To actually use this library (as opposed to the command line client), 
you need to establish how it fetches documents and tell
it how to save documents. An example is below. If you just want to compile
some documents, use the command line client and ignore this. Just saying the
following is not pretty. At least, not yet!

The thing to keep in mind is
that this library is structured around events 
using my [event-when](https://github.com/jostylr/event-when) library. The
variable gcd is the event emitter (dispatcher if you will).

    
    var fs = require('fs');
    var Folder = require('literate-programming-lib');
    var folder = new Folder();
    var gcd = folder.gcd;
    var colon = folder.colon;
   
    gcd.on("need document", function (rawname) {
        var safename = colon.escape(rawname);
        fs.readfile(rawname, {encoding:'utf8'},  function (err, text) {
            if (err) {
                gcd.emit("error:file not found:" + safename);
            } else {
                folder.newdoc(safename, text);
            }
        });
    });

    gcd.on("file ready", function(text, evObj) {
        var filename = evObj.pieces[0]; 
        fs.writefile(filename, text);
    });
   
    gcd.emit("need document:first.md");

This last line should start the whole chain of compilation with first.md being read in
and then any of its files being called, etc., and then any files to save will
get saved. 

The reason the lib does not have this natively is that I separated it out
specifically to avoid requiring file system access. Instead you can use any kind of
function that provides text, or whatever. It should be fine to also use
`folder.newdoc` directly on each bit of text as needed; everything will
patiently wait until the right stuff is ready. I think. 

Note that live code can be run from a literate program as well. So be
careful!

 ## Example

Let's give a quick example of what a sample text might look like. 

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

A full example of a literate program is lp.md in this repository. It compiles
to this library. 


 ## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level, either atx # or
seText underline ) demarcates a full block. Code blocks within a full block
are the bits that are woven together. 

 ### Code Block

Each code block can contain whatever kind of code, but there is a primary special
syntax.  

`_"Block name"` This tells the compiler to compile the block with "Block
   name" and then replace the `_"Block name"` with that code.

Note the the allowed quotes are double, single, and backtick. Matching types
are expected. And yes, it is useful to have three different types. 

The full syntax is something of the form 
`_"scope name::block name:minor block name | cmd arg 1, arg 2 | cmd2 |cmd3 ..."`
where the scope name allows us to refer to other documents (or artificial
common scopes) and the commands run the output of one to the input of the
other, also taking in arguments which could they themselves be block
substitutions. 

Note that one can also backslash escape the underscore. To have multiple
escapes (to allow for multiple compiling), one can use `\#_"` where the number
gets decremented by one on each compile and, when it is compiled with a 0 there,
the sub finally gets run.

A block of the form `_":first"` would look for a minor block, i.e., a block
that has been created by a switch directive. See next section. 

One can also visually hide parts of the document, without it being hidden to
the compiler, by using html comments. If the start of a line is `<!--+` then
it will strip that and the next occurrence of `-->` before doing the markdown
compiling. 

 ### Directive

A directive is a command that interacts with external input/output. Just about
every literate program has at least one save directive that will save some
compiled block to a file. 

The syntax for the save directive is 

    [file.ext](#name-the-heading "save: encoding | pipe commands")  

where 

* `file.ext` is the name of the file to save to
* `name-the-heading` is the heading of the block whose compiled version is being saved. 
Spaces in the heading get converted to dashes for id linking purposes.  Colons can be used
to reference other scopes and/or minor blocks. In particular, `#:jack` will
refernce the `jack` minor in the current heading block where the save
directive is located.
* `save:` is there to say this is the directive to save a file
* `encoding` is any valid encoding of
  [iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).
  This is relevant more in the command line module, but is here as the save
  directive is here. 
* `pipe commands` optional commands to process the text before saving. See
  next section. 


For other directives, what the various parts mean depends, but it is always 

    [some](#stuff "dir: whatever")  

where the `dir` should be replaced with a directive name. If dir is absent,
but the colon is there, then this demarcates a minor block start.   

 ### Pipes

One can also use pipes to pipe the compiled text through a command to do
something to it. For example, `_"Some JS code | jshint"`  will take the code
in block `some JS code` and pipe it into the jshint command which can be a 
thin wrapper for the jshint module and report errors to the console.
That command would then return the text in an untouched fashion.  We can also use 
pipe commands to modify the text. 

Commands can be used in block substitutions, minor block directive switches, and
other directives that are setup to use them such as the save and out directive:  
`[code.js](#some-js-code "save: | jstidy)` will tidy up the code
before storing it in the file `code.js`. 

If you want your own directive to process pipes, see the [save directive](https://github.com/jostylr/literate-programming-lib/blob/master/lp.md#save)  in
lp.md. Pay particular attention to the "process" and "deal with start" minor
blocks. The functionality of pipe parsing is in the `doc.pipeParsing` command,
but there are events that need to be respected in the setup. 

Commands take arguments separated by commas and commands end with pipes or the
block naming quote. One can also use a named code block as an argument, using
any of the quote marks (same or different as surround block name). To
escape commas, quotes, pipes, underscores, spaces (spaces get trimmed from the
beginning and ending of an argument), newlines, one can use a backslash, which
also escapes itself. Note that the commonmark parser will escape all
backslash-punctuation combinations outside of code blocks. So you may need a
double backslash in directive command pipings. 

You can also use `\n` to pu ta newline in line or `\u...` where the ... is a
unicode codepoint per JavaScript spec implemented by [string.fromcodepoint](https://github.com/mathiasbynens/String.fromCodePoint).    


 ### Minor Block

Finally, you can use distinct code blocks within a full block. If you simply
have multiple code blocks with none of the switching syntax below, then they
will get concatenated into a single code block. 

You can also switch to have what I call minor blocks within a main heading. This is mainly
used for small bits that are just pushed out of the way for convenience. A
full heading change is more appropriate for something that merits separate attention. 

To create a minor block, one can either use a link of the form `[code name]()` or 
`[code name](#whatever ":|cmd ...")` Note this is a bit of a break from
earlier versions in which a link on its own line would create a minor block. Now it is
purely on the form and not on placement. 


Example: Let's say in heading block `### Loopy` we have `[outer loop]()` 
Then it will create a code block that can be referenced by
`_"Loopy:outer loop"`.

Note: If the switch syntax is `[](#... ":|...")` then this just transforms
whatever is point to in href using the pipe commands. That is, it is not a
switch, but fills in a gap for main blocks not having pipe switch syntax. The
key is the empty link text.

 #### Templating

One use of minor blocks is as a templating mechanism.

    ## Top

    After the first compile, the numbers will be decremented, but the blocks
    will not be evaluated.

        \1_":first"

        \2_":second"
        
        \1_":final"


    This is now a template. We could use it as

    [jack](# "store:| compile basic ")

    [happy.txt](#jack "save:| compile great")
    [sad.txt](# "save:| compile basic | compile grumpy")


    # Basic

    [first]()
        
        Greetings and Salutations

    [final]()

        Sincerely,
        Jack

    # Great

    [second]()

        You are great.

    # Grumpy

    [second]()

        You are grumpy.

    # Middle

    [second]()

        You are okay.

    ## Another

        \_":first"

        \_"$2:second"
        
        \_":final"

    [middle.txt](# "save:| sub $2, middle | compile basic")

This would produce the files: 

happy.txt

    Greetings and Salutations

    You are great.

    Sincerely,
    Jack

sad.txt
    
    Greetings and Salutations

    You are grumpy.

    Sincerely,
    Jack

middle.txt

    Greetings and Salutations

    You are okay.

    Sincerely,
    Jack

    
Note that you need to be careful about feeding in the escaped commands into
other parsers. For example, I was using Pugs to generate HTML structure and
then using this templating to inject content (using markdown). Well, Pugs
escapes quotes and this was causing troubles. So I used backticks to delimit
the block name instead of quotes and it worked fine. Be flexible.


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
  ideas in the future, etc.
* You can "paste" multiple blocks of code using the same block name. This is
  like DRY, but the code does get repeated for the computer. You can also
  substitute in various values  in the substitution process so that code
  blocks that are almost the same but with different names can come from the
  same root structure. 
* You can put distracting data checks/sanitation/transformations into another
  block and focus on the algorithm without the use of functions (which can be
  distracting). 
* You can process the blocks in any fashion you want. So for example, to
  create a JSON object, one could use a simpler setup appropriate for the
  particular data and then transform it into JSON. It's all good. 
* This brings DSL and grunt power, written in the same place as your code. It
  is really about coding up an entire project. 
* Getting the length of functions right is difficult. Too short functions,
  and boilerplate and redirection becomes quite the bother. Too long, and it
  is hard to understand what all a function is doing. Too long and we lose
  composability. Too short, the chain of composing them becomes too long.
  Literate programming can help somewhat in that we can have longer functions
  and still have it understood. We could also potentially use the litpro
  blocks again allowing for some composability though that that should be
  rare. I think the rule of thumb is that if breaking it up seems good from a
  usability stance, do it. If breaking it up is more about keeping a function
  to a readable length, use litpro blocks. Another advantage of using litpro
  blocks is that we get the benefit of small parts when coding, but when
  debugging, we can see a much larger flow of code all at once in the compiled
  version. 

I also like to use it to compile an entire project from a single file, pulling
in other literate program files as needed. That is, one can have a
command-and-control literate program file and a bunch of separate files for
separate concerns. But note that you need not split the project into any
pre-defined ways. For example, if designing a web interface, you can organize
the files by widgets, mixing in HTML, CSS, and JS in a single file whose
purpose is clear. Then the central file can pull it all in to a single web
page (or many) as well as save the CSS and JS to their own files as per the
reommendation, lessing the CSS, tanspiling ES6, linting, and minifying all as
desired. Or you could just write each output file separate in its own litpro
document.

It's all good. You decide the order and grouping. The structure of your litpro
documents is up to you and is **independent** of the needed structures of the
output. 

 ## Directives vs commands vs subcommand

Directives affect the flow of the literate program itself, such as defining
commands, saving output, or directly storing values. Commands transform
incoming text or other input. Subcommands create useful arguments to commands. 

Directives can be thought of as procedures, commands as methods on the input,
and subcommands as functions. And indeed, directives do not compose in the
sense of returning a value. Commands are written like the chain syntax, with
what is on the left being evaluated first. Subcommands are written with
typical function syntax, with what is on the right being evaluated first. 


 ## Built in directives

There are a variety of directives that come built in.
    
* **Save** `[filename](#start "save:options|commands")` Save the text from
  start into file filename. The options can be used in different ways, but in
  the command client it is an encoding string for saving the file; the default
  encoding is utf8.
* **Store** `[name|value](#start "store:value|...")`  If the value is present, then
  it is sent through the pipes. If there is no value, then the `#start`
  location is used for the value and that gets piped.  The name is used to
  store the value. You can also use the pipe syntax in the linkname part for
  the value instead. This dominates over the start or option value. A little
  bit easer for the reader to see in rendered form. 
* **Log** Same as store, except instead of storing it in the doc, it logs it
  to console. Same exact syntax. 
* **Transform** `[des|name](#start "transform:|...)` or `[des|name](#start
  ":|...")`.  This takes the value that start points to and transforms it
  using the pipe commands. Note one can store the transformed values by
  placing the variable name after a pipe in the link text.  The description of
  link text has no role. For the syntax with no transform, it can be link text
  that starts with a pipe or it can be completely empty. Note that if it is
  empty, then it does not appear and is completely obscure to the reader. 
* **Load** `[alias](url "load:options")` This loads the file, found at the url
  (file name probably) and stores it in the alias scope as well as under the
  url name. We recommend using a short alias and not relying on the filename
  path since the alias is what will be used repeatedly to reference the blocks
  in the loaded file. Options are open, but for the command line client it is
  the encoding string with default utf8. Note there are no pipes since there
  is no block to act on it.
* **Cd** `[path](#ignore "cd: load/save")` This creates the ability to change
  directories for either loading or saving. This is relative to the default
  directory. `[](# "cd: load")` (or save)  will clear the path; it is always
  good to do that when done. Ideally, this would be a tightly grouped of files
  (listing like a directory) with the initial change right before the list and
  the changing back after the list. 
* **Define** `[commandName](#start "define: async/sync/raw/defaults|cmd")`
  This allows one to define commands in a lit pro document. Very handy. Order
  is irrelevant; anything requiring a command will wait for it to be defined.
  This is convenient, but also a bit more of a bother for debugging. Anyway,
  the start is where we find the text for the body of the command. The post
  colon, pre pipe area expects one of three options which is explained below
  in plugins.You can also pipe your command definition through pipe commands
  before finally installing the function as a live function. Lots of power,
  lots of headaches :)  
  
    + The basic signature of a command is 
      `function (input, args, name/callback)` where
      the input is the text being piped in, the args are the arguments array
      of the command, and name is the name to be emitted when done. The `this`
      is the doc. 
    + sync. This should return a value which will be used as the text being
      passed along. You can access name if you like, but it is not useful
      here.  
    + async. Name is a callback function that should be called when done.
      Standard node signature of `(err, data)`. So put the text in the second
      slot and null in the first if all is well. 
    + raw. Nothing is setup for you. You have to get your hands dirty with the
      event emitter of the doc. You'll need some good understanding of it. See
      the sub command definition for inspiration.
    + defaults. The idea is that this is mostly synchronous, but has some
      default arguments that come from the document and hence it is async for
      that reason. So we need to create a tag for the emitname, document
      variable names for default, and the function that is to be called when
      all is ready. To accomodate this, instead of a function, we should have
      an array that gets read in: `[tag, arg0, arg1, ...., fun]` where tag is
      either a string or a function that takes in the passed in arguments and
      generates a string,  arg0 to arg..., are the default doc variables. It
      is fine to have some be empty. The final entry should be a function of
      the same type as the sync functions (return values pass along the
      input). 
      
    This defines the command only for current doc. To do it across docs in the
    project, define it in the lprc.js. The commandName should be one word. 

* **Compose** `[cmdname](#useless "compose: cmd1, arg1, ..| cmd2, ...")` This
  composes commands, even those not yet defined. The arguments specified here
  are passed onto the commands as they are executed. There are no subcommands
  used in these arguments, but subcommands can be used in the arguments
  differently. If an argi syntax has `$i` then that numbered argument when the
  command is invoked is subbed in. If the argi has `@i`, then it assumed the
  incoming argument is an array and uses the next available array element; if
  the @i appears at the end of the arg list, then it unloads the rest of its
  elements there. This may be a little klunky and the syntax may change. We
  also have as special commands in compose: ` ` which does nothing but handles
  two accidental pipes in a row smoothly,  `->$i` which stores the incoming
  into the ith variable to use later as a named dollar sign variable, `$i->`
  which sends along the ith variable to the next pipe, `->@i` which pushes the
  value onto the ith element, assuming it is an array (it creates an array if
  no array is found). There is also a special variant of `$i->cmd->$j` where
 if the first arrow is present, then it uses argument `i` as the input and if
 the second arrow is present, then it saves the output into argument `j`,
 sending the original input on instead of the output. 
* **Partial** `[cmdname](#block "partial: oldcmdname, argplace | pipes...")` This
  takes a command, `oldcmdname`, and makes a new command, `cmdname`, by
  replacing an argument slot, `argplace` zero-based, with whatever the block
  and pipes result in. 
* **Subcommand** `[subcommandname](#cmdName "subcommand:")` This defines
  subcommandname (one word) and attaches it to be active in the cmdName. If no
  cmdName, then it becomes available to all commands.  
* **Block**s on/off `[off](# "block:")` Stops recording code blocks. This is
  good when writing a bunch of explanatory code text that you do not want
  compiled. You can turn it back on with the `[on](# "block:")` directive.
  Directives and headings are still actively being run and used. These can be
  nested. Think "block comment" sections. Good for turning off troublesome
  sections. 
* **Eval** `[des|name](# "eval:)` Whatever block the eval finds itself, it
  will eval. It will eval it only up to the point where it is placed. This is
  an immediate action and can be quite useful for interventions. The eval will
  have access to the doc object which gives one access to just about
  everything else. This is one of those things that make running a literate
  progamming insecure. The return value is nonexistent and the program will
  not usually wait for any async actions to complete. If you put a pipe in the
  link name text, then the anything after the pipe will become a name that the
  variable `ret` will be stored in.  
* **Ignore** `[language](# "ignore:")` This ignores the `language` code
  blocks.  For example, by convention, you could use code fence blocks with
  language js for compiled code and ignore those with javascript. So you can
  have example code that will not be seen and still get your syntax
  highlighting and convenience. Note that this only works with code fences,
  obviously. As soon as this is seen, it will be used and applied there after. 
* **Out**  `[outname](#start "save:|commands")` Sends the text from start to
  the console, using outname as a label.
* **New scope** `[scope name](# "new scope:")` This creates a new scope (stuff
  before a double colon). You can use it to store variables in a different
  scope. Not terribly needed, but it was easy to expose the underlying
  functionality. 
* **Push** `[var name |value](#start "push: |...")` This takes the stuff in start,
  throws it through some pipes, and then stores it as an item in an array with
  the array stored under var name. These are stored in the order of appearance
  in the document. The optional pipe syntax after var name will yield the
  value that starts and we ignore `#start` in that case.
* **h5** `[varname](#heading "h5: opt | cmd1, ...")` This is a directive that
  makes h5 headings that match `heading` act like the push above where it is
  being pushed to an array that will eventually populate `varname`. It takes
  an optional argument which could be `off` to stop listening for the headings
  (this is useful to have scoped behavior) and `full` which will give the
  event name as well as the text; the default is just the text.  
* **Link Scope** `[alias name](# "link scope:scopename")` This creates an
  alias for an existing scope. This can be useful if you want to use one name
  and toggle between them. For example, you could use the alias `v` for `dev`
  or `deploy` and then have `v::title` be used with just switching what `v`
  points to depending on needs. A bit of a stretch, I admit. 
* **Monitor** `[match string](# "monitor:")` This is a bit digging into the system.
  You can monitor the events being emitted by using what you want to match
  for.  For example, you could put in a block name (all lower cased) and
  monitor all events for that. This gets sent to `doc.log` which by default
  prints to `console.log`. If you use `\:` in the match string, this becomes
  the triple colon separator that we use for techinical reasons for
  `block:minor` name syntax.  This directive's code gives a bit of insight as
  to how to get more out of the system.
* **If** `[...](... "if: flag; directive:...")` If flag holds true (think
  build flag), then the driective is executed with the arguments as given. A
  couple of great uses are conditional evaling which allows for a great deal
  of flexibility and conditional block on/off which may be useful if there is
  extensive debugging commands involved. 
* **Flag** `[flag name](# "flag:")` This sets the named flag to true. Note
  there is no way to turn a flag off easily. 
* **Version** `[name](# "version: number ; tagline")` This gives the name and
  version of the program. Note the semicolon separator.  Saves `g::docname`,
  `g::docversion`, `g::tagline`.
* **npminfo** `[author name](github/gituser "npminfo: author email; deps: ;
  dev: " )` This takes in a string for some basic author information and
  dependencies used. To add on or modify how it handles the deps, dev, etc.,
  modify the `types` object on `Folder.directives.npminfo`.  Saves
  `g::authorname`, `g::gituser`, `g::authoremail`, `g::npm dependencies`,
  `g::npm dev dependencies`.


COMDOC

 ## Built-in Subcommands

With command arguments, one can run commands on arguments to get them in some
appropriate form or use, including passing in objects or arrays. You can use
them as `cmd a, subcmd(arg1, arg2, arg3)` would have subcmd acting on the args
and the result of that would be the argument place
 The `a` would be passed into cmd as the first
argument, but anything might get passed into cmd by subcmd's return value. It
could also store an object into a state for configuration. 

There are several built-in subcommands. Note that these are case insensitive. 

* `ec` or `echo`  This expects a quote-delimited string to be passed in and
  will strip the quotes. This is useful as the appearance of a quote will mask
  all other mechanics. So `e("a, b and _this")` will produce a literal
  argument of `a, b, and _this`. Multiple arguments will be stripped and
  passed on as multiple arguments.  
* `join` The first entry is the joiner separator and it joins the rest
  of the arguments. For arrays, they are flattened with the separator as well
  (just one level -- then it gets messy and wrong, probably). 
* `arr` or `array` This creates an array of the arguments.
* `arguments` or `args` Inverse of array. This expects an array and each
  element becomes a separate argument that the command will see. E.g., `cmd
  arguments(arr(3, 4))` is equivalent to `cmd 3, 4`. This is useful for
  constructing the args elsewhere. In particular, `args(obj(_"returns json of
  an array"))` will result in the array from the subsitution becoming the
  arguments to pass in. 
* `obj` or `object` This presumes that a JSON stringed object is ready
  to be made into an object.
* `merge` Merge arrays or objects, depending on what is there.
* `kv` or `key-value` This produces an object based on the assumption that a
  `key, value` pairing are the arguments. The key should be text. Multiple
  pairs welcome.  
* `act` This allows one to do `obj, method, args` to apply a method to an
  object with the slot 2 and above being arguments. For example, one could do
  `act( arr(3, 4, 5), slice, 2, 3)` to slice the array to `[5]`.
* `.method` This is similar to `act` except that the method is in the name. So
   the same example would be `.slice( arr(3, 4, 5), 2, 3)`. Also `dot(slice,
   arr(3,4,5), 2, 3)`. 
* `prop` or `property`. This will take the arguments as a property chain to
  extract the value being pointed to. 
* `json` This will convert an object to JSON representation.
* `set` The presumption is that an object is passed in whose key:values should
  be added to the command state.  `gSet` does this in a way that other
  commands in the pipe chain can see it. `set(kv(name, val, ...))` would
  probably be the typical way.  
* `get` This retrieves the value for the given key argument. `gGet` does the
  same for the pipe chain. Multiple keys can be given and each associated
  value will be returned as distinct arguments. 
* `num` `number` This converts the argument(s) to numbers, using js
  Number function. `num(1, 2, 3)` will create three arguments of integers. To
  get an array, use `arr(num(1, 2, 3)`
* `date` Returns a date object. `date()` returns what the current now is,
  `date(some date string)` will return a date object as parsed by Date. 
* `ev` or`eval` will evaluate the argument and use the magic `ret` variable as the
  value to return. This can also see doc (and doc.cmdName) and args has the
  arguments post code.  Recommend using backticks for quoting the eval; it
  will check for that automatically (just backticks, can do echo for the
  others if needed).
* `fun` or `function` evaluates the code as if it is a function and returns
  that function. Any other arguments are seen in the args closure variable.
  Just like eval, backticks can be used and should be used to directly quote
  the function text. 
* `log` This logs the arguments and passes them along as arguments.
* `true`. This returns the true value.
* `false`. This returns the false value.
* `null`. This returns the null value. 
* `reg` or `regexp` Takes in a regular expression string and possibly some
  flags and returns a regular expression. Defaults to a global flag; pass in
  `-` as part of the flags to get non-global. 
* `doc`. This returns the doc variable. This could be useful in connection to
  the property method and the log subcommand.
* `skip`. This returns no arguments. 
* `-fun` or `dash(fun, ...)` will use the functions found in the dash command
  but as a subcommand. `-pad(dude, 5)` will pad the string `dude` to have
  length 5 using the default spaces (in full where lodash is added to the
  dash).
* `?test` or `bool(test, ...)` will apply the test to the arguments. The
  following are the default tests in the variable `doc.booleans`:
    * `and` checks that all are truthy
    * `or` checks that at least one is truthy`
    * `not` negates the boolean
    * `===`, `==`, `>`, `>=`, `<`, `<=` tests in sequence the relation. 
    * `!==`, `!=` tests all pairs for non-equality. 
    * `flag` looks to see if the passed in strings are flags that have been
      set. 
    * `match` Takes in a string as first argument and either a string or
      regular expression to match.
    * `type` Tests first argument as one of the types that follow (strings). 
* `input` This returns the incoming input. Should be useful for extraction of
  information, particularly for boolean tests. 
* `type` Yields the type of the object in first argument. 

To build one's own command, you can attach a function whose arguments will be
the arguments passed in. The `this` is the doc object. The current name (say
for scope storing) is in doc.cmdName. This will point to within a whole pipe
chunk. Pop off the last part (delimited by triple colon) to get to the whole
command scope. The return value will be used as in an argument into the
command or another subcommand. If it is an array and the flag `args` is set to
true, then each entry in the array will be expanded into a set of arguments.
So instead of 1 argument, several could be returned. If nothing is returned,
then no arguments are passed on and it is as if it wasn't there.    


 ## h5 and h6

So this design treats h5 and h6 headings differently. They become subheadings
of h1-4 headings. So for example,  if we have `# top` and then `##### doc` and
`###### something` then the sections would be recorded as `top, top/doc,
top/doc/something` and we have a path syntax such as `../` which would yield
`top/doc` if placed in `top/doc/something`. Ideally, this should work as you
imagine. See `tests/h5.md` for the test examples.


 ## Plugins

This is a big topic which I will only touch on here. You can define commands
in the text of a literate program, and we will discuss this a bit here, but
mostly, both commands and directives get defined in module plugins or the `lprc.js`
file if need be. 

 ### Defining Commands

The define directive allows one to create commands within a document. This is
a good place to start getting used to how things work. 

A command has the function signature `function (input, args, name)-> void`
where the input is the incoming text (we are piping along when evaluating
commands), args are the arguments that are comma separated after the command
name, and the name is the name of the event that needs to be emitted with the
outgoing text. The function context is the `doc` example.

A minimal example is 

    function ( input, args, name) {
        this.gcd.emit(name, input);
    }

We simply emit the name with the incoming text as data. We usually use `doc`
for the `this` variable. This is the `raw` option in the define directive. 

The default is `sync` and is very easy. 

    function ( input, args, name) {
        return input;
    }

That is, we just return the text we want to return. In general, the name is
not needed though it may provide context clues. 

The third option is an `async` command. For those familiar with node
conventions, this is easy and natural. 

    function (input, args, callback, name) {
        callback(null, input);
    }

The callback takes in an error as first argument and, if no error, the text to
output. One should be able to use this as a function callback to pass into
other callback async setups in node. 

So that's the flow. Obviously, you are free to do what you like with the text
inside. You can access the document as `this` and from there get to the event
emitter `gcd` and the parent, `folder`, leading to other docs. The scopes are
available as well. Synchronous is the easiest, but asynchronous control flow
is just as good and is needed for reading files, network requests, external
process executions, etc. 

 ### Plugin convention.

I recommend the following npm module conventions for plugins for
literate-programming. 

1. litpro-... is the name. So all plugins would be namespaced to litpro.
   Clear, but short. 
2. Set `module.exports = function(Folder, other)` The first argument is the
   Folder object which construts folders which constructs documents. By
   accessing Folder, one can add a lot of functionality. This access is
   granted in the command line client before any `folder` is created. 

   The other argument depends on context, but for the command line client it
   is the parsed in arguments object. It can be useful for a number of
   purposes, but one should limit its use as it narrows the context of the
   use. 
3. Define commands and, less, directives. Commands are for transforming text,
   directives are for doing document flow maipulations. Other hacks on
   `Folder` should be even less rare than adding directives. 
4. Commands and directives are globally defined. 
5. `Folder.commands[cmd name] = function (input, args, name)...` is how to add a
   command function. You can use `Folder.sync(cmdname, cmdfun)` and
   `Folder.async` to install sync and async functions directly in the same
   fashion as used by the define directive.
6. `Folder.directives[directive name] = function (args)` is how to install a
   directive. There are no helper functions for directives. These are more for
   controlling the flow of the compiling in the large. The arg keys are read
   off from `[link](href "directive:input")`. Also provided is the current
   block name which is given by the key `cur`. 
7. If you want to do stuff after folder and its event emitter, gcd, is
   created, then you can modify Folder.postInit to be a function that does
   whatever you want on a folder instance. Think of it as a secondary
   constructor function.
8. The Folder has a plugins object where one can stash whatever under the
   plugin's name. This is largely for options and alternatives. The folder and
   doc object map to the same object.

 ### Structure of Doc and Folder

To really hack the doc compiling, one should inspect the structure of Folder,
folder, and doc.  The Folder is a constructor and it has a variety of
properties on it that are global to all folders. But it also has several
prototype properties that get inherited by the folder instances. Some of those
get inherited by the docs as well. For each folder, there is also a gcd object
which is the event emitter, which comes from the, ahem, magnificient event-when
library (I wrote it with this use in mind). In many ways, hacking on gcd will
manipulate the flow of the compiling. 

I wrote the folder instance to maintain flexibility, but typically (so far at
least), one folder instance per run is typical. Still, there might be a use
for it in say have a development and production compile separate but running
simultaneously?


 #### Folder
 
These are the properties of Folder that may be of interest.

* commands. This is an object that is prototyped onto the instance of a
  folder. Changing this adds commands to all created folder instances. 
* directives. This holds the directives. Otherwise same as commands.
* reporter. This holds the functions that report out problems. See
  reporters below. This is not prototyped and is shared across instances.
* postInit. This does modification of the instance. Default is a noop. 
* sync, async. These install sync and async commands, respectively.
* defSubCommand. Installs a subcommand. 
* plugins. This is a space to stash stuff for plugins. Use the plugin sans
  litpr as the key. Then put there whatever is of use. The idea is if you
  require something like jshint and then want default options, you can put
  that there. Then in a lprc file, someone can override those options it will
  be applied across the project.


 #### folder

Each instance of folder comes with its own instances of:

* docs. Holds all the documents.
* scopes. Holds all the scopes which are the stuff before the double colon. It
  includes the blocks from the compiled docs but also any created scopes.
* reports. This holds all the reports of stuff waiting. As stuff stops
  waiting, the reports go away. Ideally, this should be empty when all is
  done.
* stack. This is for the push and pop of text piping. 
* gcd. This is the event-emitter shared between docs, but not folders. Default
  actions are added during the instantiation, largely related to the parsing
  which sets up later. If you want to log what goes on, you may want to look
  at the event-when docs (makeLog is a good place to start).
* flags. This holds what flags are present. 

and shares via the prototype

* parse. This parses the text of docs using commonmark spec
* newdoc. This creates a new document. Kind of a constructor, but simply
  called as a function. it calls the constructor Doc.
* colon. We replace colons with a unicode triple colon for emitting purposes
  of block names (event-when uses colon as separators too). This contains the
  escape (does replacement), restore (undoes it), and v which is the unicode
  tripe colon. If the v is replaced entirely, everything should hopefully work
  just fine with a new separator.
* createScope. Creating a scope. 
* join. What is used to concatenate code blocks under same block heading.
  Default is "\n"
* log. What to do with logging. Defaults to console.log.
* indicator. An internal use to allow escaping of whitespace in command
  arguments that would otherwisebe trimmed. 
* wrapSync, wrapAsync. These wrap functions up for command sync, async, but do
  not install them. Not sure why not install them. 
* subnameTransform. A function that deals with shorthand minor substitutions
  that avoid using the main block heading. This can be overwritten if you want
  some custom behavior. 
* reportwaits. This is a function that produces the reports of what is still
  waiting. Very useful for debugging. This returns an array.
* simpleReport. This reports on the substitutions that did not get resolved.
  This returns an array. It also includes any commands that were called but
  not defined. Subcommands throw errors when not defined, but since commands
  can be defined later, they will not. Hence this mechanism.  
* Doc. This is the constructor for documents. 
* commands
* directives
* plugins

and direct copying from

* reporters

 #### doc

Each file leads to a doc which is stored in the folder. Each doc has a variety
of stuff going on. 

Unique to each instance

* file. The actual path to the file. It is treated as unique and there is a
  scope dedicated to it. Don't mess with it. It is also how docs are keyed in
  the folder.docs object.
* text. The actual text of the file.
* blockOff. This tracks whether to take in code blocks as usual. See blocks
  directive. If 0, code blocks are queued up. If greater than 1, code blocks
  are ignored. 
* levels. This tracks the level of the heading that is currently being used.
  See h5/h6 description
* blocks. Each heading gets its own key in the blocks and the raw code blocks
  are put here.
* heading, curname. These are part of the block parsing. curname is the full
  name while heading excludes minor block names.
* vars. This is where the variables live. As each code block is compiled,
  its result gets stored here. But one can also add any bit of var name and
  text to this. 
* parent. This is the folder that contains this doc.


Inherited from folder

* commands, modifications affect all
* directives, modifications affect all
* scopes, modifications affect all
* gcd, modifications affect all. Be careful to scope added events to files,
  etc. 
* plugins, modifications affect all
* colon 
* join, overwriting will only affect doc
* log, overwriting will only affect doc
* subnameTransform, overwriting will only affect doc
* indicator, overwriting will only affect doc
* wrapSync, wrapAsync, overwriting will only affect doc
* augment, this augments the object with the type. 
* cmdworker, this will call the command. needed as with the dot command, it
  can get tricky. Used in .apply, .mapc, compose. 
* compose, this creates a function from composing multiple commands 
    

Prototyped on Doc. Almost all are internal and are of little to no interest.

* pipeParsing. This parses the pipes. This may be useful if you want to do
  something like in the save or define directives. Check them out in the
  source if you want to see how to use it. 
* blockCompiling. This is what the compile command taps into. See how it is
  done there. 
* getscope. Looks up a scope and does appropriate async waiting for an
  existing scope if need be.
* retrieve. retrieves variable.
* createLinkedScope. Creates a link to a scope and notifies all.
* indent. This is the default indenting function for subbing in multi-line
  blocks. The default idea is to indent up to the indent of the line that
  contains the block sub; further existing indentation in sublines is
  respected on top of that. 
* getIndent. Figuring out the indent
* substituteParsing
* regexs. Some regular expressions that are used in the parsing of the code
  blocks.
* backslash. The backslash function applied to command arguments.
* whitespaceEscape. Handlingwhitespace escaping in conjunction with
  backslash. Putting the whitespace back.
* store. stores a variable.

 #### Reporting

A key feature of any programming environment is debugging. It is my hope that
this version has some better debugging information. The key to this is the
reporting function of what is waiting around. 

The way it works is that when an event of the form `waiting for:type:...` is
emitted with data `[evt, reportname, ...]` then reporters gets a key of the
event string wthout the `waiting for:`, and when the `evt` is emitted, it is
removed. 

If it is still waiting around when all is done, then it gets reported. The
reportname is used to look up which reporter is used. Then that reporter takes
in the remaining arguments and produces a string that will be part of the
final report that gets printed out.

Some of the waiting is not done by the emitting, but rather by presence in
.when and .onces. 


 ## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming-lib/blob/master/LICENSE)
!----


[on](# "block:")

