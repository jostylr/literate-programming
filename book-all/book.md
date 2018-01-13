# Literate programming book

This is a literate program that should compile to a book on literatep
programming using the literate programming compiler I wrote. 

## Files

* [litpro.md](#toc "save:")

# TOC

This is the table of contents. The lit pro should use the toc to grab the
sections. Use ~ to denote the section name

    1. What is literate programming ~ what
    2. The why of literate programming ~ why
    3. Basics of literate programming ~ basics
    


# What

# Why

# Basics

## Multiple files

We can load and reference multiple other literate programming files. Why not,
right?  We do this by writing load directives such as `[bob](git_url
"load:file1.md"]`  which would load `file1.md` into memory and process as a
literate progamming. The program that called it could reference it by
``bob::strings`` which would load the `strings` block of `file1.md`. 

EXAMPLE

## Directives vs. Commands

Directives are commands noted during parsing. That is, they occur before any
substitutions or stitching. This allows us to capture events, set things up
for action, etc. With async fully implemented, this is less important now, but
if we want to change behavior before compiling begins, we use directives. The
syntax for directives are markdown links whose titles involve a colon.

Commands, on the other hand, are functions that act on the text itself and
work during compiling. They take in a text input plus any arguments provided
and then they are expected to provide a text output for the next step. They
can be synchronous or asynchronous. Their syntax involves pipes within the
substitution process. 


### List of included directives

These are the directives included in the core library. They mainly have to do
with manipulating the literate programming flow.

All directives are of the form `[link](#href "directive:input")` where link,
href, directive, and title are all substituted in. The directive is a function
that is called in the code with an argument object with keys link, href, input, 
and cur for the current block name. 

#### 





