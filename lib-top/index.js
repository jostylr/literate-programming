/*global require, module */
/*jslint evil:true*/

var EvW = require('event-when');
var commonmark = require('commonmark');
require('string.fromcodepoint');


var apply = function (instance, obj) {
    var meth, i, n;

    for (meth in obj) {
        n = obj[meth].length;
        for (i = 0; i < n; i += 1) {
            instance[meth].apply(instance, obj[meth][i]);
        }

    }
};

var Folder = function (actions) {
    actions = actions || Folder.actions;
    //var parent = this;

    var gcd = this.gcd = new EvW();
    //.when will preserve initial, not emitted order
    gcd.initialOrdering = true; 
    
    // this is for handling file loading
    var fcd = this.fcd = new EvW();
    fcd.folder = this; // so it can issue warnings, etc.
    
    this.docs = {};
    this.scopes = { g:{} };
    
    this.commands = Folder.commands;
    this.directives = Folder.directives;
    this.subCommands =Folder.subCommands;
    this.reports = {};
    this.recording = {};
    this.stack = {};
    this.reporters = Folder.reporters;
    this.plugins = Folder.plugins;
    this.leaders = Folder.leaders;
    this.dash = Folder.dash;
    this.booleans = Folder.booleans;
    this.flags = {};
    this.comments = Folder.comments;
    this.Folder = Folder;
    
    this.logs = {
        error : [],
        warn : [],
        events : [],
        "command log" : [],
        "directive log" : {},
        out : {},
        0 : []
    };

    this.done = {
        gcd : new EvW(),
        cache : {}
    };
    this.done.gcd.action("done", function (data, evObj) {
        var folder = this;
        folder.done.cache[evObj.ev] = true;
    }, this);
    
    gcd.parent = this;

    gcd.on("block needs compiling", "compiling block");
    
    gcd.action("compiling block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[1];
            var blockname = evObj.pieces[0];
            var doc = gcd.parent.docs[file]; 
            var block = doc.blocks[blockname];
            doc.blockCompiling(block, file, blockname);
        }
    );
    
    gcd.on("heading found", "add block");
    
    gcd.action("add block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var text = doc.convertHeading(data);
            var curname = doc.heading = doc.curname = text;
            doc.levels[0] = text;
            doc.levels[1] = '';
            doc.levels[2] = '';
            if ( ! doc.blocks.hasOwnProperty(curname) ) {
                doc.blocks[curname] = '';
            }
        }
    );
    
    gcd.on("heading found:5", "add slashed block");
    
    gcd.action("add slashed block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var text = doc.convertHeading(data);
            doc.levels[1] = text;
            doc.levels[2] = '';
            var curname = doc.heading = doc.curname = doc.levels[0]+'/'+text;
            if ( ! doc.blocks.hasOwnProperty(curname) ) {
                doc.blocks[curname] = '';
            }
            evObj.stop = true;
        }
    );
    
    gcd.on("heading found:6", "add double slashed block");
    
    gcd.action("add double slashed block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var text = doc.convertHeading(data);
            doc.levels[2] = text;
            var curname = doc.heading = doc.curname = doc.levels[0]+'/'+doc.levels[1]+'/'+text;
            if ( ! doc.blocks.hasOwnProperty(curname) ) {
                doc.blocks[curname] = '';
            }
            evObj.stop = true;
        }
    );
    
    gcd.on("switch found", "create minor block");
    
    gcd.action("create minor block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var colon = doc.colon;
            var text = doc.convertHeading(data[0]);
            
            var subEmit, textEmit, doneEmit;
            
            var curname = doc.curname = doc.heading+colon.v+text;
            if ( ! doc.blocks.hasOwnProperty(curname) ) {
                doc.blocks[curname] = '';
            }
            
            
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
        }
    );
    
    gcd.on("code block found", "add code block");
    
    gcd.action("add code block", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            if (doc.blockOff > 0) { return;}
            if (doc.blocks[doc.curname]) {  
                doc.blocks[doc.curname] +=  doc.join + data;
            } else {
                doc.blocks[doc.curname] = data;
            }
        }
    );
    
    gcd.on("code block found:ignore", "ignore code block");
    
    gcd.action("ignore code block", function (data, evObj) {
            var gcd = evObj.emitter;
            evObj.stop = true;
            gcd=gcd; //js hint quieting
        }
    );
    
    gcd.on("directive found", "process directives");
    
    gcd.action("process directives", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var fun;
            var directive = evObj.pieces[1];
            if (directive && (fun = doc.directives[directive] ) ) {
                fun.call(doc, data);
            }
        }
    );
    
    gcd.on("parsing done", "list blocks to compile");
    
    gcd.action("list blocks to compile", function (data, evObj) {
            var gcd = evObj.emitter;
            var file = evObj.pieces[0];
            var doc = gcd.parent.docs[file];
            var blocks = doc.blocks;
            var name;
            for (name in blocks) {
                gcd.emit("block needs compiling:" + file + ":" + name); 
            }
        }
    );
    
    gcd.on("waiting for", "wait reporting");
    
    gcd.action("wait reporting", function (data, evObj) {
            var gcd = evObj.emitter;
             
            var reports = gcd.parent.reports; 
            
            var evt = data[0];
            var msg = evObj.pieces.slice(0,-1).reverse().join(":");
            
            
            reports[msg] = data.slice(1);
            gcd.once(evt, function () {
                delete reports[msg];
            });
        }
    );
    
    gcd.on("push ready", "finish push");
    
    gcd.action("finish push", function (data, evObj) {
            var gcd = evObj.emitter;
            
            var name = evObj.pieces[0];
            var file = evObj.pieces[1]; 
            var doc = gcd.parent.docs[file];
            
            if (! Array.isArray(data) ) {
                data = [data];
            }
            
            if (doc) {
                doc.store(name, data);
            } else {
                gcd.emit("error:impossible:action push", 
                    [data, evObj.pieces]);
            }
        }
    );

    if (actions) {
        apply(gcd, actions);
    }

    Folder.postInit(this);
    
    

    return this;
};

Folder.requires = {};
var clone = Folder.requires.clone = function clone (input) {
	var output = input;
	var	type = typeit(input);
	var	i, n, keys;
	if (type === 'array') {
		output = [];
		n = input.length;
		for ( i=0 ; i < n; i+=1 ) {
		    output[i] = clone(input[i]);
        }
	} else if (type === 'object') {
		output = {};
        keys = Object.keys(input);
        n = keys.length;
        for ( i=0; i <n; i+=1) {
			output[keys[i]] = clone(input[keys[i]]);
        }
	}
	return output;
};
var typeit = Folder.requires.typeit = function (input, test) {

    var type = ({}).toString.call(input);
  
    if (type === '[object Object]') {
      type = 'object';
    } else if (type === '[object Array]') {
      type = 'array';
    } else if (type === '[object String]') {
      type = 'string';
    } else if (type === '[object Number]') {
      type = 'number';
    } else if (type === '[object Function]') {
      type = 'function';
    } else if (type === '[object Null]') {
      type = 'null';
    } else if (type === '[object Bolean]') {
        type = 'boolean';
    } else if (type === '[object Date]') {
        type = 'date';
    } else if  (type === '[object RegExp]') {
        type = 'regexp';
    } else {
        type = 'undefined';
    }
    if (test) {
        if (test[0] === '!') {
            return type !== test.slice(1);
        } else {
            return (type === test);
        }
    } else {
        return type;
    }
};
var merge = Folder.requires.merge = function (bclone, recursive) {
    var merge_recursive = function merge_recursive(base, extend) {
    
    	if ( typeit(base) !== 'object') {
    		return extend;
        }
        
        var i, key;
        var keys = Object.keys(extend);
        var n = keys.length;
        for (i = 0; i < n; i += 1) {
            key = keys[i];
    		if ( (typeit(base[key]) === 'object') && 
                 (typeit(extend[key]) === 'object') ) {
    			base[key] = merge_recursive(base[key], extend[key]);
    		} else {
    			base[key] = extend[key];
    		}
    	}
    	return base;
    };
    var merge = function merge(bclone, recursive, argv) {
    
    	var result = argv[0];
    	var n = argv.length;
    
        if (bclone || typeit(result) !== 'object') {
    		result = {};
        }
    
        var item, sitem, key, i, type, j, m, keys;
    	for ( i=0; i<n ; i+= 1 ) {
    
    		item = argv[i];
    	    type = typeit(item);
    
    		if (type !== 'object') {
                continue;
            }
    
            keys = Object.keys(item);
            m = keys.length;
            for (j=0; j < m; j +=1) {
                key = keys[j];
    			sitem = bclone ? clone(item[key]) : item[key];
    			if (recursive) {
    				result[key] = merge_recursive(result[key], sitem);
    			} else {
    				result[key] = sitem;
    			}
    		}
    	}
    	return result;
    };
    if ( typeit(bclone) !== 'boolean' ) {
       return merge(false, false, arguments);
    } else if (typeit(recursive) !== 'boolean') {
        return merge(bclone, false, arguments);
    } else {
        return merge(bclone, recursive, arguments);
    }
};

Folder.comments = {};

Folder.prototype.parse = function (doc) {
    var gcd = doc.gcd;
    var file = doc.file;

    gcd.when("marked done:"+file, "parsing done:"+file);

    gcd.on("parsing done:"+file, function () {
        doc.parsed = true;
    });

    var text = doc.text;
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

    var reader = new commonmark.Parser();
    var parsed = reader.parse(text); 

    var walker = parsed.walker();
    var event, node, entering, htext = false, ltext = false, lang, code;
    var ind, pipes, middle, title, href, directive; //for links

    while ((event = walker.next())) {
        node = event.node;
        entering = event.entering;

        switch (node.type) {
        case "text" : 
            if (htext) {
                htext.push(node.literal);
            }
            if (ltext) {
                ltext.push(node.literal);
            }
        break;
        case "link" : 
            if (entering) {
                ltext = [];
            } else {
                href = node.destination;
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
                        gcd.emit("directive found:transform:" + file, 
                            {   link : ltext,
                                input : title.slice(1),
                                href: href, 
                                cur: doc.curname, 
                                directive : "transform"
                            }
                        );
                    } else {
                        ind = 0;
                        pipes = title.indexOf("|");
                        if (pipes === -1) {
                            middle = title.slice(ind+1).trim(); 
                            pipes = '';
                        } else {
                            middle = title.slice(ind+1, pipes).trim();
                            pipes = title.slice(pipes+1).trim();
                        }
                        if (middle) {
                            ltext += "." + middle.toLowerCase();    
                        }
                        gcd.emit("switch found:" + file, [ltext,pipes]);
                    }
                } else if ( (ind = title.indexOf(":")) !== -1) {
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
                }
                ltext = false;
            }
        break;
        case "code_block" :
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
        break;
        case "heading" :
            if (entering) {
                htext = [];
            } else {
                gcd.emit("heading found:"+node.level+":"+file, htext.join(""));
                htext = false;
            }
        break;
        }

       // console.log(node.type, node.literal || '', node.destination|| '', node.title|| '', node.info|| '', node.level|| '', node.sourcepos, event.entering);
    }

    gcd.emit("marked done:" + file);
};

Folder.prototype.newdoc = function (name, text, actions) {
    var parent = this;

    var doc = new parent.Doc(name, text, parent, actions);
    
    try {
        parent.parse(doc);
    } catch (e) {
        doc.log("Markdown parsing error. Last heading seen: " + 
            doc.curname);       
    }

    return doc;

};

Folder.prototype.colon = {   v : "\u2AF6",
    escape : function (text) {
         return (typeof text === "string") ? 
            text.replace(/:/g,  "\u2AF6") : text;
    },
    restore : function (text) {
        return (typeof text === "string") ? 
            text.replace( /[\u2AF6]/g, ":") : text;
    }
};

Folder.prototype.join = "\n";

Folder.prototype.log = function (msg, level) {
    var out = this.logs;
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(msg);
    if (typeit(level, "undefined")) {
        out[0].push(args);
    } else {
        if (typeit(out[level], "array") ) {
            out[level].push(args);
        } else {
            out[level] = [args];
        }
    } 
        
};
Folder.prototype.error= function () {
    var doc = this;
    var gcd = doc.gcd;
    var args = Array.prototype.slice.call(arguments);

    doc.logs.error.push(args); 
    //shuts off all further processing
    gcd.stop();
};
Folder.prototype.warn= function () {
    var doc = this;
    var args = Array.prototype.slice.call(arguments);

    doc.logs.warn.push(args);
};
Folder.prototype.dirlog = function (name, data) {
    var doc = this;
    
    var out = doc.logs;
    if (!name) {
        name = 'dirlog'+this.uniq();
        doc.warn('dir:log', 'need unique name for directive log', name);
    }
    out["directive log"][name] = data;
} ;
Folder.prototype.cmdlog = function (input, lbl, data) {
    var out = this.logs;
    out['command log'].push([lbl, input, data]);
} ;
Folder.prototype.eventlog = function (event, lbl, data) {
    var out = this.logs;
    out.events.push([lbl, event, data]);
} ;
Folder.prototype.formatters = {
    "error": function (list) {
        return list.map(
            function (args) {
                var kind = args.shift();
                var description = args.shift();
                var ret = "### " + kind + "\n" + description + "\n";
                if (args.length) {
                    ret += args.join("\n* ");
                }
                return ret;
            }).
            join("\n");
    },
    "warn": function (list) {
        return list.map(
            function (args) {
                var kind = args.shift();
                var description = args.shift();
                var ret = "### " + kind + "\n" + description + "\n";
                if (args.length) {
                    ret += args.join("\n* ");
                }
                return ret;
            }).
            join("\n");
    },
    "out": function (obj) {
        return Object.keys(obj).
            map(function (key) {
                return  "### " + key + "\n`````\n" + obj[key] + "\n`````";
            }).
            join('\n* * *\n');
    },
    "log": function (list) {
        return list.map(
                function (args) {
                    var msg = args.shift();
                    var ret = "* " + msg;
                    if (args.length) {
                        ret += "\n    * " + 
                            args.join("\n    * ");
                    }
                    return ret;
            }).
            join('\n* * *\n');
    },
    "command log": function (list) {
        var types = {};
        list.forEach(function (el) {
            var lbl = el[0];
            if (!(types[lbl]) ) {
                types[lbl] = [];
            }
            types[lbl].push(el.slice(1));
        });
        return Object.keys(types).map(function (el) {
            var str = "### " + el + "\n";
            str += types[el].map(function (evd) {
                var event = evd[0];
                var data = evd[1];
                return event + 
                    (data.length ? ('\n~~~\n' + data.join('\n~~~\n') ) : '' );
            }).
            join('\n* * *\n');
            return str;
        }).
        join('\n* * *\n');
    },
    "one arg": function (list) {
        var ret = '';
        ret += list.map(
            function (args) {
                return args.shift();
            }).
            join("\n");
        return ret;
    } ,
    "directive log": function (obj) {
        var keys = Object.keys(obj);
        return keys.map(function (name) {
            var data = obj[name];
            return name + '\n`````\n' + data + '\n`````\n';
        }).
        join('\n* * *\n');
    },
    "events": function (list) {
        var types = {};
        list.forEach(function (el) {
            var lbl = el[0];
            if (!(types[lbl]) ) {
                types[lbl] = [];
            }
            types[lbl].push(el.slice(1));
        });
        return Object.keys(types).map(function (el) {
            var str = "### " + el + "\n";
            str += types[el].map(function (evd) {
                var event = evd[0];
                var data = evd[1];
                return event + 
                    (data ? ('\n`````\n' + data + '\n`````\n') : '');
            }).
            join('\n* * *\n');
            return str;
        }).
        join('\n* * *\n');
    }
};
Folder.prototype.reportOut = function (filter) {
    var folder = this;
    var formatters = folder.formatters;
    var docs = Object.keys(folder.docs);
    var ret = '';
    docs.forEach(function (key) {
          var dig = folder.docs[key].logs;
          var temp = '';
          var keys =  Object.keys(dig);
          if (typeit(filter, 'function') ) {
              keys = keys.filter(filter);
          }
          temp += keys.map (function (typ) {
              var str = '';
              if (typeit(formatters[typ], 'function') ) {
                  str += formatters[typ](dig[typ]);
              } else {
                  str += formatters.log(dig[typ], typ);
              }
              if (str) {
                  str = "## " + typ.toUpperCase() + "\n" + str;
              }
              return str;
          }).
          filter(function (el) {return !!el;}).
          join("\n");
          if (temp) {
            ret +=  (ret ? "\n" : "") + "# DOC: " + key + "\n"  + temp;
          } 
    });
    var dig = this.logs;
    var temp = '';
    var keys =  Object.keys(dig);
    if (typeit(filter, 'function') ) {
        keys = keys.filter(filter);
    }
    temp += keys.map (function (typ) {
        var str = '';
        if (typeit(formatters[typ], 'function') ) {
            str += formatters[typ](dig[typ]);
        } else {
            str += formatters.log(dig[typ], typ);
        }
        if (str) {
            str = "## " + typ.toUpperCase() + "\n" + str;
        }
        return str;
    }).
    filter(function (el) {return !!el;}).
    join("\n");
    if (temp) {
      ret +=  (ret ? "\n" : "") + "# FOLDER LOGS\n" + temp;
    } 
    ret = ret.replace('\n`````\n' + "\n", '\n`````\n');
    return ret;
};
Folder.prototype.logLevel = 0; 

