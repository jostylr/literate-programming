-# Web Projects

The web is a particularly beautiful hot mess of tech stacks. 

We first detail various useful parts related to particular pieces of the
stack. 

### HTML

This is a language that covers both the structure of a webpage and the
content. Combining the tasks lead to a language that is a bit painful to
write out. 

Litpro can help by offering boiler plate with subbing in of content. The
boiler plate can be written in a structure focused (templating) language, such
as pug, and the content can be written in markdown. Litpro can then transform
and stitch together it all. 

### JS

Litpro is written in JavaScript and thus many of the common commands turn out
to be quite useful in writing JavaScript. 

There are a few very specific ways that can be very helpful. 

The first is using JSHint. You can take any block of JS code and feed it into
JSHint to get a log output of issues and problems. It is as easy as `js code |
jshint`assuming you have installed litpro-jshint or using the full
literate-programming. 

Another handy command, in all versions, is `js-string`. This takes the text
and breaks it by newline and outputs text suitable for creating a string in JS
code that returns that text. This enables one to, say, write some HTML for
templating and put it in there. In newer versions of JS, one can have
multi-line strings, but this works for all versions of JS.

There is also the `ife` command which creates an immediate function execution
around the incoming text. This is again less necessary in the newer variants,
but it can still be handy for closures or if one does not want to use the new
`let` version of `var`. 

### CSS

This is a language with great potential, but it is hampered by differing
browser specs. While that has greatly improved, it is best to let a tool
handle the differences. There can also be a lot of repetition at times. Both
of these things Litpro can help with. 

One can take any incoming text and run it through a preprocessor such as SASS
or run it through PostCSS and the wonderful auto-prefixer. The latter is
included in literate-programming.  

One can also use some snippets or the `caps` command to help ease some of the
more verbose parts of the syntax. 

One can also do variables with the substitutions. This may help avoid using
something like SASS entirely. 

### Tidy and Minify

Literate-programming includes tools for formatting the above three languages,
either to make them pretty (tidy)  or to reduce their size (minify). 

One can have multiple directories generated say, one for development and one
for production. Using the `cd` command, this is often quite convenient. 

It is also possible to include some code in one, but not the other. Again,
this comes to transforming the blocks of text. 

###  Servers

In addition to the static content served up, one often needs dynamic
interactions and thus writing a server and using a database comes up. 

The same tools above for writing JavaScript are just as helpful with node. In
particular, having development and production splits can be very useful. 

There is also the database. For a database, one has the language of the server
and the database language. Plus, one may have schemas to guide the
development, perhaps even a specific language. 

This tool may help with that by offering a mapping between the languages.
Unlike the magic tools of ORM, this tool does the conversion and allows one to
see the output in context. 

### AWS

AWS is an amazing land of tools. It is all very piecemeal and run by resource
policies. There are a lot of configurations to handle and updating requires a
process. 

It seems like a perfect place for a text transformation tool to run.

### writeweb

This is an attempt by the author to create automatic compiling of literate
programs. Due to their insecure nature, this would be something that would
need to be installed by an individual (or team).

### static site

This is where we show how to setup a static site, one in which the content and
individual page styling/js is done in a directory of files that are not
literate programs, but a literate program processes them. 

That is, we make a static site generator that runs as a literate program. 
