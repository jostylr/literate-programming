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


## Built in commands

Note commands need to be one word and are case-sensitive. They can be
symbols as long as that does not conflict with anything (avoid pipes,
commas, colons, quotes).

* **eval** `code, arg1,...`  The first argument is the text of the code to
  eval. In its scope, it will have the incoming text as the `text`
  variable and the arguments, which could be objects, will be in the
  `args` array. The code is eval'd (first argument). The code text itself
  is available in the `code` variable. The variable `text` is what is
  passed along.  This should make for quick hacking on text. The doc
  variable is also available for inspecting all sorts of stuff, like the
  current state of the blocks. If you want to evaluate the incoming text
  and use the result as text, then the line `text = eval(text)` as the
  first argument should work.
* **async** (async eval) `code1, code2, ...` Same deal as eval, except
  this code expects a callback function to be called. It is in the
  variable callback. So you can read a file and have its callback call the
  callback to send the text along its merry way. 
* **evil** While the eval commands thinks of the first argument as code
  acting on the incoming text, its twin evil thinks of the incoming text
  as the code and the arguments as just environment variables. The value
  returned is the variable `ret` which defaults to the original code. 
* **funify** This assumes the incoming text is a function-in-waiting and
  it evals it to become so. This is great if you want to do a `.map` or if
  you just want to mess with stuff. `.call , args..` will call the
  function and return that result. 
* **compile** `block, minor1, val1, minor2, val2,...` This compiles a
  block of text as if it was in the document originally. The compiled text
  will be the output. The first argument gives the names of the blockname
  to use if short-hand minor blocks are encountered. This is useful for
  templating. If no blockname is given, then the current one is used. Any
  further arguments should be in pairs, with the second possibly empty, of
  a minor block name to fill in with the value in the second place. 
* **sub** 

  A: Replaces parts of incoming text.   
  
  S: `str -> key1, val1, key2, val2, ... -> str`, 
    `str-> regexp, replacement str/fun -> str`

  This replaces `key#` in the text
  with `val#`. The replacement is sorted based on the length of the key
  value. This is to help with SUBTITLE being replaced before TITLE, for
  example, while allowing one to write it in an order that makes reading
  make sense. This is a bad, but convenient idea. 
  
  Recommend just using one pair at a time as commands can be piped along.  

  Alternate signature `regexp, replacement str/func`.
   This does a regular expression replacement
  where the first is a reg ( `reg(str, flags)` ) 
  that acts on the string and replaces it using
  the [usual javascript replacement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) syntax for the second. 

  The regex syntax can be part of pair sequences. In accordance with
  shorter first, regex's which typically are epansive, will go last, but
  amongst regex's, the order of processing is preserved.
  Recommendation is to not mix in multiple pairs with regexs. 

  E:
  
  #basic, string
* **store** `variable name`  This stores the incoming text into the
  variable name.  This is good for stashing something in mid computation.
  For example, `...|store temp | sub THIS, that | store awe | _"temp"` will
  stash the incoming text into temp, then substitute out THIS for that,
  then store that into awe, and finally restore back to the state of temp.
  Be careful that the variable temp could get overwritten if there are any
  async operations hanging about. Best to have unique names. See push and
  pop commands for a better way to do this. 
* **clear** `variable name`. This removes the variable name and passes
  along the input. The input has no impat on this.  
* **log** This will output a concatenated string to doc.log (default
  console.log) with the incoming text and the arguments. The first
  argument is treated as an idenitifer in the output. This is a good
  way to see what is going on in the middle of a transformation.
* **raw** `start, end` This will look for start in the raw text of the
  file and end in the file and return everything in between. The start and
  end are considered stand-alone lines. 
* **trim** This trims the incoming text, both leading and trailing
  whitespace.  Useful in some tests of mine. 
* **filter** This will filter an array or object into a lesser object,
  based on what the rest of the arguments are. If the input
  is an object, then it will take the rest of the arguments as either: 
    
    * type string: explicit keys to keep.
    * type regexp: keys must match the regexp to be kept.
    * type function: a function that takes in the key and value returns
      the boolean true if the key, value should be added.
    * true: if the boolean true (or no argument at all is supplied) then
      all this essentially copies the object. 
  
  It filters the object based on these criteria and returns the new
  object.

  For an array, it is similar except an array is
  returned. 

    * #  either actual number or one that parses into it. This pushes the
      entry at the number onto the new array.
    * '#:#' will slice it between the two numbers.
    * 'ax + b' b is the starting value (negative counts from the end)
      while a is the increment to add (negative goes down). 
    * type function takes in the value and index and returns true if the
      value should be added. 
    * true adds a whole copy of the array; also default if nothing is
      provided. 