Folder.prototype.indicator = "\u2AF6\u2AF6\u2AF6";

Folder.prototype.convertHeading = function (str) {
    var reg = /\s+/g;
    str = str.trim().toLowerCase();
    str = str.replace(reg, " ");
    return str;
};

Folder.normalize = function (name) { 
    name = name.toLowerCase().
        replace(/(.)-/g, "$1").
        replace(/(.)_/g, "$1");
    return name;
    
};
var sync  = Folder.prototype.wrapSync = function (fun, label) {
        var temp;
        if (typeof fun === "string") {
            temp = fun;
            fun = label;
            label = fun;
        }

    var f = function (input, args, name, command) {
        var doc = this;
        var gcd = doc.gcd;

        try {
            var out = fun.call(doc, input, args, name);
            gcd.scope(name, null); // wipes out scope for args
            gcd.emit("text ready:" + name, out); 
        } catch (e) {
            doc.log(e);
            gcd.emit("error:command execution:" + name, 
                [e, e.stack, input, args, command]); 
        }
    };

    if (label) {
        f._label = label;
    }

    return f;
};
Folder.sync = function (name, fun) {
    name = Folder.normalize(name);
    return (Folder.commands[name] = sync(name, fun));
};

var async = Folder.prototype.wrapAsync = function (fun, label) {
        var temp;
        if (typeof fun === "string") {
            temp = fun;
            fun = label;
            label = fun;
        }
    var f = function (input, args, name, command) {
        
        var doc = this;
        var gcd = doc.gcd;

        var callback = function (err, data) {
            if (err) {
                doc.log(err);
                gcd.emit("error:command execution:" + name, 
                    [err, input, args, command]);
            } else {
                gcd.scope(name, null); // wipes out scope for args
                gcd.emit("text ready:" + name, data);
            }
        };
        callback.name = name; 
        fun.call(doc, input, args, callback, name);
    };
    if (label)  {
        f._label = label;
    } 
    
    return f;
};
Folder.async = function (name, fun) {
    name = Folder.normalize(name);
    return (Folder.commands[name] = async(name, fun));
};

var defaults = Folder.prototype.wrapDefaults = function (label, fun) {
        var temp;
        if (typeof fun === "string") {
            temp = fun;
            fun = label;
            label = fun;
        }
    var i, n, bad;

    var arr = fun.slice();
    var tag = arr.shift() || '';
    fun = arr.pop();

    if (typeof tag === "string") {
        tag = (function (tag) {
            return function (args) {
                var doc = this;
                var col = doc.colon.v;
                return tag + args.join(col) + col + doc.file +  
                    col + doc.uniq();
            };
        })(tag);
    }

    n = arr.length;
    bad = true;
    for (i = 0; i < n; i += 1) {
        if (arr[i] && typeof arr[i] === "string") {
            bad = false;
        } else {
            arr[i] = '';
    
        }
    } 
    
    var f = function (input, args, name, command) {
        
        var doc = this;
        var gcd = doc.gcd;
        var v = doc.colon.v;
        
        var cbname = tag.call(doc, args);    

        gcd.when(cbname + v + "setup", cbname); 

        arr.forEach(function (el, i) {
            if ( ( el ) && ( ( typeof args[i] === "undefined" ) || ( args[i] === '' ) ) ) {
                gcd.when(cbname + v + i, cbname);
                doc.retrieve(el, cbname + v + i); 
            } 
        });
        
        gcd.on(cbname, function(data) {
            data.shift(); // get rid of setup
            data.forEach(function (el) {
                var ev = el[0];
                var i = parseInt(ev.slice(ev.lastIndexOf(v)+1));
                args[i] = el[1];
            });
            try {
                var out = fun.call(doc, input, args, name);
                gcd.scope(name, null); // wipes out scope for args
                gcd.emit("text ready:" + name, out); 
            } catch (e) {
                doc.log(e);
                gcd.emit("error:command execution:" + name, 
                    [e, e.stack, input, args, command]); 
            }
        });
        
        gcd.emit(cbname + v + "setup");
        
    };

    if (label)  {
        f._label = label;
    } 
    
    return f;

};
Folder.defaults = function (name, fun) {
    name = Folder.normalize(name);
    return (Folder.commands[name] = defaults(name, fun) );
};

Folder.prototype.uniq = Folder.requires.unique =
    function () {
        var counter = 0;
        return function () {
            return counter += 1;
        };
    };

Folder.prototype.createScope = function (name) {
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
};
Folder.prototype.subnameTransform = function (subname, lname, mainblock) {
    var colind, first, second, main;
    var doc = this;
    var colon = doc.colon;
    
    var reg = /\s*\:\s*/g;
    subname = subname.replace(reg, ":");

    if (subname[0] === ":") {
        if (mainblock) {
            //console.log(mainblock)
        } else {
            colind = lname.lastIndexOf(":");
            mainblock = lname.slice(colind+1, lname.indexOf(colon.v, colind));
        }
        if (subname === ":") {
            subname = mainblock;
        } else {
            subname = mainblock + subname;
        }
        return subname;
    } 

    if (subname.slice(0, 6) === "../../" ) {
        //in a/b/c asking for a
        if (mainblock) {
            //console.log(mainblock)
        } else {
            colind = lname.lastIndexOf(":");
            mainblock = lname.slice(colind+1, lname.indexOf(colon.v, colind));
        }
        main = mainblock.slice(0, mainblock.indexOf("/")); 
        if ((subname.length > 6) && (subname[6] !== ":") ) {
            subname =  main + "/" + subname.slice(6);
        } else {
            subname = main + subname.slice(6);
        }
    } else if (subname.slice(0,2) === "./" ) {
        // in a/b asking for a/b/c using ./c
        if (mainblock) {
            //console.log(mainblock)
        } else {
            colind = lname.lastIndexOf(":");
            mainblock = lname.slice(colind+1, lname.indexOf(colon.v, colind));
        }
        if (subname[2] === ":" ) {
            subname = mainblock + subname.slice(2);
        } else {
            subname = mainblock + "/" + subname.slice(2);     
        }
    } else if (subname.slice(0,3) === "../") {
        //either in a/b or in a/b/c and asking for a or a/b, respectively
        if (mainblock) {
            //console.log(mainblock)
        } else {
            colind = lname.lastIndexOf(":");
            mainblock = lname.slice(colind+1, lname.indexOf(colon.v, colind));
        }
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
   
    return subname;

};

// communication between folders, say for caching read in files
Folder.fcd = new EvW(); 

Folder.postInit = function () {}; //a hook for plugin this modification
Folder.plugins = {};
Folder.leaders = ['.', '-', '#', '*'];
Folder.dash = {};
Folder.booleans = { 
    "and" : function (args) {
        return args.every(function (el) {
            return !!el;
        });
    },
    "or" : function (args) {
        return args.some(function(el) {
            return !!el;
        });
    },
    "not" : function (args) {
        return !args[0];
    },
    "===" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one === el);
            });
            return ret;
        },   
    "==" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one == el);
            });
            return ret;
        },   
    ">=" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one >= el);
            });
            return ret;
        },   
    ">" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one > el);
            });
            return ret;
        },   
    "<=" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one <= el);
            });
            return ret;
        },   
    "<" :   function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one < el);
            });
            return ret;
        },   
    "!=" : function (args) {
        var i, j, n = args.length, cur;
        for (i = 0; i < n; i += 1) {
            cur = args[i];
            for (j = i + 1; j < n; j += 1) {
               if ( (cur == args[j] ) ) {
                    return false;
               }
            }
        }
        return true;
    },   
    "!==" :  function (args) {
        var i, j, n = args.length, cur;
        for (i = 0; i < n; i += 1) {
            cur = args[i];
            for (j = i + 1; j < n; j += 1) {
               if ( (cur === args[j] ) ) {
                    return false;
               }
            }
        }
        return true;
    },
    "flag" : function (flag) {
        return this.parent.flags.hasOwnProperty(flag);
    },
    "match" : function (args) {
        var doc = this;
        var typeit = this.Folder.requires.typeit;
        
    
        var str = args[0];
        var condition = args[1];
    
        if (typeit(str) !== 'string') {
            doc.warn("subcmd:boolean match",
                "first argument needs to be a string",
                "inputs: ", str, condition);
            return false;
        }
    
        var typ = typeit(condition);
        
        if (typ === 'string') {
            return (str.indexOf(condition) !== -1);
        } else if (typ === 'regexp') {
            return (condition.test(str)); 
        } else {
            doc.warn("subcmd:boolean match",
                "second argument needs to be string or regex",
                "inputs: ", str, condition);
            return false;
        }
    
    },
    "type" : function (obj) {
        var typeit = this.Folder.requires.typeit;
        
    
        var args = Array.prototype.slice.call(arguments, 1);
    
        var t = typeit(obj);
    
        if (args.length === 1) {
            return t === args[0];
        } else if (args[0] === '!') {
            args.shift();
            return args.every(function (el) {
                return t !== el;
            });
        } else {
            return args.some(function (el) {
                return t === el;
            });
        }
    
    }
};

Folder.reporters = {
    save : function (args) {
        var name = this.recording[args[2]] || args[2];
        return "NOT SAVED: " + args[0] + " AS REQUESTED BY: " + args[1] + 
            " NEED: " + name;
    },
    out : function (args) {
        var name = this.recording[args[2]] || args[2];
        return "NOT REPORTED OUT: " + args[0] + " AS REQUESTED BY: " + args[1] + 
            "\nNEED: " + name;
    },
    "command defined" : function (args) {
        var name = this.recording[args[2]] || args[2];
        return "COMMAND NOT DEFINED: " + args[0] + " AS REQUESTED IN: " + args[1] + 
            "\nNEED: " + name;
    },
    "scope exists" : function (data) {
        if (data[3]) {
            return "NEED SCOPE: " + data[0] + " FOR RETRIEVING: " + data[2] + 
                " IN FILE: " + data[1]; 
        } else {
            return "NEED SCOPE: " + data[0] + " FOR SAVING: " + data[2] + 
                " IN FILE: " + data[1]; 
        }
    },
    "text" : function (data) {
        var hint = this.recording[data[0]];
        var parts = data[0].split(":").reverse();
        var block = parts[0].split(this.colon.v)[0];
        if (hint) {
            return "PROBLEM WITH: " + hint + " IN: " + block + 
                " FIlE: " + parts[1]; 
        } 
    
    },
    "minor" : function (data) {
        var hint = this.recording[data[0]];
        var parts = data[0].split(":").reverse();
        var block = parts[0].split(this.colon.v)[0];
        if (hint) {
            return "PROBLEM WITH: " + hint + " IN: " + block + 
                " FIlE: " + parts[1]; 
        } 
    
    },
    "retrieval" : function (data) {
        return "NEED VAR: " + data[1] + " FROM: " + data[0];
    },
    "cmd" : function (data) {
        var ind = data[1].lastIndexOf(this.colon.v);
        if (ind === -1) {
            ind = data[1].length + 1;
        }
        var name = data[1].slice(0, ind);
        var hint = this.recording[name];
        return "NEED COMMAND: " + data[0] + " FOR: " + hint; 
    }

};

Folder.prototype.reportwaits = function () {
    var report = this.reports;
    var reporters = this.reporters;
    var arr, msg, data, temp;

    arr = [];
    
    for (msg in report) {
        data = report[msg];
        if (reporters.hasOwnProperty(data[0]) ) {
            temp = reporters[data[0]].call(this, data.slice(1) );
            if (temp) {
                arr.push(temp);
            } else { 
               // console.log(msg, data);
            }
        }
    }

    return arr; 
};

Folder.prototype.simpleReport = function () {
    var folder = this;
    var recording = folder.recording;
    var gcd = this.gcd;
    var key, lname, ret = [], el, pieces;
    var v = this.colon.v;
    for (key in gcd.whens) {
        if (key.slice(0,15) === "stitch fragment") { 
            lname = key.slice(16);
            ret.push("PROBLEM WITH: " + recording[lname] + 
                " IN: " + lname.slice(lname.indexOf(":")+1, 
                   lname.indexOf(v) ) +  
                " FILE: " + lname.slice(0, lname.indexOf(":"))); 
        } 
    }
    for (key in gcd._onces) {
        el = gcd._onces[key];
        if ( el[0].slice(0, 15) === "command defined") {
            pieces = key.split(":");
            if (pieces.length < 3) {
                gcd.error("error:simple report:"+ el[1]);
                return ret;
            }
            ret.push("COMMAND REQUESTED: " + 
                pieces[1] +  
                " BUT NOT DEFINED. REQUIRED IN: " + 
                pieces[3].slice(0, pieces[3].indexOf(v)) +  
                " FILE: " + pieces[2] ); 
        }
    }
    return ret;
};

