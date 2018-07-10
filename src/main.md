# Core

This is the main entry for the common library of literate-programming. 

In this file, we set up the main flows, such as the proxies for directives,
commands, etc.,  loading up commonmark, and defining the processing order. 

Essentially, we load our requires, default directives/cmd/subcmds, then start
processing the lp files. 

The library exports a function that gets called with an object the tells it
how to read and write files (and possibly other stuff) as well as the initial
setup files (init) and the starter files (start). 


    let commonmark = require('commonmark');

    modules.exports = async function lpLib () {
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
                files: {}
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




## Doc: Flow

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




##  Directives proxy
 
Here we handle get and set calls for directives. For get, we check for
directives first on the ret pro




## Flows  

We process a file, storing blocks of text and executing async directives, such
as preparing to save compiled blocks to a file or loading new files for
parsing. 

When a file is done being processed, it returns an object with those blocks
and other data. This fulfills a promise that was created. Once that is
finished, any block that was requested from that file is then setup as a
promise.



### Call a block

Here we have a call to a block. This is after parsing its location and so the
function is passed in a full file name reference (maybe an alias,
but fully pathed) and the full block name relative to the file. This is an
async function which eventually returns the compiled block object. 

    async function retrieveBlock (fname, bname) {
        let docs = this.docs;
        try {
            let file = await docs.files[fname];
            let block = await file.blocks[bname];
            return block;
        } catch (e) {
            e.msg = "failed to get block " + fname + '::' + bname + e.msg;
            throw e;
        }
    }


#### Block Proxy

To get a compiled version of a block, we use a proxy to handle the get
semantics. This is used in a closure environment in which compile is a
function defined there which operates on the blocks of that file. 

    {
        get: async function $getBlock (obj, prop ) {
            return (obj in prop) ?
                obj :
                (obj[prop] = $compile(prop) );
        }
    }

Use the return value with await. 

#### Source Proxy

This calls into existence, if needed, a promise that returns the full source
of a code block. It starts off unresolved, but when a block is ready to be
saved fully (blocks can be defined across a file), this uses the res trick.



    { 
        get : function getSrc (obj, prop) {
            if (obj in prop) {
                return obj;
            } else {
                let res, rej; 
                let ret = new Promise(resolve, reject) {
                    res = resolve;
                    rej = reject;
                }
                ret.res = function (src) {
                    ret.res = () => {throw new Error(
                        "storing source twice for " + prop) };
                    ret.rej = ret.res;
                    res(src);
                    return src;
                };
                obj[prop] = ret;
                reutrn ret;
            }
        }
    }



### Make empty file structure

This creates the shell of the returned parsed file. This is where the prox

    function makeEmptyFile (path) {

        let file = {
            path,
            staging : {},
            source$ : {},
            compiled$ : {}
        }

        let $compile = _"compile block";

        file.compiled$ = new Proxy({}, _"block proxy"); 

        return file;

    }

### Compile block

This initiates the calling of the compile of a block. The file object is
available through closure.  

    async function $compileBlock ( blockName) {
        let src = await file.source[blockName];
        let stagedBlock = file.staging[blockName];

        let block = {
            bits : [],
            full : ''
        };
         
        _"run through source"

        return block;

    }




### Files proxy

Here we deal with the files proxy. When a "file" is needed, we retrieve the
promise of it from the files object, creating the promise if needed. The file
is in quote because this could be an alias. When an alias is defined, that
file is loaded and parsed and the promise of that process will resolve this
promise. If two or more files try to resolve the file, it will check if the
files are the same or conflicting. A conflict creates an error, being the same
does nothing. 

    { 
        get : function getFile (obj, prop) {
            if (obj in prop) {
                return obj;
            } else {
                let res, rej; 
                let ret = new Promise(resolve, reject) {
                    res = resolve;
                    rej = reject;
                }
                ret.res = function (file) {
                    let path = file.path;
                    ret.res = _"replace resolve function";
                    ret.rej = _"replace rejection";
                    res(file);
                    return file;
                };
                obj[prop] = ret;
                reutrn ret;
            }
        }
    }


#### Replace resolve function

We replace the resolve function so that it is fine if the same alias is being
resolved again, but not fine if it is to another file. 

    function (laterFile) {
        if (laterFile.id === id) {
            return file; //redundant not a problem
        } else {
           throw new Error('distinct files being saved under ' + prop + 
            'but paths are ' + path + ' vs ' + laterFile.path);
        }
    }

#### Replace rejection

Since we already resolved, if we reject, this is a problem. We need to throw. 

    function (err) {
        err.reason = "alias rejection after being resolved " + file.path;
        throw err;
    }


### Alias file code

We get the text (a promise) from the texts document, creating the file call
via getting and promise if needed. 

We then get the alias (creating it if needed via getting) and chain a .then
with the compile promise.

The path should be the canonical path for identifying the unique file at that
location. 

In files, we have promises that may be called many times; they resolve to a
file object that contains blocks. They can be created either by such a call or
by a call to load a file using that alias. 

The texts object are promises for loading. They should be used exactly once:
the original loading of that unique path. Any other attempts should wait for
the compiled version. 

The text is actually a promise that is not awaited for until the cmParse
method. 

    async function aliasFile (alias, path) {
        let dc = this;
        if (alias === path) {
            if ( dc.docs.texts[path]) {  // already being loaded
                return docs.files[path]; // this is just a promise
            }
            let text = dc.docs.texts[path] =  dc.load(path); //returns a promise
            let actual = docs.files[path]; //creates promise if does not exist
            return await dc.cmParse(path, text, dc)); //parser resolves promise
        }
        return await docs.files[alias].res(await dc.aliasFile(path, path) );
    }



## Reference pathways

This is how to navigate the possible directory structures and paths
referenced. 



## Run through source

This is a key component of the tool. It substitutes in all the 
`_" block name | cmd | ..."` objects for their actual contents. This has
several tasks to accomplish: 

1. Recognize the start (easyish) and end (hardish) of a substitution block
2. Take note of indents when substituting
3. Handle commands, subcommands
4. In commands and subcommands, more async and block name calling in can
   happen.
5. Generate line and column numbers both in the source where it is being
   replaced as well as in the output. All of the intermediate steps should be
   stored for inspection. 

The idea is that we carve up the original source into distinct bits, the raw
which gets concatenated with line info and indents, but little else going on,
and then the substitution blocks which consist of an array of sequentially
progressing down by commands with the relevant info, finally yielding the
final bit to be put in. Commands can yield any kind of structure to be fed
into the next one, but ultimately, it gets used as a string at the end of the
command sequence unless it is the only substitution bit though such a
construct is probably better served as a transform directive. 

    n = src.length;

    while (let ind < n) {

        


    }
    