* **join** This will concatenate the incoming text and the arguments
  together using the first argument as the separator. Note one can use
  `\n` as arg1 and it should give you a newline (use `\\n` if in a
  directive due to parser escaping backslashes!). No separator can be as
  easy as `|join ,1,2,...`.

  This also does double duty as something entirely different. If the input
  is an object or an array, then it first filters it according to the
  arguments, just as in the filter command, and then joins the results
  with the first argument as the join separator. For objects, if the keys
  are a group (such as regexp matching), then they will be sorted
  alphabetically first before joining. 
* **cat**  The arguments are concatenated with the incoming text as is.
  Useful for single arguments, often with no incoming text.
* **echo** `echo This is output` This terminates the input sequence and
  creates a new one with the first argument as the outgoing. 
* **get** `get blockname` This is just like using `_"blockname"` but that
  fails to work in compositions. So get is its replacement. This ignores
  the input and starts its own chain of inputs. 
* **array** `array a1, a2, ...` This creates an array out of the input and
  arguments. 
* **.** `. propname, arg1, arg2,... ` This is the dot command and it
  accesses property name which is the first argument; the object is the
  input (typically a string, but can be anything). If the property is a
  method, then the other arguments are passed in as arguments into the
  method. For the inspirational example, the push directive creates an
  array and to join them into text one could do `| . join, \,`. There is
  also an alias so that any `.propname` as a command works. For example,
  we could do `| .join \,` above.  This avoids forgetting the comma after
  join in the prior example. 
