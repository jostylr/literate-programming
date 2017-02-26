#!/usr/bin/env node

/*global process, require */

var mod = require('literate-programming-cli');

var args = mod.opts.parse();

args.build = args.build.map(function (el) {
    if (el.slice(-1) === "/") {
        return el.slice(0, -1);
    } else {
        return el;
    }
});

var z = {};
args.other.forEach(function (arg) {
    var pair = arg.split(":");
    if (pair.length === 1) {
        args[pair[0]] = true;
    } else if (pair.length === 2) {
        args[pair[0]] = pair[1]; 
    } else {
        args[pair[0]] = pair.slice(1);
    }
    z[pair[0]] = args[pair[0]];
});

//console.warn("!!", args);

var Folder = mod.Folder;

Folder.inputs = args;
Folder.z = z;

var merge = Folder.requires.merge;
if (! Folder.requires) {
    Folder.requires = {};
}
var typeit = Folder.requires.typeit;

var jshint = require('jshint').JSHINT;
Folder.plugins.jshint = {
    options: {unused: true},
    globals: [],
    clean : false
} ;
Folder.sync("jshint", function (input, args, name) {
    
    var doc = this;
    var options, globals;

    var log = [], err, i, lines, line, logcopy,
        globhash, ind, shortname;

    var plug = doc.plugins.jshint;

    options = merge(true, plug.options, args[0] || {});
    
    globals = plug.globals.concat(args[1] || []);
    
    if (args[2]) {
       shortname = args[2];
    } else {
        shortname = name.slice(name.lastIndexOf(":")+1, 
            name.indexOf(doc.colon.v, ind) );
    }
    
    globhash = {};
    globals.forEach( function (el) {
        var bits; 
        bits = el.trim().split(":");
        bits[1] = bits[1] === "true";
        globhash[bits[0].trim()] = bits[1];
    });

    jshint(input, options, globhash);


    var data = jshint.data();


    lines = input.split("\n");
    for (i = 0; i < jshint.errors.length; i += 1) {
       err = jshint.errors[i];
       if (!err) {continue;}
       if (err.reason.indexOf("is defined but never used.") !== -1) {
           continue; //this is covered elsewhere. 
       }
       line = lines[err.line-1];
       if (line.trim().length < 4) {
            line = "\n---\n" + lines.slice(err.line-2, err.line+1).join("\n") + 
                "\n---\n";     
       }
       log.push("E "+ err.line+","+err.character+": "+err.reason +
            "  "+ line.trim());
    }
    if (data.hasOwnProperty("implieds") ) {
        for (i = 0; i < data.implieds.length; i += 1) {
            err = data.implieds[i];
            log.push("Implied Gobal "+ err.line+": "+err.name +
                "  "+ lines[err.line[0]-1].trim());
     }            
    }
    if (data.hasOwnProperty("unused") ) {
        for (i = 0; i < data.unused.length; i += 1) {
            err = data.unused[i];
            log.push("Unused "+ err.line+": "+err.name +
            "  "+ lines[err.line-1].trim());
     }            
    }

    if (log.length > 0 ) {
        logcopy = log.slice();
        logcopy.unshift(shortname, "jshint Report");
        doc.log.apply(doc, logcopy); 
    } else {
        if (args[3] || plug.clean) {
            doc.log(shortname, "jshint clean");
        }
    }

    return input;
});

var pug = require('pug');
Folder.plugins.pug = {pretty:true};

Folder.sync("pug" , function (code, args) {
    var options = merge(true, this.plugins.pug, args);
    return pug.render(code, options); 
});

var mdit = require('markdown-it');

var mddefault = {
    html:true,
    linkify:true
};


