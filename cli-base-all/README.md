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
