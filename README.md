# literate-programming  [![Build Status](https://travis-ci.org/jostylr/literate-programming.png)](https://travis-ci.org/jostylr/literate-programming)
 

This is the fat command-line client for
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
It contains the full functionality for literate programming, including useful
commands such as jshint included in it. For a thin client,
check out
[litpro](https://github.com/jostylr/litpro)


Full documentation:  [Literate Programming, MD: How to Treat and Prevent Software Project Mess](https://leanpub.com/literate-programming-md)

This is not done being fully baked, hence v0.9. But this does represent a
significant break from 0.8.4.  You can take a look at convert.md for some
observations of mine as I converted from the old version to the new. 

Install using `npm install literate-programming`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write
`literate-programming` then use `npm install -g literate-programming`.

The library has a full listing of the syntax, commands, and directives. Here
we list the flags and new commands and directives. 

## Example usage

 Save the following code to file `project.md` and run `literate-programming project.md`.

    # Welcome

    So you want to make a literate program? Let's have a program that outputs
    all numbers between 1 to 10.

    Let's save it in file count.js

    [count.js](#Structure "save: | jshint")

    ## Structure 

    We have some intial setup. Then we will generate the array of numbers. We
    end with outputting the numbers. 

        var numarr = [], start=1, end = 11, step = 1;

        _"Loop"

        _"Output"

    ## Output 

    At this point, we have the array of numbers. Now we can join them with a
    comma and output that to the console.

        console.log("The numbers are: ", numarr.join(", ") );

    ## Loop

    Set the loop up and push the numbers onto it. 

        var i;
        for (i = start; i < end; i += step) {
            numarr.push(i);
        }

## Documentation

For more information, see the [documentation book](https://leanpub.com/literate-programming-md) which is free to read online or available for purchase as a PDF. 

Some particularly useful syntax sections are: 

*  [command-line flags](https://leanpub.com/literate-programming-md/read#leanpub-auto-command-line-1)
* [directives](https://leanpub.com/literate-programming-md/read#leanpub-auto-directives-1)
* [commands](https://leanpub.com/literate-programming-md/read#leanpub-auto-commands-1)
* [subcommands](https://leanpub.com/literate-programming-md/read#leanpub-auto-subcommands-1)
 


## Use and Security

It is inherently unsecure to compile literate
program documents. No effort has been made to make it secure. Compiling a
literate program using this program is equivalent to running arbitrary code on
your computer. Only compile from trusted sources, i.e., use the same
precautions as running a node module. 
 

## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)
