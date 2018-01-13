# lprc.js

A full specification of how to use this file. It includes a variety of information about the structure of the folder and doc objects.


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
   doc object have prototyped objects on this as well which allows one to
   choose the scope of applicability of objects. But beware that subobjects
   are not prototyped (unless setup in that way; you may want to implement
   that by Object.creating what is there, if anything). Think of it as deciding
   where options should live when creating them. 

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


and uses Object.create to kind of share 

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
* colon, Object.created
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
* whitespaceEscape. Handling whitespace escaping in conjunction with
  backslash. Putting the whitespace back.
* store. stores a variable.



