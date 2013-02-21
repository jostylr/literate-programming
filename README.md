literate-programming
====================

Write your code anywhere and in any order with as much explanation as you like. literate-programming will weave it all together to produce your project.

This is a modificaiton of and an implementation of [Knuth's Literate Programming](http://www-cs-faculty.stanford.edu/~uno/lp.html) technique. It is perhaps most in line with [noweb](http://tex.loria.fr/litte/ieee.pdf). 

It uses markdown as the basic document format with the code to be weaved together being delimited by each line having 4 spaces as is typical for markdown. 

It can handle any programming language, but has some standard commands useful for creating HTML, CSS, and JavaScript. 

## Installation

This required [node.js](http://nodejs.org) and [npm](https://npmjs.org/) to be installed. Then issue the command:

    npm install -g literate-programming

## Using

From the command line:

    literate-programming <file.md>

This will process the literate program in `file.md` and produce whatever output files are specified in the program. 

Use `literate-programming -h`  for command flag usage, including specifying the root output directory.  

## Example

Let's give a quick example. Here is the text of sample.md

    # Welcome

    So you want to make a literate program? Let's have a program that outputs all numbers between 1 to 10.

    Let's save it in file count.js

    FILE "Structure" count.js

    ## Structure 

    We have some intial setup. Then we will generate the array of numbers. We end with outputting the numbers. 

        var numarr = [], start=1, end = 11, step = 1;

        _"Loop"

        _"Output"

    ## Output 

    At this point, we have the array of numbers. Now we can join them with a comma and output that to the console.

        console.log("The numbers are: ", numarr.join(", ") );

    ## Loop

    Set the loop up and push the numbers onto it. 

        var i;
        for (i = start; i < end; i += step) {
            numarr.push(i);
        }

Running it through literate-programming produces count.js: 

    var numarr = [], start=1, end = 11, step = 1;

    var i;
    for (i = start; i < end; i += step) {
        numarr.push(i);
    }

    console.log("The numbers are: ", numarr.join(", ") );

And it can be run from the command line using `node count.js`


There are more [examples](https://github.com/jostylr/literate-programming/tree/master/examples), but for a non-trivial example, see the [literate program]( that compiles to literate-programming



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