Folder.commands = {   eval : sync(function ( text, args ) {
    var doc = this;

    var code = args.shift();

    try {
        eval(code);
        return text;
    } catch (e) {
        doc.gcd.emit("error:command:eval:", [e, e.stack, code, text]);
        return e.name + ":" + e.message +"\n" + code + "\n\nACTING ON:\n" +
            text;
    }
}, "eval"),
    passthru : sync(function (text) {return text;}, "passthru"),
    sub : function (str, args, name) {
        var doc = this;
        var gcd = this.gcd;
        var typeit = this.Folder.requires.typeit;
        
        var regs = [];
        var strs = [];
        var i, n,  key, typ;
    
        n = args.length;
        for (i = 0; i < n; i += 2) {
            key = args[i];
            typ = typeit(key);
            if (typ === 'string') {
                strs.push([key, args[i+1]]);
            } else if (typ === 'regexp') {
                regs.push([key, args[i+1]]);
            } else {
                doc.warn("cmd:sub", 
                "bad kind; either string or regexp as every other argument.",
                typ, key, args[i+1]);
            }
        }
    
        strs.sort(function (a,b) {
            return b[0].length - a[0].length; 
        });
    
        strs.forEach(function (el) {
            var index = 0, i, indented;
            var toMatch = el[0];
            var rep = el[1];
            typ = typeit(rep);
            if  (typ !== 'string' ) {
                doc.warn("cmd:sub", "bad replacement; need string", 
                    typ, toMatch, rep);
                return; //no replacement done
            }
            while (index < str.length) {
                    i = str.indexOf(toMatch, index);
                
                    if (i === -1) {
                        break;
                    } else {
                        indented = doc.indent(rep, doc.getIndent(str, i));
                        str = str.slice(0,i) + indented + str.slice(i+toMatch.length);
                        index = i + indented.length;
                    }   
            }
        });
    
        regs.forEach(function (el) {
            var reg = el[0];
            var rep = el[1];
            typ = typeit(rep);
            if ( (typ !== 'string') && (typ !== 'function') ) {
                doc.warn("cmd:sub", "bad replacement; need string or function", 
                    typ, reg, rep);
                return; //no replacement done
            }
        
            str = str.replace(reg, rep);
        
        });
    
        gcd.emit("text ready:" + name, str); //example of bare command
    
    },
    store: sync(function (input, args) {
        var doc = this;
        var colon = this.colon.v;
        var colesc = this.colon.escape;
        
    
        var vname = colesc(args[0]);
        if (args[1]) {
            vname = vname + colon +  colesc(args[1]);
        }
    
        if (vname) {
            doc.store(vname, input);
        }
        return input; 
    }, "store"),
    clear: sync(function (input, args) {
        var doc = this;
        var colon = this.colon.v;
        var colesc = this.colon.escape;
        
    
        var vname = colesc(args[0]);
        if (args[1]) {
            vname = vname + colon +  colesc(args[1]);
        }
    
        if (vname) {
            doc.store(vname, null);
        }
        return input; 
    }, "clear"),
    log : sync(function (input, args) {
        var doc = this;
        args = args || [''];
        var type = args.shift();
        if (!type) {
            type = '';
        }
        doc.cmdlog(input, type, args);
        return input;
    }, "log"),
    async : async(function (text, args, callback) {
        var doc = this;
    
        var code =  args.shift();
    
        try {
            eval(code);
        } catch (e) {
            doc.gcd.emit("error:command:async:", [e, e.stack, code, text]);
            callback( null, e.name + ":" + e.message +"\n"  + code + 
             "\n\nACTING ON:\n" + text);
        }
    }, "async"),
    compile : function (input, args, name) {
        var doc = this;
        var gcd = doc.gcd;
        var file = doc.file;
        var colon = doc.colon.v;
        var i, n, start ;
    
        var stripped = name.slice(name.indexOf(":")+1) + colon + "c";
    
        if (args[0]) {
            start = args[0].toLowerCase();
        } else {
            i = name.indexOf(":")+1;
            n = name.indexOf(":", i);
            if (n === -1) { n = name.indexOf(colon); }
            start = name.slice(i, n);
        }
    
        n = args.length;
        for (i = 1; i < n; i += 2) {
            if (args[i] && (typeof args[i] === "string") ) {
                if (typeof args[i+1] === "undefined") {
                    doc.store(start + doc.colon.v + args[i].toLowerCase(), '');
                } else {
                    doc.store(start + doc.colon.v + args[i].toLowerCase(), args[i+1]);
                }
            }
        }
    
        gcd.once("minor ready:" + file + ":" + stripped, function (text) {
            gcd.emit("text ready:" + name, text); 
        });
        doc.blockCompiling(input, file, stripped, start );
    },
    raw : sync(function (input, args) {
        var doc = this;
        var start, end, text;
        var gcd = doc.gcd;
    
        var file = doc.parent.docs[args[2]] || doc;
        
        if (file) {
            text = file.text;
            start = args[0].trim() + "\n";
            start = text.indexOf(start)+start.length;
            end = "\n" + args[1].trim();
            end = text.indexOf(args[1], start);
            return text.slice(start, end);
        } else {
            gcd.emit("error:raw:" + doc.file, args);
            return '';
        }
    
    
    }, "raw"),
    trim : sync(function (input) {
        var typeit = this.Folder.requires.typeit;
        
        var t = typeit(input);
        if (t === 'string') {
            return input.trim();
        }
        if ( (t === 'undefined') || (t === 'null') ) {
            return '';
        }
        return input.toString().trim();
    }, "trim"),
    filter : sync(function (input, args) {
        var doc = this;
        var typeit = this.Folder.requires.typeit;
        
        var here = 'cmd:filter';
        var typ = typeit(input);
        var ret, num1, num2, nums, i, n;
        if (typ === 'array') {
            ret = [];
            if (args.length === 0) {
                args[0] = true;
            }
            args.forEach(function (cur) {
                if ( typeit(cur, 'number') ) {
                    ret.push(input[cur]);
                } else if (typeit(cur, 'string') ) {
                    if ( (num1 = parseInt(cur, 10) ) == cur) {
                        ret.push(input[num1]);
                    } else if (cur.indexOf(":") !== -1 ) {
                        nums = cur.split(":");
                        num1 = parseInt(nums[0].trim(), 10) || 0;
                        num2 = parseInt( (nums[1] || '').trim(), 10) || (input.length-1);
                        if (num1 > num2) {
                            for (i = num1; i >= num2; i -= 1) {
                                ret.push(input[i]);
                            } 
                        } else {
                            for (i = num1; i <= num2; i += 1) {
                                ret.push(input[i]);
                            }
                        }
            
                    } else if (cur.indexOf("x") !== -1 ) {
                      nums = cur.split("x");
                      num1 = ( parseInt(nums[0].replace(/ /g, ''), 10) || 1 );
                      num2 = ( parseInt((nums[1] || '').replace(/ /g, ''), 10) || 0);
                      if (num2 >= 0) {
                          i = num2;
                      } else {
                          i = input.length + num2;
                      }
                      if (num1 > 0) {
                          n = input.length;
                          for (i; i < n; i += num1 ) {
                              ret.push(input[i]);
                          }
                      } else if (num1 < 0) {
                          for (i; i >= 0; i += num1) {
                              ret.push(input[i]);
                          }
                      }
                    }
                } else if (typeit(cur, 'function') ) {
                    input.forEach(function (el, ind) {
                        if (cur(el, ind) === true ) {
                            ret.push(el);
                        }
                    });
                } else if (cur === true)  {
                    input.forEach(function (el) {
                        ret.push(el);
                    });
                } else {
                    doc.warn(here, 'unhandled type', typeit(cur), cur, input, args);
                }
            });
        } else if (typ === 'object') {
            ret = {};
            // Object.keys() and then filter on the keys
            var keys = Object.keys(input);
            keys.sort();
            if (args.length === 0) {
                args[0] = true;
            }
            args.forEach(function (cur) {
                if (typeit(cur, 'regexp')) {
                    keys.forEach(function (el) {
                        if (el.match(cur) ) {
                            ret[el] = input[el];
                        }
                    });
                } else if (typeit(cur, 'function'))  {
                     keys.forEach(function (el) {
                        if (cur(el, input[el]) === true ) {
                            ret[el] = input[el];
                        }
                     });
                } else if (typeit(cur, 'string')) {
                    if (input.hasOwnProperty(cur) ) {
                        ret[cur] = input[cur];
                    }
                } else if (cur === true) {
                    keys.forEach(function (el) {
                        ret[el] = input[el]; 
                    });
                } else {
                    doc.warn(here, 'unhandled type', typeit(cur), cur, input, args);
                }
            });
        } else {
            doc.error(here, 
                "unrecognized input type; need string, array, or object", 
                input, args);
            return input;
        }
        return ret;
    }, "filter"),
    join : sync(function (input, args) {
        var doc = this;
        var typeit = this.Folder.requires.typeit;
        
        var here = 'cmd:join';
        var sep = args.shift() || '';
         
        var typ = typeit(input);
        var ret, num1, num2, nums, i, n;
        if (typ === 'string') {
            if (input) { 
                // input may be empty and it should  not be added then
                args.unshift(input);
            }
            ret = args;
        } else if (typ === 'array') {
            ret = [];
            if (args.length === 0) {
                args[0] = true;
            }
            args.forEach(function (cur) {
                if ( typeit(cur, 'number') ) {
                    ret.push(input[cur]);
                } else if (typeit(cur, 'string') ) {
                    if ( (num1 = parseInt(cur, 10) ) == cur) {
                        ret.push(input[num1]);
                    } else if (cur.indexOf(":") !== -1 ) {
                        nums = cur.split(":");
                        num1 = parseInt(nums[0].trim(), 10) || 0;
                        num2 = parseInt( (nums[1] || '').trim(), 10) || (input.length-1);
                        if (num1 > num2) {
                            for (i = num1; i >= num2; i -= 1) {
                                ret.push(input[i]);
                            } 
                        } else {
                            for (i = num1; i <= num2; i += 1) {
                                ret.push(input[i]);
                            }
                        }
            
                    } else if (cur.indexOf("x") !== -1 ) {
                      nums = cur.split("x");
                      num1 = ( parseInt(nums[0].replace(/ /g, ''), 10) || 1 );
                      num2 = ( parseInt((nums[1] || '').replace(/ /g, ''), 10) || 0);
                      if (num2 >= 0) {
                          i = num2;
                      } else {
                          i = input.length + num2;
                      }
                      if (num1 > 0) {
                          n = input.length;
                          for (i; i < n; i += num1 ) {
                              ret.push(input[i]);
                          }
                      } else if (num1 < 0) {
                          for (i; i >= 0; i += num1) {
                              ret.push(input[i]);
                          }
                      }
                    }
                } else if (typeit(cur, 'function') ) {
                    input.forEach(function (el, ind) {
                        if (cur(el, ind) === true ) {
                            ret.push(el);
                        }
                    });
                } else if (cur === true)  {
                    input.forEach(function (el) {
                        ret.push(el);
                    });
                } else {
                    doc.warn(here, 'unhandled type', typeit(cur), cur, input, args);
                }
            });
        } else if (typ === 'object') {
            ret = [];
            // Object.keys() and then filter on the keys
            var keys = Object.keys(input);
            keys.sort();
            if (args.length === 0) {
                args[0] = true;
            }
            args.forEach(function (cur) {
                if (typeit(cur, 'regexp')) {
                    keys.forEach(function (el) {
                        if (el.match(cur) ) {
                            ret.push(input[el]);
                        }
                    });
                } else if (typeit(cur, 'function'))  {
                     keys.forEach(function (el) {
                        if (cur(el, input[el]) === true ) {
                            ret.push(input[el]);
                        }
                     });
                } else if (typeit(cur, 'string')) {
                    if (input.hasOwnProperty(cur) ) {
                        ret.push(input[cur]);
                    }
                } else if (cur === true) {
                    keys.forEach(function (el) {
                        ret.push(input[el]); 
                    });
                } else {
                    doc.warn(here, 'unhandled type', typeit(cur), cur, input, args);
                }
            });
        } else {
            doc.error(here, 
                "unrecognized input type; need string, array, or object", 
                input, args);
            return '';
        }
        return ret.join(sep);
    }, "join"),
    cat : sync(function (input, args) {
        var sep = '';
        if (input) {
            args.unshift(input);
        }
        return args.join(sep);
    }, "cat"),
    echo : sync(function (input, args) {
        return args[0];
    }, "echo"),
    get : function (input, args, name) {
        var doc = this;
        var colon = doc.colon;
    
        var section = colon.escape(args.shift());
        doc.retrieve(section, "text ready:" + name);
    },
    array : sync(function (input, args) {
        args.unshift(input);
        return args;
    }, "array"),
    push : sync(function (input, args, name) {
        var folder = this.parent;
        var stack = folder.stack;
        var cmdpipe = name.slice(0, name.lastIndexOf(folder.colon.v));
        if (stack.hasOwnProperty(cmdpipe)) {
            stack[cmdpipe].push(input);
        } else {
            stack[cmdpipe] = [input];
        }
        return input;
    }, "push"),
    pop : sync(function (input, args, name) {
        var gcd = this.gcd;
        var folder = this.parent;
        var stack = folder.stack;
        var cmdpipe = name.slice(0, name.lastIndexOf(folder.colon.v));
        var ret;
        if (stack.hasOwnProperty(cmdpipe)) {
            ret = stack[cmdpipe].pop();
            if (stack[cmdpipe].length === 0) {
                delete stack[cmdpipe];
            }
        } else {
            gcd.emit("error:pop found nothing to pop:"+name);
            ret = input;           
        }
        return ret;
    }, "pop"),
    "." : function (input, args, name, cmdname) {
        var doc = this;
        var gcd = doc.gcd;
        var propname = args.shift();
        var async = false;
        var prop;
        if ( (prop = input["." + propname] ) ) {
            async = true;
        } else {
            prop = input[propname];
        }
        var ret;
        if (typeof prop === "function") {
            if (async) {
                prop.call(doc, input, args, name, cmdname);
                return;
            } else {
                ret = prop.apply(input, args);
                if (typeof ret === "undefined") {
                    doc.log("method returned undefined ", 
                        "cmd:dot", input, "proerty requested:" + propname, args);
                    ret = input;
                } 
            }
        } else if (typeof prop === "undefined") {
            doc.log( "property undefined ", 
                "cmd:dot", input, "property requested:" + propname, args); 
            ret = input; 
        } else {
            ret = prop;
        }
        gcd.emit("text ready:" + name, ret);
    },
    "-" : function (input, args, name ) {
        var doc = this;
        var gcd = doc.gcd;
        var propname = args[0];
        var cmd;
        var dash = doc.dash;
       
            var found = Object.keys(dash).sort(function (a,b) {
               var numa = dash[a][1], numb = dash[b][1];
               var ret = numa - numb;
               if (isNaN(ret)) {
                    return 0;
               } else {
                    return ret;
               }
            }).some(function (a) {
                if (typeit(dash[a][0][propname], "function" )) {
                    cmd = a;
                    return true;
                }
            });
        
        // no such property
        if (!found) {
            doc.log("Command dash: no such property: " +  propname +
                " with args: " + args.join("\, ") );
            gcd.emit("text ready:" + name, input);
        } else {
            doc.commands[cmd].call(doc, input, args, name);
        }
    },
    "if" : function (input, args, name) {
        var doc = this;
        var gcd = doc.gcd;
        var bool = args[0];
        var cmd;
    
        if (bool) {
            cmd = args[1];
            args = args.slice(2);
            if (doc.commands[cmd]) {
                doc.commands[cmd].call(doc, input, args, name);
            } else {
                gcd.once("command defined:" + cmd, function () {
                    doc.commands[cmd].call(doc, input, args, name);
                });
            }
        } else {
            gcd.emit("text ready:" + name, input);
        }
    },
    "ifelse" : function (input, args, name) {
        var doc = this;
        var gcd = doc.gcd;
        var cmd;
        var checked = args.some(function (el) {
            if ( el[0] === true ) {
                cmd = el[1];
                args = el.slice(2);
                if (doc.commands[cmd]) {
                    doc.commands[cmd].call(doc, input, args, name);
                } else {
                    gcd.once("command defined:" + cmd, function () {
                        doc.commands[cmd].call(doc, input, args, name);
                    });
                }
                return true;
            } else {
                return false;
            }
        });
        if (!checked) {
            gcd.emit("text ready:" + name, input);
        }
    
    },
    "done" : function (input, args, name) {
        var gcd = this.gcd;
        this.parent.done.gcd.emit(args[0]);
        gcd.emit("text ready:" + name, input);
    },
    "when" : function (input, args, name) {
        var folder = this.parent;
        var gcd = this.gcd;
        var done = folder.done;
        var cache = done.cache;
        var when = [];
    
        var i, n = args.length;
        for (i = 0; i < n; i +=1) {
            if (! cache[args[i]]) {
                when.push(args[i]);
            }
        }
        if (when.length > 0) {
            done.gcd.once("ready to send:" + name, function () {
                gcd.emit("text ready:" + name, input);
            });
            done.gcd.when(when, "ready to send:" + name);
        } else {
            gcd.emit("text ready:" + name, input);
        }
    }
};

