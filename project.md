# Literate Programming, MD

This is a literate programming compiler. It compiles from markdown into
whatever language one wants. It is primarily used by the author for web stuff,
but it should work well for any input text formats. 

This is a single repository that generates many different packages. 

The starting point is this file, project.md. It coordinates all the
transformations. 

    setup package info


## Library

The core library that does the bulk of the work is the package
`literate-programming-lib`. It contains no node-specific calls, instead
stubbing out such calls to facilitate a web-based option in addition to the
more traditional command client. 

The library uses commonmark to parse the files, generating promises for the
various values. As relevant blocks get compiled, the promises get fulfilled
and trigger further block completion.

The following source files are required for compiling lib:

* [lib](lib.md) This orchestrates the basic code stitching for the entire lib. 
* [commonmark](commonmark.md "load:") Parses out the file, setting up promises
  and evaluating directives. 
* [directives](directives.md "load:") Processes the default directives. 
* [commands](commands.md "load:")
...
* [lib-test](lib-test.md "load:") Creates a test script to run. 

Our saved files

* [literate-programming-lib/](# "cd: save")
* [index.js](#lib::index "save:")
* [tests.js](#lib-test:: "save:")
* [npmignore]()
* [README.md]() 
* [](# "cd:save")




