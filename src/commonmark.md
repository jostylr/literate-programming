Here we implement the markdown parser. We use commonmark and it generates an
AST which we can then do whatever we like with it. Our purposes are purely
informational and we extract headers, links, and code blocks. 

    function (doc) {
        var gcd = doc.gcd;
        var file = doc.file;

        gcd.when("marked done:"+file, "parsing done:"+file);

        gcd.on("parsing done:"+file, function () {
            doc.parsed = true;
        });

        var text = doc.text;
        _"process comments"

        var reader = new commonmark.Parser();
        var parsed = reader.parse(text); 

        var walker = parsed.walker();
        var event, node, entering, htext = false, ltext = false, lang, code;
        var ind, pipes, middle, title, href, directive; //for links

        while ((event = walker.next())) {
            node = event.node;
            entering = event.entering;

            _"walk the tree"

           // console.log(node.type, node.literal || '', node.destination|| '', node.title|| '', node.info|| '', node.level|| '', node.sourcepos, event.entering);
        }

        gcd.emit("marked done:" + file);
    }


## process comments


This strips the comment part of comments of the form `<!--+ ... -->`. This
allows one to hide a great deal from viewing while maintaining functionality.
The comment needs to start at a new line.

    var bits = text.split("\n<!--+");
    if (bits.length > 1) {
        text = bits[0] + "\n" + bits.slice(1).map(function (el) {
            var ind = el.indexOf("-->"); 
            if (ind !== -1) {
                return el.slice(0, ind).trim() + el.slice(ind+3);
            } else {
                return el;
            }
        }).join("\n");
    } 



# walk the tree

So we examine the nodes and decide when to do something of interest. The nodes
of interest are of type Heading, Link, Text, and CodeBlock. CodeBlock is easy
as the literal is all we need. Both Heading and Link require us to descend and
string together the text. 


    switch (node.type) {
    case "text" : 
        _":text"
    break;
    case "link" : 
        _"link"
    break;
    case "code_block" :
        _":code"
    break;
    case "heading" :
        _":heading"
    break;
    }
    

[text]() 

This simply adds the text to an array if the array is there. We have header
text and link text. Since links may be in headers, we have two separate text
trackers. 

    if (htext) {
        htext.push(node.literal);
    }
    if (ltext) {
        ltext.push(node.literal);
    }

[heading]()

Headings create blocks. We emit an event to say we found one. We collect the
text as we go with the text and then join them when ready. 

    if (entering) {
        htext = [];
    } else {
        gcd.emit("heading found:"+node.level+":"+file, htext.join(""));
        htext = false;
    }
    
[code]()

We emit found code blocks with optional language. These should be stored and
concatenated as need be. 

    lang = node.info;
    code = node.literal || '';
    if (code[code.length -1] === "\n") {
        code = code.slice(0,-1);
    }
    if (lang) {
        gcd.emit("code block found:"+lang+":"+file, code);
    } else {
        gcd.emit("code block found:"+ file, code);
    }

### Link

Links may be directives if one of the following things occur:

1. Title contains a colon. If so, then it is emitted as a directive with the
   stuff preceeding the colon being a directive. The data sent is an array
   with the link text, the stuff after the colon, and the href being sent. No
   pipe parsing is done at this point.
2. Title starts with a colon in which case it is a switch directive. The stuff
   after the colon is sent as second in the data array, with the link text as
   first. The href in this instance is completely ignored. There is some pipe
   processing that happens.
3. Title and href are empty. 

Return the text in case it is included in a header; only the link text will be
in the heading then. 

    if (entering) {
        ltext = [];
    } else {
        href = node.destination;

Commonmark translates `^` into `%5E`. This undoes that. May want to think
about a general transformation back or to block it, but this is sufficient for
now. 

        if (href === "#%5E") {
            href = "#^";
        }
        title = node.title;
        ltext = ltext.join('').trim();
        
        if (title) {
            title = title.replace(/&#39;/g, "'").replace(/&quot;/g, '"');
        }   
        if ((!href) && (!title)) {
            gcd.emit("switch found:"+file, [ltext, ""]);
        } else if (title[0] === ":") {
            if  ((ltext.indexOf("|") !== -1) || ( ltext.length === 0) ) {
                _":transform"
            } else {
                _":switch with pipes"
            }
        } else if ( (ind = title.indexOf(":")) !== -1) {
            _":directive"
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

A nice customary directive found. The load and save prefixes allow for
changing the path. Those directives need that data sent to them. 

    directive =  doc.convertHeading(title.slice(0,ind)); 
    var toSend = {   link : ltext,
            input : title.slice(ind+1),
            href: href, 
            cur: doc.curname, 
            directive : directive 
        };
    if (doc.loadprefix) {
        toSend.loadprefix = doc.loadprefix;
    }
    if (doc.saveprefix) {
        toSend.saveprefix = doc.saveprefix;
    }
    gcd.emit("directive found:" + 
        directive +  ":" + file, 
        toSend
    );


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