var dirFactory = Folder.prototype.dirFactory = function (namefactory, handlerfactory, other, post) {

    return function (state) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
        
        state.linkname = colon.escape(state.link);
        var temp;
        
        state.start =  doc.getBlock(state.href, state.cur);
        
        temp = doc.midPipes(state.input);
        state.options = temp[0];
        state.pipes = temp[1];
        
        namefactory.call(doc, state);
        
        handlerfactory.call(doc, state);

        other.call(doc, state);

        doc.pipeDirSetup(state.pipes, state.emitname, state.handler, 
            ( state.start ||  state.block || '') );
        
        var pipeEmitStart = "text ready:" + state.emitname + colon.v + "sp";
        if (! state.value) {
            doc.retrieve(state.start, pipeEmitStart);
        } else if (state.wait) {
            gcd.once(state.wait, function (data) {
                if (state.preprocess) {
                    data = state.preprocess(data);
                }
                gcd.emit(pipeEmitStart, data);
            });
        } else {
            gcd.once("parsing done:"+this.file, function () {
                gcd.emit(pipeEmitStart, state.value || "" );
            });
        }

        if (post) {
            post.call(doc, state);
        }
    };
    

};
Folder.plugins.npminfo = { 
    deps : {   val : function (arr) {return arr.join(",\n");},
        element : function (str) {
            var pieces;
            
            if (str) {
                pieces = str.trim().split(/\s+/);
                if (pieces.length === 2) {
                    return '"' + pieces[0].trim() + '"' + " : " + '"^' + 
                        pieces[1].trim() + '"';
                } 
            }
        },
        save : "npm dependencies" 
    },
    dev : {   val : function (arr) {return arr.join(",\n");},
        element : function (str) {
            var pieces;
            
            if (str) {
                pieces = str.trim().split(/\s+/);
                if (pieces.length === 2) {
                    return '"' + pieces[0].trim() + '"' + " : " + '"^' + 
                        pieces[1].trim() + '"';
                } 
            }
        },
        save : "npm dev dependencies"
    }
};
Folder.prototype.compose = function () {
    var arrs = arguments;

    return function (input, cmdargs, name, cmdname ) {
        var doc = this;
        var colon = doc.colon;
        var gcd = doc.gcd;
        var done = "text ready:" + name; 
        
        var exec = function (data, evObj) {
            var bit = evObj.pieces[0];
            var pos = parseInt(bit.slice(bit.lastIndexOf(colon.v) + 1), 10)+1;
            var cmd = arrs[pos][0];
            var args = arrs[pos].slice(1);
            var full = function (cmd) {
                var ret = [];
                var m, lind, rind;
            
                //get arg # as input
                if ( (m = cmd.match(/^\$(\d+)\-\>/) ) ) {
                   ret[0] = parseInt(m[1], 10);
                   lind = m[0].length;
                } else {
                    ret[0] = null;
                    lind = 0;
                }
            
                //store result in #
                if ( (m = cmd.match(/\-\>\$(\d+)$/) ) ) {
                    ret[2] = parseInt(m[1], 10);
                    rind = m.index;
                } else {
                    ret[2] = null;
                    rind = cmd.length;
                }
            
                //cmd is in between
                ret[1] = cmd.slice(lind, rind);
            
                return ret;
            
            };
        
            var arrtracker = {}; 
            var ds = /^([$]+)(\d+)$/;
            var at = /^([@]+)(\d+)$/;
            var nl = /\\n/g; // new line replacement
            var n = args.length;
            var subnum;
            var i, el; 
            
            var noloopfun = function (args) {
                return function (el) {
                    args.push(el);
                };
            };
            
            
            for (i = 0; i < n; i +=1 ) {
                el = args[i] =  args[i].replace(nl, '\n'); 
                var match = el.match(ds);
                var num;
                if (match) {
                    if (match[1].length > 1) { //escaped
                        args[i] = el.slice(1);
                        continue;
                    } else {
                        num = parseInt(match[2], 10);
                        args[i] = cmdargs[num];
                        continue;
                    }
                }
                match = el.match(at);
                if (match) {
                    if (match[1].length > 1) { //escaped
                        args[i] = el.slice(1); 
                        continue;
                    } else {
                        num = parseInt(match[2], 10);
                        if (arrtracker.hasOwnProperty(num)) {
                            subnum = arrtracker[num] += 1;
                        } else {
                            subnum = arrtracker[num] = 0;
                        }
                        if (i === (n-1)) {
                            args.pop(); // get rid of last one
                            cmdargs[num].slice(subnum).forEach(
                                noloopfun(args));
                        } else {
                            args[i] = cmdargs[num][subnum];
                        }
                    }
                }
            }
        
            var m, a;
            if (cmd === '') {
                gcd.emit("text ready:" + name + c + pos, data);
                return;
            
            // store into ith arg    
            } else if ( (m = cmd.match(/^\-\>\$(\d+)$/) ) ) {
                cmdargs[parseInt(m[1], 10)] = data; 
                gcd.emit("text ready:" + name + c + pos, data);
                return;
            
            // retrieve from ith arg
            } else if ( (m = cmd.match(/^\$(\d+)\-\>$/) ) ) {
                gcd.emit("text ready:" + name + c + pos, 
                    cmdargs[parseInt(m[1], 10)]);
                return;
            
            } else if ( (m = cmd.match(/^\-\>\@(\d+)$/) ) ) {
                a = cmdargs[parseInt(m[1], 10)];
                if (Array.isArray(a)) {
                    a.push(data);
                } else {
                    cmdargs[parseInt(m[1], 10)] = [data]; 
                }
                gcd.emit("text ready:" + name + c + pos, data);
                return;
            } 
        
            m = full(cmd);
            if (m[0] !== null) {
                input = cmdargs[m[0]];
            } else {
                input = data;
            }
            
            if (m[2] !== null) {
                gcd.on("text ready:" + name + c + pos + c + m[2], function (newdata) { 
                    cmdargs[m[2]] = newdata;
                    //data is input to pass along
                    gcd.emit("text ready:" + name + c + pos, data); 
                });
                doc.cmdworker(m[1], input, args, name + c + pos + c + m[2]);
            } else {
                doc.cmdworker(m[1], input, args, name + c + pos);
            
            }   
            return ;
        
        
        };

        var c = colon.v + cmdname + colon.v ;

        var i, n = arrs.length;
        for (i = 0; i < n-1 ;i += 1) {
            gcd.once("text ready:" + name + c + i, exec); 
        }
        // when all done, the last one is sent as the final bit
        gcd.once("text ready:" + name + c + (n-1), function (text) {
           gcd.emit(done, text); 
        }); 

        //start it
        exec(input, {pieces: [name+c+"-1"]});
    };

};
Folder.directives = {   
    "save" : dirFactory(function (state) {
        state.emitname =  "for save:" + this.file + ":" + 
          (state.saveprefix || '') + state.linkname; 
    }, function (state) {
        var gcd = this.gcd;
        var linkname = (state.saveprefix || '') + state.linkname;
    
        var f = function (data) {
            if (data[data.length-1] !== "\n") {
               data += "\n";
            }
            gcd.emit("file ready:" + linkname, data);
        };
        f._label = "save;;" + linkname;
    
        state.handler = f;
    
    }, function (state) {
        var file = this.file;
        var gcd = this.gcd;
        var linkname = (state.saveprefix || '') + state.linkname;
        var options = state.options;
        var start = state.start;
        // es6 var {linkname, options, start} = state; 
    
        gcd.scope(linkname, options);
    
        gcd.emit("waiting for:saving file:" + linkname + ":from:" + file, 
             ["file ready:" + linkname, "save", linkname, file, start]);
    
    }),
    "new scope" : function (args) {
        var doc = this;
        var scopename = args.link;
    
        doc.parent.createScope(scopename);
    
    },
    "store" : dirFactory(function (state) {
        var linkname = state.linkname;
    
        state.emitname =  "for store:" + this.file + ":" + linkname;
    }, function (state) {
        var doc = this;
        var c = doc.colon.v;
        var linkname = state.linkname;
    
        var f = function (data) {
            if (state.varname[0] === c) {
                //allowing minor blocks to get the major block directive is in
                state.varname = state.cur.split(c)[0] + state.varname; 
            }
            doc.store(state.varname, data);
        };
        f._label = "storeDir;;" + linkname;
    
        state.handler = f;
    
    }, function (state) {
    
        var ln = state.linkname;
        var ind = ln.indexOf("|");
        if (ind !== -1) {
            state.varname = ln.slice(0, ind).trim();
            state.block = state.start;
            state.start = '';
            state.value = ln.slice(ind+1).trim();
        } else {
            state.varname = state.linkname;
        }
    
        if (state.options) {
            state.block = state.start;
            state.start = '';
            state.value = state.options;
        }
    }),
    "monitor" : function (args) {
        
        var doc = this;
        var gcd = doc.gcd;
    
        var name = args.input.trim();
    
        var str = args.link;
        var i;
        while ( (i = str.indexOf("\\:") ) !== -1 )  {
            str = str.slice(0, i) + doc.colon.v + str.slice(i+2);
        }
    
        str = str || doc.colon.escape(args.cur);
    
        gcd.monitor(str, function (ev, data) {
            doc.eventlog(ev, name, data);
        });
    
    },
    "log" : dirFactory(function (state) {
        var linkname = state.linkname;
    
        state.emitname =  "for log:" + this.file + ":" + linkname;
    }, function (state) {
        var doc = this;
        var c = doc.colon.v;
        var linkname = state.linkname;
    
        var f = function (data) {
            if (state.varname[0] === c) {
                //allowing minor blocks to get the major block directive is in
                state.varname = state.cur.split(c)[0] + state.varname; 
            }
            doc.dirlog(state.varname, data);
        };
        f._label = "logDir;;" + linkname;
    
        state.handler = f;
    
    }, function (state) {
    
        var ln = state.linkname;
        var ind = ln.indexOf("|");
        if (ind !== -1) {
            state.varname = ln.slice(0, ind).trim();
            state.block = state.start;
            state.start = '';
            state.value = ln.slice(ind+1).trim();
        } else {
            state.varname = state.linkname;
        }
    
        if (state.options) {
            state.block = state.start;
            state.start = '';
            state.value = state.options;
        }
    }),
    "out" : dirFactory(function (state) {
        state.emitname = "for out:" + this.file + ":" + this.colon.escape(state.linkname);
    }, function (state) {
        var doc = this;
        var gcd = doc.gcd;
        var linkname = state.linkname;
        var emitname = state.emitname;
    
    
        var f = function (data) {
            gcd.emit(emitname, data);
            doc.log(linkname + ":\n" + data + "\n~~~\n");
        };
    
        f._label = "out;;" + linkname;
    
        state.handler = f;       
    
    }, function (state)  {
        var gcd = this.gcd;
        var linkname = state.linkname;
        var emitname = state.emitname;
        var start = state.start;
        var options = state.options;
        
        gcd.scope(linkname, options);
    
        gcd.emit("waiting for:dumping out:" + linkname, 
            [emitname, linkname, this.file, start]  );
    }),
    "load" : function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var folder = doc.parent;
        var url = (args.loadprefix || '') + args.href.trim();
        var options = args.input;
        var urlesc = folder.colon.escape(url);
        var nickname = doc.colon.escape(args.link.trim());
        
        gcd.scope(urlesc, options);
    
        if (nickname && (nickname !== urlesc) ) {
            doc.createLinkedScope(urlesc, nickname);
            if (!(folder.docs.hasOwnProperty(urlesc) ) ) {
                gcd.emit("waiting for:loading for:" + doc.file, 
                    "need document:" + urlesc);
                gcd.emit("need document:" + urlesc, url );
            }
        } else {
            if (!(folder.docs.hasOwnProperty(urlesc) ) ) {
                gcd.emit("waiting for:loading for:" + doc.file, 
                    "need document:" + urlesc);
                gcd.emit("need document:" + urlesc, url );
            }
        }
    
    },
    "cd" : function (args) {
        var doc = this;
        var path = args.link.trim();
        var type = args.input.trim();
        if (type === "load") {
            doc.loadprefix = path;
        }
        if (type === "save") {
            doc.saveprefix = path;
        }
    },
    "link scope" : function (args) {
        var doc = this;
        var alias = args.link;
        var scopename = args.input;
    
        doc.createLinkedScope(scopename, alias); 
    
    },
    "transform" : dirFactory(function (state) {
        state.name = this.colon.escape(state.start + ":" + state.input);
        state.emitname =  "for transform:" + this.file + ":" + state.name;
    }, function (state) {
        var doc = this;
        var gcd = doc.gcd;
    
    
        var f = function (data) {
            gcd.emit(state.emitname, data);
            var name = doc.getPostPipeName(state.linkname);
            if (name) {
                doc.store(name, data);
            }
        };
        f._label =  "transform;;" + state.name;
        
        state.handler = f;
    }, function (state) {
        var doc = this;
        var gcd = this.gcd;
        var name = state.name;
        var start = state.start;
        var emitname = state.emitname;
    
        gcd.emit("waiting for:transforming:" + name, 
            [emitname, name, doc.file, start]  );
    }),
    "define" : dirFactory(function (state) {
        state.emitname =  "cmddefine:" + state.linkname;
    }, function (state) {
        var doc = this;
        var gcd = this.gcd;
        var cmdname = doc.normalize(state.linkname);
    
        var han = function (block) {
            var f; 
            
            try {
                block = "f="+block;
                eval( block);
            } catch (e) {
                doc.gcd.emit("error:define:"+cmdname, [e, block]);
                doc.log(e.name + ":" + e.message +"\n" + block);
                return;
            }
    
            switch (state.options) {
                case "raw" :  f._label = cmdname;
                    doc.commands[cmdname] = f;
                break;
                case "async" : doc.commands[cmdname] = 
                    doc.wrapAsync(f, cmdname);
                break;
                case "defaults" : doc.commands[cmdname] = 
                    doc.wrapDefaults(f, cmdname);
                break;
                default : doc.commands[cmdname] = 
                    doc.wrapSync(f, cmdname);
            }
    
            gcd.emit("command defined:" + cmdname);
        };
        han._label = "cmd define;;" + cmdname;
    
        state.handler = han;
    
    }, function (state) {
        var cmdname = state.linkname;
    
        var file = this.file;
        var gcd = this.gcd;
    
        gcd.emit("waiting for:command definition:" + cmdname, 
            ["command defined:"+cmdname, cmdname, file, state.start]  );
    
    }),
    "subcommand" : function (args) {
        var doc = this;
    
        var block = doc.blocks[args.cur];
        
        var subCommandName = args.link;
    
        var cmdName = args.href.trim().slice(1);
       
        var f; 
        
        try {
            block = "f="+block;
            eval( block);
        } catch (e) {
            doc.gcd.emit("error:subcommand define:"+subCommandName, [e, block]);
            doc.log(e.name + ":" + e.message +"\n" + block);
            return;
        } 
    
        doc.defSubCommand( subCommandName, f, cmdName); 
         
    },
    "block" : function (args) {
        var doc = this;
        
        if (args.link === "off") {
            doc.blockOff += 1;
        } else if (args.link === "on") {
            if (doc.blockOff > 0 ) {
                doc.blockOff -= 1;
            }
        } else {
            doc.log("block directive found, but the toggle was not understood: " + 
                args.link + "  It should be either on or off");
        }
    
    },
    "ignore" : function (args) {
        var lang = args.link;
    
        var doc = this;
        var gcd = doc.gcd;
    
        gcd.on("code block found:" + lang, "ignore code block");
    
    },
    "eval" : function (args) {
        var doc = this;
    
        var block = doc.blocks[args.cur];
        
        var storageName = doc.getPostPipeName(args.link);
        var ret = '';
        
        try {
            eval(block);
            if (storageName) {
                doc.store(storageName, ret);
            }
        } catch (e) {
            doc.gcd.emit("error:dir eval:", [e, block]);
            doc.log(e.name + ":" + e.message +"\n" + block);
            return;
        }
        
    },
    "if" : function (args) {
        
        var doc = this;
        var folder = doc.parent;
        
        var title = args.input;
        var ind = title.indexOf(";");
        var flag = title.slice(0, ind).trim();
        var directive, semi, fun;
        
        if (folder.flags.hasOwnProperty(flag) ) {
            semi = title.indexOf(":", ind);
            directive = title.slice(ind+1, semi).trim();
            args.directive = directive;
            args.input = title.slice(semi+1).trim();
    
            if (directive && (fun = doc.directives[directive] ) ) {
                fun.call(doc, args);
            }
        }
    },
    "flag" : function (args) {
        this.parent.flags[args.link.trim()] = true;
    
    },
    "push" : dirFactory(function (state) {
        var doc = this;
        
        var ln = state.linkname;
        var ind = ln.indexOf("|");
        if (ind !== -1) {
            state.varname = ln.slice(0, ind).trim();
            state.block = state.start;
            state.start = '';
            state.value = ln.slice(ind+1).trim();
        } else {
            state.varname = state.linkname;
        }
        
        state.name = doc.colon.escape(state.linkname + ":"  + 
            state.start + ":" + state.input);
        state.emitname =  "for push:" + doc.file + ":" + state.name;
        state.donename =  "push bit:" + doc.file + ":" + state.name;
        state.goname =  "push ready:" + doc.file + ":" + state.varname;
    }, function (state) {
        var doc = this;
        var gcd = doc.gcd;
    
    
        var f = function (data) {
            gcd.emit(state.donename, data);
        };
        f._label =  "push;;" + state.name;
        
        state.handler = f;
    }, function (state) {
        var doc = this;
        var gcd = this.gcd;
        var name = state.name;
        var start = state.start;
        var emitname = state.emitname;
    
        gcd.emit("waiting for:push bit:" + name, 
            [emitname, name, doc.file, start]  );
        gcd.flatWhen(state.donename, state.goname ); 
    }),
    "h5" : function (args) {
        var doc = this;
        var gcd = doc.gcd;
        var colon = doc.colon;
    
        var heading = args.href.slice(1); 
        heading = doc.convertHeading(heading.replace(/-/g, ' '));
    
        if (! heading ) {
            heading = args.link;
        }
       
        var temp = doc.midPipes(args.input);
        var options = temp[0]; 
    
        if (options === "off") { 
            gcd.emit("h5 off:" + colon.escape(heading));
            return;
        }
        
        var pipes = temp[1];
    
        var name = colon.escape(args.link);
        var whendone = "text ready:" + doc.file + ":" + name + colon.v  + "sp" ;
    
        doc.pipeDirSetup(pipes, doc.file + ":" + name, function (data) {
        
            doc.store(name, data);
        }    , doc.curname ); 
        var seenAlready =[]; 
        var handler = gcd.on("heading found:5:" + doc.file , function (data ) {
           
            var found = doc.convertHeading(data);
            var full; 
        
            if (found === heading) {
                full = colon.escape(doc.levels[0]+'/'+found);
                if (seenAlready.indexOf(full) === -1) { 
                    gcd.when("text ready:" + doc.file + ":" + full, whendone); 
                    seenAlready.push(full);
                }
            }
        });
    
        gcd.once("h5 off:" + colon.escape(heading), function () {
            gcd.off("heading found:5:" + doc.file, handler);
        });
    
        if (options === "full") {
            gcd.when("parsing done:" + doc.file, whendone).silence();  
        } else {
            gcd.flatWhen("parsing done:" + doc.file, whendone).silence();  
        }
    
        
    
    },
    "compose" : function (args) {
        var doc = this;
        var gcd = doc.gcd;
        
        var cmdname = args.link;
        var cmds = args.input.split("|").map(function (el) {
            var arr = el.split(",").map(function(arg) {
                arg = arg.trim();
                return arg;
            });
            var ind = arr[0].indexOf(" ");
            if (ind !== -1) {
                arr.unshift(arr[0].slice(0, ind).trim());
                arr[1] = arr[1].slice(ind).trim();
            }
            return arr;
        });
    
        var fcmd = doc.file + ":" + cmdname;
        var compready = "composition ready:" + fcmd;
        var compcheck = "composition command checking:" + fcmd;
        var cmddefine = "command defined:" + cmdname;
        
        var define = function () {
            doc.commands[cmdname] =  doc.parent.compose.apply(null, cmds);
            gcd.emit(cmddefine);
        };
        
        gcd.once(compready, define);
        
        gcd.when(compcheck, compready);
        
        // get unique cmds
        var obj = {};        
        cmds.forEach(function (el) {
           obj[el[0]] = 1;
        });
        
        Object.keys(obj).forEach(function (el) {
            if (doc.leaders.indexOf(el[0]) !== -1 ) {
                return ;
            }
            if (!(doc.commands[el])) {
                gcd.when("command defined:" +  el, cmddefine);
            }
        });
        
        gcd.emit(compcheck);
    },
    "partial" : dirFactory(function (state) {
        state.emitname =  "cmddefine:" + state.linkname;
    }, function (state) {
        var cmdname = state.linkname;
        var doc = this;
        var gcd = this.gcd;
    
        var opts = state.options.split(",");
        var command = opts[0]; //old command
        var arg = (opts[1] ? parseInt(opts[1].trim(),10) : 0);
        var propcommand = false;
    
        var fun;   //closure
    
        var han = function (block) {
            if ( (command[0] === ".") && (command.length > 1) ) {
                fun = doc.commands["."];
                propcommand = command.slice(1);
            } else {
                fun = doc.commands[command];
            }
    
            if (fun) {
                doc.commands[cmdname] = 
                    function (input, args, name, command) {
                        var doc = this;
                        var newargs; 
                        var push = Array.prototype.push;
                
                        if (propcommand) {
                            newargs = [propcommand];
                         } else {
                            newargs = [];
                         }
                         push.apply(newargs, args.slice(0, arg));
                         newargs.push(block);
                         push.apply(newargs, args.slice(arg));
                
                        fun.call (doc, input, newargs, name, command); 
                    };
                gcd.emit("command defined:" + cmdname);
            } else {
                var lasthand = function () {
                    fun = doc.commands[command];
                    if (fun) {
                        doc.commands[cmdname] = 
                            function (input, args, name, command) {
                                var doc = this;
                                var newargs; 
                                var push = Array.prototype.push;
                        
                                if (propcommand) {
                                    newargs = [propcommand];
                                 } else {
                                    newargs = [];
                                 }
                                 push.apply(newargs, args.slice(0, arg));
                                 newargs.push(block);
                                 push.apply(newargs, args.slice(arg));
                        
                                fun.call (doc, input, newargs, name, command); 
                            };
                        gcd.emit("command defined:" + cmdname);
                    } else { // wait some more ? why
                        gcd.once("command defined:" + command, lasthand);
                    }
                };
                lasthand._label = "delayed command:" + command +
                    ":" + cmdname;
                gcd.once("command defined:" + command, lasthand);
            }
        };
        han._label = "cmd define;;" + cmdname;
    
        state.handler=han;
    
    }, function (state) {
        var cmdname = state.linkname;
    
        var file = this.file;
        var gcd = this.gcd;
    
        gcd.emit("waiting for:command definition:" + cmdname, 
            ["command defined:"+cmdname, cmdname, file, state.start]  );
    }),
    "version" : function (args) {
        var doc = this;
        var colon = doc.colon;
    
        var ind = args.input.indexOf(";");
        if (ind === -1) { ind = args.input.length +1; }
    
        doc.store(colon.escape("g::docname"), 
            args.link.trim());
        doc.store(colon.escape("g::docversion"),
            args.input.slice(0, ind).trim());
        doc.store(colon.escape("g::tagline"), 
            (args.input.slice(ind+1).trim() || "Tagline needed" ) );
    
    },
    "npminfo" : function self (args) {
        var doc = this;
        var g = "g" + doc.colon.v + doc.colon.v;
    
        var types = doc.plugins.npminfo;
    
        doc.store(g+"authorname", args.link);
    
        var gituser = args.href.slice(args.href.lastIndexOf("/")+1).trim();
        doc.store(g+"gituser", gituser);
    
        var pieces = args.input.split(";");
    
        doc.store(g + "authoremail", (pieces.shift() || '').trim());
      
        pieces.forEach(function (el) {
            if (!el) {return;}
    
            var ret = [];
            
            var ind = el.indexOf(":");
            var prekind = el.slice(0, ind).trim();
            var kind = types[prekind];
            if (!kind) { 
                doc.log("unrecognized type in npminfo:" + prekind );
                return;
            }
            var entries = el.slice(ind+1).split(",");
            entries.forEach(function(el) {
                if (!el) {return;}
                var bits = kind.element(el);
                if (bits) {
                    ret.push(bits);
                }
            });
            doc.store(g +  kind.save, kind.val(ret) );
        });
    
        doc.store(g + "year", ( new Date() ).getFullYear().toString() );
    },
};

