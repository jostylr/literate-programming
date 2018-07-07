# Core

This is the main entry for the common library of literate-programming. 

In this file, we set up the main flows, such as the proxies for directives,
commands, etc.,  loading up commonmark, and defining the processing order. 

Essentially, we load our requires, default directives/cmd/subcmds, then start
processing the lp files. 

The library exports a function that gets called with an object the tells it
how to read and write files (and possibly other stuff). 


    let commonmark = require('commonmark');

    modules.export = async function lpLib (setName, startNames, access) {
        let directives = {_"directives::"};
        let cmds = { _"commands::" };
        let subcmds = {_"subcommands::"};
        let cmParser = _"commonmark::";

        let setup = {
            directive, cmd, subcmd, blocks,
            log : _"log",
            logs : [],
            error : _"error",
            errors : [],
            docs : {
                blocks: {},
                rets: {},
                starts : []
            }
        };

        let setFile = await access.read(setName);
        let setRet = cmParser(setID, setFile, setup, setBlocks);
        setup.docs.rets[setName] = setRet;

First, we make sure all loaded files are done. 

        await Promise.all(setRet.files);
        

        



    }


We need the following files:

* [commonmark](commonark.md "load:")  This does the initial document parsing
* [directives](directives.md "load:")



[flow](# "doc:on")

## Flow

The literate programming library works by first using the setup file,
`lpconfig.md` by default, and running it in vanilla mode to setup the custom
commands, directives, and subcommands for the project. In the setup file, one
can define these as per those directives and then they will be accessible to
all files in the project. It is ill-advised to try and use them in the setup
process. 

Once that process is complete, then the project parsing occurs. 

The default directories to start reading documents from and storing them are
defined in `top.txt` which also defines the top directory where `lpconfig.md`
should be. One can also alter the default setup file name here as well. The
defaults are equivalent to the following `top.txt`

    build:build
    src:src
    setup:lpconfig.md


[flow](# "doc:off")


##  Directives proxy
 
Here we handle get and set calls for directives. For get, we check for
directives first on the ret pro 
