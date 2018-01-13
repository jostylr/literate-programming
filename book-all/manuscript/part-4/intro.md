-# Reference

This part is the technical documentation of literate programming. While it
does document itself, in some sense, this is a ready index of syntax,
directives, commands, subcommands, and plugins.

Most of this applies to literate-programming core library, but there are
directives and commands that may only be applicable in the command client.
Those are marked in their own section, either with Litpro (thin and fat client
applicable) or Literate-Programming (just the fat client)

### Syntax

Here we describe the syntax as formally as possible. 

#### Commonmark

This is the markdown specification and parser that we use to determine when
something is a header, a code block or link. The rest of the syntax is not
relevant for our purposes though it may be of relevance to readers. 

#### Code blocks

Our main concern is to transform and string together code blocks. A code block
is something that essentially is indented by 4 spaces or is fenced off (3
backticks  before and after). 

#### Minor Blocks

A minor block is a block that is being referenced by two parts: a header block
name and, after a colon, the minor block's name. 

#### References and Substitutions

References are what we use to refer to the chunks of code, or rather, what we call
the names of those chunks. 

Substitutions are the syntax saying that something else should go there. Only
substitutions and their escaped versions cause a change in the code chunks. 

Substitutions can have null references. The point of these would be the pipes
and commands. 

References can occur before the first pipe or as part of a command or as part
of a directive.

#### Pipes

These initiate commands that transform the incoming text. 

#### Directive Syntax

This is a link syntax with the title text starting with a word followed by a
colon. Each part of the link may or may not have relevance to the directive. 

#### Command Syntax

No parentheses required for command arguments. 

#### Subcommand Syntax

These are functions in the arguments of a command. These require parentheses. 

### Directives

Directives are generally intended for using text in a certain way, such as
saving it to a file or defining a command with it. There is also the eval
syntax which will act immediately upon being encountered. 

### Commands

Much of the heart of the transformations are commands and there are a great
many commands that come by default. 

### Subcommands

These help in getting the right kind of arguments into a command. One can
create arrays, objects, booleans, numbers, etc., as well as manipulate such
structures. 

### Command-line

The command line programs have flags that we explain here. 

### Plugins

Plugins are a way to have commonly used function easily packaged up and used. 

### lprc.js

This is a file that gets executed upon startup. It is the place to load up
plugins, define commands, directives, and defaults. 

### Compile Events

Here we detail some of the parts of the program that one may want to access
for a variety of reasons. Further details can be read in the literate source
code, mainly in that of
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).