Folder.subCommands = (function () {
    var ret = {};
    
    ret.echo = ret.ec = function () {
        var arr = Array.prototype.slice.call(arguments);
        
        var ret = arr.map(function (str) { 
            if (("\"'`".indexOf(str[0]) !== -1) && 
                (str[0] === str[str.length-1]) ) {
                
                return str.slice(1, -1);
            } else {
                return str;
            }
        });
    
        ret.args = true;
    
        return ret;
    };
   
    ret.join = function (sep) {
        var args = Array.prototype.slice.call(arguments, 1);
        var ret = [];
        
        args.forEach( function (el) {
            if ( Array.isArray(el)) {
                ret.push(el.join(sep));
            } else {
                ret.push(el);
            }
        });
    
        return ret.join(sep);
    
    };
    
    ret.array = ret.arr = function () {
        return Array.prototype.slice.call(arguments, 0);
    };

    ret.object = ret.obj =  function (str) {
        var ret, doc = this;
        try {
            ret = JSON.parse(str);
            if (Array.isArray(ret) ) {
                return ["val", ret];
            } else {
                return ret;
            }
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad json parse:" + this.cmdname, 
                [e, e.stack, str]);
            return ["error", e];
        }
    };

    ret.merge = function (a) {
        var ret, args; 
        if (Array.isArray(a) ) {
            args = Array.prototype.slice.call(arguments, 1);
            return Array.prototype.concat.apply(a, args);
        } else {
            args = Array.prototype.slice.call(arguments, 1);
            ret = a;
            args.forEach( function (el) {
                var key;
                for (key in el) {
                    ret[key] = el[key];
                }
            });
            return ret; 
        }
    };

    ret["key-value"] = ret.kv = function () {
        var ret = {};
        var i, n = arguments.length;
        for (i = 0; i < n; i += 2) {
            ret[arguments[i]] = arguments[i+1];
        }
    
        return ret;
    };

    ret.act = function (obj, method) {
        try {
            return  obj[method].apply(obj, 
                Array.prototype.slice.call(arguments, 2)) ;
        } catch (e) {
            this.gcd.emit("error:arg prepping:bad method:" + this.cmdname, 
                [e, e.stack, obj, method,
                Array.prototype.slice.call(arguments)]);
            return ;
        }
    };

    ret.property = ret.prop = function () {
        var props = Array.prototype.slice.call(arguments, 0);
        var obj;
        try {
            obj = props.reduce(function (prev, cur) {
                return prev[cur];
            });
            return obj;
        } catch (e) {
            this.gcd.emit("error:bad property access:" +
                this.cmdname, [e, e.stack, props]);
            return;
        }
    };

    ret.json = function (obj) {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            this.gcd.emit("error:arg prepping:bad json:" + this.cmdname, 
                [e, e.stack, obj]);
            return ;
        }
    };

    ret.set = function (obj, retType) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName;
        var scope, key; 
        
        scope = gcd.scope(name);
        if (!scope) {
            scope = {};
            gcd.scope(name, scope);
        }
        for (key in obj) {
            scope[key] = obj[key];
        }
        if (retType === "pass" ) {
            return obj;
        } else {
            return ;
        }
    };

    ret.gset = function (obj, retType) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName.slice(0, doc.cmdName.lastIndexOf(doc.colon.v)) ;
        var scope, key; 
        
        scope = gcd.scope(name);
        if (!scope) {
            scope = {};
            gcd.scope(name, scope);
        }
        for (key in obj) {
            scope[key] = obj[key];
        }
        if (retType === "pass" ) {
            return obj;
        } else {
            return ;
        }
    } ;

    ret.get = function () {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName;
        var scope; 
        
        scope = gcd.scope(name);
        if (!scope) {
            gcd.emit("error:arg prepping:no scope:" + name);
            return ;
        }
    
        var i, n = arguments.length;
        var ret = [];
        for (i = 0; i < n; i +=1 ) {
            ret.push(scope[arguments[i]]);
        }
        ret.args = true; // each is separate 
        return ret;
    };

    ret.gget = function () {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName.slice(0, doc.cmdName.lastIndexOf(doc.colon.v)) ;
        var scope; 
        
        scope = gcd.scope(name);
        if (!scope) {
            gcd.emit("error:arg prepping:no scope:" + name);
            return ;
        }
    
        var i, n = arguments.length;
        var ret = [];
        for (i = 0; i < n; i +=1 ) {
            ret.push(scope[arguments[i]]);
        }
        ret.args = true; // each is separate 
        return ret;
    } ;

    ret.arguments = ret.args = function (arr) {
        var ret =  arr.slice(0); //make a shallow copy
        ret.args = true;
        return ret;
    };

    ret.number = ret.num = function () {
        var ret = [], i, n = arguments.length;
        if ( n === 0 ) {
            return 0;
        }
        for (i = 0; i < n; i += 1) {
            ret.push(Number(arguments[i]));
        }
        ret.args = true;
        return ret;
    };

    ret.date = function () {
        var ret = [], i, n = arguments.length;
        if (n === 0) {
            return new Date();
        }
        for (i = 0; i < n; i += 1) {
            ret.push(new Date(arguments[i]));
        }
        ret.args = true;
        return ret;
    };

    ret.function = ret.fun = function (code) {
        var f, doc = this;
        var args = Array.prototype.slice.call(arguments, 1);
    
        if ( (code[0] === "`" ) && (code[code.length-1] === code[0]) ) {
            code = code.slice(1, code.length-1);
        }
       
        try {
            eval("f=" + code);
            return f;
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad function:" + doc.cmdname, 
                [e, e.stack, code, args]);
            return;
        }
    
    };

    ret.eval = ret.ev =  function (code) {
        var ret, doc = this;
        var args = Array.prototype.slice.call(arguments, 1);
    
        if ( (code[0] === "`" ) && (code[code.length-1] === code[0]) ) {
            code = code.slice(1, code.length-1);
        }
       
        try {
            eval(code);
            return ret;
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad eval:" + doc.cmdname, 
                [e, e.stack, code, args]);
            return;
        }
    };

    ret.log = function () {
        var doc = this, name = doc.cmdName;
        var args = Array.prototype.slice.call(arguments);
        doc.log("arguments in " + name + ":\n---\n" + 
            args.join("\n~~~\n") + "\n---\n");
        return args;  
    };

    ret.dash = ret["-"] = function (propname) {
        var doc = this;
        var dash = doc.dash;
        var cmd;
    
        var args = Array.prototype.slice.call(arguments, 1);
    
            var found = Object.keys(dash).sort(function (a,b) {
               var numa = dash[a][1], numb = dash[b][1];
               var ret = numa - numb;
               if (isNaN(ret)) {
                    return 0;
               } else {
                    return ret;
               }
            }).some(function (a) {
                if (typeit(dash[a][0][propname], "function" )) {
                    cmd = a;
                    return true;
                }
            });
    
        if (!found) {
            doc.log("Subcommand dash: no such property: " +  propname +
                " with args: " + args.join("\, ") );
            doc.log("no such property on dash: ", propname);
            return '';
        } else {
            return dash[cmd][0][propname].apply(dash[cmd][0], args);
        }
    };
    ret.dot = ret["."] = function (method, obj) {
        var doc = this;
        var fun;
    
        if (arguments.length < 2) {
            doc.log("insufficient number of arguments for dot command:" +
                arguments.join(", "));
            return '';
        }
    
        var args = Array.prototype.slice.call(arguments, 2);
    
        fun = obj[method];
        if ( typeit(fun) === "function") {
            return fun.apply(obj, args);
        } else {
            return fun; //ex: .length(arr(1, 5) )
        }
    };
    ret.bool = ret["?"] = function (propname) {
        var doc = this;
        var bool = doc.booleans;
    
        var args = Array.prototype.slice.call(arguments, 1);
    
        if ( bool[propname] ) {
            var ret = bool[propname].call(doc, args);
            return ret;
        } else {
            doc.log("no such boolean tester: ", propname);
            return false;
        }
    };

    ret.true  = function () {return true;}; 
    ret.false = function () {return false;}; 
    ret.null = function () {return null;}; 
    ret.doc =  function () {return this;}; 
    ret.skip = function () {return ;}; 
    ret.type = function (obj) {
        var typeit = this.Folder.requires.typeit;
        
        return typeit(obj);
    };
    ret.reg = ret.regexp = function (text, flags) {
        var doc = this;
        
        if ( typeit(flags) !== 'string' ) {
            flags = 'g';
        } else if (flags.match('-') !== -1) {
            flags = flags.replace('-', ''); 
        } else if (flags.match('g') === -1) {
            flags += 'g';
        }
        var reg;
        
        try {
            reg = new RegExp(text, flags);
            return reg;
        } catch(e) {
            doc.error("subcmd:reg", "failure to compile regular expression", 
                "to compile:", text, "flags:", flags, 
                "error:", e.message );
        }
    };

    return ret;
})();

Folder.defSubCommand =function (sub, f, cmd) {
    var subs, cmdplug,  cmdsub;

    if (cmd) {
        cmdplug = this.plugins[cmd];
        if (!cmdplug) {
            cmdplug = this.plugins[cmd] = {};
        } 
        cmdsub = cmdplug.subCommands;
        if (!cmdsub) {
            cmdsub = cmdplug.subCommands = {};
        }
        cmdsub[sub] = f;
    } else {
        subs = this.subCommands;
        subs[sub] = f; 
    }
};