Folder.plugins.md = {
    req : mdit,
    def: mdit(mddefault),
    options: mddefault,
    prepost : [function litsub (code) {
        var snips = [];
        var masklit = function (match) {
            snips.push(match);
            return "<!--LITSNIP" + (snips.length-1) + "-->";
        };
    
        var rep = function (match, num) {
            return snips[parseInt(num, 10)];
        };
        
        var undo = function (html) {
            var reg = /<\!\-\-LITSNIP(\d+)\-\->/g; 
            return html.replace(reg, rep);
        };
    
        var lit = /(?:\\|\\\d*)?\_+(\"[^"]+\"|\`[^`]+\`|\'[^']\')/g;
        code = code.replace(lit, masklit);
        return [code, undo];
    }, function mathsub (code) {
        var snips = [];
        var maskinline = function (match, ignore, math) {
            snips.push("\\(" + math + "\\)" );
            return "<!--MATHSNIP" + (snips.length-1) + "-->";
        };
        
        var maskdisp = function (match, ignore, math) {
            snips.push("\\[" + math + "\\]" );
            return "<!--MATHSNIP" + (snips.length-1) + "-->";
        };
    
        var rep = function (match, num) {
            return snips[parseInt(num, 10)];
        };
        
        var undo = function (html) {
            var reg = /<\!\-\-MATHSNIP(\d+)\-\->/g; 
            return html.replace(reg, rep);
        };
    
        var inline = /(\`+)([^`]+)\1\$/g;
        code = code.replace(inline, maskinline);
        var display = /(\`+)\$([^`]+)\1/g;
        code = code.replace(display, maskdisp);
        return [code, undo];
    }]
};

Folder.sync( "md", function (code, args) {
    var plug = this.plugins.md;
    var html, rend;
    rend = plug[args[0]] || plug.def;
    var post = [];
    plug.prepost.forEach(function (el, ind) {
        var temp;
        if (args[ind+1] !== false) {
            temp = el(code);
            post.push(temp[1]);
            code = temp[0];
        }
    });
    html = rend.render(code);
    post.forEach(function (el) {
        html = el(html);
    });
    return html;
});

var cheerio = require('cheerio');
Folder.plugins.cheerio = {
    req: cheerio
};

Folder.sync( "cheerio" , function(code, args) {
    var selector = args.shift(); 
    var method = args.shift();
    var $ = cheerio.load(code);
    var el$ = $(selector);
    try {
       el$[method].apply(el$, args);
       return $.html();
    } catch (e) {
        this.log("Problem with cheerio: " + selector + "," + 
            method + "," + args.join(","));
        return code;
    }
});
Folder.sync( "ch-replace" , function(code, args) {
    var selector, replacement;
    var n = args.length;
    var $ = cheerio.load(code);
    var i;
    for (i = 0; i < n; i += 2) {
        selector = args[i];
        replacement = args[i+1];
        $(selector).replaceWith(replacement);
    }
    return $.html();
});

var postcss      = require('postcss');

Folder.commands.postcss = function (input, args, name) {
    var doc = this;
    var pc = doc.plugins.postcss; 
    var cmds = [];
    if ( (typeof input !== "string") || (input === '') ) {
        doc.gcd.emit("text ready:" + name, input);
        return;
    }
    args.forEach(function (el) {
        if (typeof pc[el] === "function" ) {
            cmds.push(pc[el]);
        }
    });
    postcss(cmds).process(input).then(function (result) {
        result.warnings().forEach(function (warn) {
            doc.log(warn.toString());
        });
        doc.gcd.emit("text ready:" + name, result.css);
    }).catch(function (error) {
        doc.log(error.toString());
    });
};

Folder.plugins.postcss = {
    req : postcss,
     autoprefixer : require('autoprefixer')
};

var tidy = require("js-beautify");

Folder.plugins.tidy = {
    js : {
       "indent_size": 4, 
       "jslint_happy": true 
    },
    css: {},
    html :{}
};

Folder.sync("tidy", function (code, args) {
    var type = args[0];
    var options = args[1] || {};
    var plug = this.plugins.tidy;

    if (! plug.hasOwnProperty(type) ) {
        type = "js";
    }
    
    code = tidy[type](code, merge(true, plug[type], options ));  

    return code;
});

