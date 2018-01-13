Let's create a testing environment. The idea is that we'll have a series of
documents in the tests folder that will have the convention `name -
description` at the top, then three dashed separator line to create a new
document to parse followed by its result. In more advanced tests, we will
introduce a syntax of input/output and related names. 

The log array should be cleared between tests. 

Underscores in filenames trigger different behavior; one underscore will limit
test runs to just those and produce some simple info. Two underscores will
list all events fired. 

Only files wit `.md` extension are considered, but all of them are. To have
one not be run, change extension to, say, `.mdn`

    /*global require, setTimeout, console*/
    /*jslint evil:true*/

    var fs = require('fs');
    var test = require('tape');
    var Litpro = require('./index.js');


    var testrunner = _"testrunner";

    var equalizer = _"equalizer";

    var spaces = _"spaces";

    _"testfiles"


    Litpro.commands.readfile = Litpro.prototype.wrapAsync(_"test async", "readfile");


    var i, n = testfiles.length;

    for (i =0; i < n; i += 1) {
        testrunner(testfiles[i]);
    }

### testrunner

This is a function that sets up and then runs the test. We need a function to
avoid the implicit closures if it was looped over code. Yay async!

The plan is: read in the file, split it on `---`, figure out what is to be
input vs output and link the tests to the outputs being saved, and then
process the inputs. 

    function (file) {
 


        var pieces, name, i, n, td, newline, piece,
            start, text, j, m, filename;
    
        var testdata = {};

        text = fs.readFileSync('./tests/'+file, 'utf-8');
        pieces = text.split("\n---");
        
        name = file + ": " + spaces(file) +  pieces.shift().trim();

        td = testdata[name] = {
            start : [],
            in : {},
            out : {},
            log : []
        };

        
        _"set up test data"


        var folder = new Litpro({
            "on" : [
                ["need document", "fetch document"],
                ["document fetched", "compile document"]
                ],
             "action" : [
                ["fetch document", _"test fetch document"],
                ["compile document", _"test compile document"]
              ]
        });
        var gcd = folder.gcd;

        
        var log = td.log; 

        if (monitor) {
            //gcd.makeLog();
            //data too messy so just event name
            gcd.monitor('', function (evt) { console.log(evt); });
        }

        test(name, function (t) {
            var outs, m, j, out;

            _"dealing with logs"

            outs = Object.keys(td.out);
            m  = outs.length;
            
            t.plan(m+log.length+ (td.reports ? 1 : 0));
            
            for (j = 0; j < m; j += 1) {
                out = outs[j];
                gcd.on("file ready:" + out, equalizer(t, td.out[out]) );
            }
            

            start = td.start;
            n = start.length; 
            for (i = 0; i < n; i += 1) {
                filename = start[i];
                if (!folder.docs.hasOwnProperty(filename) ) { 
                    folder.newdoc(filename, td.in[filename]);
                }
            }

            var notEmit = _"not emitting";

            if (showLogs) {
                notEmit();
                setTimeout( function () {
                    console.log(
                        "Scopes: ", folder.scopes,  
                        "\nRecording: " , folder.recording
                    );}, 100);
                setTimeout( function () { 
                    console.log(folder.reportwaits().join("\n")); 
                }); 
            }
        });
    }


## Testfiles

To gather the files, we read the tests directory, filter on`.md` files, and we
see if there are any that contain an underscore. If so, we flag that as on
the list to run and ignore the others. With one underscore, we run it and give
out some basic information. With two underscores, we monitor it. This is
global (assuming just one file at a time, anyway).

    var reduced = [];
    var showLogs = false;
    var monitor = false;
    var testfiles = fs.readdirSync('./tests').filter(function(el) {
        if ( (/\.md$/).test(el) ) {
            if ( (/\_/).test(el) ) {
                reduced.push(el);
                showLogs = true;
                if ( (/\__/).test(el) ) {
                    monitor = true;
                }
            }
            return true;
        } else {
            return false;
        }
    });
    testfiles = (reduced.length !== 0) ? reduced : testfiles;




## Set up test data

