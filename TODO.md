Implement link text for directives and type switches

Implement template solution

Make sure missing blocks don't cause problems. 

Add in a toggl to enable immediate console logging from doc.log calles. 

Make sure non-existent blocks do not hang program (cname). More generally, make sure that looped references (alice calls bob, bob calls alice) do not hang program; emit doc.log problem and move on. Also have a check at the end for ready to compile docs. This should allow for saving of files that are fine and the hung up files do not get saved. 

Deal with line spacing. 

Deal with empty file -- a better reporting mechanism. 

Implement a ! tracking. Put ! at the beginning of a line--the number of marks is the level of severity of the issue. 

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