var jsmin = require("uglify-js").minify;
var cssmin = require("clean-css");
var htmlmin = require("html-minifier").minify;

Folder.plugins.minify = {
    js : {},
    css : {},
    html : {}
};

Folder.sync("minify", function (code, args) {
    var type = args[0];
    var options = args[1] || {};
    var plug = this.plugins.minify;

    if (! plug.hasOwnProperty(type) ) {
        type = "js";
    }
    
    options = merge(true, plug[type], options);

    switch (type) {
        case 'js' : 
            options.fromString = true; 
            code = jsmin(code, options);
        break;
        case 'css' : 
            code = new cssmin(options).minify(code);
            if (args[2] !== true) {
                code = code.styles; 
            }
        break;
        case 'html':
            code = htmlmin(code, options);
        break;
    }

    return code;
} );

var datefns = require('date-fns');
Folder.requires.datefns = datefns;
Folder.dash.date = [datefns, 0];
Folder.sync('date', function (date, args) {
    var fn = args[0];
    if (date) {
        if (typeit(date) !== 'date') {
            date = datefns.parse(date);
        }
    } else {
        if (datefns.hasOwnProperty(fn) ) {
            // has method and no incoming so make date
            date = new Date();
        } else if (! fn)  {
            return new Date();
        } else {
            // assuming date string in first argument
            date = datefns.parse(args.shift());
            fn = args[0];
        }
    }
        if (! (datefns.hasOwnProperty(fn) ) ) {
            // no method just get a date object
            return date;
        } else {
            args[0] = date;
        }
    return datefns[fn].apply(datefns, args);
});

var csv = Folder.requires.csv = require("csv");
Folder.plugins.csv = {
    parse : {},
    stringify : {},
    transform : {}
};
Folder.async("csv-parse", function (input, args, cb) {
    var options = merge(args[0], this.plugins.csv.parse);
    csv.parse(input, options,  cb);
});
Folder.async("csv-transform", function (input, args, cb) {
    var options = merge(args[1], this.plugins.csv.transform);
    var f = (typeit(args[0] === "function" ) ) ?
        args[0] : function (el) {return el;};
    csv.transform( input, f, options, cb);
});
Folder.async("csv-stringify", function (input, args, cb) {
    var options = merge(args[0], this.plugins.csv.stringify);
    csv.stringify(input, options,  cb);
});

var lodash = Folder.requires.lodash = require("lodash");
Folder.dash.lodash = [lodash, 1];
Folder.sync("lodash", function (input, args) {
    if (args.length) {
        var method = args[0];
        if ( typeit(lodash[method], 'function') ) {
            args[0] = input;
            return lodash[method].apply(lodash, args);
        } else {
            // this is an error. need to come up with a warning.
            this.warn("lodash", "unrecognized method", method);
            return input; 
        }
    } else {
        return input;
    }
});

var he = require('he');
Folder.requires.he = he;
Folder.plugins.he = {
    encode : {},
    decode : {},
};
Folder.sync("html-encode", function (input, args) {
    var options = merge(this.plugins.he.encode, args[0]);        
    return he.encode(input, options);
});
Folder.sync("html-decode", function (input, args) {
    var options = merge(this.plugins.he.decode, args[0]);        
    return he.decode(input, options);
});
Folder.sync("html-qescape", function (input) {
    return he.escape(input);
});

Folder.prototype.encoding = args.encoding;
Folder.prototype.displayScopes = (args.scopes ? function () {
    var folder = this;
    var str = '';
    Object.keys(folder.scopes).forEach(function (el) {
        str += el+ "::\n------\n";
        var scope = folder.scopes[el];
        Object.keys(scope).sort().forEach(
            function (v) {
                str+= v + ": '" + scope[v] + "'\n* * *\n";
            });
        str += "\n------\n";
    });
    str = str.replace(/\n\n/g, "\n");
    console.log(str);
} :
    function () {} );


Folder.lprc(args.lprc, args);

Folder.process(args);

process.on('exit', Folder.exit());
