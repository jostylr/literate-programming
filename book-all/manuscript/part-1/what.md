# What is literate programming? 

Literate programming is a way of organizing code developed in the late '70s by
Donald Knuth. It allows one to interweave documentation and code snippets laid
out in a way agnostic to the underlying language needs. That is, it fits the
human need, not the computer need, for how something is organized and
explained. 

As a first approximation, literate programming allows one to explain the
purpose of the code, how it fits in with the larger program, what this specific
bit is supposed to do, and some non-obvious maneuvers in the code. The details
of how, of course, can be left to well-written code, but the hope is that the
prose and section headings allow one to navigate around to the interesting
bits. 

This approximation is the elevation of comments out of code and into the
primary view with code descending into a secondary viewpoint.  

This is semi-literate programming and is the most often implemented view,
being the easiest and fitting with the name "literate". 

At the next level of understanding, it allows one to sculpt the code to fit
the human mind. The most interesting bits can be placed first. Or the overall
structure can be laid out first. Whatever makes more sense, it can be done
that way. Much like how a
story may be laid out in non-chronological order for maximum impact of the
human reading it, so too does literate programming enable the organization of
code for maximal human understanding by shedding the dependency on what the
computer requires for organization. 

Just as humans may disagree on rather a story is told well so to does this increase the potential conflicts between reader and author of code. It becomes dependent on the author to try and think in the perspective of the reader as to how to present it well enough to the expected audience. This is not an easy task. 

This is the level of arbitrary ordering of snippets. We can go even further
and have arbitrary input and output files. That is, multiple literate program
files can combine to make a single or multiple output files. This allows us to
not only reorganize code within a single file, but organize the code across
the project. 

We could, for example, use a literate program in web development in which some
html widget, with its css and javascript, all live in a single literate
program file but upon compiling, those pieces go to there separate various
destinations. We could also choose to do the opposite such as having javascript,
say, in its own literate program, but then inject it (or a small, crucial
subset of it)  into the html file for performance reasons. We fit the
organization of the project to the demands of the mental view of the project. 

Related to this is the idea of a central project management file. Compile that
literate program and it triggers the compilation of the entire project. But
more to the point, it would be the entry point, a sort of table-of-contents
with explanations, for the whole project. Instead of being limited to
expressive directory and file names, one can use arbitrary comments to reveal
a clear insight into the whole structure of the project.

We could call this literate projecting. Or perhaps symphonic programming,
thinking of it as conducting all the disparate pieces of code threaded
together in a harmonious fashion.

The third level is complete and arbitrary control of the code. At this stage,
we can run snippets through any process we want. We can write a JSON
description of an object and then translate that into a language specific
object. We can have bits of markdown or pug and compile it into the same HTML
document. We can create our own little mini-language for just that one bit of
the project to reduce the amount of code written and have the literate program
create the final rendered version. 

We can also take almost common bits of code and programmatically change them
as needed. This is a middle ground between copy-and-paste versus creating
functions to implement common code.

This third level is where the bulk of the effort of litpro was spent. It is
not hard to do the first two levels, particularly if syntax is not too worried
about. But the third opens an entire world of asynchronous text processing
with arbitrary tools. Here convenience is extremely important and, as anyone
knows, the price of convenience is complexity. 

This level is perhaps described as artistic programming. It allows for an
unconstrained canvas to paint the code. 

As we go up the levels, each one is increasingly more complex and potentially
dangerous for the undisciplined. But it is also a big opportunity to learn
discipline. There is nothing quite like making a mess to teach one discipline
in coding.