Here we put the tests into testdata either as an input or output. If there are
just two, we assume the first is input and the second is output. The default
names are in and out, respectively. So we should save the output to out. 

The start listing are the ones that get specifically processed. The in, which
includes the starts, are those that can be loaded from within the documents. 

We split the log portion (if present) on `\n!`. We will expect a test for
each log entry and we will verify by the called log function text being in the
array. That should cover most cases. 


     if (pieces.length === 2) {
        // \n---\n  will be assumed and the rest is to be used
        // the first is input, the second is output
       td.start.push("in");
       td.in.in = pieces[0].slice(1);
       td.out.out = pieces[1].slice(1).trim();
    } else {
        m = pieces.length;
        for (j = 0; j < m; j += 1) {
            piece = pieces[j];
            newline = piece.indexOf("\n");
            if (piece.slice(0,3) === "in:") {
                td.in[piece.slice(3, newline)] = piece.slice(newline + 1);
            } else if (piece.slice(0,4) === "out:") {
                td.out[piece.slice(4, newline)] = 
                    piece.slice(newline + 1).trim();
            } else if (piece.slice(0,6) === "start:") {
                td.start.push(piece.slice(6, newline));
                td.in[piece.slice(6, newline)] = piece.slice(newline + 1);
            } else if (piece.slice(0,4) === "log:" ) {
                td.log = piece.slice(newline + 1).split("\n!");
                td.log.pop(); // test log should end in an \n!
                if( td.log[0]) {
                    td.log[0] = td.log[0].slice(1);
                }
            } else if (piece.slice(0, 8) === "reports:") {
                td.reports = piece.slice(newline+1);
            }
        }
    }
    _":check start for save"

[check start for save]()

So we want a convenience measure in which if there is no save our out, then we
use the beginning block of the first start. 

We have two natural options: 
* scan all the starts and ins for "out:" and "save:"  directives. Failing to
find any, we add one `[out](#^ "save:")` to the end of the start. 
* look for a first header in the first start. Failure leads to appending the
  save. 

We'll do the second for convenience. 

    var firstName = td.start[0];
    var firstText = td.in[firstName];
    if ( !(/^#/).test(firstText) ) {
        if (firstText) {
            td.in[firstName] = firstText + '\n[out](#^ "save:")';
            //console.log(td.in[firstName]);
        }
    }
     



### Dealing with logs

This is a bit of a pain with logs. Trying to make it somewhat work. This cuts
out the doc.log normal behavior. We can try that out in a different place
(logs-doc.md).  

So here we want to convert the incoming command log and directive log into
their original form which worked for these tests. The second argument is the
type. 

    if (td.log.length > 0) {
        _":log replace"
    } else if (td.reports) {
        _":reports"
    } else {
        _":convert warn"
        _":convert warn | sub warn, error, WARNING, ERROR"
        folder.cmdlog = folder.log = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            console.log.apply(console, args);
        };
    }
          
[log replace]()

This replaces the log functions for inspection.

    folder.eventlog = _":event log";
    folder.cmdlog = _":cmd log";
    folder.dirlog = _":dir log";
    folder.log = function (text) {
        if (log.indexOf(text) !== -1) {
            t.pass();
        } else {
            console.log(text);
            t.fail(text);
        }
    };


[event log]() 

Here we want something of the form `EVENT: ... DATA: ...`

    function (event, type, data) {
        folder.log("EVENT: " + event + " DATA: " + data);
    }
    
    
[dir log]() 


    function (name, data) {
        folder.log("DIR LOG:" + name + "\n" + data);
    }

[cmd log]()

Here we join the input with the args using tildas to separate. 

    function (input, lbl, args) {
        if (lbl) {
            args.unshift(lbl);
        }
        args.unshift(input);
        folder.log(args.join("\n~~~\n"));
    }

[reports]()

