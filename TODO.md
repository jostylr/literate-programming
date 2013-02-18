Add in an opt-out for file saving or a rerouting... Add to Version the ability to set various boolean flags, such as dev, deploy, ..., add an environment directive to set those things. 

Implement a literate program test example. Also a dev, deploy version. Realized one could have a lit pro that is just a shell for files, etc., calling in the big thing. 

modify the file command to do "block name" filename | ...   so input then output: FILE "TODO" todo.md | clean raw

More docs.

Make it async. so track the status and be able to abort/restart. Plan is to use a doc.status to indicate the phase (initial, parsing, compiling, done). The parsing phase just needs to track the line it is currently on. The compiling phase should have a queue object of blocks not yet attempted to be compiled and then any block that needs to wait (A) on something (B) should register itself (A) with that other thing (B) to trigger its (A) compile when (B) all done compiling. Also need a way to restart a compile of a block when whatever it was waiting for is done. Wrap all that into a nice asyncy function (like doc.resume or something).  I guess we can just queue up the objects initially, loop over them, and no need to break. Everything will just happen automagically with callbacks once it is all primed. Pretty sweet. The load directive for other lit programs can also be asynced. The existence of the file gets noted and no compiling should happen until all parsing is done on all loaded documents. But after that, the different compiles can all go crazy as they just queue themselves willy-nilly. 

Have some more preview/testing options. Maybe an abort on failed test/jshint kind of stuff and/or a diff viewer. npm diff seems popular. 


Think about get code block. If no name specified, look for unnamed code blocks. So while type of caller would be relevant if multiple unnamed blocks of different types, it would not be relevant if there is an unnamed block. A typical case seems to be a main block that is not labeled and then named ones below. Of course with a browser IDE depending on type, this may change. 


Think about piping. Maybe have a pipe(blockname) that sees each line as a pipe. 

Make a proper parser of commands, directives that allows for nested parentheticals, quotes, commas, escapes
 
Let  "block name.html" get the html section of the block. So do the "." splitting first. 


Using  VARS to write down the variables being used at the top of the block. Then use _"Substitute parsing:vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

## IDE

An in-browser version is planned. The intent is to have it be an IDE for the literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...