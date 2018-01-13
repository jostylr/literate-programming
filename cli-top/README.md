# litpro 

This is the thin command-line client for
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
It contains the minimal functionality for literate programming, but it does
not have any other modules such as jshint included in it. For a fat client,
check out
[literate-programming](https://github.com/jostylr/literate-programming)

Install using `npm install litpro`

Usage is `./node_modules/bin/litpro file` and it has some command flags. 

If you want a global install so that you just need to write `litpro` then use
`npm install -g litpro`.
## Example usage

 Save the following code to file `project.md` and run `litpro project.md`.

    # Welcome

    So you want to make a literate program? Let's have a program that outputs
    all numbers between 1 to 10.

    Let's save it in file count.js

    [count.js](#Structure "save:")

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


For more on the document format, see 
[literate-programming-lib](https://github.com/jostylr/literate-programming-lib).
## Documentation

For more information, see the 
[documentation book](https://leanpub.com/literate-programming-md) 
which is free to read online or available for purchase as a PDF. 

Some particularly useful syntax sections are: 

*  [command-line flags](https://leanpub.com/literate-programming-md/read#leanpub-auto-command-line-1)
* [directives](https://leanpub.com/literate-programming-md/read#leanpub-auto-directives-1)
* [commands](https://leanpub.com/literate-programming-md/read#leanpub-auto-commands-1)
* [subcommands](https://leanpub.com/literate-programming-md/read#leanpub-auto-subcommands-1)
 
## Use and Security

This thin client is envisioned to be a developer dependency for projects using
it. Thus one would install it via npm's json package system along with any
litpro plugins. 

The only caveat to this is that it is inherently unsecure to compile literate
program documents. No effort has been made to make it secure. Compiling a
literate program using this program is equivalent to running arbitrary code on
your computer. Only compile from trusted sources, i.e., use the same
precautions as running a node module. 
 
## LICENSE

[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE-MIT)
