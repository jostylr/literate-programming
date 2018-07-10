Here we work with the markdown parser. We use commonmark and it generates an
AST which we can then walk along as we wish. As we go along, we set up our
block structure. 

We expect a text to come in, an identifier, and an object with the commands,
directives, the docs, etc. The compiled form returns the markdown parsed structure, the
compiled blocks, and a set of saved files. There will be a lot of promises
involved here that are waiting for the completion of the other promises. 

The object dc contains a number of methods, some of which manipulate
structures outside of this function (side effects!). Mainly, it is a set of
promises that 

    
    async function (id, text, dc) {
        let docs = dc.docs;

        text = await text;

        let ret = dc.makeRet(id);
        ret.lines = text.split('\n'),


        let prom = docs.files[id]; // this may create the item 


        let reader, parsed;
        _"commonmark parse"
    
        let walker = parsed.walker();


The `dc.Parser` is something that can be changed around based on directives. We use cur
as an object that gets into any parser type function. If no such type exists,
then noop does not. The log from dc should expect to be passed in the array to
store the logs and return a function to be called as the logger.

The block for a current is where we stash the code, as we assemble it, the
name, boundary information. We also have a header property which is there for
the last "proper" header, determined at the end of the parsing of a header.


        let noop = () => {};
        let cur = {
            parser : new dc.Parser(),
            levels : [id],
        };

        _"gather up text and run directives" 

        prom.res(ret);

        return ret;

    }


## Commonmark translation

This is where do some minor transformations of what commonmark produces and
convert it into something that literate programming can use. We call
directives for each when action is ready to be taken. The text nodes and
inline code node are just used in assembling headers and link text and never
call directives, but 

### Text

This simply adds the text to an array if the array is there. We have header
text and link text. Since links may be in headers, we have two separate text
trackers since both might be active at the same time. Also, note that links
can have stuff inside them as well, which is why it is not just bubbled up. 

    let {htext, node, ltext} = cur;
    if (htext) {
        htext.push(node.literal);
    }
    if (ltext) {
        ltext.push(node.literal);
    }


### Heading

Headings create blocks. 

We collect the text as we go along and then join them when ready. Different
heading levels have different behavior.


    let {node, levels} = cur;
    if (entering) {
        dc.directive.closeBlock(cur, ret, dc);
        cur.htext = [];
    } else {
        let level = node.level;
        let htext = dc.convertHeading(cur.htext.join(''));
        cur.htext = false;
        cur.minor = false;

        if (level === 5) {
            levels[2] = htext;
            levels.length = 3;
        } else if (level === 6) {
            levels[3] = htext;
            levels.length = 4;
        } else {
            levels[1] = htext;
            levels.length = 2;
        }
        dc.directive.newBlock(cur, ret, dc);

    }


### Code

We store code blocks with an optional language. The concatenation will occur
separately, as needed. Typically, the language should be the same, but having
it allows for some different options including potentially mixing languages in
a single block and pulling them out separately. 

The removal of the last newline happens because we generally concatenate with
newlines which would make it redundant also code fences.  

    cur.lang = node.info || '';
    let code = node.literal || '';
    if (code[code.length -1] === "\n") {
        code = code.slice(0,-1);
    }
    cur.code = code;
    dc.directive.addCode(cur, ret, dc);

### Link

Links may be directives if one of the following things occur:

1. Title contains a colon. If so, then it is run as a directive with the
   stuff preceding the colon being the directive name. The data sent is an array
   with the link text, the stuff after the colon, and the href being sent. No
   pipe parsing is done at this point, but the directive's execution may do
   the parsing. 
2. Title starts with a colon in which case it is a switch directive with link
   text not being empty or beginning with a pipe. The stuff
   after the colon is sent as second in the data array, with the link text as
   first. The href in this instance is completely ignored. There is some pipe
   processing that happens.
3. Title and href are empty. This is a switch with no later processing.
4. Transforms either have a directive of transform or have nothing before the
   colon (like a switch) but to distinguish, it needs either no link text or link text containing a pipe. 
5. Switch like except link text is `^`. This restores the setup to the current
   operating major block heading. This allows for little minor block
   interruptions and then returning to the flow. This would also work with h5,
   h6 headings. 

For the switches and transforms, the commands are parsed and placed as
transforms in the block. A switch also creates a new block.

All of these options are converted into a directive which is then called. As
the current object contains everything we need to manipulate further parsing,
including creating a new block, etc, we can safely call them all directives.