* **-** `- propname, arg1, arg2,... ` This is the dash command and it
  accesses the utility property which is the first argument; the object is the
  input (typically a string, but can be anything). It calls the relevant
  command with that method. 

  Each object in the `Folder.dash` has the form `cmdname: [object with
  methods, num]` where the command name is the name to be called (such as
  `lodash` and the methods should be on the called object, such as
  `require('lodash')` and the `num` order the search, with lower numbers
  coming first. 
* **push** Simply pushes the current state of the incoming text on the
  stack for this pipe process.
* **pop** Replaces the incoming text with popping out the last unpopped
  pushed on text.
* **if** `boolean, cmd, arg1, arg2, ....` If the boolean is true, 
  then the command will execute with the given input text and
  arguments. Otherwise, the input text is passed on. This is usefully
  paired with the subcommand boolean asks. For example 
  `?and(?flag(left),?flag(right)) will execute the `if` if both `left` and
  `right` are flagged.
* **ifelse** `arr(bool, cmd, arg1, arg2, ...), arr(bool2, cmd2, arg21,
  arg22, ...), ...` This expects arrays of the above form as arguments. It
  works through the conditions until it finds a true value and then it
  executes the command. If none are found, then it passes along the input
  text. 
* **when** `name1, name2, ...` This takes in the event names and waits for
  them to be emitted by done or manually with a
  `doc.parent.done.gcd.once(name, "done")`. That would probably be used in
  directives. The idea of this setup is to wait to execute a cli command
  for when everything is setup. It passes through the incoming text. 
* **done** `name` This is a command to emit the done event for name. It
  just passes through the incoming text. The idea is that it would be,
  say, a filename of something that got saved. 
* **arrayify** This takes the incoming text and creates an array out of
  it. The first argument is an object with keys `sep` to know what to
  split on, `esc` to escape the separator and itself, `trim` a boolean
  that will trim the text for each entry. The defaults are newline,
  backslash, and true, respectively. You can also pass them as the first,
  second, and third argument, respectively. 
  Note that this assumes that both sep
  and esc are single characters. You can have the usual block
  substitutions, of course, but it might be safer to escape the block and
  run it through compile, e.g., ` | arrayify | .mapc compile`. 
  This also allows nesting of objects. To get a string representation of
  the array, call `| .toString`.
* **objectify** This takes the incoming text and creates an object out of
  it. The first argument is an object with keys `key` to know what to
  split on for the key, `val` to split on for the end of the value, `esc`
  to escape the separator and itself, `trim` a boolean that will trim the
  value for each entry; keys are automatically trimmed. The defaults
  are colon, newline, backslash, and true, respectively. 
  Note that this assumes
  that all the characters are single characters. You can have the usual
  block substitutions, of course, but it might be safer to escape the
  block and run it through compile, e.g., ` | objectify | .mapc compile`.
  This also allows nesting of objects. Call `|.toString()` to get a
  string. 
* **regify** Turns the incoming input into a regular expression. First
  argument are the flags; if none, g is assumed, but if some flags are
  specificed one should add g. If no global needed use, '-'.
* **ife** This takes a snippet of code and creates an immediate function
  execution string for embedding in code. the arguments become the
  variable names in both the function call and the function definition. If
  an equals is present, then the right-hand side is in the function call
  and will not be hidden from access in the ife. 
* **caps** This is a command that tries to match caps and replace them.
  The idea comes from wanting to write `M W>900px` and get `@media
  (min-width:900px)`. This does that. By passing in a JSON object of
  possible matches as argument or setting the caps local object to an
  object of such matches, you can change what it matches. But it only
  will match a single character (though unicode is fine if you can input
  that).  
* **assert** This asserts the equality of the input and first argument
and if it
  fails, it reports both texts in a log with the second argument as a
  message. `something | assert _"else", darn that else`. This is a way to
  check that certain things are happening as they should. 
* **wrap** This wraps the incoming text in the first and second argument:
  `some text | wrap <, >"  will result in `<some text>`. 
* **js-string** This breaks the incoming text of many lines into quoted
  lines with appropriate plus signs added. The first argument allows for a
  different quote such as `'`. The double quote is default. Also `q` and
  `qq` generates single and double quotes, respectively. 
* **html-wrap** This takes the incoming text and wraps it in a tag
  element, using the first argument as the element and the rest of the
  arguments as attributes. An equals sign creates an attribute with value,
  no equals implies a class. An attribute value will get wrapped in
  quotes. 
  `text-> | html-wrap p, data, pretty, data-var=right`
  will lead to  `<p class="data pretty" data-var="right">text</p>`
* **html-table** This requires an array of arrays; matrix is
  good. The first argument should either be an array of headers or
  nothing. It uses the same argument convention of html-wrap for the rest
  of the arguments, being attributes on the html table element. We could
  allow individual attributes and stuff on rows and columns, but that
  seems best left to css and js kind of stuff. Still thinking on if we
  could allow individual rows or entries to report something, but that
  seems complicated. 
* **html-escape** This escapes `<>&` in html. It is mainly intended for
  needed uses, say in math writing. Very simple minded. One can modify the
  characters escaped by adding to `Folder.plugins.html_escape`. This is
  actually similar to caps and snippets. 
* **html-unescape** The reverse of html-escape, depending on what the
  symbols are in `plugins.html_unescape`. 
* **snippets** (alias **s** ). This is a function for things that are
  easily named, but long to write, such as a cdn download script tag for a
  common js library, say jquery. `s jquery` could then do that. Currently,
  there are no default snippets. To load them, the best bet is in the
  lprc.js file and store the object as `Folder.plugins.snipets = obj` or,
  if you are feeling generous, one could do
  `Folder.merge(Folder.plugins.snippets, obj);`. This is really a
  stand-alone command; incoming text is ignored. 

  In writing a snippet, it can be a function which will take in the
  arguments. Alternatively, you can sprinkle ``ARG#||...| `` 
  in your code for
  the Argument with numner # and the pipes give an optional default; if
  none, then ARG# is eliminated. So `ARG0||1.9.0|` yields a default of
  1.9.0. Pipes cannot be in the default

  Be careful that the first argument is the snippet name. 
* **#/#name** This is just a comment. For special-character free text,
  one can just write it, but if one wants to include special characters,
  use `ec('...')`. Example `# This is a comment` or `#dude this is a
  comment`. This latter form will store the current state into
  `doc.comments`. 
* **cmds** This creates a sequence of commands to execute, most likely
  used with if-else since a single pathway is covered by the usual pipe
  syntax. The form is `cmds cmd1, array of args for 1, cmd2, args for
  2`, e.g., `cmds sub, arr(awe, dud), cat, arr(dude, what)`... If it is
  just one argument, then the array is not needed (if it is just one
  argument and that is an array, wrap that in an array)). 
