Need to document every single syntax bit. Eliminating macros in favor of
javascript code that has access to a "global" namespace. So instead of
"http://geogebra.org"` or `[geogebra](# "define: http://geogebra.org")`  which
would take the name and associate with the value. The define directive could
be done anywhere and would be seen before any code evaluation in the cblocks
while the other one would need to have order taken care of it (tricky,
possibly). In the define, allow  eval(...) to execute code to create the
value. We could also have access to other docs globals using
_docs.docname.varname 

Use marked to parse the document. Write a custom parser for the
substitutions/commands. 

Convert to event-style async. This should allow for easier hooking into the
process. Create directives that allow eventing and hooking, somewhat along the
lines of the define directive. 


Make sure missing blocks don't cause problems. 

Add in a toggle to enable immediate console logging from doc.log calls. 

Make sure non-existent blocks do not hang program (cname). More generally,
make sure that looped references (alice calls bob, bob calls alice) do not
hang program; emit doc.log problem and move on. Also have a check at the end
for ready to compile docs. This should allow for saving of files that are fine
and the hung up files do not get saved. 

Deal with line spacing. 

Deal with empty file -- a better reporting mechanism. 

Implement a ! tracking. Put ! at the beginning of a line--the number of marks
is the level of severity of the issue. 

Add in an opt-out for file saving or a rerouting... Add to Version the ability
to set various boolean flags, such as dev, deploy, ..., add an environment
directive to set those things. 

Implement a literate program testing example. Also a dev, deploy version.
Realized one could have a lit pro that is just a shell for files, etc.,
calling in the big thing. 

More docs.

Have some more preview/testing options. Maybe an abort on failed test/jshint
kind of stuff and/or a diff viewer. npm diff seems popular. 


Make a proper parser of commands, directives that allows for nested
parentheticals, quotes, commas, escapes
 

Using  VARS to write down the variables being used at the top of the block.
Then use _"Substitute parsing:vars" to list out the variables.

    var [insert string of comma separated variables]; // name of block 

## IDE

An in-browser version is planned. The intent is to have it be an IDE for the
literate program. 

For IDE, implement: https://github.com/mleibman/SlickGrid

For diff saving: http://prettydiff.com/diffview.js  from
http://stackoverflow.com/questions/3053587/javascript-based-diff-utility

For scroll syncing https://github.com/sakabako/scrollMonitor

Note that code mirror will be the editor. A bit on the new multi-view of
documents:  http://marijnhaverbeke.nl/blog/codemirror-shared-documents.html

explore using node to run stuff between browser/lit pro/python:r:tex:sage...