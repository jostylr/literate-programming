/*global require, setTimeout, console*/
/*jslint evil:true*/

var fs = require('fs');
var test = require('tape');
var Litpro = require('./index.js');


var testrunner = function (file) {



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
    var firstName = td.start[0];
    var firstText = td.in[firstName];
    if ( !(/^#/).test(firstText) ) {
        if (firstText) {
            td.in[firstName] = firstText + '\n[out](#^ "save:")';
            //console.log(td.in[firstName]);
        }
    }


    var folder = new Litpro({
        "on" : [
            ["need document", "fetch document"],
            ["document fetched", "compile document"]
            ],
         "action" : [
            ["fetch document", function (rawname, evObj) {
                var gcd = evObj.emitter;
                var filename = evObj.pieces[0];
                
                if (td.in.hasOwnProperty(filename) ) {
                    gcd.emit("document fetched:" + filename, td.in[rawname]);        
                } else {
                    console.log("ERROR~File not found: " + filename);
                    gcd.parent.createScope(filename);
                    gcd.emit("error:file not found:"+ filename);
            
                }
            
            }],
            ["compile document", function (text, evObj) {
                var gcd = evObj.emitter;
                var filename = evObj.pieces[0];
                var folder = gcd.parent;
            
                setTimeout(function () {
                    folder.newdoc(filename, text);
                    }, 1);
            
            }]
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

        if (td.log.length > 0) {
            folder.eventlog = function (event, type, data) {
                folder.log("EVENT: " + event + " DATA: " + data);
            };
            folder.cmdlog = function (input, lbl, args) {
                if (lbl) {
                    args.unshift(lbl);
                }
                args.unshift(input);
                folder.log(args.join("\n~~~\n"));
            };
            folder.dirlog = function (name, data) {
                folder.log("DIR LOG:" + name + "\n" + data);
            };
            folder.log = function (text) {
                if (log.indexOf(text) !== -1) {
                    t.pass();
                } else {
                    console.log(text);
                    t.fail(text);
                }
            };
        } else if (td.reports) {
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
        } else {
            folder.warn = function (kind, description ) {
                console.error("\nWARNING:\nKind: " + kind +
                    "\nDescription: " + description + 
                    "\nArgs:\n" + 
                    Array.prototype.slice.call(arguments, 2).join("\n~~~\n"));
            };
            folder.error = function (kind, description ) {
                console.error("\nERROR:\nKind: " + kind +
                    "\nDescription: " + description + 
                    "\nArgs:\n" + 
                    Array.prototype.slice.call(arguments, 2).join("\n~~~\n"));
            };
            folder.cmdlog = folder.log = function () {
                var args = Array.prototype.slice.call(arguments, 0);
                console.log.apply(console, args);
            };
        }

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

        var notEmit = function () {
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
        };

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
};

var equalizer = function (t, out) {
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
};

var spaces = function (file) {
    var n = ("ok ... should be equal").length - file.length;
    var i;
    var ret = '';
    for (i = 0; i < n; i += 1 ) {
        ret += ' ';
    }
    return ret;
};

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


Litpro.commands.readfile = Litpro.prototype.wrapAsync(function (input, args, cb) {
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
}, "readfile");


var i, n = testfiles.length;

for (i =0; i < n; i += 1) {
    testrunner(testfiles[i]);
}
