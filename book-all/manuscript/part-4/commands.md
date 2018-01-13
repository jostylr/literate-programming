# Commands

Commands ...


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
* **sub** `key1, val1, key2, val2, ...`  This replaces `key#` in the text
  with `val#`. The replacement is sorted based on the length of the key
  value. This is to help with SUBTITLE being replaced before TITLE, for
  example, while allowing one to write it in an order that makes reading
  make sense. A little unorthodox. We'll see if I regret it. 
* **store** `variable name`  This stores the incoming text into the
  variable name.  This is good for stashing something in mid computation.
  For example, `...|store temp | sub THIS, that | store awe | _"temp"` will
  stash the incoming text into temp, then substitute out THIS for that,
  then store that into awe, and finally restore back to the state of temp.
  Be careful that the variable temp could get overwritten if there are any
  async operations hanging about. Best to have unique names. See push and
  pop commands for a better way to do this. 
* **log** This will output a concatenated string to doc.log (default
  console.log) with the incoming text and the arguments. This is a good
  way to see what is going on in the middle of a transformation.
* **raw** `start, end` This will look for start in the raw text of the
  file and end in the file and return everything in between. The start and
  end are considered stand-alone lines. 
* **trim** This trims the incoming text, both leading and trailing
  whitespace.  Useful in some tests of mine. 
* **join** This will concatenate the incoming text and the arguments
  together using the first argument as the separator. Note one can use
  `\n` as arg1 and it should give you a newline (use `\\n` if in a
  directive due to parser escaping backslashes!). No separator can be as
  easy as `|join ,1,2,...`.
* **cat**  The arguments are concatenated with the incoming text as is.
  Useful for single arguments, often with no incoming text.
* **echo** `echo This is output` This terminates the input sequence and
  creates a new one with the first argument as the outgoing. 
* **get** `get blockname` This is just like using `_"blockname"` but that
  fails to work in compositions. So get is its replacement. This ignores
  the input and starts its own chain of inputs. 
* **array** `array a1, a2, ...` This creates an array out of the input and
  arguments. This is an augmented array.
* **.** `. propname, arg1, arg2,... ` This is the dot command and it
  accesses property name which is the first argument; the object is the
  input (typically a string, but can be anything). If the property is a
  method, then the other arguments are passed in as arguments into the
  method. For the inspirational example, the push directive creates an
  array and to join them into text one could do `| . join, \,`. There is
  also an alias so that any `.propname` as a command works. For example,
  we could do `| .join \,` above.  This avoids forgetting the comma after
  join in the prior example. 
* **push** Simply pushes the current state of the incoming text on the
  stack for this pipe process.
* **pop** Replaces the incoming text with popping out the last unpopped
  pushed on text.
* **if** `flag, cmd, arg1, arg2, ....` If the flag is present (think build
  flag), then the command will execute with the given input text and
  arguments. Otherwise, the input text is passed on.
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
  lines with appropriate plus signs added. 
* **html-wrap** This takes the incoming text and wraps it in a tag
  element, using the first argument as the element and the rest of the
  arguments as attributes. An equals sign creates an attribute with value,
  no equals implies a class. An attribute value will get wrapped in
  quotes. 
  `text-> | html-wrap p data, pretty, data-var=right`
  will lead to  `<p class="data pretty" data-var="right">text</p>`
* **html-table** This requires an array of arrays; augmented matrix is
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
* **minidoc** `minidoc :title, :body` This takes an array and converts
  into an object where they key value is either the args as keys and the
  values the relevant input items or the item in the array is a
  two-element array whose first is the key and second is the value. The
  named keys in the arguments skip over the two-element arrays. minidocs
  are augmented with some methods.  See the augment section.
* **augment** `augment type` This augments the object with the methods
  contained in the type augment object. See the augment section. 
* **matrixify** This takes in some text and splits into a two dimensional
  array using the passed in separators. The first separator divides the
  columns, the second divides the rows. The result is an array each of
  whose entries are the rows. There is also an escape character. The
  defaults are commas, newlines, and backslashes, respectively. The escpae
  character escapes the separators and itself, nothing else. There is also
  a boolean for whether to trim entries; that is true by default. Pass in
  `f()` in the fourth argument if not desired. All the characters should
  be just that, of length 1. 

  This returns an augmented object, a matrix that has the properties:
  * `transpose` This returns a new matrix with flipped rows and columns.
  * `trim` This trims the entries in the matrix, returning the original.
  * `num` This converts every entry into a number, when possible. 
  * `clone` This creates a copy. 
  * `traverse` This runs through the matrix, applying a function to each
    entry, the arguments being `element, inner index, outer index, the
    row object, the matrix`. 

### Augment

We have `.` methods that we can invoke and the augment command adds in
properties based on objects stored in `doc.plugins.augment`. Any key in that
object is a valid type for the command. We currently have two pre-defined
augment types: `minidoc` and `arr`. The ones with just a `.` only make sense
as commands.  

