# Literate Programming

Literate programming is the idea that we should write code to be read and understood by others. The idea is to take the reader on the thought process of the author. This can be hard, but it can also be very useful. 

This project uses markdown to write up the document. Code blocks are what gets compiled; code spans are not used. Headings demarcate blocks, but lone links can create subdivisions within that. Substitutions are done by `_"block name"` with arbitrary JavaScript being executed with `_&#96;code&#96;`.  Links can be used to to give directives, such as to save a file. And that's largely it. 

With this structure, one can create arbitrary paths through the code. You can split a single compiled file over multiple literate program documents or place multiple compiled files into a single document. You can manage a whole project from a single literate program document. You can use it as a preprocessor, linter, validator, postprocessor, minifier, pusher, whatever you want. 

It has an extensible plugin system which allows you to add in functionality. Enjoy!

This document creates the core js file that yields the function that compiles. It takes in a document, options  and returns an object with all the blocks, compiled blocks, etc.  The function itself has constructors attached to it to make custom instances. You can also override many of its methods. 

## Complete Syntax

This uses marked to compile the markdown with a default setting of [GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown). So if it thinks something is, for example, a heading, then it is.

### Stitching Syntax

This covers the syntax which is about sewing together chunks of code. 

* All headers create a new block, called an hblock. There is a default hblock called _default. Levels are irrelevant. Style is irrelevant. Links will have their text attribute used (possibly combined with the surrounding text). 
* Code blocks are the pieces that get sewn together. They are associated with a particular hblock (or subhblock). Code blocks within the same (sub)hblock level get sewn together in the order of appearance. 
* A paragraph with a single link and nothing else triggers a new subhblock. This is like an hblock except it can only be accessed with hblock:subhblock (put their respective names there). That is, it is a form of namespacing.
* All other blocks are ignored except for any inline texts that trigger something (links). 
* The only inline text that triggers behavior is a link. These are the directives. 

Inside a code block, you can substituet in a cblock by using the syntax `_"hblock"` or `_"hblock:subhblock"`. This will then replace the whole underscore quote stuff with the appropriate block. If the block does not exist at all, then it is left untouched. If the block exists but has no code, then the quoted region is replaced with the empty string. 

### Conversion Syntax.

As we sew together the code, we can run code on the code. This may be something simple like a transformation (marked to html), a linter (jshint), substitutions, eval'ing some code, etc.

To work this awesome magic, we have commands and directives. When subbing a block, we can add in pipes followed `command[arg1, ...]`  The square brackets are optional

It has the format `[name](#link "directive: ...")`. Depending on the directive, the link or name may be used. Also after the colon, what is relevant depends on the directive, but it will be parsed as `:arg1,arg2,..|command(args) | command(args) | ...`  Commands should be javascript variable names while args will be either treated as text or they could be JavaScript 


## Non-Backwards Compatibility Break

There are a few things that I am throwing out of literate programming. Some of it is because of syntax issues, some of it is because of underused/confusing stuff. 

* No parentheses around arguments in commands. This is because of a conflict with the link syntax of parentheses triggering behaviors. Basically `")` or `](` will cause issues. The best is to not use parentheses. So square brackets are used throughout for consistency. This will be an unpleasant conversion. Hence the parentheses syntax will be supported for legacy reasons only. Also, it works without issues in block substitutions. Just the link syntax is a dodgy use case though even that is fine if you stay away from all quotes.  
* Using blocks as arguments is allowed! 
* Macros are dropped. Instead the block eval can be used. 
* Switch syntax is `[cname](#whatever "command[arg1, ...] | ...")` There is no name or extension before the first command. If you want an extension, use gfm's codefences. 
* There is no multiple runs through a block `[](# "MD| 1 marked ")` and `__whatever`.  Now everything is run through just once in its initial compile phase. For other manipulations, use the commands. For example, `[](# "marked | sub[BOGUS, _"whatever"] ")` with BOGUS being something in the text. 

