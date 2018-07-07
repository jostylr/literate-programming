# Thought

These are random thoughts, examples. Because example can interfere with the LP
process, we have them here. 


## Dubious example of load and save item lists

Use directives to toggle into different behavior. For load and save, as
alternatives to having a bunch of directives, we have

[/](src "iload:")
* `lib=lib.md` This orchestrates the basic code stitching for the entire lib. 
* `commonmark.md=commonmark`  Parses out the file, setting up promises
  and evaluating directives. 
* [directives](directives.md "load:") Processes the default directives. 
* [commands](commands.md "load:")
...
* [lib-test](lib-test.md "load:") Creates a test script to run. 

Our saved files

[literate-programming-lib/](. "isave:")

The command uses the first item block found as the source of information to go
through. When the item block is done, we end the special behavior. Nothing
else gets processed as normal until done with the item block.

* `lib/index=index.js` The index file for the lib. This is the only file. 
*  `lib-test/=tests.js` The first section in lib-test is the default export
* [npmignore]()
* [README.md]() 
* [](# "cd:save")

## Setup

Old cli used lprc.js to modify stuff. Instead, want to have a special file
called lpconfig.md (changeable) that initializes any custom stuff, mainly
commands and directives. 

It starts at the top directory (defined by the existence of a top.yml file).
All directories between top and wherever the file being loaded lives are
scanned for lpconfig.md and run. All commands and directives are recorded in
the path of the directory from top and can be accessed as such. Any command
without a path is looked for between current and up to top. 

The lpconfig.md when run adds all its defined commands and directives to the
current path command unless it has an option passed in the definition to be
local. In a more general setup, the local version of a command is by default
unless it has a path in its name. 

lpconfig.md can load other stuff as well, potentially also downloading into
lpmodules at the top level. When loaded they go into the path of the
lpconfig.md as well. The loading is in order and later ones overwrite. The
lpmodules will be versioned (name-version) and stored as such. These are
cached. We can use a tag for the version, I think. Downloads from github, I
suppose. 

When command definition directives are encountered in a general file, the promise of their definition is recorded.
When parsing occurs, anything promised will be awaited for, but if not
promised, then errored. 

The lpconfig.md parsing occurs as needed, but it does do this at startup. The
whole source file setup is a tree with the top location as the root. 

## Test

Having a header with `test:` (regardless of capitalization) beginning with
whatever after it generates a test entry with the name.Could have `| req` to
require the test before saving changes. Something like that. 

## Graph

Want to have graphs for this stuff. The compiled chunk should point to its
ancestors that compile into it. 

Thinking kind of mindmap style, with the blocknames as being what is shown,
links to other sub-blocks forming the extended out list blocks.  


## Code spans

!Failed.  Commonmark does not give position data for inline elements. Thus
cannot look after the code line. But we can use this to make some more
interesting directive syntax, including shortening the save/load directives. 

We can have a special syntax for inline code, generally in the form of a list.
This could allow for lots of little variables. Essentially, look for each code
span, look in the next character and see if it matches a known character. If so, do
it, with the stuff in the code being passed as raw and the stuff after the
symbol up to the next whitespace being passed in as well. 

* `a#3`~  stores the number 3 into a. This is eval'd js. Alt `3`#a
* `ace beta=3`~ or  `3`=ace-beta stores directly into 'ace beta' (the
  whitespace thing is also the same from the href in link directives, I
  believe. 
* `lib::index>index.js`~ saves the block in lib::index into the file index.js
* `lib<lib.md`~ reads lib.md into the file space lib.
* `lib::index>index.js:utf8|parse whatever | ...`~ allows for usual save
  options in this syntax. 
* `*<*.md`~ would load all markdown files in the top src directory and put
  them under their filename without the md
* `posts/*.html~posts/*.md|scrub|html`~ would load all posts
* `linktext=href info|cmds`!dir is a complete alternative syntax for
  directives (use dashes in the directive name if a space is needed.)
* [lib::index>index.js](~) could be another syntax

For an activated code span with a tilde, we go through each character one at a
time, looking for the first symbol to match the execution.  


## link syntax

[ace beta = 3](~)

[a=`3+6`](~)

[`*<*.md`](~ ":|whatever...")
 

