Change syntax to include :: for external lit,  : for internal block and leaving a . 


Make it async. so track the status and be able to abort/restart. Plan is to use a doc.status to indicate the phase (initial, parsing, compiling, done). The parsing phase just needs to track the line it is currently on. The compiling phase should have a queue object of blocks not yet attempted to be compiled and then any block that needs to wait (A) on something (B) should register itself (A) with that other thing (B) to trigger its (A) compile when (B) all done compiling. Also need a way to restart a compile of a block when whatever it was waiting for is done. Wrap all that into a nice asyncy function (like doc.resume or something).  I guess we can just queue up the objects initially, loop over them, and no need to break. Everything will just happen automagically with callbacks once it is all primed. Pretty sweet. The load directive for other lit programs can also be asynced. The existence of the file gets noted and no compiling should happen until all parsing is done on all loaded documents. But after that, the different compiles can all go crazy as they just queue themselves willy-nilly. 


As part of plugin process, have some option for storing objects that could then be passed on to something else. This would be for example in commands. One might evaluate something in a language, getting a javscript object that should then be fed into another command object to translate into text. Or even just JSON'd. 

Indent based on position by default. That is, use the given indent of where the _"" is and then apply it throughout if the _"" is on a line of its own. Otherwise, leave the first line as is and then indent the others another 4 spaces beyond the indent of the line on which _"" appears. The command indent would override this, of course, but hopefully it gets the common cases. 

Have some more preview/testing options. Maybe an abort on failed test/jshint kind of stuff and/or a diff viewer. npm diff seems popular. 

More docs.

 
Using  VARS to write down the variables being used at the top of the block. Then use _"Substitute parsing|vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

## IDE

An in-browser version is planned. The intent is to have it be an IDE for the literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...