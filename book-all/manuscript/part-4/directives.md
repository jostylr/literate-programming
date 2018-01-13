# Directives

All the directives

...

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
  also have as special commands in compose: `` which does nothing but handles
  two accidental pipes in a row smoothly,  `->$i` which stores the incoming
  into the ith variable to use later as a named dollar sign variable, `$i->`
  which sends along the ith variable to the next pipe, `->@i` which pushes the
  value onto the ith element, assuming it is an array (it creates an array if
  no array is found).  
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
  value that starts and we ignore `#start` in that case. This produces an
  augmented array.
* **h5** `[varname](#heading "h5: opt | cmd1, ...")` This is a directive that
  makes h5 headings that match `heading` act like the push above where it is
  being pushed to an array that will eventually populate `varname`. It takes
  an optional argument which could be `off` to stop listening for the headings
  (this is useful to have scoped behavior) and `full` which will give the
  event name as well as the text; the default is just the text.  This produces
  an augmented array.
* **Link Scope** `[alias name](# "link scope:scopename")` This creates an
  alias for an existing scope. This can be useful if you want to use one name
  and toggle between them. For example, you could use the alias `v` for `dev`
  or `deploy` and then have `v::title` be used with just switching what `v`
  points to depending on needs. A bit of a stretch, I admit. 
* **Log** `[match string](# "log:")` This is a bit digging into the system.
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

## Common Client Directives

* `[name](# "exec:command line command")` Executes command line as a
  directive. Not sure on usefulness.
* `[var name](url "readfile:encoding|commands")` Reads a file, pipes it in,
  stores it in var name.  
* Save. Not new, but works to actually save the file on disk. 