This checks the report format. This is a bit tricky in that we need to do this
at the end of the process, but it is not always clear when that happens. We
will assume this is for nonasync with just one in file. The queueEmpty should
be fine to use after the parsing is done event has been dealt with. 

    gcd.on("parsing done", function () {
        gcd.queueEmpty = function () {
            var rep = folder.reportOut();
            if (rep.trim() === td.reports.trim()) {
                t.pass("report testing");
            } else {
                t.fail("bad report");
                console.log(
                    "ACTUAL:\n" + rep + 
                    "\n~~~\n" +
                    "EXPECTED:\n" + td.reports
                );
            }
        };
    });
  
[convert warn]()

    folder.warn = function (kind, description ) {
        console.error("\nWARNING:\nKind: " + kind +
            "\nDescription: " + description + 
            "\nArgs:\n" + 
            Array.prototype.slice.call(arguments, 2).join("\n~~~\n"));
    };
   

### Not emitting

This hopefully is useful diagnostic information for saying why something did
not fire. 

    function () {
        var key, el, nofire;
        var comreg = /command defined/;
        var textreg = /text stored/;
        var savereg = /for save/;
        for (key in gcd._onces) {
            el = gcd._onces[key];
            nofire = el[0];
            if (comreg.test(nofire)) {
                console.log("COMMAND NOT DEFINED: " +
                    nofire.slice( ("command defined:").length ) );
            } else if (textreg.test(nofire) ) {
                console.log("NOT STORED: " + 
                    nofire.slice(("text stored:").length) );
            } else if (savereg.test(nofire) ) {
                //nothing; report waits will get it 
            } else {
                console.log("DID NOT FIRE: " + nofire);
            }
       }
    }

[junk]()

    function () { 
        setTimeout( function () {
            var key, el;
            for (key in gcd.whens) {
                console.log("NOT EMITTING: " + key + " BECAUSE OF " +
                    Object.keys(gcd.whens[key].events).join(" ; "));
            }

            for (key in gcd._onces) {
                el = gcd._onces[key];
                console.log("NOT EXECUTED "+ el[1] + " TIMES: " + 
                    key + " BECAUSE EVENT " + el[0] + 
                    " DID NOT FIRE. " + el[2]  + " TIMES LEFT"
                );
            }

        });
    }

### Equalizer

This is just a little function constructor to close around the handler for the
output file name. 

    function (t, out) {
        return function (text) {
            if (text !== out) {
                if ( (text[text.length-1] === "\n") && 
                    (out[out.length-1] !== "\n" ) ) {
                    out += "\n";
                } else {
                    console.log(text + "---\n" + out);
                }
            }
            t.equals(text, out);
        };
    }

### Test fetch document

This will fetch the document from the ins of the testdata. 

The emit will be of the form "need document:file location",
with data being the actual file location.

    function (rawname, evObj) {
        var gcd = evObj.emitter;
        var filename = evObj.pieces[0];
        
        if (td.in.hasOwnProperty(filename) ) {
            gcd.emit("document fetched:" + filename, td.in[rawname]);        
        } else {
            console.log("ERROR~File not found: " + filename);
            gcd.parent.createScope(filename);
            gcd.emit("error:file not found:"+ filename);

        }

    }

### Test compile document

This takes in the text of a file and compiles it. 

    function (text, evObj) {
        var gcd = evObj.emitter;
        var filename = evObj.pieces[0];
        var folder = gcd.parent;

        setTimeout(function () {
            folder.newdoc(filename, text);
            }, 1);

    }

### Test async

This is the example async function. It takes in filename and gives out the
text after a timeout. This is to simulate a readfile, but without actually
using the file structures. 

    function (input, args, cb) {
        var f = function () {
            if (args[0] === "stuff") {
                cb(null, "Hello world. I am cool.");
            } else if ( args[0] === "hello") {
                cb(null, "'Hello world.' + ' I am js.'");
            } else {
                cb(new Error("no such file")) ;
            }
        };
        setTimeout(f, 5);
    }

## Spaces

This adds spaces if needed in between filename and description to get past
the equals messages. 

    function (file) {
        var n = ("ok ... should be equal").length - file.length;
        var i;
        var ret = '';
        for (i = 0; i < n; i += 1 ) {
            ret += ' ';
        }
        return ret;
    }

