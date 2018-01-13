These are the handler actions common to much. Note that some handlers are
defined in the code and are difficult to overwrite. This was done for
closure's sake and ease. Perhaps it will get revised. 


    _"Action compiling block | oa"

    _"heading | oa"

    _"heading 5| oa"

    _"heading 6| oa"

    _"switch| oa"

    _"code | oa"

    _"code ignore | oa"

    _"directive | oa"

    _"Ready to start compiling blocks |oa"
    
    _"what is waiting| oa"
    
    _"directives::push:action | oa"


## done when

This creates the done object which is needed for done and when commands. 

    this.done = {
        gcd : new EvW(),
        cache : {}
    };
    this.done.gcd.action("done", _"commands::done:action", this);

## apply

We will load events, actions, and handlers, etc., here. They should be passed
in to the constructor in the form of  `method name: [ [args 1], [args2], ...]`
and this method will iterate over it all to load the events and so forth to
the emitter. 

    function (instance, obj) {
        var meth, i, n;

        for (meth in obj) {
            n = obj[meth].length;
            for (i = 0; i < n; i += 1) {
                instance[meth].apply(instance, obj[meth][i]);
            }

        }
    }


## parsing events

These are common events that need to be loaded to the emitter. These are the
ones that assemble the literate programs. 


### heading vars

This is just an intro that seems commonly needed.
 
    var file = evObj.pieces[0];
    var doc = gcd.parent.docs[file];

### init block

I am separating out this one line since I may want to revise it. We have the
option of concatenating what is already there or overwriting. While I think it
is best form not to have the same block name twice and concatenating it up,
there may be use cases for it and this might also help track down accidental
double blocking (you get the code of both blocks to search for!).

    if ( ! doc.blocks.hasOwnProperty(curname) ) {
        doc.blocks[curname] = '';
    }

### heading

Headings create blocks. For heading levels 1-4, they create new blocks on an
equal footing. For heading leavels 5,6, they create relative blocks using
slashes from the currently selected block (a directive could be used to switch
current block?) Level 6 is relative to level 5 and the level above so
something like `great code/test/particular` from a 3, 5, 6 combo. 

The headings are there to start code blocks. The code blocks concatenate into
whatever is there. 

We use doc.levels to navigate 

    heading found --> add block
    _"heading vars"
    var text = doc.convertHeading(data);
    var curname = doc.heading = doc.curname = text;
    doc.levels[0] = text;
    doc.levels[1] = '';
    doc.levels[2] = '';
    _"init block"

### heading 5

The 5 level is one level below current heading. We stop the event propagation.


    heading found:5 --> add slashed block 
    _"heading vars"
    var text = doc.convertHeading(data);
    doc.levels[1] = text;
    doc.levels[2] = '';
    var curname = doc.heading = doc.curname = doc.levels[0]+'/'+text;
    _"init block"
    evObj.stop = true;


### heading 6

The 6 level is one level below current heading. We stop the event propagation.


    heading found:6 --> add double slashed block 
    _"heading vars"
    var text = doc.convertHeading(data);
    doc.levels[2] = text;
    var curname = doc.heading = doc.curname = doc.levels[0]+'/'+doc.levels[1]+'/'+text;
    _"init block"
    evObj.stop = true;

### switch

Whenever a minor block directive is found, this is used.

It uses the doc.heading as the base, appending a colonated heading stored in
the current name. Note the colon is a triple colon. All variable recalls will
have colons transformed into triple colons. This is stored in colon.v for
global overriding if need be. 

Switches can execute stuff on the compiled block. To signify when done, we
emit gcd.emit("text ready:"+ curname). But within the block compiling, we will
emit a text ready:minor:... which we should listen for here. 

Note that for piping of minors, there could be a problem if those listening
for the text then call something else wanting it; there could be a gap from
when the text ready event is fired and the storage happens. It won't happen
unless piping is going on. And the risk seems low. Let me know if it is a
problem. 

    switch found  --> create minor block
    _"heading vars"
    var colon = doc.colon;
    var text = doc.convertHeading(data[0]);

    var subEmit, textEmit, doneEmit;

    var curname = doc.curname = doc.heading+colon.v+text;
    _"init block"


    var title = data[1];
    var fname = evObj.pieces[0] + ":" + curname;
    doneEmit = "text ready:" + fname; 
    var pipename;
    if (title) { // need piping
        title = title.trim()+'"';
        pipename = fname + colon.v + "sp";
        textEmit = "text ready:" + pipename;
        subEmit = "switch chain done:" + pipename; 
        
        gcd.when(textEmit, subEmit);

        gcd.once(subEmit, function (data) {
            var text = data[data.length-1][1] || '';
            doc.store(curname, text);
            gcd.emit(doneEmit, text);
        });
        
        gcd.flatWhen("minor ready:" + fname, textEmit);

        doc.pipeParsing(title, 0, '"' , pipename, doc.heading,
          subEmit, textEmit ); 
    } else { //just go
        gcd.once("minor ready:" + fname, function (text) {
            doc.store(curname, text);
        });
        gcd.flatWhen("minor ready:" + fname, "text ready:" + fname);

    }