* **mapc** or **`*`** with `cmd, arg1, ...` 
This takes the input and applies `cmd` to each, if array or obj.
Otherwise, just appleis command to whole input. `*cmds arr(...), arr(...)`
allows a sequence of commands to happen. For the object, if the args
contains `*KEY*`, then that gets replaced by the key under consideration. 
* **forin** The args are 
  `function f (val, key, ret, input), initial value, sort order`.
  This iterates over the input object. 
  
  If the input is not an array or object, then `f` is called on the input
  itself as `val` with a `key` of an empty string, and the `ret` is just
  the initial value. 

  The return value of `f` is used in the third plave of the next loop. If
  it is undefined, `null` is passed in. 
  
   All functions should be synchronous. All values will be visited; there
   is no way to break out of the loop though one could have the function
   do nothing if the ret value was a particular kind (say, looking for
   false values, it starts true and if it becomes false, then it just
   returns that for all later ones). This is not designed for large number
   of keys. 

  The sort should be a comparison function that expects the following
  arguments: `key1, key2, value1, value2, input`.  Alternatively, it can
  send in the strings `key` or `value` to sort the order by intrinsic key or
  value meaning. Note that value needs to be natively comparable in some
  meaningful sense if `value` is sent in. 
* **pget** Gets the property named by the arguments.
* **pset** Sets the property named by the arguments with the last
  argument being the value. May create objects and arrays as
  needed. 
* **pstore** This stores the input into the first argument (should be
  object or array) using the rest of the arguments to define. This returns
  the value.
* **toJSON** Returns a JSON representation of input. Uses JSON.stringify
  and passes in the first two args (whitelist, spaces) to allow full features. 
* **fromJSON** Returns an object from a JSON representation. Uses
  JSON.parse and passes in first argument (reviver function) if present. 
* **anon** The first argument should be a function or string that can be
  converted into a function of command form, namely the arguments are
  `input, arguments` and the `this` is `doc` though that is also in a
  closure if it is a string evaluated. The function should be synchronous
  and return the value to send on. 
* **minors** This converts the input from an array into an object, using
  the arguments as the keys. If there is a mismatch in length, than the
  shorter is used and the rest is discarded. If the input is not an array,
  then it becomes the sole value in the object returned with key as first
  argument or empty string. 
* **templating** This expects an object as an input. Its keys will be
  minor block names when compiling the template given by the first
  argument. It will send along the compiled text.
* **merge** Merges arrays or objects. 
* **clone** Clones an array or object. 
* **apply** This applies a function or command to a property of an object
  and replaces it. Clone first if you do not want to replace, but have a
  new. The first arguments is the key, the second is the commnd string or
  function, and the rest are the args to pass in. It returns the object
  with the modified property.     
* **matrixify** This takes in some text and splits into a two dimensional
  array using the passed in separators. The first separator divides the
  columns, the second divides the rows. The result is an array each of
  whose entries are the rows. There is also an escape character. The
  defaults are commas, newlines, and backslashes, respectively. The escpae
  character escapes the separators and itself, nothing else. There is also
  a boolean for whether to trim entries; that is true by default. Pass in
  `f()` in the fourth argument if not desired. All the characters should
  be just that, of length 1. 

  This returns a matrix (prototyped) that has the properties:
  * `rows` Iterates a function over the rows. If an array is returned, it
    replaces the row. 
  * `cols` Iterates a function over the cols and will also replace the
    columns if an array is returned. 
  * `transpose` This returns a new matrix with flipped rows and columns.
  * `trim` This trims the entries in the matrix, returning the original.
  * `num` This converts every entry into a number, when possible. 
  * `clone` This creates a copy. 
  * `traverse` This runs through the matrix, applying a function to each
    entry, the arguments being `element, inner index, outer index, the
    row object, the matrix`. 
  * `equals` This takes in a second matrix and checks if they are strictly
    equal. 
  * `print` This prints the matrix using the passed in row and col
    separator or using the property

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
