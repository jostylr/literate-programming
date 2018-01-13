-# The Literate Programs

Here we give descriptions and links to all the various pieces of the literate
program family. They are all written in a literate fashion and the source code
is freely available at their repositories, listed below. 

All of this relies on [node.js](https://nodejs.org/en/).

To understand these tools, the most interesting repositories are those for the
underlying library, literate-programming-lib, and the event library,
event-when. 

### litpro

This is our main tool. It is a command-line tool. It can be installed globally
or locally into a repository. Use `npm install litpro -g` to install it
globally. 

* [github](https://github.com/jostylr/litpro) is where the code lives
* [npm](https://www.npmjs.com/package/litpro) is the package. 

### literate-programming

This is the fat command-line client. It can do everything that litpro can do,
but it also comes bundled with pug, markdown-it, postcss, tidy, minifiers.
This is a "batteries loaded" tool for web development. 

* [github](https://github.com/jostylr/literate-programming) is where the code lives
* [npm](https://www.npmjs.com/package/literate-programming) is the package. 

This can also be installed globally with `npm install literate-programming
-g`. The command is then `literate-programming`. 

### litpro-jshint

If you all you need is jshint, you might want to install the module
litpro-jshint instead of the full one.  

* [github](https://github.com/jostylr/literate-programming) is where the code
  lives
* [npm](https://www.npmjs.com/package/literate-programming) is the package. 

### literate-programming-cli

This is an intermediate project between the library and litpro. This is where
most of the command line client code is written. 

* [github](https://github.com/jostylr/literate-programming-cli) is where the code
  lives
* [npm](https://www.npmjs.com/package/literate-programming-cli) is the package. 

### literate-programming-cli-test

This is our test framework for the command line client. Basically, we have a
directory with the files to process, a canonical directory showing what we
expect to be in the build directory. 

* [github](https://github.com/jostylr/literate-programming-cli-test) is where
  the code lives
* [npm](https://www.npmjs.com/package/literate-programming-cli-test) is the
  package. 

### literate-progamming-lib

This is the place to read the literate program construction in detail. Start
with project.md and migrate to the other files in the structure. Parsing and
stitching are the two main algorithmic pages. 

* [github](https://github.com/jostylr/literate-programming-lib) is where the code
  lives
* [npm](https://www.npmjs.com/package/literate-programming-lib) is the package. 

### event-when

This is an event library that allows one to wait for multiple events with
ease. We use it, for example, to assemble a variety of substitutions into a
single code block. The return of that code block must wait for when the events
of the other blocks being subbed in have fired. 

* [github](https://github.com/jostylr/event-when) is where the code
  lives
* [npm](https://www.npmjs.com/package/event-when) is the package. 
