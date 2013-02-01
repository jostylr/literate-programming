I wrote a [program](https://github.com/jostylr/literate-programming) that implements [Knuth's literate-program](http://literateprogramming.com/)  idea.

The motto is: "Its like writing sphagetti code then shredding the code into little pieces, throwing those pieces into a blender, and finally painting the paste onto an essay. Tasty!"

## Installation

To install and run, you currently need to install [node/npm](nodejs.org). Then you can do `npm install -g literate-programming`. This installs a command line function which will take in a literate markdown program and produce the files of a "program". 

## Basic Use Case

Writing programs is the original reason. You can write the idea, reasoning, and code all in one document. More importantly, one can break the code up into any sensible blocks that you like and reorder them. One can also do various substitutions and run them through commands that can make doing annoying things less so. 

Perhaps the most important part is to be able to have diffrent levels of structure to the code. It is, in some ways, an outlining tool. Programming in JavaScript involves a number of different flow controls, such as loops and conditionals. With literate programming, one can write the overall flow in one block, leaving informative names for the stuff that should be done in the various parts. As an example: 

    if (UNDEFINED(retirement) ) {
        _"Send Money Book"
    } else {
        _"Contribute to fund"
    }

So in that block, we use an UNDEFINED macro which expands to  `typeof retirement === "undefined"`  (a bit of annoying JS var checking)  and then we do two different things, which refer to other code blocks, one of which might look like:

    JS Contribute to fund

        contribution = retirement.amount / years;
        myaccount.transfer(retirement.account, contribution);

Either section of code could come first. Indeed, a big advantage of literate programming is that one can write anything anywhere. Yes, languages allow some reordering of the code by using functions, but in literate programming, any line can be written anywhere. There is no having to create a file or find a file or figure out which file something goes in. One just starts writing. And then later on, one can link it all up again. 

Another great feature is that one can create whole new portions of code without invalidating the program in the meantime. I often found that while adding something, the program would become unusable. Here, just do not link the code until it is ready. One can lint it, test it, and inspect it all before throwing it into the normal code. 

 
## Other Prospective Uses. 

Moving a little beyond programming, one could create webpages or whole websites from a single or a few literate programming documents. One needs to be careful with mingling of concerns, but this gives the power of decision to authors. Right now, one has to write separate html, css, javascript, and server-side code files. Depending on the need, it may make more sense to break it into widgets. So if we wanted to code up a little chat widget, we could write the  html structure, a little css, a little javascript and ajaxy thing going to the server-side where the relevant logic is implemented. All of this, including the server code, could be done in one file instead of buried in four files filled with irrelevant material from the rest of the website. This literate program module could then extract all those code bits and place them in whatever files one needed them placed. 

We could also write documents in this fashion. When writing an article, for example, one could write down a bunch of ideas and facts that would not go into the published article, but it might be nice to keep them around. And if someone really wanted to get more on your article, you could send them the literate program which would have all of that in it. You could also write multiple articles from one document, say a teaser article,  a more in-depth article, and even a chapter of a book. It keeps together relevant ideas. 

A blog is another use for this setup. I envision a blog literate program setup to be organized by categories as the separate files. Each blog entry would be in the file of its category. This is an evolution of the static website generators. One could even use it to style the different categories differently, if one wished to do so. 

As part of the writing, one could also create material dynamically while compiling the literate program. So instead of doing computations and copying/pasting results, one could put the computations in the literate program, run the program, and generate a compiled document with fresh computations. Something like this already exists for special uses, such as [Sweave](http://www.stat.uni-muenchen.de/~leisch/Sweave/),  but this would allow the use for any combination of programming and document generation needed. 

For me, this is about having control over my flow of work. I can collect everything in one place, in any order desired, labelled in any fashion I desire.

## Examples

The biggest example to date is the [literate-programming module](https://github.com/jostylr/literate-programming/blob/master/lp5.md) itself. I wrote it in such a way that it compiles itself. That took a bit of effort, but it gave me the instant feedback I needed to get the syntax right (I hope). 

A sample document is in examples/logs.md. It compiles to a html fragment for adding to a blog engine and to an html document for a stand-alone viewing.  It produces a table of factorials using JavaScript written in the document itself; the document's JavaScript generates an array and then the common command htmltable parses that array into an HTML table.

There hopefully will also be an example of a literate program that computes something (say factorials) and a separate literate program that runs tests on the various code bits. 

## Experience So Far and Prospects

I have enjoyed writing a non-trivial program in literate programming fashion. I found myself able to follow the flow of the program much more readily. I also found that as I was adding bits "to just get it working", I would split off chunks to somewhere else to maintain understanding the strucuture. A good rule of thumb is that a block of code should fit comfortably in the screen. 

I do intend to create a browser-based IDE. This will help, but I have been surprised at how easy it is to navigate already with nothing but a plain text editor. The find command works wonders. I generally have unqiue snippets of code or use the block names. 

Since my editor thinks the document is markdown, I have had no syntax highlighting or other goodies. But I find this is not really a problem. With focused chunks of code, it seems fairly easy to write code and keep it in human-RAM. But I do look forward to using an editor that will understand the relevant syntax and highlight it for me. 

There are a few other things to work on, notably the ability to declare whether to push production code or just do dev code. I want pretty much all my steps to be codified in the literate program itself as much as possible. 

Another thing I am looking forward to in the IDE is the ability to have special values that I could adjust in some intelligent fashion. So for example, a macro such as  RANGE(x, 5, 10, 1, 7)  to mean that the variable x could take on values from 5 to 10 with a step of 1 and a default of 7. And then in the IDE, there could be a slider associated with x and one could see the impact of the value on the compiled output. There would be a save command that could then write down the value to be used and a suitable history developed. Or a macro of GRID(x, 5, 10) that might make a editable spreadsheet grid 5x10 whose values are put into a matrix-array and then assigned to x. These would be powerful notions, inspired by [Bret Victor](http://worrydream.com/)

By the way, this document is also in the literate programming document. If I wanted to, I could pull in example code from the document itself, ensuring that it stayed up-to-date. 

## Futher reading

For more on literate programming, I recommend this question on [SO](http://stackoverflow.com/questions/2545136/is-literate-programming-dead)

I particularly like the quote that the only people who use lit pro are those that develop a system to do so. Why not? This is about someone taking over their development flow. Perhaps someone will use this, but if not, well, it works for me to make awesome stuff -- I hope. 



## Documentation

Write a markdown document. See the [syntax](http://daringfireball.net/projects/markdown/). What we use is the headings with number signs to indicate new text blocks and the 4-space indents to indicate code blocks within a text block. 

Each heading will be parsed as the name of the text block and is key to referencing. You should not use `| :`. 

### Text Block

Within a text block, there are directives and types as possible special commands. Both involve capital letters and/or periods. 


#### Directives
A directive has the form of  `DIRECTIVE arg1 | arg2 | ...`  where the args used depend on the directive. It can have periods in the middle to allow for a kind of name-scoping. 

Example:  `FILE package.json | NPM package : json | jshint`  at the beginning of a line. 

#### Type

A type is `TYPE  code block name | # command1(arg1, arg2, ...) | command2 ....`  where the TYPE should be a known type, such as JS, or an unknown one using a period: `.NEW`. The code block name should be descriptive but it should not contain `| :`  Commands can be, with white space, anything except `| ( `, but they can also be followed by optional arguments with the parentheticals being optional if there are no arguments. The arguments are plain text passed into the command; no `| , )`  

Example: `JS Wrap values in function`  says it is a JS block with name `Wrap values in function`

The # in front of the command is optional. If not there, the command is invoked after all substitutions are made. If a 0 is there, then it is invoked before any substitutions are made. A positive integer says which loop of the substitution cycle it should be applied to. 

Example: `MD main |1 marked`  says to invoke the marked function on the code block named main after 1 cycle of substitution. In this instance, it is hiding conflicting markup from the marked function. To do this, one needs 2 or more underscores so that the substituion is done after the initial marking. 

#### Breaking Code Blocks

One can intersperse text and code freely. The line parser adds any code line to the current code block. A TYPE switch creates a new code block and further code will be added to that one. 

A new textblock creates a new code block associated with that textblock. 

### Code Block

In the code block, there are code block substitutions, evaluated code, and macro substitutions. 

Each underscore substitution can be longer than one underscore in front. The number of underscores corresponds to which loop of the substitution cycle it will come in to play. This is useful for hiding conflicting markup.

#### Block Substitutions

A code block substitution is of the form `_"litpro :: text block name : code block name . type  | command(arg1, arg2) | ... `  

The litpro is the literate program name that has been LOADed. If omitted (and the ::) then it defaults to the current doc which is the usual case. 

The text block name can pick out any defined text block. If omitted, it defaults to the current one. 

The code block name refers to just the code blocks in the selected text block. If omitted, then eithr `main` or an unamed code block is pulled. The optional type will be used to distinguish multiple code blocks with the same name or no name. For example, in one textblock, one might define little bits of html, css, and js with three external text blocks pulling them in. 

An entirely empty name could be a problem. At least use a :. 

After the name is a series of optional commands using pipes. They will be applied to the final compiled code block, in sequence, each command receiving the code block and being able to share a state object in the `this`. 

See [literate-programming-standard](https://github.com/jostylr/literate-programming-standard) for information on commonly available commands and developing a command. 
 
#### Evaluated Code

An eval'd line is _ &#x60;code&#x60;  (md uses backtick to highlight inline code so it is rather hard to display.  This should be written on a single line. The code will get evaluated and its result will replace the sub bit. 


#### Macro Substitutions

All caps will trigger a macro lookup. This has potential conflicts, but is also remniscent of constants in programming languages. If there is no match, then nothing is done. 

A macro can be a value or a function. Actually, values are wrapped to be a function too.

Example `JQUERY(1.8.0)`  could produce the script tag pointing to the Google CDN for 1.8.0.  If one used `JQUERY` alone, it could default to 1.9.0. One has to define the macro to do this. 

Defining it requires a new text block and a code block written out with just a function as content. After it is done, use the directive `DEFINE name` No substitutions are made in this code block as it is used before such subsitutions are done. This is how one would define the JQUERY macro. 

            function (v) {
            return '<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/' + 
            (v || '1.9.0') + '/jquery.min.js"></script>';
        }

     DEFINE jquery


## Default Directives

1. FILE -- Saves a compiled block to a file
2. LOAD -- Loads another literate program
3. REQUIRE -- Loads in plugins via npm module require
4. VERSION -- A way to define the version of your document; defines the macros VERSION and VNAME
5. DEFINE -- Define a macro function
6. SET -- Set a macro name to a constant value.

You can also define your own directives; see [literate-programming-standard](https://github.com/jostylr/literate-programming-standard)