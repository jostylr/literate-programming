This is taken for posterity to show how one could evolve. Saving was initially
a one off with pipe processing, but then it became copied and more used and so
it migrated into functions and then a factory. Pros and cons to both. 


### Dealing with directive pipes

Sometimes we want to have pipes being parsed and used. This should be an easy
thing to do and this is where the helper functions live. They are attached via
prototyping from Folder down to doc.

One goal is to try and eliminate a need to understand the gcd object. We just
make the choices. 

#### Doc block

We start by deciding which block of text to read in from. 

This typically comes from `args.href` and the leading sharp is removed if
present. If there is a sharp, then we also replace dashes with spaces. 


`start = doc.getBlock(args.href, args.cur)`

Note start (href) is not expected to have colon escapes, but cur might. 


    function (start, cur) {
        var doc = this;
        var colon = doc.colon;

        cur = colon.restore(cur);

        if (start) {
            if ( start[0] === "#") {
                start = start.slice(1).replace(/-/g, " ");
            }

            start = start.trim().toLowerCase();

            if (start[0] === ":") {
                console.log(start);
                start = doc.stripSwitch(cur) + start;
                console.log(start);
            }

        } 
        
It is possible (likely even!) that start consisted of just `#` which indicates
that it should be the current block name to use for starting. Afer slicing
from the hash, start would be empty in this case. 
        
        if (!start) {
            start = cur;
        }
    
        return colon.escape(start);
    }
        


#### Strip switch

This is a small utility that recovers the block name not including any minor
block. 

    function (name) {
        var ind, blockhead;

        blockhead = name;

        if ( (ind = name.indexOf("::")) !== -1)  {
            if (  (ind = name.indexOf(":", ind+2 )) !== -1 ) {
                blockhead = name.slice(0, ind);
            }
        } else if ( (ind = name.indexOf(":") ) !== -1) {
            blockhead = name.slice(0, ind);
        }

        return blockhead;

    }


#### Middle of pipes

This deals with the stuff between the colon and the first pipe. What that
stuff represents, if anything, depends on the directive. 

`doc.midPipes(args.title);`

    function (str) {
        var ind = str.indexOf("|");
        var options, pipes;

        ind = str.indexOf("|");
        if (ind === -1) {
            options = str.trim();
            pipes = "";
        } else {
            options = str.slice(0,ind).trim();
            pipes = str.slice(ind+1);
        }

        return [options, pipes];
    }

#### Pipe Processing for directives

This should handle the pipes for directives given the needed info. This setups
the events. Supply the end of the title string, the emitname which is defined
in the directive (unique), the handler to be called (also defined in the
directive), and the starting block. 

`doc.pipeDirSetup(pipes, emitname, f, start)`

    function (str, emitname, handler, start) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        var block;

        if (str) {
            str = str + '"';
            gcd.once("text ready:" + emitname, handler);
            
            block = doc.stripSwitch(colon.restore(start));

            doc.pipeParsing(str, 0, '"', emitname, block);

        } else {
            gcd.once("text ready:" + emitname + colon.v + "0", handler); 
        }

    }


### Dir Factory

This produces functions that can serve as directives with the pipe parsing
built in. It takes in an emitname function and a handler creator. 

    function (namefactory, handlerfactory, other) {

        return function (args) {
            _":init"
            
            var emitname = namefactory.call(doc, linkname, args);
            var f = handlerfactory.call(doc, linkname, args);

            other.call(doc, linkname, options, start, args);

            _":emit"
        };
        

    }

[init]()

This sets up the variables and parsing of the incoming arguments. 

    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon;
    var linkname = colon.escape(args.link);
    var temp, options, pipes;

    var start = doc.getBlock(args.href, args.cur);
    
    temp = doc.midPipes(args.input);
    options = temp[0];
    pipes = temp[1];


[emit]()

This setups the pipe processing and then queues/executes it based on whether
the start value is ready. 

        
    doc.pipeDirSetup(pipes, emitname, f, start);

    doc.retrieve(start, "text ready:" + emitname + colon.v + "0");


#### Dir factory save

Here we write the save function using the factory function. 

    
    dirFactory(_":emitname", _":handler factory", _":other")

[emitname]()


    function(linkname) {
        return  "for save:" + this.file + ":" + linkname;
    }


[handler factory]()

    function(linkname) {
        var gcd = this.gcd;

        var f = function (data) {
            if (data[data.length-1] !== "\n") {
               data += "\n";
            }
            gcd.emit("file ready:" + linkname, data);
        };
        f._label = "save;;" + linkname;

        return f;

    }

[other]()

    function (linkname, options, start) {
        var file = this.file;
        var gcd = this.gcd;

        gcd.scope(linkname, options);

        gcd.emit("waiting for:saving file:" + linkname + ":from:" + file, 
             ["file ready:" + linkname, "save", linkname, file, start]);

    }

#### Dir option save

This saves the options 


