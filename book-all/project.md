# LitPro the Book

This is the project management file for the literate-programming book. 

This book encompasses an introduction to both the methodology and the
particular program. It covers a gentle introduction into using the tools. It
will also delve into some specific applications, notably, web development.
Finally, it is a comprehensive guide to the built-in commands, directives,
subcommands, etc, and a guide to some of its plugins. 

The intention of the first part of the book is to first get one up to speed on
how to use this. The second part delves into some deeper workings. The third
part is the reference manual. The fourth part is an in-depth guide to using
this for web projects. The fifth part, not included, is the literate
programming program itself. As all literate programmers know, it should be
written as a literate programming using itself to compile itself. 

This is the second major version of this program that I wrote. The first one
was good, but it lacked an essential asynchronous nature. To facilitate what I
needed, I wrote the event-when library, using the first version of
literate-programming. I then leveraged that library to make the second
version. It is fully event based which allows for such things as running other
programs and including the output into the compiled program. It also makes it
ever so slightly harder to debug. I would also include this as the fifth part. 

## Structure

This book is compiled into markdown files that are then compiled by leanpub
into actual books.

Here will be the table of contents in the sense of files for book.txt

    
    _"part I"
    _"part II"
    _"part III"
    _"part IV"


[manuscript/Book.txt](# "save:| add.txt")

[add .txt]()

This adds txt to the end of each line. `sub \n, .txt\n` almost works, but it
fails to capture the last line.
   
    function (input) {
        return input.
            split("\n").
            map( function (el) {
                return el + ".txt";
            }).
            join("\n");
    }

[add.txt](# "define:")


### Part I

The sample PDF corresponds to Part I which is free to read. It consists of the 80% case.  
    
    intro
    what
    litpro
    semi-litpro
    symphonic-programming
    artistic-programming

[manuscript/Sample.txt](# "save:| add.txt")

### Part II

These are more in-depth examples, demonstrating artistic programming in its
fullest. 

    basic-workings

### Part III

All the syntax defined, explained, and exemplified. The first four chapters
are overviews with cross-links to later chapters that go in detail. 

    core-syntax
    commands
    subcommands
    directives
    plug-ins

### Part IV

Applying this to making web stuff. There is a lot of front-end stuff to manage

    web-overview
    writeweb


##  Test

The various code snippets should all be tested automatically, both to make
sure they work as advertised while writing and then also part of the testing
regime for litpro. 


## Compiling

In the directory section, we list each directory that we want to descend into.
That directory is made up of markdown files that get processed, mainly looking
for commands of `!CAPS:` at the beginning of a line with the rest of the line
being whatever it needs to be. Generally, it gets code fenced. 