Return the text in case it is included in a header; only the link text will be
in the heading then. 

    if (entering) {
        ltext = [];
    } else { //link text ready

        href = node.destination;

Commonmark translates `^` into `%5E`. This undoes that. May want to think
about a general transformation back or to block it, but this is sufficient for
now. 

        if (href === "#%5E") {
            href = "#^";
        }

Clean up other stuff. We don't transform the link text because it could be
used by other stuff. 

        title = node.title;
        let ltext = ltext.join('').trim();
        
        if (title) {
            title = title.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        }   

Now we figure out what we have

        if ((!href) && (!title)) {
            
            dc.log("switch found", cur);
            _"switch"
        } else if (title[0] === ":") {
            let pipes = title.slice(1);

            if  ((ltext.indexOf("|") !== -1 ) || ( ltext.length === 0) ) {
                _"transform"
            } else if (ltext === "^") {
                _"return to main"
            } else {
                _"switch"
                _"transform"
            }

        } else if ( (ind = title.indexOf(":")) !== -1) {

These are what happens to directives in general. Be sure to use cur for load
and save prefixes.  

            directive =  dc.convertHeading(title.slice(0,ind)); 
            dc.directives(directive, ltext, title.slice(ind+1), href, cur, ret)

        }

        ltext = false;
    
    }

[transform]()

This becomes a directive, but looks a lot like a switch. It kind of fills in
the gap of main blocks not having pipes that can act on them. The idea is that
this can transform the text and do something with it, maybe just log or eval'd
or stored in a different variable.

It is triggered by having a pipe in the link text; one can
then write a descriptive for the rest of the link text before the pipe and/or
a variable name to store the result in after the pipe. One can also have
empty link text though that becomes entirely hidden to the reader and is best not done. 

    gcd.emit("directive found:transform:" + file, 
        {   link : ltext,
            input : title.slice(1),
            href: href, 
            cur: doc.curname, 
            directive : "transform"
        }
    );

    

[directive]()



[switch with pipes]()

Switch probably with pipes. This adds an extension in the middle of colon and
pipe. Really not
sure why. Probably should remove that. 

    ind = 0;
    _":before pipe"
    if (middle) {
        ltext += "." + middle.toLowerCase();    
    }
    gcd.emit("switch found:" + file, [ltext,pipes]);



[before pipe]()

This takes the possible part in the middle between the switch directive's colon and
the first pipe. 

This will produce  `middle === 'js'` for `: js` or  `: js| jshint` with the
latter producing `pipes === 'jshint'`.  If there is no extension such as `:`
or `: | jshint`, then `middle === ''` and should be falsey. 

We add a quote to pipes to terminate it as that is a signal to end in other
pipe parsings, one that got stripped by the title matching of links. 


    pipes = title.indexOf("|");
    if (pipes === -1) {
        middle = title.slice(ind+1).trim(); 
        pipes = '';
    } else {
        middle = title.slice(ind+1, pipes).trim();
        pipes = title.slice(pipes+1).trim();
    }


## Inline Code

This is a new addition. It is mostly redundant with the link syntax, but it
might have some visibility and quick typing advantages. It also can add a more
protected text space for complicated expressions that one might want to use
somehow. 

