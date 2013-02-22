Make sure non-existent blocks do not hang program (cname).

Add in an opt-out for file saving or a rerouting... Add to Version the ability to set various boolean flags, such as dev, deploy, ..., add an environment directive to set those things. 

Implement a literate program testing example. Also a dev, deploy version. Realized one could have a lit pro that is just a shell for files, etc., calling in the big thing. 

More docs.

Have some more preview/testing options. Maybe an abort on failed test/jshint kind of stuff and/or a diff viewer. npm diff seems popular. 


Make a proper parser of commands, directives that allows for nested parentheticals, quotes, commas, escapes
 

Using  VARS to write down the variables being used at the top of the block. Then use _"Substitute parsing:vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

## IDE

An in-browser version is planned. The intent is to have it be an IDE for the literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...