literate-programming
====================

Write a program using markdown to write out your thoughts and the bits of code that go with those thoughts. This program weaves the bits together into usable fiels. 

## Installation

This is not yet operational, but soon: 

    npm install -g literate-programming

## Using

The command installed is literate-programming and it has some command flags and one primary argument which is the markdown document containing the program, or at least the structure of the project. 

    literate-programming sample.md 

will create the files specified in sample.md

### Command flags
Currently there is only one flag: -d or --dir  with a directory that specifies the root directory where the compiled files go.


## Document syntax

A literate program is a markdown document with some special conventions. 

The basic idea is that each header line (regardless of level) demarcates a full block. Any code blocks within a full block are concatenated together and are the code portion of the block. 

Each code block can contain whatever kind of code, but there are three special syntaxes (space between underscore and quote should not be present; it is there to avoid processing): 

1. _ "Block name" This tells the compiler to compile the block with "Block name" and then replace the _ "Block name" with that code.
2. _ `javascript code`  One can execute arbitrary javascript code within the backticks, but the parser limits what can be in there to one line. This can be circumvented by having a block name substitution inside the backticks. 
3. CONSTANTS/MACROS all caps are for constants or macro functions that insert their output in place of the caps. 

For both 1 and 3, if there is no match, then the text is unchanged. One can have more than one underscore for 1 and 2; this delays the substitution until another loop. It allows for the mixing of various markup languages and different processing points in the life cycle of compilation.

Outside of a code block, if a line starts with all caps, this is potentially a directive. For example, the `FILE` directive takes the name of a file and it will compile the current block and save it to a file. 

If a heading level jumps down by two or more levels (say level 2 going to level 4), then this is also a potential directive. It allows for the use of a TEST section, for example, that can automatically run some tests on a compiled block.

## Nifty parts of writing literate programming

You can write code in the currently live document that has no effect, put in ideas in the future, etc. Only those on a compile path will be seen. 

You can have your code in any order you wish. 

You can "paste" multiple blocks of code using the same block name. 

You can put distracting data checks/sanitation/transformations into another block and focus on the algorithm without the use of functions (which can be distracting). 

You can use JavaScript to script out the compilation of documents, a hybrid of static and dynamic. 

## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE)