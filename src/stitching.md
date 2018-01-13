This is where the main algorithm for transforming the literate program into
something useful. 

    var dp = Doc.prototype;

    dp.retrieve = _"variable retrieval";

    dp.getScope = _"get scope";

    dp.createLinkedScope = _"create linked scope";
     
    dp.indent = _"indent";

    dp.getIndent = _"Figure out indent";

    dp.blockCompiling = _"block compiling";
    
    dp.substituteParsing = _"Substitute parsing";

    dp.pipeParsing = _"Parsing commands";

    dp.regexs = _"Command regexs";

    dp.store = _"Store";


    _"directives::doc prototype"


    dp.findMatchQuote = _"Find match quote";

    dp.argHandlerMaker = _"Basic argument processing:handler maker";

    dp.argEscaping = _"Basic argument processing:escaping";

    dp.argProcessing = _"Basic argument processing";
    
    dp.argFinishingHandler = _"Action for argument finishing";

    dp.whitespaceEscape = _"whitespace escape";

    dp.argsPrep = _"argument prepping";  





## Folder prototype

    Folder.prototype.createScope = _"Create global scope";
    Folder.prototype.subnameTransform = _"Subname Transform";

### Block compiling

This is the actual parsing function. We look for underscores, basically. 

Some tricky bits. 

* We want to escape out underscores with slashes. So slashes
in front of an underscore get replaced in pairs. Note that we will need to
escape any underscores that are nested, i.e. `\_"\_"asd " "`
* We want smart indenting
* We need to replace the substitute. Thinking making an array that gets
  joined. We divide the text. 
* We allow any quote (single, double, backtick) and need it matched.

After each check, if we need to stop, we break out of the if by continuing the
loop. The fragments part of document is where we assemble the pieces of the
code block, but the subsitute part and the part in between. When all the
pieces have settled, we join them as the final step (another event).

This function can also be used as a directive, just send in a text and var
name to store it. This is another way to do multiple substitution runs.

The variable last is where to start from the last match. 

We create a stitch handler for the closures here.

!! REWRITING:  going to eliminate location and frags. Instead, will use
gcd.when ordering to eliminate the need. The first will be the done parsing
event, but after that each one is a text ready keyed to the index. Whenever we
find a substitution block, we emit the indexed string from before, and pass on
the emitname for the block of text. Easy as pi :) If a block substitution is
given, then we also pass an indent as second argument.

Make note of the stitcher function. It has side effects. It sets stitchfrag
and sets up the .when listener. 

    function (block, file, bname, mainblock) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        
        var  quote, place, lname, slashcount, numstr, chr, indent;
        var name = file + ":" + bname;
        var ind = 0;
        var start = 0; 
        var stitchfrag;
        var stitchend = "ready to stitch:" + name;
        gcd.when("block substitute parsing done:"+name, stitchend);
        var n = block.length;

        _"stitching"
              
        var stitcher = function (start) {
            if (start < n) {
                stitchfrag = "stitch fragment:" + name + colon.v + start;
                gcd.when(stitchfrag, stitchend);
            }
        };

        stitcher(0);
        
        while (ind < n) {
            ind = block.indexOf("\u005F", ind);

If index reports no more underscores or if the index is at the end
preventing a quote from happening, then we stop            
            
            if ( (ind === -1) || ( ind >= (n-1) ) ) {
                gcd.emit(stitchfrag, block.slice(start) );
                break;
            } else {
                ind += 1;

                _":check for quote"
                
                _":check for escaped" 

                _":we are a go"
            
                start = doc.substituteParsing(block, ind+1, quote, lname,
                         mainblock);
               
                doc.parent.recording[lname] = block.slice(ind-1, start);
                
                stitcher(start);
                ind = start ;
        
            }
        }


        gcd.emit("block substitute parsing done:"+name);
    }


[check for quote]()


Is the character after the underscore a quote? Can be double or single or
backtick. 

    if (block[ind].match(/['"`]/)) {
        quote = block[ind];
    } else {
        continue;
    }

[check for escaped]()

This implements a countdown escape for getting substitution blocks past early
compiles. For example, if one is using jade for html structure and then has a
block to insert htmlified markdown, one probably wants to have the markdown
inserted after the jade is converted to html. This allows that to happen
smoothly.

Index was already incremented past the underscore, capturing the quote. So we subtract. 

This will determine whether the underscore is escaped. This is done by looking
backwards for a digit or an underscore. Just the first underscore encountered
matters. Some cases:

* `\1_"`  is similar to `\_"` and the block is not seen, yielding `\0_"`
* `\0_"` is the same as `_"` and the block will be run. This is good if you
  actually want `\1?` where the question mark is what is returned from the
  block run. That is `\1\0_"` is the same as `\1_"` if we had no escaping.
* `\2_"` will yield `\1_"` and prime it for more escaping.
* `\\1_"` will yield `\_"` 

And beware lists? No idea what that means. 

When an underscore-quote is found with a numbered escape, then we chunk along
to the next quote, keeping track of further undersscore-quote parts (stack) or
backslash-quote (don't stack). Note that, for now at least, we are ignoring
some more edge cases such as using the given quote within another
underscore-different quote setup or other command stuff. We may revisit this
decision, but remember one can use the unicode insertion within  arguments for
the quote in question so it should still allow for full expression. 


    place = ind-2;
    numstr = '0123456789';
    slashcount = '';
    chr = block[place];
    if (chr === '\\' ) { //escaped underscore; no escaping backslash!
        gcd.emit(stitchfrag, block.slice(start, place) + "\u005F" );
        start = ind;  
        stitcher(start);
        continue;
    } else if ( numstr.indexOf(chr) !== -1 ) {
        slashcount += chr;
        place -= 1;
        chr = block[place];
        while ( numstr.indexOf(chr) !== -1 ) {
            slashcount += chr;
            place -= 1;
            chr = block[place];
        }


We are definitely in the stage of an escape situation if we have a number
preceded by a backslash. The number needs to be
positive. It will then decrement and print out a backslash and number escape,
including 0.

We emit two string blocks if the count is positive, one before the slash, and
one after the underscore to the matching quote for the escaped underscore quote.

        if (chr === '\\') {
            slashcount = parseInt(slashcount, 10);
            if (slashcount > 0) {
                slashcount -= 1;

                gcd.emit(stitchfrag, block.slice(start, place) + "\\" +
                     slashcount + "\u005F");

                stitcher(place); 
                start = doc.findMatchQuote(block, quote, ind+1); //+1 to get past quote
                // yes this is supposed to be reversed (from quote to quote,
                // start is just beyond quote 
                gcd.emit(stitchfrag, block.slice(ind, start)); 
                
                stitcher(start); 
                ind = start;
                continue;

So with slashcount 0, this is not escaping except for the escape. 

            } else {
                gcd.emit(stitchfrag, block.slice(start, place));  
                start = ind-1; // underscore
                stitcher(start-2); //to point to where the escape sequence 
            }
        }
    }
    


[we are a go]()

So at this point we know we have the start of a sub command. So we process
forward. In part, this means cutting up the previous string for loc. We reuse
the place variable as ind-1, the place of underscore

When the text ready for the location is emitted, we plug it into the array and
then alert the waiting. 

Note that name contains the file name, but after event parsing, the file gets
split off.

    place = ind-1;
    if (start !== place ) { // \0 could have happened
        gcd.emit(stitchfrag, block.slice(start, place)); 
        start = place; // underscore
        stitcher(start);
    }
    lname = name + colon.v + start;
    gcd.flatWhen("text ready:" + lname, stitchfrag);  

    if (place > 0) {
        indent = doc.getIndent(block, place);
        if ( indent > 0 ) {
            gcd.when("indent for prior:" + lname, stitchend);
            gcd.emit("indent for prior:" + lname, doc.getIndent(block, place));
        }
    }



### Stitching

Here we stitch it all together. Seems simple, but if this is a minor block,
then we need to run the commands if applicable after the stitching. 



    gcd.once(stitchend, function (data) {
        
        var text = '', insert, i, n = data.length;
        var indent = doc.indent;

        _":unpack and stitch"         

        if (bname.indexOf(colon.v) !== -1) {
            gcd.emit("minor ready:" + name, text);
        } else {
            doc.store(bname, text);
            gcd.emit("text ready:" + name, text);
        }
    });

[unpack and stitch]()

The data should have the first one be ignored (just done parsing), then the
next ones will be string to insert. It is possible to have the indents
following it, which we need to check. We can see by the event name. 

We start at `i=1` to skip over the first irrelevant data.


    for (i = 1; i < n; i += 1) {
        insert = data[i][1];
        if ( (i+1 < n) && ( data[i+1][0].slice(0,6) === "indent") ) {
            text += indent(insert, data[i+1][1], gcd);
            i += 1; 
        } else {
            text += insert;
        }

    }


### Find match quote

We need to find the matching quote to an escaped underscore. We need to take
into account underscore-quote pairs and backslash-quotes. This is currently
leaving open some edge cases, but maybe that's okay. 

    function (text, quote, ind) {
        var char;
        var n = text.length;
        var level = 0;

        while ( ind < n) {
            char = text[ind];
            ind += 1;
            if (char === quote) {
                if ( level === 0)   {
                    break;
                } else {
                    level -= 1;
                }
            } else if (char === '\u005F') {
                if (text[ind] === quote) {
                    level += 1;
                    ind += 1;
                }

            } else if (char === "\\") {
                if ( text[ind] === quote) {
                    ind += 1;  // skip over the quote
                }
            }
        }

        return ind;
    }


## Figure out indent

What is the indent? We need to find out where the first new line is and the
first non-blank character. If the underscore is first, then we have an indent
for all lines in the end; otherwise we will indent only at the end. 

The if checks if we are already at the beginning of the string; if not, we
look at the character. first is first non-blank character. 

Our goal is to line up the later lines with the first non blank character
(though usually they will have their own indent that they carry with them). 


    function ( block, place ) {
        var first, backcount, indent, chr;
        first = place;
        backcount = place-1;
        indent = 0;
        while (true) {
            if ( (backcount < 0) || ( (chr = block[backcount]) === "\n" ) ) {
                indent = first - ( backcount + 1 ); 
                break;
            }
            if (chr.search(/\S/) === 0) {
                first = backcount;
            }
            backcount -= 1;
        }
        return indent;
    }

### Indent

We need a simple indenting function. It takes a text to indent and returns
text indented (after first line).

    function (text, indent, gcd) {
        var line, ret;
        var i, n;
        
        n = indent;
        line = '';
        for (i = 0; i <n; i += 1) {
            line += ' ';
        }
        
        if (typeof text !== "string") {
            gcd.emit("error:indent does not see a text item", text);
            return ret;
        }

        ret = text.replace(/\n/g, "\n"+line);
        return ret;
    }


## Substitute parsing


This is fairly simple. We want to crunch along until we find a pipe or hit the
ending quote or run-off the end of the string (shouldn't happen; we emit an
event and stop subbing).  The
text taken is the variable, after being trimmed. 

The index is already pointing to the quote.  

The pipe parser is synchronous. It queues up all the commands based on
the
text being ready.

So there are a lot of names going on here. There is `name` which is the block
name, `lname` which is the block name plus the location added, then there is
`subname` which is the reference to the variable being subbed in. But there
might be no `subname` if it is a direct command evaluation. Each text is
stored in its respective structure in the docs.

An empty subname will retrieve an empty text from the document. 

The events are scoped by numbers using tripe colon as separator. Note the
colon itself is the event separator. 

The `.when` supplies the data of the events called in an array in order of the
emitting. The array is specifically `[ [ev1, data1], [ev2, data2]]` etc. 

The numbering of the commands is the input into that command number, not the
output. So we use subname to get the text from that location and then feed
it into command 0. If there are no commands, then command 0 is the done bit. 

!!! REWRITING, using index for placements. This is a sequential stepping through
of the texts, but it is still good to do .whens, I think. This allows one to
inspect the whole transformation and to see which part stopped the process. So
we need to create an event that will be .when'd and then it will emit the last
text as being ready. 

Also realizing that the .whens are being tracked (gcd.whens) and so we can use
that in our reporting instead of yet another mechanism for it. 

    function (text, ind, quote, lname, mainblock ) { 

        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;

        var match, subname, chr, subtext;
        var subreg = doc.regexs.subname[quote];

        var doneEmit = "text ready:" + lname; 
        var textEmit = doneEmit + colon.v + ind;
        var subEmit = "substitution chain done:" + lname; 

        gcd.when(textEmit, subEmit);

        gcd.once(subEmit, _":subemit handler");

        subreg.lastIndex = ind;
        
        match = subreg.exec(text);
        if (match) {
            _":got subname"
            _":past subname"
        } else {
            gcd.emit("failure in parsing:" + lname, ind);
            return ind;
        }
     

        if (subname === '') { // no incoming text, just commands acting
            gcd.emit(textEmit, '');
        } else {
            subtext = doc.retrieve(subname, textEmit);
        }

        return ind;

    }


[got subname]()


    ind = subreg.lastIndex;
    chr = match[2];
    subname = doc.convertHeading(match[1]);
    subname = doc.subnameTransform(subname, lname, mainblock);
    subname = colon.escape(subname);

[past subname]()

If there is a pipe, process out commands. If a quote, we're done. Otherwise,
we have a problem. 


    if (chr === "|") {
        ind = doc.pipeParsing(text, ind, quote, lname, mainblock, subEmit,
            textEmit );
    } else if (chr === quote) {
        // nothing to do; it should automatically work !!!
    } else {
        gcd.emit("failure in parsing:" + lname, ind);
        return ind;
    }


[subemit handler]()

The data will be a series of steps in the process and we just want the last
one. To debug, one might want to attach a listener for this event and get the
full train of transformations.

!!! We could check that it is text at this stage. 

    function (data) { 
        gcd.emit(doneEmit, data[data.length-1][1] || '');
    } 



### Subname Transform

This takes a subname and transforms it based on where it is relative to the
document. We use a hack to get the mainblock name. This works for lnames of
the form `file:main\:...` that is, everything between the first colon and
the first escaped colon will be returned as mainblock.

    function (subname, lname, mainblock) {
        var colind, first, second, main;
        var doc = this;
        var colon = doc.colon;
        
        var reg = /\s*\:\s*/g;
        subname = subname.replace(reg, ":");

        _":fix colon subname"

        _":h5 transform"
       
        return subname;

    }

[slicing]() 

This slices the mainblock. It is used repeatedly in the if's to minimize the
need to do this if it is not going to be used. 

So the name variable should start with a file name with a colon after it and
then from there to a triple colon should be the major block name on record. 


    if (mainblock) {
        //console.log(mainblock)
    } else {
        colind = lname.lastIndexOf(":");
        mainblock = lname.slice(colind+1, lname.indexOf(colon.v, colind));
    }


[fix colon subname]()

A convenient shorthand is to lead with a colon to mean a minor block. We need
to put the big blockname in for that. 

If the subname is simply a colon, then we use the major block heading on
record for it. 

Directives require a bit of finesse. See the save directive for how it handles
it. Basically, it uses the starting href as the mainblock. That is why
mainblock is being passed in everywhere. 



    
    if (subname[0] === ":") {
        _":slicing"
        if (subname === ":") {
            subname = mainblock;
        } else {
            subname = mainblock + subname;
        }
        return subname;
    } 




[h5 transform]()

Here we want to implement the h5 and h6 path shortcuts of `.` and `..`

We have a hierarchy that can be `a/b/c` and if we are at the `c` level, then
we want to be able to back up. This function will take in the varname and the
name of the block being processed and return the transformed varname. For the
`..` changes, we need to figure out whether to include the "/" or not at the
end. For the `.`, we need the colon or a slash to avoid recrusion. 

    if (subname.slice(0, 6) === "../../" ) {
        //in a/b/c asking for a
        _":slicing"
        main = mainblock.slice(0, mainblock.indexOf("/")); 
        if ((subname.length > 6) && (subname[6] !== ":") ) {
            subname =  main + "/" + subname.slice(6);
        } else {
            subname = main + subname.slice(6);
        }
    } else if (subname.slice(0,2) === "./" ) {
        // in a/b asking for a/b/c using ./c
        _":slicing"
        if (subname[2] === ":" ) {
            subname = mainblock + subname.slice(2);
        } else {
            subname = mainblock + "/" + subname.slice(2);     
        }
    } else if (subname.slice(0,3) === "../") {
        //either in a/b or in a/b/c and asking for a or a/b, respectively
        _":slicing"
        first = mainblock.indexOf("/");
        second = mainblock.indexOf("/", first+1);

        if (second !== -1) {
            // a/b/c case
            main = mainblock.slice(0, second);
        } else {
            main = mainblock.slice(0, first);
        }

        if ((subname.length > 3) && (subname[3] !== ":") ) {
            subname = main + "/" + subname.slice(3);
        } else {
            subname = main + subname.slice(3);
        }

    }


## Parsing commands

Commands are the stuff after pipes. 

A command is a sequence of non-white spaced characters followed by a white
space plus arguments or pipe.  The arguments are comma separated values that
are either the literals to be passed in as argument values or are
substitutions (underscore quote stuff) whose output is passed in as an
argument. A backslash will escape a comma, underscore, or other backslash. 

We assume we are given a piece of text with a starting position that comes
after the first pipe. We are also given a name that we attach the command
positions to as we go along. Also the ending quote must match the initial one
so we are passed in that quote as well.

We need to track the command numbering for the event emitting. 

    function (text, ind, quote, name, mainblock, toEmit, textEmit) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
       
        var incomingEmit = textEmit;

        var chr, match, command, 
            comname, start;
        var n = text.length;
        var comreg = doc.regexs.command[quote];


        while (ind < n) { // command processing loop

            _":get command"

            gcd.emit("command parsed:" + comname, 
                [doc.file, command, "text ready:" + comname ]);

            if (text[ind] === quote) {
                break;
            } else if (text[ind] === "|") {
                start = ind += 1;
            } else {
                doc.warn("parsing cmd", "bad terminating character in command " + 
                    name, [start, ind, text[ind]]);
            }

        }
        

        return ind+1;

    }


[get command]()

So we just chunk along and deal with some cases. The quote at the end
terminates the loop as the substitution is done. A pipe indicates that we move
onto the next command; no arguments. A space indicates we move onto the
argument phase.

The .whens are setup to track the command being done parsing (sync), the
arguments being done, and the input (that's the text ready). For the command
name being parsed emission, we send along the doc, command and the nextname to
be sent along. 

Commands are case-insensitive just as block names are as well as being
trimmed.

This generates having the input text first, the file and command name second,
and then the rest of the arguments. The next one in the line will
automatically receive the previous bit as the incoming text. 

    comreg.lastIndex = ind;
    start = ind; 

    match = comreg.exec(text);
    if (match) {
        command = match[1].trim();
        chr = match[2];
        ind = comreg.lastIndex;
        if (command === '') {
            command = "passthru";    
        }
        command = colon.escape(command);
        comname = name + colon.v + start;

        gcd.once("arguments ready:" + comname, 
            doc.argFinishingHandler(comname));

        gcd.when([incomingEmit, 
                  "command parsed:" + comname ],
            "arguments ready:"  + comname );

        gcd.when("text ready:" + comname, toEmit);

        incomingEmit = "text ready:" + comname;

        _":post command"

    } else {
        gcd.emit("error:command parsing:" + name + colon.v + ind);
        return ind+1;
    }

[post command]() 

We either see a terminating quote, a pipe for the next command, or we need to
process arguments. 

    if (chr === quote) {
        ind -= 1; // it is set to just after the last position 
        gcd.emit("command parsed:" + comname, 
            [doc.file, command, "text ready:" + comname ]);
        break;

    } else if (chr === "|") {
        ind -= 1; // this is so the pipe is seen next
    } else {
        ind = doc.argProcessing(text, ind, quote, comname, mainblock );
    }


### Basic argument processing

This is the basic argument processor. It chunks along looking for commas to
separate the arguments, it replaces substitute strings, has escapes with a unicode gobbler,
looks for an end quote or a pipe. This the default for any command that does
not specify a different argument processor. This also allows for `name(.. ,
..., ..)` constructs embedded as arguments. That is, parentheses next to a
word generates a function type of call. It is expected that these commands are
recognized by the function, which is part of the command's properties
("commands" property). We also allow square bracket and curly brackets to make
commas not be arguments, but nothing else is used about it; we simply track
the stack. The same is true about quotes, except for the needed quote unless
already in a stack. 

Example:  `great, jack(hello, _"goodbye", "7,7"), [3, 4, jane("bye, Joe")]`
leads to argument array `['great', jack's return with hello, the subsitute
goodbye, and "7,7" stuck in it, and then the third bit is the literal
argument; no arguments or commands put in`. In particular, jane is not
considered a command. Is that reasonable? Presumably that should reduce
unintentional conflicts and allow for passing in stuff to another level. 

In terms of what the function would do immediately, it would emit the first
and third arguments immediately. For the jack command, it would first setup
waiting for the substitute to callback. After its arguments are assembled, it
would hook evaluate jack in the command's context, passing in the return
value. The subcommands can be async as well as defined later. It all waits. 

The input into this is the block of text, starting position, name to build on
and call when done, and the special quote, and the command name and the
mainblock to use in the case of switch. The context
is doc, as usual.  The output is the new position pointing to whatever
terminated the argument processing (pipe or quote). 

The start variable tracks the start of the argument. It starts as the
beginning index, but for each next argument, it changes. 

The args array holds the bits that will be passed. These are mostly strings,
but for the parenthetical commands, it will be an array whose first entry is
the command and the arguments fill the rest. Note that the command arguments
themselves might have commands. These should be resolved first and the output
is then the argument into the outer command. 

The breaks will lead to an index + 1; continues mean the index is adjusted
within the case which is pretty much the escaping.

The commas are arguments only if the current mode (stack) is nothing or a
command parenthesis. 

The whitespace before and after an argument is ignored. That is, the string is
trimeed. To get whitespace, the following cumbersome method could be used
`c(stuff, s("   "))`. This will concatenate stuff and the whitespace, stripping the
quote. Or one can use backslash to escape.  

We return the index at the end. If we hit a terminating character, such as a
pipe, we finish the argument, if any, and then return. 

Underscores only trigger substitution if it is first in an argument, after
whitespace. 

We advance start until the first non-whitespace character.

The argdone flag is set true after a command parenthesis finishes or a
substitution. If true, when an argument finishes (pipe, comma, substitute end
quote), then it does not add an argument; if there is something, it emits an
error. The text ready event is handled elsewhere. But we always pop a level.    

We have coming into this a .when that is waiting for the parsing to be done;
this is `arguments ready`.
For each argument, we add to this .when parsing starting at the index. When
done with an argument, we emit that it is `text ready` if it was just a string. If it
is not so simple, then we emit the `text ready` when it is ready.

This should return an index pointing to a pipe (another command) or to a
matching quote from the substitution. 

This is linked to in doc prototype under name argProcessing

    function (text, ind, quote, topname, mainblock) {
        var doc = this;
        var gcd = doc.gcd;
        var n = text.length;
        var stack = [];
        var name = [topname];
        var emitname = topname;
        var colon = doc.colon;
        var argstring = '';
        var curname;
        var err;
        var temp;
        var start = ind;
        var cp = "c\u0028";  // c parentheses
        var argdone = false;
       
        var handlerMaker = doc.argHandlerMaker;

        var whenIt = function () {
            name.push(start); 
            curname =  name.join(colon.v);
            gcd.when("text ready:" + curname, "arguments ready:" + emitname);
        };


        var wsreg = /\S/g;

        _":fast forward to non-whitespace"

        
        while ( ind < n ) {

            switch (text[ind]) {

                case "\u005F" :  // underscore
                    if ( (start === ind) &&
                         ( "\"'`".indexOf(text[ind+1]) !== -1 ) ) {
                        _":argument substitution"
                        _":fast forward to non-whitespace"
                        continue;
                    } else {
                        argstring += "\u005F";
                    }
                break;
               
                case "," : 
                    if ( (stack.length === 0 ) || (stack[0] === cp) ) {
                        _":arg done"
                        ind += 1;
                        _":fast forward to non-whitespace"
                        continue;
                    } else {
                        argstring += ",";
                    }
                break;
                
                case "\\" :  
                    temp = doc.argEscaping(text, ind+1);
                    argstring += temp[0];
                    ind = temp[1];
                continue;

                case "|" :
                    if (stack.length === 0) {
                        // make sure there is an argument
                        if (argstring.trim()) {
                            _":arg done"
                        }
                        return ind;
                        
                    } else {
                        argstring += "|";
                    }   
                break;


                _":groupings"

                _":quote"

To avoid the quotes as arguments from being caught in what I am doing here, I
use unicode sequences. The double quote, however, I don't want to sub directly
because I use double quotes as the quoting. So the unicode substitution is
being done in the code itself, not the litpro compiling for the double quote
itself.

                _":quote| sub \u0027, \\u0022"

                _":quote | sub \u0027, \u0060"

If not otherwise used, the text gets added to argstr. 

                default: 
                    argstring += text[ind];
                    


            }

            ind +=1;

        }
        
        return ind;

    }


[arg done]() 

Here we have an argument terminating character. If the argument was already
done (command parentheses, substitution), then the argdone is true and we
simply move on, checking to see if argstring is empty. 

If argdone is false, then we have a simple string and we emit it. 

    if (argdone) {
        if (argstring !== "") {
            err = [argstring, text[start], text[ind], start, ind];
            _":report error | sub MSG, stuff found after argument finished"
            argstring = "";
        }
        argdone = false;
        name.pop();
        start = ind+1;

    } else { // simple string
        whenIt();
        gcd.emit("text ready:" + curname, doc.whitespaceEscape(argstring.trim()));
        name.pop();
        argstring = "";
        start = ind + 1;
    }
    


[argument substitution]()

Need to call in the substituion process. It will lead to the emitting of a
text ready event which will contain the text to be put into the emitname's
arguments.  

    whenIt();
    temp =  doc.substituteParsing(text, ind+2, text[ind+1], curname, mainblock);
    
    if ( temp === text.length) {
        //error
        err = [curname];
        _":report error | sub MSG, substitution consumed rest of block"
        return temp;
    } else {
        ind = temp;
    }
 
    argstring = '';
    argdone = true;



[shift]()

This is just dealing with the popping.

    if (stack[0] === LEFT) {
        stack.shift();
    }
    argstring += RIGHT ;


[groupings]()

This deals with the grouping characters (brackets ...)  The parentheses can be
grouping unless it matches the command syntax. 

        case "[" : 
            stack.unshift("[");
            argstring += "[";
        break;

        case "]":
            _`:shift | sub LEFT, "[", RIGHT, "]"`
        break;

        case "(" :
           _":check for cparen" 
        break;
        
        case ")" :
            if (stack[0] === cp) {
                _":close cparen"
            } else {
                _`:shift | sub LEFT, "(", RIGHT, ")"`
            }
        break;

        case "{" :
            stack.unshift("{");
            argstring += "{";
        break;

        case "}" :
            _`:shift | sub LEFT, "{", RIGHT, "}"`
        break;

[check for cparen]()

We want to ensure that there is a command (one word) associated with the parentheses. If
there is no command, then it is just parentheses. Space is allowed between
word and parentheses. 

It needs to either be the top level or in a command plus argstring is made of
non-whitespace and at least one character. If so, then it is a command.

We need to setup a .when to execute when the command is all assembled. But we
also need to add to the .when for the current emitname.

The .when data stream to the next argument should be of the form 
`[[command parsed, null], [command is, command name], [text ready, string for
arg1 || command array ], ....]` In the handler, we unpack this to emit
`[cmdname, arg1, arg2, ....]` 

Let's say that we have emitname1 from elsewhere. We hit a command which starts
at 30. We should
have already set it up to the .when for emitname1 by the time we know it is a
command. Now we have a command. We enter it at say character 35 (just after
parentheses). So character 35 is a new argument. It attaches to arguments
ready:emitname1:35. It fires when it is ready.  We have three names. We
first attach when to current emitname and the current name is the
command level.  

    //make sure no whitespace to be a command
    // also make sure either top level or in cp
    if ( ( (stack.length ===0) || (stack[0] === cp) ) && 
         (argstring.search(/^\S+\s*$/) !== -1) ) {
        
        stack.unshift(cp);
        whenIt(); 
        emitname = curname;
        gcd.once("arguments ready:" + emitname, handlerMaker(emitname, gcd));
        gcd.when(["arg command parsed:" + emitname, "arg command is:" + emitname], "arguments ready:" + emitname);
        gcd.emit("arg command is:" + emitname, argstring.trim());
        argstring = '';
        ind += 1;
        _":fast forward to non-whitespace"
        continue;
    } else {
        stack.unshift("(");
        argstring += "(";
    }

[handler maker]()

This makes a handler with emitname embedded in it. This provides the
argument data.  

        function (name, gcd) {
            var f = function (data) {
                var ret = [data[1][1]]; //cmd name
                var args = data.slice(2);
                args.forEach(function (el) {
                    ret.push(el[1]);
                });
                ret.sub = true;
                gcd.emit("text ready:" + name, ret);
            };
            f._label = "arg command processing;;"+name;
            return f;
        }


[close cparen]()

We have a closing parentheses that was started by a command. So we finish the
argument and then we emit that the command was done being parsed. And then we
restore the emitname to the previous level. 

    stack.shift();
    _":arg done" //  the last argument is popped
    gcd.emit("arg command parsed:" + emitname);
    emitname = name.slice(0, -1).join(colon.v);
    argdone = true;
    argstring = '';
    ind += 1;
    _":fast forward to non-whitespace"
    continue;
    


[quote]()

Quoted passages are very simple. Once a quote is found, we regex to the next
quote of that kind. There are no escapes. In particular, a quote cannot be
embedded in its own quote style. The return includes the quotes. 

If a quote is found when stack has length 0, then it is checked to see if it
matches the sub quote. If stack has stuff on it, it will not close the
substitution. 

Each quote is the same except which character is under consideration. So we
will write this once and use the sub.  


    case "'" :
        if ( (stack.length === 0) && (quote === "'") ) {
            if (argstring.trim()) {
                _":arg done"
            }
            return ind;
        } else {
            // start after current place, get quote position
            temp = text.indexOf("'", ind+1)+1;
            if (temp === -1 ) { 
                err = [start, ind, temp];
                _":report error | sub MSG, non-terminating quote"
                argstring += "'";
            } else {
                argstring += text.slice(ind, temp);    
                ind = temp;
                
                continue;
            }
        }
    break;


[fast forward to non-whitespace]()

This little snippet advances start and ind to the first non-whitespace
character. This should always be found. 


        wsreg.lastIndex = ind;
        if (wsreg.test(text) ) {
            start = ind = wsreg.lastIndex - 1;
        } else {
            ind = text.length;
            err = [start, ind];
            _":report error | sub MSG, 
                argument is just whitespace with no terminating"
            return;
        }


[report error]() 

This reports the error. 

    gcd.emit("error:" + topname, [err, "MSG"]);


[escaping]()

This is a function that does the escaping. It is attached to doc as
`doc.argEscaping`

It takes in a text and an index to examine. This default function escapes
backslashes, underscores, pipes, quotes and

* u leads to unicode sucking up. This uses fromCodePoint
* n converted to a new line. 

There is no need to escape whitespace as whitespace is preserved now. 

If none of those are present a backslash is returned. 

We return an object with the post end index in ind and the string to replace
as chr.

Note that with commonmark, `\_` will be reported as `_` to the lit pro doc.
That is in commonmark, backslash underscore translates to underscore. So to
actually escape the underscore, we need to use two backslashes: `\\_`.


    function (text, ind ) {
        var chr, match, num;
        var uni = /[0-9A-F]+/g;
        var indicator = this.indicator;

        chr = text[ind];
        switch (chr) {
        case "|" : return ["|", ind+1];
        case '\u005F' : return ['\u005F', ind+1];
        case "\\" : return ["\\", ind+1];
        case "'" : return ["'", ind+1];
        case "`" : return ["`", ind+1];
        case '"' : return ['"', ind+1];
        case "n" : return [indicator + "\n" + indicator, ind+1];
        case "t" : return [indicator + "\t" + indicator, ind+1];
        case " " : return [indicator + " " + indicator, ind+1];
        case "," : return [",", ind+1];
        case "u" :  _":unicode"
        break;
        default : return ["\\", ind];

        }
    }



[unicode]()

This handles the unicode processing in argument strings. After the u should be
a hexadecimal number. If not, then a backslash is return and processing starts
at u. 

If it cannot be converted into a unicode, then the backslash is returned and
we move on. No warning emitted. 

    uni.lastIndex = ind;
    match = uni.exec(text);
    if (match) {
        num = parseInt(match[0], 16);
        try {
            chr = String.fromCodePoint(num);
            return [chr, uni.lastIndex];
        } catch (e)  {
            return ["\\", ind];
        }
    } else {
        return ["\\", ind];
    }

### Whitespace Escape

This escapes whitespace. It looks for indicator something indicator and
inserts. 

    function (text) {
        var indicator = this.indicator;
        var n = indicator.length, start, end, rep;
        while ( (start = text.indexOf(indicator) ) !== -1 ) {
            end = text.indexOf(indicator, start + n);
            rep = text.slice(start+n, end);
            if (rep === "n") {
                rep = "\n";
            }
            text = text.slice(0, start) + rep + text.slice(end+n);
        }
        return text;

    }

     



### Command Regexs

We have an object that has the different flavors of gobbling regexs that we
need. The problem was the variable quote. I want to have statically compiled
regexs and so just stick them in an object and recall them based on quote.
With just one variable changing over three times, not a big deal. 

For commands, these are non-whitespace character strings that do not include
the given quote or a pipe. There is no escaping. 
The regex ignores the initial whitespace returning the word
in 1 and the next character in 2. A failure to match should mean it is an
empty string and the passthru can be used. 

Using `.` in the regex is a problem because newline should be consumed as
well. So we use (\S|\s)

    {

        command : {
            "'" : /\s*([^|'\s]*)([\S\s])/g,
            '"' : /\s*([^|"\s]*)([\S\s])/g,
            "`" : /\s*([^|`\s]*)([\S\s])/g
        },

The argument is anything up to a comma, pipe, underscore, or the special
quote. It ignores initial whitespace. In 1 is the straight text, if any, and
then in 2 is the character to signal what to do next (quote ends processing,
pipe ends command, comma ends argument, underscore may initiate substitution,
and slash may initiate escaping).


! These don't seem to be used???

        argument : {
            "'" : /\s*([^,|\\']*)([\S\s])/g,
            '"' : /\s*([^,|\\"]*)([\S\s])/g,
            "`" : /\s*([^,|\\`]*)([\S\s])/g
        },
        endarg : {
            "'" : /\s*([,|\\'])/g,
            '"' : /\s*([,|\\"])/g,
            "`" : /\s*([,|\\`])/g

        },

And a super simple subname is to chunk up to pipes or quotes.

        subname : {
            "'" : /\s*([^|']*)([\S\s])/g,
            '"' : /\s*([^|"]*)([\S\s])/g,
            "`" : /\s*([^|`]*)([\S\s])/g
        }


    }



## Scope

Okay, this is a pretty important part of this whole process. The scope is the
bit before the double colons. Fundamentally, a new document is put under the
scope of its path/filename. But it can have other names because using filenames is
a bit annoying at times. 

The big question is whether these nicknames are local to a single document or
glboal across all documents being parsed together. At first, I was going to do
local names, but I think there shall be just one universal set of scope names.
If you want a local scope, consider prefixes. Multiple global scope names can
reference the same underlying scope. 

The basic use of scopes is to store and retrieve variables. Given a scope
name, we look it up in the scopes object. If the key exists, then it will
point to either the fundamental object or to another key. If an object is
found, then we either store the variable or, if retrieving, we take it if
it exists and flag it if it does not exist. 

If a scope name does not exist, then we wait until it does exist and then
proceed through the chain again.  

### Store

This stores some text under a name. If the name has double colons, then it
will get that scope and put it there.

If the variable already exists in the scope, then after saving it to the new
location, this fact gets emitted with the old and the new. 

    function (name, text) {
        var doc = this;
        var gcd = doc.gcd;
        var scope = doc.getScope(name);

       
        var f;
        if (! scope[0]) {
            _":non-existent"
            return;
        }

        var varname = scope[1];
        var file = scope[2];
        scope = scope[0];

        var old; 
        if (scope.hasOwnProperty(varname) ) {
            old = scope[varname];
            if (text === null ) {
                delete scope[varname];
                gcd.emit("deleting existing var:" + file + ":" + varname, 
                    {oldtext: old});
            } else {
                scope[varname] = text;
                gcd.emit("overwriting existing var:" + file + ":" + varname, 
                {oldtext:old, newtext: text} );
            }
        } else {
            scope[varname] = text;
            gcd.emit("text stored:" + file + ":" + varname, text);
        }
    }

[non-existent]()

This deals with the situation that the scope is not yet in a state for
existence. Essentially, it sets up a listener that will store and emit once
the scope exists. 

Scope is of the form `[null, varname, alias]`

    gcd.emit("waiting for:storing:" + doc.file + ":" + name,
        ["scope exists:" + scope[2], "scope exists",  scope[2],
        doc.file, scope[1] ]);
    f = function () {
        doc.store(name, text);
    };
    f._label = "Storing:" + doc.file + ":" + name;
    gcd.once("scope exists:" + scope[2], f);


### Variable retrieval

This function retrieves the variable either from the local document or from
other scopes. 

The local variables are in the vars object, easily enough. The scopes refer to
var containing objects of other documents or artificial scopes. Note that one doc 
can name the scopes
potentially different than other docs do. Directives define the scope name
locally. Also note that scopes, even perfectly valid ones, may not exist yet.

If either the scope does not yet exist  or the variable does not exist, then
we wait for listeners. The second argument is either a callback function or an
event string to emit. The variable is not returned. 

If the scope does not exist yet, then we wait until it does and call this
again. 

Returning undefined is good and normal.

    function (name, cb) {
        var doc = this;
        var gcd = doc.gcd;

        var scope = doc.getScope(name);


        var varname = scope[1];
        var file = scope[2];
        scope = scope[0];
        var f;
        _"debugging::var tracking:need var"
        if (scope) {
            if (scope.hasOwnProperty(varname) ) {
                _"debugging::var tracking:has var"
                _":callback handling"
                return ;
            } else {
                _":no var"
                return ;
            }
        } else {
            _":no scope"
            return ;
        }
    }

[callback handling]()

Here we handle the callbacks. If it is a function, we call it with the
variable. If it is a string, we assume it is an emit string and emit the
variable name with it. Anything else is unhandled and is an error. 


    if (typeof cb === "function") {
        cb(scope[varname]);
    } else if (typeof cb === "string") {
        gcd.emit(cb, scope[varname]);
    } else {
        gcd.emit("error:unrecognized callback type:" +
            doc.file + ":" + name, (typeof cb) );
    }

[no scope]()

If there is no scope yet of this kind, then we listen for it to be defined and
linked. The file var there is poorly named; it is the link name of the scope
since the actual global scope name is not known. 

    gcd.emit("waiting for:retrieval:" + cb+ "need:" + name, 
        ["scope exists:" + file, "scope exists",  file, doc.file, varname,
        true]);
    f = function () {
        doc.retrieve(name, cb);
    };
    f._label = "Retrieving:" + doc.file + ":" + name;
    gcd.once("scope exists:" + file, f);



[no var]() 

In this bit, we have no variable defined yet. So we need to listen for it. We
will get triggered

    gcd.emit("waiting for:retrieval:" + doc.file, 
        ["text stored:" + file + ":" + varname, "retrieval", file, varname]);
    f = function () {
        doc.retrieve(name, cb);
    };
    f._label = "Retrieving:" + file + ":" + varname;
    gcd.once("text stored:" + file + ":" + varname, f);


### Get Scope

This is the algorithm for obtaining the scope from a name of the form
`scopename::varname`. It will return an array of the form `[scope, varname, filename]`.

The filename is what the local scope points to. The scope is the actual object
that the variable names are the keys of and varname is the key that will be in
the object. Note we say filename as the scopes are probably likely to be other
docs, but they need not be. One can create global scopes with arbitrary names. 

So when a scope is requested, it may not have been linked to yet or it may not
exist yet. In fact, if it does not exist, it will not be linked to. So we only
need to worry about the linking case. 

The while loop will iterate over possible alias --> alias --> ... --> scope.
This chain should only happen when all are established. 


    function (name) {
        var ind, scope, alias, scopename, varname;
        var doc = this;
        var colon = doc.colon;
        var folder = doc.parent;

        if (  (ind = name.indexOf( colon.v + colon.v) ) !== -1 ) {
            alias = name.slice(0,ind);
            varname = name.slice(ind+2);
            _":check for empty main | sub name, varname"
            scopename = doc.scopes[ alias ];
            if (typeof scopename === "string") {
                while ( typeof (scope = folder.scopes[scopename]) === "string") { 
                    scopename = scope;   
                }
                if (scope) {
                    return [scope, varname, scopename]; 
                } else { //this should never happen
                    doc.gcd.emit("error:non-existent scope linked:" + 
                        alias, scopename);
                }
            } else if (scopename) { //object -- alias is scope's name
                return [scopename, varname, alias];
            } else { // not defined yet
                return [null, varname, alias];
            }
        } else { //doc's scope is being requested
            _":check for empty main"
            return [doc.vars, name, doc.file];
        }
    }

[check for empty main]()

It is possible that one wants to reference a top unnamed block. The varname that
this, and its minors, are stored under is `^`. Instead of typing that, we
check for an empty heading.

First if the name is empty:

    if (name.length === 0) {
        name = "^";

Then if it is just a minor. Probably happens with a callout to another file.

    } else if (name[0] === colon.v ) {
        name = "^" + name;
    }


### Create Global Scope

This is the function on the folder that creates a scope. This creates the vars
object on a doc as well as creates stand alone scopes. If a scope with a name
already exists, it returns that scope. If the scope is a string, then this is
a reference and I am considering that an error. An error is emitted and a new
object is created. 

    function (name) {
        var folder = this;
        var gcd = folder.gcd;
        var scopes = folder.scopes;
        var colon = folder.colon;

        name = colon.escape(name);

        if (! scopes.hasOwnProperty(name) ) {
            scopes[name] = {};
            gcd.emit("scope created:" + name);
            gcd.emit("scope exists:" + name);
        } else if (typeof scopes[name] === "string") {
            gcd.emit("error:conflict in scope naming:" + name);
            scopes[name] = {};
        }

        return scopes[name];
    }

[reporter]()

This deals with scope existing. 

    function (data) {
        if (data[3]) {
            return "NEED SCOPE: " + data[0] + " FOR RETRIEVING: " + data[2] + 
                " IN FILE: " + data[1]; 
        } else {
            return "NEED SCOPE: " + data[0] + " FOR SAVING: " + data[2] + 
                " IN FILE: " + data[1]; 
        }
    }
    


### Create Linked Scope

This is where we go to create scopes. It creates an alias to another scope. It
does not create a new scope. This is different than loading another litpro doc.

We check for whether the alias is defined or not. If it is not, then we link
it to the scope under the name. If that linked scope does not exist, we wait
to link to it until after it does exist. If two scopes try to link to each
other, this should result in nothing happening which is better than looping
repeatedly.    

Anyway, if the alias is defined already, then we check that it is a string
that corresponds to the name. If not, we issue an error report and do nothing. 

This function returns nothing. 

    function (name, alias) {
        var doc = this;
        var gcd = doc.gcd;
        var folder = doc.parent;
        var scopes = folder.scopes;
        var colon = doc.colon;

        name = colon.escape(name);
        alias = colon.escape(alias);

        if (scopes.hasOwnProperty(alias) ) {
            if (scopes[alias] !== name ) {
                gcd.emit("error:conflict in scope naming:" +
                     doc.file, [alias, name] );
            } 
        } else {
            if ( scopes.hasOwnProperty(name) ) {
                _":scope exists"
            } else {
                gcd.once("scope exists:" + name, function () {
                    _":scope exists"
                });
            }
        }


    }

[scope exists]()

This is how we link the stuff 

    
    folder.scopes[alias] = name;
    gcd.emit("scope linked:" + doc.file + ":" + alias, name);
    gcd.emit("scope exists:" + alias);



## Maker

No longer being used, but may inspire the waiting or reporting.

This is an object that makes the handlers for various once's. We can overwrite
them per document or folder making them accessible to manipulations. 

    {   'emit text ready' : function (doc, name) {
                var gcd = doc.gcd;

                var evt =  "text ready:" + name;
                gcd.emit("waiting for:text:"  + name, 
                    [evt, "text", name]);
                var f = function (text) {
                    gcd.emit(evt, text);
                };
                f._label = "emit text ready;;" + name;
                return f;
            },
        'store' : function (doc, name, fname) {
                
                var f = function (text) {
                    doc.store(name, text);
                };
                f._label = "store;;" + (fname ||  name);
                return f;
            },
        'store emit' : function (doc, name, fname) {
                fname = fname || name;
                var gcd = doc.gcd;

                var evt = "text ready:" + fname;
                gcd.emit("waiting for:text:"  + fname, 
                    [evt, "text", fname]);
                var f = function (text) {
                    doc.store(name, text);
                    gcd.emit(evt, text);
                };
                f._label = "store emit;;" +  fname;
                return f;
            },
        'location filled' : function (doc, lname, loc, frags, indents ) {
                var gcd = doc.gcd;

                var evt = "location filled:" + lname;
                gcd.emit("waiting for:location:"  + lname,
                    [evt, "location", lname]);

                var f = function (subtext) {
                    subtext = doc.indent(subtext, indents[loc]);
                    frags[loc] = subtext;
                    gcd.emit(evt);
                };
                f._label = "location filled;;" + lname;
                return f;
            },
        'stitch emit' : function (doc, name, frags) {
                var gcd = doc.gcd;

                var evt = "minor ready:" + name;
                gcd.emit("waiting for:minor:" + name,
                    [evt, "minor", name]);

                var f = function () {
                    gcd.emit(evt, frags.join(""));
                };
                f._label = "stitch emit;;" + name;
                return f;
            },
       'stitch store emit' : function (doc, bname, name, frags) {
                var gcd = doc.gcd;

                var evt = "text ready:" + name;
                gcd.emit("waiting for:text:"  + name,
                    [evt, "text", name]);

                var f = function () {
                    var text = frags.join("");
                    doc.store(bname, text);
                    gcd.emit(evt, text);
                };
                f._label = "stitch store emit;;" + name;
                return f;
            }
    }


## Action for argument finishing

We extract the data and then we check for the existence of the command. If it
exists, we execute it and any subcommands. If it does not exist, we wait for
it to exist and then use a handler to run it. But if it is still not a
property on the needed doc, then we wait some more. 

Subcommands used to be dealt with inside the command itself, for some reason.
Now they are executed before the command. 

    function (comname) {
        var doc = this;
        var gcd = this.gcd;

        var f = _":handler";
        f._label = "waiting for arguments:" + comname; 
        return f;
    }

[handler]() 

    function (data) {
        var input, args, command, han;

        _":extract data"
        
        var fun;

        _":prep command"

        args = doc.argsPrep(args, comname, doc.subCommands, command, input);

        if (fun) {
            fun.apply(doc, [input, args, comname, command]);
        } else {
            han = function () {
                fun = doc.commands[command];
                if (fun) {
                    fun.apply(doc, [input, args, comname, command]);
                } else { // wait some more
                    gcd.once("command defined:" + command, han);
                }
            };
            han._label = "delayed command:" + command + ":" + comname; 
            gcd.once("command defined:" +  command, han); 
        }


    }


[prep command]() 

Here we want to do a few things. We want to normalize command names so that
they can have different capitalizations and slugs and be treated the same. 

But first we want to check the command for a leading character that is known
to be a lead for a namespace of characters. The two default examples are `.`
for indicating a property/method access and `-` for a bunch of utilities of
which none are in there by default; the full library uses it (lodash,
datefns), but it is defined here.  

This allows property access. We are piggy backing off `.` sync command as
 that is just easier to do -- keeps it tidy within the same flow. 

The command is left untouched, but the function recalled is the one that we
are manipulating. 

        var method;
        if ( doc.leaders.indexOf(command[0]) !== -1 ) {
            method = command.slice(1);
            if (method) {args.unshift( method );}
            fun = doc.commands[command[0]];
        } else {
            command = doc.normalize(command);
            fun = doc.commands[command];
        }

[extract data]()

The data is of the form and order: 
`[text ready, input text], [command parsed, [file, command]], [tr,
[arg1]],...`

The arguments should be strings unless they are subcommands. They have the
form ....

    input = data[0][1];
    command = data[1][1][1];
    args = data.slice(2).map(function (el) {
        return el[1];
    });


### Argument prepping

So we have a bunch of arguments. Many of the times it is just a string, but if
it is an array, then it will be a subcommand followed by its arguments,
possibly their own subcommands. 

This receives arguments, the command name, and an object containing
subCommands, which is prototyped up doc and folder. The command name can be
used for state from scoping. One can use this to stash configuration options,
for example, that can then be removed from the argument list. 

If an argument is an array, then it is a subcommand plus its own arguments. We
call the function itself to recurse down until we are done with all arguments. 

The return object will be passed on as is unless it is an array. Then it
should be of the form [type, val, ...]. Types can be: 

* array to pass the rest as an array
* val to pass the immediately next value
* args to pass the rest of the array as separate arguments
* state which should then be an object to merge with existing state; keys overwrite
* lineState which is a common scope to all in this pipe chain.
* skip to skip entirely.
* default is to add to arguments as a whole but with an error emitted. 

Break from list--

    function self (args, name, subs, command, input ) {
        var retArgs = [], i, n = args.length;
        var ret, subArgs;
        var cur, doc = this, gcd = this.gcd;
        doc.cmdName = name;
        var csubs, normsubc, subc, sfun;
        csubs =  doc.plugins[command] &&
             doc.plugins[command].subCommands ;
        for (i = 0; i < n; i += 1) {
            cur = args[i];
            if (Array.isArray(cur) && cur.sub ) {
                subArgs = cur.slice(1);
                subc = cur[0];
                normsubc = doc.normalize(subc);
                if (subArgs.length) {
                    subArgs = self.call(doc, subArgs, name, subs, command, input);
                }
                 try {

We have a very special subcommand which is just `input`. This returns the
input object. 

                    if (normsubc === 'input') {
                        ret = input; 

This handles the case of a subcommand being present either in the
command subcommand or the generic subcommands. 

                   } else if ( (sfun =  ( 
                        (csubs && csubs[normsubc] ) || 
                        (subs && subs[normsubc] )    ) ) ) {
                        ret = sfun.apply(doc, subArgs);

This looks if there is a leader command. If so, it proceeds. There is
no need to check if it is a standalone leader since the first if would catch
that. 

                   } else if  ( ( sfun = ( 
                        (csubs && csubs[subc[0]] ) || 
                        (subs && subs[subc[0]] )    ) ) ) {
                        subArgs.unshift(subc.slice(1));
                        ret = sfun.apply(doc, subArgs);
                    } else {
                        gcd.emit("error:no such subcommand:" + command + ":" +
                            subc, [i, subArgs,name]);
                        continue;
                    }
                } catch (e) {
                    gcd.emit("error:subcommand failed:" + command + ":" +
                    subc, [i, subArgs, name]);
                    continue;
                }
                
                _":parse ret types"
            } else { // should never happen
                retArgs.push(cur);
            }

        }

        return retArgs;

    }

[parse ret types]()

Here we implement the possible types and responses. If it is an array with
the args flag set to true, then we put each element in the array as an
argument.   

    if (Array.isArray(ret) && (ret.args === true) ) {
        Array.prototype.push.apply(retArgs, ret);
    } else if (typeof ret === "undefined") {
        // no action, nothing added to retArgs
    } else {
        retArgs.push(ret);
    }

[array ret]()


This seems unused???

    switch (ret.shift()) {
    case "value" :
    case "values" :
    case "val" : 
        Array.prototype.push.apply(retArgs, ret);
    break;
    case "array" : 
        // generate an array from rest of array and add that as a whole
        retArgs.push(ret); 
    break;
    case "arguments" : 
    case "args" : 
        // array each item is added as separate thing
        Array.prototype.push.apply(retArgs, ret.shift());
    break;
    case "skip" : 
        // blank intentionally
    break;
     default : 
        // add as if a value but warn
        gcd.emit("warn:unrecognized type in arg prepping:" + name,
            ret);
        retArgs.push(ret);
    break;
    }

         
       