We save it in vars of the document with the name in the link. The href tells
us where to begin. The title gives us options before the first pipe while
after the pipe, we get commands to act on the sections. 

This tacks on a newline at the end of the file data to meet convention.


    function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        var linkname = colon.escape(args.link);
        var temp, options, pipes;

        var start = doc.getBlock(args.href, args.cur);
        
        temp = doc.midPipes(args.input);
        options = temp[0];
        pipes = temp[1];

        _":custom"

        
        doc.pipeDirSetup(pipes, emitname, f, start);

        doc.retrieve(start, "text ready:" + emitname + colon.v + "0");


    }


[custom]()

This is the custom section. It needs to generate the emitname and f. The
emitname probably should involve the directive, the file and the linkname. But
it can be any unique event identifier for the directive use. 

The handler f should be what happens when everything is ready. Here we make
sure the data (text to be stored) ends in a newline per file convention. Then
we emit an evit to say the file is ready. The actually saving is done
elsewhere as the save command is general and actually saving a file is
specific to the command line. 

The label on f is optional and is useful for debugging. 

The scope link is how we stash the options for later retrieval. The later
retrieval is done by using `options = gcdscope(linkname);`

The emit "waiting for" is part of the reporting mechanism. See 




        var emitname = "for save:" + doc.file + ":" + linkname;

        gcd.scope(linkname, options);
        
        gcd.emit("waiting for:saving file:" + linkname + ":from:" + doc.file, 
             ["file ready:" + linkname, "save", linkname, doc.file, start]);

        var f = function (data) {
            if (data[data.length-1] !== "\n") {
               data += "\n";
            }
            gcd.emit("file ready:" + linkname, data);
        };
        f._label = "save;;" + linkname;


[reporter]() 

Here we make the function that will give the report when a save does not
happen. This is very important. 

The args should be `filename to save, section to wait for`. 

    function (args) {
        var name = this.recording[args[2]] || args[2];
        return "NOT SAVED: " + args[0] + " AS REQUESTED BY: " + args[1] + 
            " NEED: " + name;
    }



### Save

We save it in vars of the document with the name in the link. The href tells
us where to begin. The title gives us options before the first pipe while
after the pipe, we get commands to act on the sections. 

This tacks on a newline at the end of the file data to meet convention.


    function (args) {
        var doc = this;
        var colon = doc.colon;
        var gcd = doc.gcd;
        var savename = doc.colon.escape(args.link);
        var title = args.input;

        _":deal with start"

        var emitname = "for save:" + doc.file + ":" + savename;

        gcd.scope(savename, options);
        

        gcd.emit("waiting for:saving file:" + savename + ":from:" + doc.file, 
             ["file ready:" + savename, "save", savename, doc.file, start]);

         var f = function (data) {
             // doc.store(savename, data);
             if (data[data.length-1] !== "\n") {
                data += "\n";
             }
             gcd.emit("file ready:" + savename, data);
         };
         f._label = "save;;" + savename;
        
         _":process"

    }

[process]() 

     if (title) {
         title = title + '"';
         gcd.once("text ready:" + emitname, f);
        
         doc.pipeParsing(title, 0, '"', emitname, blockhead);

     } else {
        gcd.once("text ready:" + emitname + colon.v + "0", f); 
     }
     
     doc.retrieve(start, "text ready:" + emitname + colon.v + "0");

[deal with start]()

This is dealing with where to start, getting the text. It first comes from the
href, then anything between the first colon and the pipe. 

To get something from another context, one can simply put it after the first
colon.


After the `:` and before the first `|`, that text is trimmed and then sent as options. 
Also, if the name comes out to nothing, then we use the current
block being parsed.  


    var options, start, blockhead, ind;
    if ( args.href[0] === "#") {
        start = args.href.slice(1).replace(/-/g, " ");
    } else {
        start = args.href;
    }
    start = start.trim().toLowerCase();

    ind = title.indexOf("|");
    if (ind === -1) {
        options = title.trim();
        title = "";
    } else {
        options = title.slice(0,ind).trim();
        title = title.slice(ind+1);
    }
    
    if (!start) {
        start = args.cur;
    }

    if (start[0] === ":") {
        start = doc.levels[0] + start;
    }

    blockhead = doc.colon.restore(start);

    if ( (ind = blockhead.indexOf("::")) !== -1)  {
        if (  (ind = blockhead.indexOf(":", ind+2 )) !== -1 ) {
            blockhead = blockhead.slice(0, ind);
        }
    } else if ( (ind = blockhead.indexOf(":") ) !== -1) {
        blockhead = blockhead.slice(0, ind);
    }


    start = doc.colon.escape(start);

[reporter]() 

Here we make the function that will give the report when a save does not
happen. This is very important. 

The args should be `filename to save, section to wait for`. 

    function (args) {
        var name = this.recording[args[2]] || args[2];
        return "NOT SAVED: " + args[0] + " AS REQUESTED BY: " + args[1] + 
            " NEED: " + name;
    }