The code spans get activated if there is a known activation character
immediately after the code span. 
    
    let end = node.sorcepos[1];
    let activeChar = ret.lines[end[0]][end[1]
    code = node.literal || '';
    if (code[code.length -1] === "\n") {
        code = code.slice(0,-1);
    }
    cur.block.code.push( {
        lang, code, start:node.sourcepos[0], end:node.sourcepos[1]
    });


## For dc

This is the jumping off point for the dc inclusion of items here

    _"main parser"

    dc.convertHeading = _"convert heading";

    dc.directive.newBlock = _"new block";
    dc.directive.closeBlock = _"close block";


### Main Parser

The above strategy is to have a parser object that has various functions for
different node types of interest. This parser can be replaced at times if
desired. But here we are interested in specifying the behavior. They are all
given the node, a boolean indicating whether this is the first time we have
seen it, the current working state which contains what parser to use and the
log function, as well as the forming block, to add code and transforms to.
When the block finishes, there should be an end attribute added. The name of
the block should be the heading name; when the heading is done, the block gets
added underneath that name (or combined with an existing name if it already
exists). The block also has a boundary property which gives a list of
start.end positions; it could be multiple due to repeat headers. 


So we examine the nodes and decide when to do something of interest. The nodes
of interest are of type Heading, Link, Text, and CodeBlock. CodeBlock is easy
as the literal is all we need. Both Heading and Link require us to descend and
string together the text. 

We create an object for nodeParsing to allow the adding of methods to
customize the parsing on the fly with directives. 

    dc.nodeParser = function nodeParser () {return this;}
    let p = dc.nodeParser.prototype;
    p.text          = (cur, ret, dc) => {_"text"},
    p.link          = (cur, ret, dc) => {_"link"},
    p.code_block    = (cur, ret, dc) => {_"code"},
    p.heading       = (cur, ret, dc) => {_"heading"}
    p.code          = (cur, ret, dc) => {_"inline code"} 


#### Convert Heading 

This converts the heading to a normal form with lower caps, one space, no
spaces at ends.

    function convertHeading (str) {
        var reg = /\s+/g;
        str = str.trim().toLowerCase();
        str = str.replace(reg, " ");
        return str;
    }


### New Block


The sourcepos attribute contains both the beginning and ending of the block,
but it is not our block. Hence we need to just use the beginning and, when
closing a block, use the beginning of that block as the end which means it is
one more than the actual end, like a slice. 
        
    function (cur, ret, dc) {
        let {levels, minor} = cur;

        block.levels = Array.from(levels);
        block.name = levels.join('/');
        if (minor) {
            block.minor = minor;
            block.name += ':' + minor;
        }

        return null;
    }


### Close Block

###

### Close code block

Here we close any open code blocks. We essentially store the block, both in
the return object of blocks as well as in the docs block.

    cur.boundary.push(position);
    _":chunk"
    ret.blocks.push(block);
    block.placement = ret.blocks.length - 1;
    dc.storeBlock(block);

[chunk]()

We also put a
complete textual representation of the whole chunk in the block. The end is
fine for slicing as long as it is at the beginning of the block (typical); otherwise we
need to add 1. 

    let start = block.boundary[0][0];
    let end = position[0];
    if (position[1] !== 0) {
        end += 1;
    }
    block.chunk = ret.lines.slice(start, end);
    start = block.boundary[0][1]; // start on the first line
    if (start) { block.chunk[0] = block.chunk[0].slice(start); }
    end = position[1]; 
    if (end) { 
        let last = block.length-1;
         block.chunk[last] = block.chunk[last].slice(0, end);
    }


### Store Block

This might get moved. It is a function that takes in a block and stores a copy
of it in the structure of blocks. It is complicated because we allow for
multiple blocks with the same name and this puts them all together. 

    function (block) {
        let dc = this;
        let docs = dc.docs;
        let target = docs[block.name];

        if ( target ) {
            dc.log("repeat block", block);
        } else {
            target = docs[block.name] = {
                code : [],
                transforms : [],
                boundaries : [],
                name : block.name,
                chunks : []
            };
        }
        
        target.chunks.push( [block.chunk, block.placement] );
        
        ['code', 'transforms', 'boundaries'].forEach ( (type) => {
            block[type].forEach( 
                    (item) => target[type].push(dc.deepCopy(item))
                )
            }       
        );
    }


### New code block

This is where we define a new code block. Essentially, we have an array for
the code, an array for any transforms listed on this block (piped commands to
be done on the code before storing it). There is also a boundary and a name 


    cur.block = {
        code: [],
        transforms : [],
        boundary: [position],
        name : null
    };


### Add to code block

This adds a block 

    cur.block.code.push( {
        lang, code, start:cur.position[0], end:cur.push[1]
    });



## Commonmark Parse

This does the basic parsing. If fails, we reject the promise and return. 

    try {
        reader = new commonmark.Parser();
        parsed = ret.parsed = reader.parse(text); 

    } catch (e) {
        let reason = "commonmark failed to parse";
        e.reason = reason + id;
        prom.rej(e);
        error(reason, id, e);
        throw e;    
    }

## Gather up text and run directives


    try {
        let cur.position = [[1,1],[1,1]];
        dc.directive.newBlock(cur, ret, dc);

        while (let event = walker.next()) {
            cur.node = event.node;
            cur.position = dc.deepCopy(node.sourcepos);
            cur.entering = event.entering;
            (cur.parser[cur.node.type] || noop)(cur, ret, dc);
        }

        position = [ret.lines.length, ];
        _"close code block"

        _"clean up"

    } catch (e) {
        let reason = "commonmark failed to parse";
        e.reason = reason + id;
        prom.rej(e);
        error(reason, id, e);
        throw e;    
    }