var Doc = Folder.prototype.Doc = function (file, text, parent, actions) {
    this.parent = parent;
    var gcd = this.gcd = parent.gcd;
    this.Folder = Folder;

    this.file = file; // globally unique name for this doc

    parent.docs[file] = this;

    this.text = text;

    this.blockOff = 0;
    
    this.levels = {};
    this.blocks = {'^' : ''}; //an empty initial block in case of headless
    this.heading = this.curname = '^';
    this.levels[0] = text;
    this.levels[1] = '';
    this.levels[2] = '';


    
    this.vars = parent.createScope(file);

    this.commands = parent.commands;
    this.directives = parent.directives;
    this.subCommands = parent.subCommands;
    this.comments = parent.comments; 
    this.colon = parent.colon; 
    this.join = parent.join;
    this.logs = {
        error : [],
        warn : [],
        events : [],
        "command log" : [],
        "directive log" : {},
        out : {},
        0 : []
    };
    this.log = this.parent.log;
    this.error = this.parent.error;
    this.warn = this.parent.warn;
    this.dirlog = this.parent.dirlog;
    this.cmdlog = this.parent.cmdlog;
    this.eventlog = this.parent.eventlog;
    this.cmdworker = this.parent.cmdworker;
    this.compose = this.parent.compose;
    this.scopes = this.parent.scopes;
    this.subnameTransform = this.parent.subnameTransform;
    this.indicator = this.parent.indicator;
    this.wrapAsync = parent.wrapAsync;
    this.wrapSync = parent.wrapSync;
    this.wrapDefaults = parent.wrapDefaults;
    this.uniq = parent.uniq;
    this.sync = Folder.sync;
    this.async = Folder.async;
    this.defSubCommand = Folder.defSubCommand;
    this.dirFactory = parent.dirFactory;
    this.plugins = parent.plugins;
    this.leaders = parent.leaders;
    this.dash = parent.dash;
    this.booleans = parent.booleans;
    this.convertHeading = parent.convertHeading;
    this.normalize = Folder.normalize;

    if (actions) {
        apply(gcd, actions);
    }

    return this;

};

var dp = Doc.prototype;

dp.retrieve = function (name, cb) {
    var doc = this;
    var gcd = doc.gcd;

    var scope = doc.getScope(name);


    var varname = scope[1];
    var file = scope[2];
    scope = scope[0];
    var f;
    
    if (scope) {
        if (scope.hasOwnProperty(varname) ) {
            
            if (typeof cb === "function") {
                cb(scope[varname]);
            } else if (typeof cb === "string") {
                gcd.emit(cb, scope[varname]);
            } else {
                gcd.emit("error:unrecognized callback type:" +
                    doc.file + ":" + name, (typeof cb) );
            }
            return ;
        } else {
            gcd.emit("waiting for:retrieval:" + doc.file, 
                ["text stored:" + file + ":" + varname, "retrieval", file, varname]);
            f = function () {
                doc.retrieve(name, cb);
            };
            f._label = "Retrieving:" + file + ":" + varname;
            gcd.once("text stored:" + file + ":" + varname, f);
            return ;
        }
    } else {
        gcd.emit("waiting for:retrieval:" + cb+ "need:" + name, 
            ["scope exists:" + file, "scope exists",  file, doc.file, varname,
            true]);
        f = function () {
            doc.retrieve(name, cb);
        };
        f._label = "Retrieving:" + doc.file + ":" + name;
        gcd.once("scope exists:" + file, f);
        return ;
    }
};

dp.getScope = function (name) {
    var ind, scope, alias, scopename, varname;
    var doc = this;
    var colon = doc.colon;
    var folder = doc.parent;

    if (  (ind = name.indexOf( colon.v + colon.v) ) !== -1 ) {
        alias = name.slice(0,ind);
        varname = name.slice(ind+2);
        if (varname.length === 0) {
            varname = "^";
        } else if (varname[0] === colon.v ) {
            varname = "^" + varname;
        }
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
        if (name.length === 0) {
            name = "^";
        } else if (name[0] === colon.v ) {
            name = "^" + name;
        }
        return [doc.vars, name, doc.file];
    }
};

dp.createLinkedScope = function (name, alias) {
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
            folder.scopes[alias] = name;
            gcd.emit("scope linked:" + doc.file + ":" + alias, name);
            gcd.emit("scope exists:" + alias);
        } else {
            gcd.once("scope exists:" + name, function () {
                folder.scopes[alias] = name;
                gcd.emit("scope linked:" + doc.file + ":" + alias, name);
                gcd.emit("scope exists:" + alias);
            });
        }
    }


};
 
dp.indent = function (text, indent, gcd) {
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
};

dp.getIndent = function ( block, place ) {
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
};

dp.blockCompiling = function (block, file, bname, mainblock) {
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

    gcd.once(stitchend, function (data) {
        
        var text = '', insert, i, n = data.length;
        var indent = doc.indent;
    
        for (i = 1; i < n; i += 1) {
            insert = data[i][1];
            if ( (i+1 < n) && ( data[i+1][0].slice(0,6) === "indent") ) {
                text += indent(insert, data[i+1][1], gcd);
                i += 1; 
            } else {
                text += insert;
            }
        
        }         
    
        if (bname.indexOf(colon.v) !== -1) {
            gcd.emit("minor ready:" + name, text);
        } else {
            doc.store(bname, text);
            gcd.emit("text ready:" + name, text);
        }
    });
          
    var stitcher = function (start) {
        if (start < n) {
            stitchfrag = "stitch fragment:" + name + colon.v + start;
            gcd.when(stitchfrag, stitchend);
        }
    };

    stitcher(0);
    
    while (ind < n) {
        ind = block.indexOf("\u005F", ind);
        if ( (ind === -1) || ( ind >= (n-1) ) ) {
            gcd.emit(stitchfrag, block.slice(start) );
            break;
        } else {
            ind += 1;

            if (block[ind].match(/['"`]/)) {
                quote = block[ind];
            } else {
                continue;
            }
            
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
                    } else {
                        gcd.emit(stitchfrag, block.slice(start, place));  
                        start = ind-1; // underscore
                        stitcher(start-2); //to point to where the escape sequence 
                    }
                }
            } 

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
        
            start = doc.substituteParsing(block, ind+1, quote, lname,
                     mainblock);
           
            doc.parent.recording[lname] = block.slice(ind-1, start);
            
            stitcher(start);
            ind = start ;
    
        }
    }


    gcd.emit("block substitute parsing done:"+name);
};

