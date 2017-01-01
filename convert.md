Are you coming from the old version? There are syntax differences. Here we
list a few tips to help the process. 

Old way: `| clean raw"`  takes the raw text of the section and makes it
cleaned up New way: New version does not see the commentary text. So we need
to act on the document itself. We also don't want the blocks to get evaluated
which automatically happens in this version. So we place directives to turn
off that feature: `[off](# "block:")` turns off block reading,  
`[on](# "block:")` turns it back on. We then need to do the snippet cutting:  
`| raw ## README, !---- | sub \n\ #, \n# |trim`
Raw says to take the raw document and
cut between the two given pieces. We still shift the headings to not be read
as heading and the sub puts it back. 

Moving towards a conventional setup of  setup.md containing project files to
be put in home directory (package.json and lprc.js for example) using `litpro
-b . setup.md` then one can do `npm install` and then do `litpro` to process
`project.md` which then calls the other files. 

Convert substitute(...) to sub. In VIM:  `:%s/substitute(\([^)]\+\))/sub \1/g`

Boilerplate. Old syntax, rather wonky, was to use * to indicate a template to
fill in. New version has the compile command. So instead of `float tests*test
template` we would have `_"test template | compile float tests"` All the minor
sections in the template are required, but they can be empty. Instead of the *
in front of the minor, escape the underscore. `_"*:code"` --> `\_":code"`
While the asterisk notation is, in some sense, nicer, the async nature of the
new version made it problematic. 

Beware of h5 and h6 headers; they fill a new role. Reduce the number of hashes. 

Minor blocks should now best be in the form `[name]()`  They can appear
anywhere; it is the form that matters. Alternatively, `[name](# ": | ...")`
can be used if there are pipe transformations desired. The key is the leading
colon and having a name.

The old setup had minors that could have an extension between `: |` and that
would become part of the name. That is not present in the new one. It was not
really needed. Also minors can be referred to in the hash -- just use the
colon as one would, e.g. `[logs.htm](#structure "Save: main")` becomes 
`[logs.htm](#structure:main "Save: ")`

Blocks cannot refer to each other without problems as they will mutually wait
for each other.

Fencing of code blocks follows commonmark syntax. Be careful about lists too. 

To eval code directly, one can use `| eval _"some code"`. The incoming text is
in the variable `text` and that variable is what the outgoing text is recorded
as. 

We no longer can evaluate the blocks in terms of where we are in the command
input stage. This was always confusing, anyway. Instead use backslashes and
the compile command. 

To access the arguments called by the command line, one can do
`doc.parent.stdin[whatever property]` and one can create whatever property by
doing `- z prop:val`

The two things above allow one to have the literate program directly doing
computations instead of just creating a script that can be called. No real
reason for this, I suppose, but hey, it works. 

No replacement for 

```
\_"*:expected|heading"
## Heading

    function () {
        return this.hblock.heading.split("*")[0]; 
    }

 [heading](#heading "define: command | | now")
```


  ## Break with previous versions

This is a complete rewrite. The syntax is simplified so that only the ``_`code
block| function | functionn` `` syntax is needed. Leave off the code block to
just start using functions (leave the pipe). The code block in that syntax
need not be a code block, but could be a user-defined variable name,

Another break in the syntax is the switch link. This was a link that was on a
line by itself. It was a kind of heading, one that would make a quick separate
code block under the same heading. I find it convenient. But in trying to
match the general parsing of markdown programs, I am moving towards using a
professional markdown parser that would make it difficult to recognize the
positioning of a link, but trivial to parse one.  So the switch link will be a
link whose title quote starts with a colon. So an empty directive. It can
still be positioned as always.  Also can implement it so that if the
parenthetical is completely empty, then that is a switch. I noticed that that
is what I often do. 

For header purposes, a link's square bracket portion will be returned to the
surrounding block.

Also headers will have a way to be modified based on their levels. 
I have never used levels 5 and 6, for example.
As an example, one could have level 5 headers for tests, docs, and examples,
that could then be compiled and run bey selecting those headers.  Not sure yet. 

Also, there is no tracking of the non-significant text. So for example, raw
will not work in the same way. It was always a bit of a hack and now it will
be more so. There can be easily a plugin that will search for the heading and
cut the rest, etc.

Multiple substitute cycles are no longer supported. I always found it hard to
reason about it and it greatly simplifies the code. If you need that
functionality, it probably is workable with substitutes and the variable
storage introduced. 

The compiled blocks are stored as variables. We can store arbitrary variable
names and so potentially can conflict with block names. You have been warned.
It is all "global" scope though you can use syntax to kind of scope it. Well,
actually we are scoped to the documents, that is `docname::..` gives another
scope which the var setting respects. 

Another break is that block names need to match. There is the main block which
has no minor associated with it and then there are the minors of the block. If
you want the minor commands on the main, then start the code line with `[](#
":|...")` where the colon is there to indicate a minor directive, but with no
name and no extension, this will signal the main block. Note that this will
overwrite whatever was in the main code block, if anything. Once a block
(minor or not) is switched from, it cannot be added to later. Trust me, this
is a good thing.
