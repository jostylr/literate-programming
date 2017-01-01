# litpro 

This is the fat command-line client for
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
It contains the full functionality for literate programming, including useful
commands such as jshint included in it. For a thin client,
check out
[litpro](https://github.com/jostylr/litpro)

This is not done being fully baked, hence the 0.9.0. But this does represent a
significant break from 0.8.4.  You can take a look at convert.md for some
observations of mine as I converted from the old version to the new. 

Install using `npm install literate-programming`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write
`literateprogramming` then use `npm install -g literate-programming`.

The library has a full listing of the syntax, commands, and directives. Here
we list the flags and new commands and directives. 

## Example usage

 Save the following code to file `project.md` and run `litpro project.md`.

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


For more on the document format, see 
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).


## Flags

The various command-line flags are

* -e, --encoding Specify the default encoding. It defaults to utf8, but any
  encoding supported by iconv-lite works. To override that behavior per loaded
  file from a document, one can put the encoding between the colon and pipe in
  the directive title. This applies to both reading and writing. 
* --file A specified file to process. It is possible to have multiple
  files, each proceeded by an option. Also any unclaimed arguments will be
  assumed to be a file that gets added to the list. 
* -l, --lprc This specifies the lprc.js file to use. None need not be
  provided. The lprc file should export a function that takes in as arguments
  the Folder constructor and an args object (what is processed from the
  command line). This allows for quite a bit of sculpting. See more in lprc. 
* -b, --build  The build directory. Defaults to build. Will create it if it
  does not exist. Specifying . will use the current directory. 
* -s, --src  The source directory to look for files from load directives. The
  files specified on the command line are used as is while those loaded from
  those files are prefixed. Shell tab completion is a reason for this
  difference. 
* -c, --cache The cache is a place for assets downloaded from the web.
* --cachefile This gives an alternate name for the cache file that registers
  what is downloaded. Default is `.cache`
* --checksum This gives an alternate name for the file that lists the hash
  for the generate files. If the compiled text matches, then it is not
  written. Default is `.checksum` stored in the build directory.
* -d, --diff This computes the difference between each files from their
  existing versions. There is no saving of files. 
* -o, --out This directs all saved files to standard out; no saving of
  compiled texts will happen. Other saving of files could happen; this just
  prevents those files being saved by the save directive from being saved. 
* -f, --flag This passes in flags that can be used for conditional branching
  within the literate programming. For example, one could have a production
  flag that minimizes the code before saving. 

## New Directives

* `[name](# "exec:command line command")` Executes command line as a
  directive. Not sure on usefulness.
* `[var name](url "readfile:encoding|commands")` Reads a file, pipes it in,
  stores it in var name.  
* Save. Not new, but works to actually save the file on disk. 

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


## Use and Security

It is inherently unsecure to compile literate
program documents. No effort has been made to make it secure. Compiling a
literate program using this program is equivalent to running arbitrary code on
your computer. Only compile from trusted sources, i.e., use the same
precautions as running a node module. 
 

## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)