dp.substituteParsing = function (text, ind, quote, lname, mainblock ) { 

    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon;

    var match, subname, chr, subtext;
    var subreg = doc.regexs.subname[quote];

    var doneEmit = "text ready:" + lname; 
    var textEmit = doneEmit + colon.v + ind;
    var subEmit = "substitution chain done:" + lname; 

    gcd.when(textEmit, subEmit);

    gcd.once(subEmit, function (data) { 
        gcd.emit(doneEmit, data[data.length-1][1] || '');
    } );

    subreg.lastIndex = ind;
    
    match = subreg.exec(text);
    if (match) {
        ind = subreg.lastIndex;
        chr = match[2];
        subname = doc.convertHeading(match[1]);
        subname = doc.subnameTransform(subname, lname, mainblock);
        subname = colon.escape(subname);
        if (chr === "|") {
            ind = doc.pipeParsing(text, ind, quote, lname, mainblock, subEmit,
                textEmit );
        } else if (chr === quote) {
            // nothing to do; it should automatically work !!!
        } else {
            gcd.emit("failure in parsing:" + lname, ind);
            return ind;
        }
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

};

dp.pipeParsing = function (text, ind, quote, name, mainblock, toEmit, textEmit) {
    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon;
   
    var incomingEmit = textEmit;

    var chr, match, command, 
        comname, start;
    var n = text.length;
    var comreg = doc.regexs.command[quote];


    while (ind < n) { // command processing loop

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
        
        } else {
            gcd.emit("error:command parsing:" + name + colon.v + ind);
            return ind+1;
        }

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

};

dp.regexs = {

    command : {
        "'" : /\s*([^|'\s]*)([\S\s])/g,
        '"' : /\s*([^|"\s]*)([\S\s])/g,
        "`" : /\s*([^|`\s]*)([\S\s])/g
    },
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
    subname : {
        "'" : /\s*([^|']*)([\S\s])/g,
        '"' : /\s*([^|"]*)([\S\s])/g,
        "`" : /\s*([^|`]*)([\S\s])/g
    }


};

dp.store = function (name, text) {
    var doc = this;
    var gcd = doc.gcd;
    var scope = doc.getScope(name);

   
    var f;
    if (! scope[0]) {
        gcd.emit("waiting for:storing:" + doc.file + ":" + name,
            ["scope exists:" + scope[2], "scope exists",  scope[2],
            doc.file, scope[1] ]);
        f = function () {
            doc.store(name, text);
        };
        f._label = "Storing:" + doc.file + ":" + name;
        gcd.once("scope exists:" + scope[2], f);
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
};


dp.getBlock = function (start, cur) {
    var doc = this;
    var colon = doc.colon;

    if (typeof cur === "string") {
        cur = colon.restore(cur);
    } else {
        cur = '';
    }

    if (typeof start === "string") {
        if ( start[0] === "#") {
            start = start.slice(1).replace(/-/g, " ");
        }

        start = doc.convertHeading(start);

        if (start[0] === ":") {
            start = doc.stripSwitch(cur) + start;
        }

    } else {
        doc.gcd.emit("error:start not a string in doc block", [start, cur]);
        start = '';
    }
    if (!start) {
        start = cur;
    }
    return colon.escape(start);
};
dp.stripSwitch = function (name) {
    var ind, blockhead;

    blockhead = name = name || '';

    if ( (ind = name.indexOf("::")) !== -1)  {
        if (  (ind = name.indexOf(":", ind+2 )) !== -1 ) {
            blockhead = name.slice(0, ind);
        }
    } else if ( (ind = name.indexOf(":") ) !== -1) {
        blockhead = name.slice(0, ind);
    }

    return blockhead;

};
dp.midPipes = function (str) {
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
};
dp.getPostPipeName = function (name) {
    var ind = name.indexOf("|") + 1;
    if (ind) {
        return name.slice(ind);
    } else {
        return '';
    }
} ;
dp.pipeDirSetup = function (str, emitname, handler, start) {
    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon;
    var block;

    var subEmit, textEmit, doneEmit;

    if (str) {
        str = str + '"';
        doneEmit = "text ready:" + emitname;
        textEmit = "text ready:" + emitname + colon.v + "sp";
        subEmit = "pipe chain ready:" + emitname + colon.v + "sp";
        gcd.once(doneEmit, handler);
        
        gcd.when(textEmit, subEmit);
        
        gcd.once(subEmit, function (data) {
            var text = data[data.length-1][1] || '';
            gcd.emit(doneEmit, text);
        });
        

        block = doc.stripSwitch(colon.restore(start));

        doc.pipeParsing(str, 0, '"', emitname + colon.v + "sp", block,
            subEmit, textEmit);

    } else {
        gcd.once("text ready:" + emitname + colon.v + "sp", handler); 
    }

};


dp.findMatchQuote = function (text, quote, ind) {
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
};

dp.argHandlerMaker =     function (name, gcd) {
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
    };

dp.argEscaping = function (text, ind ) {
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
    case "u" :  uni.lastIndex = ind;
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
    break;
    default : return ["\\", ind];

    }
};

dp.argProcessing = function (text, ind, quote, topname, mainblock) {
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

        wsreg.lastIndex = ind;
        if (wsreg.test(text) ) {
            start = ind = wsreg.lastIndex - 1;
        } else {
            ind = text.length;
            err = [start, ind];
            gcd.emit("error:" + topname, [err, "argument is just whitespace with no terminating"]);
            return;
        }

    
    while ( ind < n ) {

        switch (text[ind]) {

            case "\u005F" :  // underscore
                if ( (start === ind) &&
                     ( "\"'`".indexOf(text[ind+1]) !== -1 ) ) {
                    whenIt();
                    temp =  doc.substituteParsing(text, ind+2, text[ind+1], curname, mainblock);
                    
                    if ( temp === text.length) {
                        //error
                        err = [curname];
                        gcd.emit("error:" + topname, [err, "substitution consumed rest of block"]);
                        return temp;
                    } else {
                        ind = temp;
                    }
                    
                    argstring = '';
                    argdone = true;
                        wsreg.lastIndex = ind;
                        if (wsreg.test(text) ) {
                            start = ind = wsreg.lastIndex - 1;
                        } else {
                            ind = text.length;
                            err = [start, ind];
                            gcd.emit("error:" + topname, [err, "argument is just whitespace with no terminating"]);
                            return;
                        }
                    continue;
                } else {
                    argstring += "\u005F";
                }
            break;
           
            case "," : 
                if ( (stack.length === 0 ) || (stack[0] === cp) ) {
                    if (argdone) {
                        if (argstring !== "") {
                            err = [argstring, text[start], text[ind], start, ind];
                            gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                    ind += 1;
                        wsreg.lastIndex = ind;
                        if (wsreg.test(text) ) {
                            start = ind = wsreg.lastIndex - 1;
                        } else {
                            ind = text.length;
                            err = [start, ind];
                            gcd.emit("error:" + topname, [err, "argument is just whitespace with no terminating"]);
                            return;
                        }
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
                        if (argdone) {
                            if (argstring !== "") {
                                err = [argstring, text[start], text[ind], start, ind];
                                gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                    }
                    return ind;
                    
                } else {
                    argstring += "|";
                }   
            break;


                case "[" : 
                    stack.unshift("[");
                    argstring += "[";
                break;
            
                case "]":
                    if (stack[0] === "[") {
                        stack.shift();
                    }
                    argstring += "]" ;
                break;
            
                case "(" :
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
                           wsreg.lastIndex = ind;
                           if (wsreg.test(text) ) {
                               start = ind = wsreg.lastIndex - 1;
                           } else {
                               ind = text.length;
                               err = [start, ind];
                               gcd.emit("error:" + topname, [err, "argument is just whitespace with no terminating"]);
                               return;
                           }
                       continue;
                   } else {
                       stack.unshift("(");
                       argstring += "(";
                   } 
                break;
                
                case ")" :
                    if (stack[0] === cp) {
                        stack.shift();
                        if (argdone) {
                            if (argstring !== "") {
                                err = [argstring, text[start], text[ind], start, ind];
                                gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                        } //  the last argument is popped
                        gcd.emit("arg command parsed:" + emitname);
                        emitname = name.slice(0, -1).join(colon.v);
                        argdone = true;
                        argstring = '';
                        ind += 1;
                            wsreg.lastIndex = ind;
                            if (wsreg.test(text) ) {
                                start = ind = wsreg.lastIndex - 1;
                            } else {
                                ind = text.length;
                                err = [start, ind];
                                gcd.emit("error:" + topname, [err, "argument is just whitespace with no terminating"]);
                                return;
                            }
                        continue;
                    } else {
                        if (stack[0] === "(") {
                            stack.shift();
                        }
                        argstring += ")" ;
                    }
                break;
            
                case "{" :
                    stack.unshift("{");
                    argstring += "{";
                break;
            
                case "}" :
                    if (stack[0] === "{") {
                        stack.shift();
                    }
                    argstring += "}" ;
                break;

            case "'" :
                if ( (stack.length === 0) && (quote === "'") ) {
                    if (argstring.trim()) {
                        if (argdone) {
                            if (argstring !== "") {
                                err = [argstring, text[start], text[ind], start, ind];
                                gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                    }
                    return ind;
                } else {
                    // start after current place, get quote position
                    temp = text.indexOf("'", ind+1)+1;
                    if (temp === -1 ) { 
                        err = [start, ind, temp];
                        gcd.emit("error:" + topname, [err, "non-terminating quote"]);
                        argstring += "'";
                    } else {
                        argstring += text.slice(ind, temp);    
                        ind = temp;
                        
                        continue;
                    }
                }
            break;
            case "\u0022" :
                if ( (stack.length === 0) && (quote === "\u0022") ) {
                    if (argstring.trim()) {
                        if (argdone) {
                            if (argstring !== "") {
                                err = [argstring, text[start], text[ind], start, ind];
                                gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                    }
                    return ind;
                } else {
                    // start after current place, get quote position
                    temp = text.indexOf("\u0022", ind+1)+1;
                    if (temp === -1 ) { 
                        err = [start, ind, temp];
                        gcd.emit("error:" + topname, [err, "non-terminating quote"]);
                        argstring += "\u0022";
                    } else {
                        argstring += text.slice(ind, temp);    
                        ind = temp;
                        
                        continue;
                    }
                }
            break;

            case "`" :
                if ( (stack.length === 0) && (quote === "`") ) {
                    if (argstring.trim()) {
                        if (argdone) {
                            if (argstring !== "") {
                                err = [argstring, text[start], text[ind], start, ind];
                                gcd.emit("error:" + topname, [err, "stuff found after argument finished"]);
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
                    }
                    return ind;
                } else {
                    // start after current place, get quote position
                    temp = text.indexOf("`", ind+1)+1;
                    if (temp === -1 ) { 
                        err = [start, ind, temp];
                        gcd.emit("error:" + topname, [err, "non-terminating quote"]);
                        argstring += "`";
                    } else {
                        argstring += text.slice(ind, temp);    
                        ind = temp;
                        
                        continue;
                    }
                }
            break;
            default: 
                argstring += text[ind];
                


        }

        ind +=1;

    }
    
    return ind;

};

dp.argFinishingHandler = function (comname) {
    var doc = this;
    var gcd = this.gcd;

    var f = function (data) {
        var input, args, command, han;
    
        input = data[0][1];
        command = data[1][1][1];
        args = data.slice(2).map(function (el) {
            return el[1];
        });
        
        var fun;
    
            var method;
            if ( doc.leaders.indexOf(command[0]) !== -1 ) {
                method = command.slice(1);
                if (method) {args.unshift( method );}
                fun = doc.commands[command[0]];
            } else {
                command = doc.normalize(command);
                fun = doc.commands[command];
            }
    
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
    
    
    };
    f._label = "waiting for arguments:" + comname; 
    return f;
};

dp.whitespaceEscape = function (text) {
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

};

dp.argsPrep = function self (args, name, subs, command, input ) {
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
                if (normsubc === 'input') {
                    ret = input; 
               } else if ( (sfun =  ( 
                    (csubs && csubs[normsubc] ) || 
                    (subs && subs[normsubc] )    ) ) ) {
                    ret = sfun.apply(doc, subArgs);
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
            
            if (Array.isArray(ret) && (ret.args === true) ) {
                Array.prototype.push.apply(retArgs, ret);
            } else if (typeof ret === "undefined") {
                // no action, nothing added to retArgs
            } else {
                retArgs.push(ret);
            }
        } else { // should never happen
            retArgs.push(cur);
        }

    }

    return retArgs;

};  

Folder.sync("evil", function (code, args) {
    var doc = this;
    var ret = code;
    try {
        eval(code);
        return ret;
    } catch (e) {
        doc.gcd.emit("error:command:evil:", [e, e.stack, code, args]);
        return e.name + ":" + e.message +"\n" + code + "\nARGS: " + args; 
    }


});

Folder.sync("funify", function (code, args) {
    var doc = this;
    var f;
    try {
        eval("f=" + code);
        return f;
    } catch (e) {
        doc.gcd.emit("error:command:evil:", [e, e.stack, code, args]);
        return e.name + ":" + e.message +"\n" + code + "\nARGS: " + args; 
    }


});

Folder.plugins.arrayify = {
    sep : "\n",
    esc : "\\",
    trim : true
};
Folder.sync("arrayify", function (input, args) {
    var plug = this.plugins.arrayify;
  if (typeof args[0] === "object") {
        plug = merge(true, plug, args.shift());
    } 
    var sep = args[0] || plug.sep;
    var esc = args[1] || plug.esc;
    var trim = args[2] || plug.trim;

    var ret = [];
    var i, n = input.length, j = 0;
    for (i = 0; i < n; i += 1) {

        if (input[i] === sep) {
            ret.push(input.slice(j,i));
            j = i + 1;
            continue;
        }
        if (input[i] === esc) {
            if ( (input[i+1] === sep) || (input[i+1] === esc) ) {
                input = input.slice(0,i) + input.slice(i+1);
                continue;
            }
        }
    }
    ret.push(input.slice(j, i));

    if (trim) {
        ret = ret.map(function (el) {
            return el.trim();
        });
    }
     
    return ret;

});

Folder.plugins.objectify = {
    key : ":",
    val : "\n",
    esc : "\\",
    trim : true
};
Folder.sync("objectify", function (input, args) {
    var plug = this.plugins.objectify;
    if (typeof args[0] === "object") {
        plug = merge(true, plug, args.shift());
    } 
    var keysep = args[0] || plug.key;
    var valsep = args[1] || plug.val;
    var esc = args[2] || plug.esc;
    var trim = args[3] || plug.trim;

    var ret = {};
    var key = "";
    var i, n = input.length, j = 0;
    for (i = 0; i < n; i += 1) {

        if (input[i] === keysep) {
            key = input.slice(j,i).trim();
            j =  i + 1;
            continue;
        }
        if (input[i] === valsep) {
            ret[key] = input.slice(j,i);
            j =  i + 1;
            continue;
        }
        if (input[i] === esc) {
            if ( (input[i+1] === keysep) ||
                 (input[i+1] === valsep) ||
                 (input[i+1] === esc) ) {
               input = input.slice(0,i) + input.slice(i+1);
               continue;
            }
        }
    }
    
    ret[key] = input.slice(j, i);
        
    if (trim) {
        Object.keys(ret).forEach( function (key) {
             ret[key] =  ret[key].trim();
        });
    }

    return ret;    

});

Folder.sync('regify', function (input, args) {
    var doc = this;
    var typeit = this.Folder.requires.typeit;
    

    var text = input;
    var flags = args[0];

    if ( typeit(flags) !== 'string' ) {
        flags = 'g';
    } else if (flags.match('-') !== -1) {
        flags = flags.replace('-', ''); 
    } else if (flags.match('g') === -1) {
        flags += 'g';
    }
    var reg;
    
    try {
        reg = new RegExp(text, flags);
        return reg;
    } catch(e) {
        doc.error("cmd:regify", "failure to compile regular expression", 
            "to compile:", text, "flags:", flags, 
            "error:", e.message );
    }

});

Folder.sync("ife", function (code, args) {
    var i, n = args.length;

    var internal = [];
    var external = [];
    var arg,ret; 

    for (i=0; i <n; i +=1 ) {
        arg = args[i] || "";
        arg = arg.split("=").map(function (el) {
            return el.trim();
        });
        if (arg[0] === "return") {
            ret = arg[1] || "";
        } else if (arg.length === 1) {
            internal.push(arg[0]);
            external.push(arg[0]);
        } else if (arg.length === 2) {
            internal.push(arg[0]);
            external.push(arg[1]);
        }

    }

    var start = "(function ( "+internal.join(", ")+" ) {";
    var end = "\n} ( "+external.join(",")+" ) )";

    if (typeof ret === "string") {
        return start + code + "\n return "+ret+";" + end;
    } else if (code.search(/^\s*function/) === -1) {
        return start + code + end;
    } else {
        return start + "\n return "+ code +";"+ end;
    }
});

Folder.plugins.caps = {
    M  : "@media",
    W : function (ind, input) {
            var reg = /\ |\n|$/g;
            reg.lastIndex = ind;
            reg.exec(input);
            var end = reg.lastIndex -1; //input.indexOf(" ", ind);
            var num = input.slice(ind+2, end);
            var rep;
            if (input[ind+1] === "<") {
                rep = "(max-width: " + num + ")";
            } else if (input[ind+1] === ">") {
                rep = "(min-width: " + num + ")";
            } else {
                return [input, ind];
            }
            return [input.slice(0, ind) + rep + input.slice(end), ind+rep.length];
        }
};

Folder.sync("caps", function (input, args) {
    var matches = args[0] || this.plugins.caps;
    var match, ret;

    var i = 0; 
    while (i < input.length) {
        if (matches.hasOwnProperty(input[i]) ) {
            match = matches[input[i]];
            if (typeof match === "string") {
                //space after cap
                if ( (input[i+1] === " ") || 
                    (input[i+1] === "\n") ||
                    ( (i+1) === input.length) ) {
                    input = input.slice(0, i) + match + input.slice(i+1);
                    i += match.length;
                }
            } else if (typeof match === "function") {
                ret = match(i, input);
                input = ret[0];
                i = ret[1];
            }
        }
        i += 1;
    }

    return input;
});

Folder.sync("assert", function (input, args) {
    var doc = this;
    if (input !== args[0]) {
        doc.log("FAIL: " + args[1] + "\nACTUAL: " + input + 
            "\nEXPECTED: " + args[0]); 
    }
    return input;
});

Folder.sync("wrap", function (code, args) {
    return args[0] + code + args[1];
});

Folder.sync("js-string", function (code, args) {
    var quote = args[0] || '"';
    quote = (args[0] === 'q') ? "'" : quote;
    quote = (args[0] === 'qq') ? '"' : quote;
    code = code.replace(/\\/g, '\\\\');
    code = code.replace(/"/g, '\\' + quote);
    var arr = code.split("\n");
    var i, n = arr.length;
    for (i = 0; i < n; i += 1) {
        arr[i] = quote + arr[i] + quote;
    }
    code = arr.join(" +\n");
    return code;
});

Folder.sync("html-wrap", function (code, options) {

    var element = options.shift();

    var i, option, attributes = [], klass = [], str, ind;
    
    for (i = 0; i < options.length; i += 1) {
        option = options[i];
        if ( ( ind = option.indexOf("=")) !== -1 ) {
            str = option.slice(0, ind+1) + '"' + 
                option.slice(ind+1).trim() + '"';
            attributes.push(str);
        } else { // class
            klass.push(option.trim());
        }
    }
    if (klass.length > 0 ) {
       attributes.push('class="'+klass.join(" ")+'"');
    }
    attributes = attributes.join(" ");

    return "<" + element + " " + attributes + ">"+code+"</"+element+ ">";
}  );

Folder.sync("html-table", function (mat, options) {
    var type = options.shift();

    var i, option, attributes = [], klass = [], str, ind;
    
    for (i = 0; i < options.length; i += 1) {
        option = options[i];
        if ( ( ind = option.indexOf("=")) !== -1 ) {
            str = option.slice(0, ind+1) + '"' + 
                option.slice(ind+1).trim() + '"';
            attributes.push(str);
        } else { // class
            klass.push(option.trim());
        }
    }
    if (klass.length > 0 ) {
       attributes.push('class="'+klass.join(" ")+'"');
    }
    attributes = attributes.join(" ");

    var ret = "<table" + (attributes.length ? " " + attributes : "") + ">\n";

    if (Array.isArray(type) ) {
        ret += "<tr><th>" + type.join("</th><th>") + "</th></tr>\n";
    }
  

    var f = function (row) {
        ret += "<tr><td>" + row.join("</td><td>") + "</td></tr>\n";
        return null;
    };   

    if (mat.rows) {
        mat.rows(f); //allows for matrix, but if not then dbl arr
    } else {
        mat.forEach(f);
    }


    ret += "</table>\n";
    return ret; 
});

Folder.plugins.html_escape = {
    '<' : '&lt;',
    '>' : '&gt;',
    '&' : '&amp;'
};

Folder.sync("html-escape", function (code) {
    var chars = this.plugins.html_escape;
    var record = [];
    var i = 0, start = 0, n = code.length;
    while (i< n) {
        var char = chars[code[i]];
        if ( char) {
            record.push(code.slice(start, i), char);
            start = i+1; 
        }
        i += 1;
    }
    record.push(code.slice(start));
    return record.join('');
});

Folder.plugins.html_unescape = {
    'lt' : '<',
    'gt' : '>',
    'amp' : '&'
};

Folder.sync("html-unescape", function (code) {
    var reg = /\&(\w+)\;/g;
    var chars = this.plugins.html_unescape;
    var match;
    var record = [];
    var start = 0;
    while ( (match = reg.exec(code) ) !== null)  {
        var char = chars[match[1]];
        if ( char) {
            record.push(code.slice(start, match.index), char);
            start = reg.lastIndex; 
        }
    }
    record.push(code.slice(start));
    return record.join('');
});

Folder.plugins.snippets = {};

Folder.sync("snippets", function (code, args) {
    var name = args.shift();
    var plug = this.plugins.snippets;
    var snip, ret, reg, match, rep, num;
    if (plug.hasOwnProperty(name)) {
        snip = plug[name];
        if (typeof snip === "function" ) {
            ret = snip.apply(this, args);
        } else if (typeof snip === "string") {
            ret = snip;
            reg = /ARG(\d+)(?:\|\|([^|]*)\|)?/g;
            while ( (match = reg.exec(ret) ) !== null ) {
                num = parseInt(match[1],10);
                if (typeof args[num]  !== "undefined") {
                    rep = args[num];
                } else { //string or undefined
                    rep = match[2] || '';
                }
                ret = ret.slice(0, match.index) + rep + 
                    ret.slice( match.index + match[0].length );
                // as string is changing, update lastIndex, but make sure we get past
                reg.lastIndex = match.index + rep.length; 
            }
        } else {
            this.log("Unknown type of snippet:"  + args.join(", "));
            ret = args.join(",");
        }
        
    } else {
        this.log("Unknown snippet: " + args.join(", "));
        ret = args.join(",");
    }
return ret;
});
Folder.sync("s", function (code, args) {
    var name = args.shift();
    var plug = this.plugins.snippets;
    var snip, ret, reg, match, rep, num;
    if (plug.hasOwnProperty(name)) {
        snip = plug[name];
        if (typeof snip === "function" ) {
            ret = snip.apply(this, args);
        } else if (typeof snip === "string") {
            ret = snip;
            reg = /ARG(\d+)(?:\|\|([^|]*)\|)?/g;
            while ( (match = reg.exec(ret) ) !== null ) {
                num = parseInt(match[1],10);
                if (typeof args[num]  !== "undefined") {
                    rep = args[num];
                } else { //string or undefined
                    rep = match[2] || '';
                }
                ret = ret.slice(0, match.index) + rep + 
                    ret.slice( match.index + match[0].length );
                // as string is changing, update lastIndex, but make sure we get past
                reg.lastIndex = match.index + rep.length; 
            }
        } else {
            this.log("Unknown type of snippet:"  + args.join(", "));
            ret = args.join(",");
        }
        
    } else {
        this.log("Unknown snippet: " + args.join(", "));
        ret = args.join(",");
    }
return ret;
});

var Matrix = function (code, args) {
    var rowsep, colsep, esc, doTrim, i, start, row, seps, char;
    if (typeit(code, 'string')) {
        rowsep = this.rowsep = args[0] || this.rowsep;
        colsep = this.colsep = args[1] || this.colsep;
        esc = this.escp =  args[2] || this.esc;
        doTrim = ( typeof args[3] !== "undefined") ? args[3] : this.doTrim;
        
        i = 0;
        start = 0;
        row = [];
        this.mat = [row];
        seps = [rowsep, esc, colsep];
        while (i < code.length) {
            char = code[i];
            if (char === rowsep) {
                row.push(code.slice(start, i));
                start = i + 1;
                row = [];
                this.mat.push(row);
            } else if (char === colsep) {
                row.push(code.slice(start, i));
                start = i + 1;
            } else if (char === esc) {
                char = code[i+1];
                if (seps.indexOf(char) !== -1) {
                    code = code.slice(0,i) + char +
                        code.slice(i+1);
                }
            }
            i += 1;
        }
        row.push(code.slice(start));
        if (doTrim) {
            this.trim();
        }
    } else if (typeit(code, 'array')) {
        this.mat = code;
    }

    return this;
};

Matrix.prototype =  {
    rowsep : "\n",
    colsep : ",", 
    esc : "\\",
    doTrim : true,
    transpose : function () {
        var old = this.mat;
        var ret = new Matrix('', []);
        var result = ret.mat;
        var oldcols = old.reduce(function (n, el) {
            return Math.max(n, el.length);
        }, 0);
        var i;
        for (i=0; i < oldcols; i += 1) {
            result[i] = [];
        }
        var oldrows = old.length, j;
        for (i = 0; i < oldcols; i+= 1) {
            for (j=0; j< oldrows ; j += 1) {
                result[i][j] = old[j][i];
            }
        }
        return ret; 
    },
    traverse : function (fun) {
        var mat = this;
        if ( (typeof fun) !== "function" ) {
            //this is an error, not sure who to tell
            return;
        }
        mat.mat.forEach(function (row, rind) {
            row = row.forEach(function (el, ind) {
                var val = fun(el, ind, rind, row, mat.mat);
                if (typeof val !== "undefined") {
                    row[ind] = val;
                }
            });
        });
        return this;
    },
    trim : function () {
         var trim = function (el) {
            if (typeof el.trim === "function") {
                return el.trim();
            } else {
                return;
            }
        };
        this.traverse(trim);
        return this;
    },
    clone :  "_mat clone",
    num : function () {
        var fun = function (el) {
            return parseFloat(el);
        };
        this.traverse(fun);
        return this;
    },
    scale : function (scalar) {
        var fun = function (el) {
            return el*scalar;
        };
        this.traverse(fun);
        return this;
    },
    rows : function (f, val) {
        var red = (typeit(val, "!undefined") );
        var self = this;
        var mat = self.mat;
        mat.forEach(function (row, ind) {
            var ret = f(row.slice(), ind, self, val);
            if (typeit(ret, 'array') ) {
                mat[ind] = ret;
            } else {
                val = ret;
            }
        });
        if ( red ) {
            return val;
        } else {
            return self;
        }
    },
    cols : function (f, val) {
        var red = typeit(val, "!undefined");
        var self = this;
        var trans = self.transpose();
        val = trans.rows(f, val);
        var dbl = trans.transpose();
        if (! (dbl.equals(self) ) ) {
            self.mat = dbl.mat;
        }
        if ( red ) {
            return val;
        } else {
            return self;
        }
    }  ,
    equals : function (other) {
        var self = this;
        var i, n, srow, orow, j, m;
        var smat = self.mat;
        var omat = other.mat;
        if (smat.length !== omat.length) {
            return false;
        }
        n = smat.length;
        for (i = 0; i < n; i +=1) {
            srow = smat[i];
            orow = omat[i];
            if (srow.length !== orow.length) {
                return false;
            } 
            m = srow.length;
            for (j= 0; j < m; j += 1) {
                if (srow[j] !== orow[j] ) {
                    return false;
                }
            }
        }
        return true;
    },
    print : function (rowsep, colsep) {
        var self = this;
        rowsep = (typeit(rowsep, 'undefined') ) ? this.rowsep : rowsep;
        colsep = (typeit(colsep, 'undefined') ) ? this.colsep : colsep;
        var ret = [];
        self.rows(function (row) {
            ret.push(row.join(rowsep));
        });
        return ret.join(colsep);
    }
};

Folder.Matrix = Matrix;

Folder.sync("matrixify", function (input, args) {
    return new Matrix(input, args);
});

Folder.sync("#", function (input, args) {
    if (args.length === 2) {
        this.comments[args[0]] = input;
    }
    return input;
});

Folder.commands.cmds = function (input, seq, finalname) {
    var doc = this;
    var gcd = doc.gcd;
    var colon = doc.colon.v;
    var typeit = doc.Folder.requires.typeit;
    var args, cmd; 

    var hanMaker = function (cmd, args, name) {
        var f = function (input) {
            if (doc.commands[cmd]) {
                doc.commands[cmd].call(doc, input, args, name);
            } else {
                gcd.once("command defined:" + cmd, function () {
                    doc.commands[cmd].call(doc, input, args, name);
                });
            }
        }; 
        f._label = "cmds;;" + name;
        return f;
    };
    var nameMaker = function (i) {
        var ret = finalname + colon + "cmds" + colon + i;
        return ret;
    };
    var i, last = ( (seq.length % 2) === 0 ) ? seq.length-2 : seq.length -1; 
    gcd.flatWhen("text ready:" + nameMaker(last), "text ready:" + finalname);
    for (i = last; i >= 0; i -= 2 ) {
        if (typeit(seq[i+1], 'array')) {
            args = seq[i+1];
        } else {
            args = [seq[i+1]];
        }
        cmd = seq[i];
        if (i > 0) {
            gcd.once("text ready:" + nameMaker(i-2), 
                hanMaker(cmd, args, nameMaker(i) ) );
        } else {
            hanMaker(cmd, args, nameMaker(i))(input);
        }
    }
};

Folder.commands['*'] = Folder.commands.mapc = function self (input, args, name) {
   var doc = this;
   var gcd = this.gcd;
   var colon = this.colon.v;
   var typeit = this.Folder.requires.typeit;
   var normalize = this.parent.Folder.normalize;
   
    args[0] = normalize(args[0]);

    var cmd = args.shift();

    var t = typeit(input);

    var newarr, i, n;
    var newobj, keys;
    var setup = "mapc setup:" + name;
    var ready = "mapc ready:" + name;
    var track;
    
    if (t === 'array') {
        track = gcd.when(setup, ready);
        track.silence(setup);
        n = input.length;
        newarr = [];
        for (i = 0; i < n; i += 1) {
            gcd.when("text ready:" + name + colon + i, ready);
            doc.cmdworker(cmd, input[i], args, name + colon + i);
        }
        gcd.on(ready, function (data) {
            data.forEach(function (el) {
                var ind = el[0].split(colon).reverse()[0]; //gets i
                var idata = el[1];
                newarr[ind] = idata;
            });
            gcd.emit("text ready:" + name, newarr);
        });
        gcd.emit(setup);
    } else if (t === 'object') {
        track = gcd.when(setup, ready);
        track.silence(setup);
        keys = Object.keys(input);
        newobj = {};
        var keyreg = /(\*KEY\*)(\**)/g;
        keys.forEach(function (key) {
            gcd.when("text ready:" + name + colon + key, 
                ready);
            var newargs = args.map(function (el) {
                if (typeit(el, 'string') ) {
                    el = el.replace(keyreg, function (full, first, asters) {
                        if (asters.length !== 0) {
                            return first + asters.slice(1);
                        } else {
                            return key;
                        }
                    });
                }
                return el;
            });
            doc.cmdworker(cmd, input[key], newargs, name + colon + key);
        });
        gcd.on(ready, function (data) {
            data.forEach(function (el) {
                var key = el[0].split(colon).reverse()[0]; //gets key
                var kdata = el[1];
                newobj[key] = kdata;
            });
            gcd.emit("text ready:" + name, newobj);
        });
        gcd.emit(setup);
    } else {
        doc.cmdworker(cmd, input, args, name);
    }

};

Folder.sync("forin", function (input, args) {
    var doc = this;
    var typeit = this.Folder.requires.typeit;
    

    var ret, keys; 

    var fun = args[0];
    var initval = args[1];
    var protosort = args[2];
    var sort;
    if (typeit(fun) !== 'function') {
        doc.warn("cmd:forin", 
            "first argument needs to be function; doing nothing", 
            typeit(fun), input, args
        );
        return input;
    }
    if (protosort === 'key') {
        sort = function (a, b) {
            if ( a < b) {
                return -1; 
            } else if ( a > b) {
                return 1;
            } else {
                return 0; 
            }
        };
    } else if (protosort === 'value') {
        sort = function (key1, key2) {
            var a = input[key1];
            var b = input[key2];
            if ( a < b) {
                return -1; 
            } else if ( a > b) {
                return 1;
            } else {
                return 0; 
            }
        };
    } else if (typeit(protosort, 'function') ) {
        sort = function (a,b) {
            return protosort(a, b, input[a], input[b], input);
        };
    } else {
        sort = false;
    }
    if (typeit(initval, 'undefined') ) {
        initval = null;
    }

    var t = typeit(input);

    if ( t === 'object' ) {
            keys =  Object.keys(input);
            if (sort) {
                sort(keys);
            }
            ret = initval;
            keys.forEach(function (key) {
                ret = fun( input[key], key, ret, input);
                if (typeit(ret, 'undefined')) {
                    ret = null;
                }
            });
    } else if ( t === 'array' ) {
        keys = input.map(function (el, ind) {return ind;});
        if (sort) {
            sort(keys);
        }
        ret = initval;
        keys.forEach(function (key) {
            ret = fun( input[key], key, ret, input);
            if (typeit(ret, 'undefined')) {
                ret = null;
            }
        });
    } else {
        ret = fun(input, '', initval, input);
    }
    if ( typeit(ret) !== "null") {
        return ret;
    } else {
        return input;
    }
});

Folder.sync("pget", function (input, args) {
    var doc = this;
    var typeit = doc.Folder.requires.typeit;
    var cur = input;
    args.some(function (el)  {
        cur = cur[el];
        return typeit(cur, "undefined");
    });
    return cur;
});
Folder.sync("pset", function (input, args) {
    var doc = this;
    var typeit = doc.Folder.requires.typeit;
    var val = args.pop();
    var last = args.pop();

    if ( typeit(input, "undefined") || typeit(input, "null") ) {
        if (typeit(args[0], "number") ) {
            input = [];
        } else {
            input = {};
        }
    }
    var prev, prevkey, cur;
    cur = prev = input; 

    args.forEach(function (elm) {
        if (typeit(cur, 'undefined') ) {
            if ( typeit(elm, 'number' )  ) {
                cur = prev[prevkey] = [];
            } else {
                cur = prev[prevkey] = {};
            }
        }
        prev = cur;
        cur = cur[elm];
        prevkey = elm;
    });

    if (typeit(cur, 'undefined') ) {
        if ( typeit(last, 'number' )  ) {
            cur = prev[prevkey] = [];
        } else {
            cur = prev[prevkey] = {};
        }
    }

    cur[last] = val;

    return input;
});
Folder.sync("pstore", function (input, args) {
    var doc = this;
    var typeit = doc.Folder.requires.typeit;
    var val = input; input = args.shift();
    var last = args.pop();

    if ( typeit(input, "undefined") || typeit(input, "null") ) {
        if (typeit(args[0], "number") ) {
            input = [];
        } else {
            input = {};
        }
    }
    var prev, prevkey, cur;
    cur = prev = input; 

    args.forEach(function (elm) {
        if (typeit(cur, 'undefined') ) {
            if ( typeit(elm, 'number' )  ) {
                cur = prev[prevkey] = [];
            } else {
                cur = prev[prevkey] = {};
            }
        }
        prev = cur;
        cur = cur[elm];
        prevkey = elm;
    });

    if (typeit(cur, 'undefined') ) {
        if ( typeit(last, 'number' )  ) {
            cur = prev[prevkey] = [];
        } else {
            cur = prev[prevkey] = {};
        }
    }

    cur[last] = val;

    return val;
});

Folder.commands.anon = function (input, args, name) {
    var doc = this;
    var gcd = this.gcd;
    var typeit = this.Folder.requires.typeit;
    
    
    var f = args.shift();

    if (typeit(f, "string") ) {
        f.trim();
        if ( ( f[0] === '\u0028')  || (f.slice(0,8) === "function") ) {
            eval('f=' + f); 
        } else {
            eval('f= function (input, args) {' + f + '}');
        }
    } else if  (!(typeit(f, "function") ) ) {
        doc.error("cmd: anon", "unrecognized function", input, args, name);
        return '';
    }

    var ret =  f.call(doc, input, args, name);
    gcd.scope(name, null);
    gcd.emit("text ready:" + name, ret);


};
Folder.commands.anonasync = function (input, args, name) {
    var doc = this;
    var gcd = this.gcd;
    var typeit = this.Folder.requires.typeit;
    
    
    var f = args.shift();

    if (typeit(f, "string") ) {
        f.trim();
        if ( ( f[0] === '\u0028')  || (f.slice(0,8) === "function") ) {
            eval('f=' + f); 
        } else {
            eval('f= function (input, args) {' + f + '}');
        }
    } else if  (!(typeit(f, "function") ) ) {
        doc.error("cmd: anon", "unrecognized function", input, args, name);
        return '';
    }

    var callback = function (err, data) {
        if (err) {
            doc.error("cmd: anon-async", "error in callback", err, input,
                args, name);
        } else {
            gcd.scope(name, null);
            gcd.emit("text ready:" + name, data);
        }
    };
    f.call(doc, input, args, callback, name);


};

Folder.sync('toJSON', function (input, args) {
    var doc = this;
    
    try {
        return JSON.stringify(input, args[0], args[1]); 
    } catch (e) {
        doc.warn("cmd:toJSON", "Failed to stringify", 
           e.message, input, args);
        return '';
    }
});
Folder.sync('fromJSON', function (input, args) {
    var doc = this;
    
    try {
       return JSON.parse(input, args[0]);
    } catch (e) {
        doc.warn("cmd:fromJSON", "Failed to parse", 
           e.message, input, args);
        return {};
    }   
});

Folder.sync("minors", function (input, args) {
    var doc = this;
    var typeit = this.Folder.requires.typeit;
    
    var ret = {};
    var t = typeit(input);
    if (t !== 'array') {
        ret[ args[0] | ''] = input;
        return ret;
    }

    input.forEach(function (el) {
        var key;
        if ( typeit(el, 'array') && (el.length === 2) ) {
            key = el[0].trim();
            ret[key] = el[1];
        } else {
            key = args.shift();
            if (typeit(key, 'string') ) {
                key = key.trim();
                if (typeit(el, '!array') ) {
                    ret[key] = el;
                } else {
                    ret[key] = el[0];
                }
            } else {
                doc.warn("cmd:minors",
                    "not enough keys for unnamed entry",
                    input, args);
            }
        }
    });
    //empty bits for rest
    args.forEach(function (el) {
        if (! ret.hasOwnProperty(el) ) {
            ret[el] = '';
        }
    });
    return ret;
}); 

Folder.commands.templating = function (input, args, name) {
    var doc = this;
    var gcd = this.gcd;
    var colon = this.colon.v;
    
    if (typeit(input) !== 'object') {
        doc.warn("cmd:templating",
            "input needs to be an object", 
            input, args);
        return input;
    }
    if ( typeit(args[0], '!string') ) {
        doc.warn("cmd:templating",
            "first argument needs to be a string to be compiled",
            input, args);
        return '';
    }


    var store = name + colon + "template store";
    var clear = name + colon + "template clear";
    var minorblockname = name + ":*KEY*";

    gcd.flatWhen( "text ready:" + store, 
        "template ready:" + name);
    gcd.once("template ready:" + name, function () { 
        gcd.once("text ready:" + name, function () {
            doc.cmdworker("mapc", input, ['clear', minorblockname], clear);
        });
        doc.cmdworker("compile", args[0], [name], name);
    });
    doc.cmdworker("mapc", input, ['store', minorblockname], store ); 
};

Folder.sync("merge", function (input, args) {
    args.unshift(input);
    return merge.apply(args);
});
Folder.sync("clone", function (input) {
    return clone(input);
});

Folder.commands.apply = function (input, args, name) {
    var doc = this;
    var gcd = this.gcd;
    var colon = this.colon.v;
    
    
    var key = args[0];
    var cmd = args[1];
    args = args.slice(2);
    var data;
    if (typeit(cmd, 'string') ) {
        var ename = name + colon + "apply" + colon + key + colon + cmd; 
        gcd.once("text ready:" + ename, function (data) {
            input[key] = data;
            gcd.emit("text ready:" + name, input);
        });
        doc.cmdworker(cmd, input[key], args, ename); 
    } else if (typeit(cmd, 'function') ) {
        args.unshift(input);
        data = cmd.apply(null, args);
        input[key] = data;
        gcd.emit("text ready:" + name, input);
    }

}; 

Folder.prototype.cmdworker = function (cmd, input, args, ename) {
    var doc = this;
    var gcd = this.gcd;
    var leaders = this.leaders;
    var typeit = this.Folder.requires.typeit;
    
    
    var lead;

    if ( (leaders.indexOf(cmd[0]) !== -1) && (cmd.length > 1) )  {
        lead = cmd[0];
        cmd = cmd.slice(1);
        args.unshift(cmd);
        doc.commands[lead].call(doc, input, args, ename, ".");
    } else if ( typeit(doc.commands[cmd], 'function') ) {
        doc.commands[cmd].call(doc, input, args, ename, cmd );
    } else {
        gcd.once("command defined:" + cmd, function () {
            doc.commands[cmd].call(doc, input, args, ename, cmd );
        });
    }
};  

module.exports = Folder;