### code

Code blocks are concatenated into the current one. The language is ignored for
this.

If no language is provided, we just call it none. Hopefully there is no
language called none?! 

We join them by adding doc.join character; this is default a newline.

Note: doc.blockOff allows us to stop compiling the blocks. This is a hack. I
tried to manipulate the action, but somehow that did not work. Anyway, this
will be scoped to the doc so that's good. 

    code block found --> add code block
    _"heading vars"
    if (doc.blockOff > 0) { return;}
    if (doc.blocks[doc.curname]) {  
        doc.blocks[doc.curname] +=  doc.join + data;
    } else {
        doc.blocks[doc.curname] = data;
    }


### code ignore

If you want to have code that gets ignored, you can use code fences with a
language of `ignore`. We do nothing other than stop the event propagation. 

The downside is that we loose the highlight. One can provide other events in
plugins the could ignore other languages. For example, if you are coding in
JavaScript, you could have JavaScript being ignored while js not being
ignored. Or you could just put the code in its own block. 

    code block found:ignore --> ignore code block
    evObj.stop = true;
    gcd=gcd; //js hint quieting


### directive

Here we deal with directives. A directive can do a variety of things and it is
not at all clear what can be done in general to help the process. Note that
directives, unlike switches, are not parsed for pipes or anything after the
colon is touched. 

You can also stop this generic handling by listening for a specific directive
and stopping the propagation with evObj.stop = true.

This really just converts from event handling to function calling. Probably a
bit easier for others to handle. 


    directive found --> process directives
    _"heading vars"
    var fun;
    var directive = evObj.pieces[1];
    if (directive && (fun = doc.directives[directive] ) ) {
        fun.call(doc, data);
    }


## Action compiling block

This is where we deal with parsing a given code block and handling the
substituting. 

This is a function that responds to the event `block needs compiling:file:block name`. 


    block needs compiling --> compiling block
    var file = evObj.pieces[1];
    var blockname = evObj.pieces[0];
    var doc = gcd.parent.docs[file]; 
    var block = doc.blocks[blockname];
    doc.blockCompiling(block, file, blockname);



## Ready to start compiling blocks

We will compile each block once the parsing is done. 

To exclude a block from the compiling phase, use the directives block off and
later block on to turn the block back on. 

    parsing done --> list blocks to compile
    var file = evObj.pieces[0];
    var doc = gcd.parent.docs[file];
    var blocks = doc.blocks;
    var name;
    for (name in blocks) {
        gcd.emit("block needs compiling:" + file + ":" + name); 
    }

## What is waiting

This is where we define the waiting function. It takes in a message to report
for whatever is interested in checking (maybe the end of a process or in a web
page, a user clicking on a report -- difficult since the compilation phase
never officially ends). It also takes in an array that should be of the form
`[event for removal, type of reporter, args for reporters...]`

`waiting for:type:file:name, [evt, reportname, args to report` 


    waiting for --> wait reporting
     
    var reports = gcd.parent.reports; 

    var evt = data[0];
    var msg = evObj.pieces.slice(0,-1).reverse().join(":");


    reports[msg] = data.slice(1);
    gcd.once(evt, function () {
        delete reports[msg];
    });
    
## Convert Heading

This converts the heading to a normal form with lower caps, one space, no
spaces at ends.

    function (str) {
        var reg = /\s+/g;
        str = str.trim().toLowerCase();
        str = str.replace(reg, " ");
        return str;
    }


## On action 

To smoothly integrate event-action workflows, we want to take a block, using
the first line for an on and action pairing. 

Then the rest of it will be in the function block of the action. 

The syntax is  `event --> action : context` on the first line and the rest
are to be used as the function body of the handler associated with the
action. The handler has signature data, evObj. 


    function (code) {
        var lines = code.split("\n");
    
        var top = lines.shift().split("-->");
        var event = top[0].trim();
        var actcon = top[1].split(":");
        var action = actcon[0].trim();
        var context = (actcon[1] || "").trim();
        
        var ret = 'gcd.on("' + event + '", "' + action + 
            '"' + (context ? (', ' + context) : '') + ");\n\n";

       ret += 'gcd.action("' +  action + '", ';
       ret += 'function (data, evObj) {\n        var gcd = evObj.emitter;\n';
       ret += '        ' + lines.join('\n        ');
       ret += '\n    }\n);';
       
       return ret;
    }

[oa](# "define:")


## Event playbook

!Be skeptical of the following.

So this is a quick sketch of the kinds of events and actions that get taken in
the course of compiling. A tilde means it is not literal but rather a
variable name. 

* Document compiling starts with a `need parsing:~filename, text`


* `text ready` is for when a text is ready for being used. Each level of use
  had a name and when the text is ready it gets emitted. The emitted data
  should either by text itself or a .when wrapped up [[ev, data]] setup.  

* filename:blockname;loc;comnum;argnum(;comnum;argnum...)