#### minidoc

* `.store arg1` will take the object and store all of its properties with
  prefix arg1 if supplied. If the key has a colon in it, it will be escaped so
  that `{":title" : "cool"} | .store pre` can be accessed by `cool:title`.
* `.clear arg1` Removes the variables stored in the scope (undoes store).
  Mostly to be used in the `.compile` command for tidying up. Best not to rely
  on the cleanup happening at any particular time so don't use unless your
  sure.
* `.mapc cmd, arg1, arg2, ...` Applies the cmd and args to each of the values
  in the object, replacing the values with the new ones. 
* `.apply key, cmd, arg1, arg2, ..` Applies the cmd and args with input being
  `obj[key]` value. This overwrites the `obj[key]` value with the new value. 
* `.clone` Makes a new object with same properties and methods. This is a
  shallow clone. You can use this with push and pop to modify the object and
  then go back to the original state.
* `.compile blockname` This uses the blockname as a reference to a template
  whose sections will be filled with the corresponding keys of the minidoc.
  The assumption is that the keys stat with colons. Any that don't will
  probably not match.
* `.set key, val` Sets the key to the value
* `.get key` Gets the value of that key
* `.keys` will give an array of the non-augmented keys. It takes one optional
  argument; a true boolean will cause it to be sorted with the default sort; a
  function will be presumed to be comparison function and it will be sorted
  according to that. Otherwise, the keys are returned as is. 
* `.toString` will print a representation of the original object. By default
  the separators are colon and newlines, but the first two arguments can
  change that. It is also possible to pass in a function that acts on each key
  and value in third and fourth slots to wrap them. 
* `.strip` This strips the object of its augmented properties. 
* `.forIn` A foreach, map, or reduce rolled into one acting on the non-augment
  properties. It takes three arguments. The first is mandatory and is the
  function to be called on each pair. The second is an initial value or a
  container object. The third is a sort order, as in keys. The signature of
  the function is key, property value, intial value/last returned value, self.
  If the third stuff is undefined, then self becomes third. The final returned
  value of the function is what is returned, but if that is undefined, then
  the object itself is returned. 

#### arr

These methods return new, augmented arrays.

* `.trim` Trims every entry in the array if it has that property. Undefined
  elements become empty strings. Other stuff becomes strings as well, trimmed
  of course. 
* `.splitsep sep` This splits each entry into an array using the separator.
  The default separator is `\n---\n`. 
* `.mapc cmd, arg1, arg2, ...` Maps each element through the commands as input
  with the given arguments being used. 
* `.pluck i` This assumes the array is an array of arrays and takes the ith
  element of each array, returning a new array. 
* `.put i, full` This takes an incoming array and places each of the elements
  in the ith position of the corresponding element in full. Reverse of pluck,
  in some ways.
* `.get i` Gets ith value. Negatives count down from last position, i.e., `get
  -1` retrieves the last element of the array.
* `.set i, val` Sets ith value to val. 


## Common Client Commands

* **exec** `exec cmd1, cmd2, ...` This executes the commands on the
  commandline. The standard input is the incoming input and the standard
  output is what is passed along. 
* **execfresh** `execfresh` Same as exec but no caching
* **readfile** `readfile name` Reads in file with filename. Starts at source
  directory.  This terminates old input and replaces with file contents.
* **readdir** `readdir name` Generates a list of files in named directory.
  This generates an augmented array. 
* **savefile** `savefile name, encoding` Saves the input into the named file
  using the encoding if specified. 
* **z** `z msg` will return the value in `msg` from the command line flag `-z
  msg:value`. If the value contains multiple colons, it is interpreted as an
  array and an array will be returned. 

## Full Client Commands


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
* **postcss** This takes incoming text and runs it through postcss. To do
  something useful, you need to have the arguments be the commands to use.
  At the moment, the only one shipping with this is autoprefixer, but
  others are likely to be added (minimizers and fixers, in particular).
  You can add them yourself by, in lprcs.js, saying (installing cssnano as
  example)
  `Folder.plugins.postcss[cssnano] = require('cssnano');` and ensuring
  that the cssnano module is installed in npm. 
* **tidy** This uses [js-beautify](https://www.npmjs.com/package/js-beautify)
The first argument is the type:  js, css, or html. The second argument are
options that get merged with the defaults. The js has a default of
`indent_size` of 4 and `jslint_happy` true. An unrecognized first argument
(or none) will default to js. 
* **minify** The first argument says the type of minifier: js, css, and
  html. js is the default if the first argument is not realized. The
  second argument is an object of options that get passed in. This uses
  uglify-js, clean-css, and 
  [html-minifier](https://www.npmjs.com/package/html-minifier), 
  respectively. For css, the
  second argument can be a boolean indicating whether to pass on the
  results object (if true, `t()` ) or just the css output text (default). 



