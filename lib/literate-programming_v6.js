/*global require, module, process*/
/*jslint evil:true*/

var fs = require('fs');

// Define the ES5 String.trim() method if one does not already exist.
// This method returns a string with whitespace removed from the start and end.
String.prototype.trim = String.prototype.trim || function () {
  if (!this) return this; // Don't alter the empty string
  return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
};
String.prototype.rawString = String.prototype.rawString || function () {
  var ret = this;
  return function () {
    return ret;
  };
};
Array.prototype.trim = Array.prototype.trim || function () {
  var ret = [];
  var arr = this;
  var i, n = arr.length;
  for (i = 0; i < n; i += 1) {
    if (typeof arr[i].trim === "function") {
      ret[i] = arr[i].trim();
    }
  }
  return ret;
};
if (!Object.keys) {
  Object.keys = function (o) {
    if (o !== Object(o)) {
      throw new TypeError('Object.keys called on non-object');
    }
    var ret = [],
      p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        ret.push(p);
      }
    }
    return ret;
  };
}

var HBlock, Doc, repo = {
  plugins: {},
  litpro: {}
};

Doc = function (md, options) {

  this.litpro = md;
  this.hblocks = {};
  this.chur = new HBlock();
  this.files = [];
  this.compiledFiles = {};
  this.logarr = [];
  this.subtimes = 0;
  this.type = ".";

  this.loading = {}; // for the LOAD and compile
  this.loaded = {}; // can reference this for external litpro by names. 
  this.waiting = {}; // place to put blocks waiting for compiling
  this.processing = 0; // Tracks status of processing. 
  this.call = []; // a list of functions to call upon a resume

  this.types = {
    "": "text/plain",
    css: "text/css"
  };

  this.directives = {
    "file": function (options) {
      var doc = this;
      var headname, internalname, litpro, arr, name;
      if (options[0] === "") {
        doc.log("No file name for file: " + options.join[" | "] + "," + doc.hcur.heading);
        return false;
      } else {
        if (!options[1]) {
          options[1] = ["", doc.hcur.heading, doc.hcur.cname];
        } else {
          name = options[1].toLowerCase();
          arr = name.split("::").trim();
          if (arr.length === 1) {
            litpro = "";
            name = arr[0] || doc.hcur.heading;
          } else {
            litpro = arr[0] || "";
            name = arr[1] || doc.hcur.heading;
          }
          arr = name.split(":").trim();
          headname = arr[0] || doc.hcur.heading;
          internalname = arr[1] || "";
          options[1] = [litpro, headname, internalname];
        }
        doc.files.push(options);
      }
    },
    "version": function (options) {
      var doc = this;

      doc.addConstants({
        docname: (options[0] || ""),
        docversion: (options[1] || "0.0.0")
      });
    },
    "load": function (options) {
      var doc = this;
      var fname = options.shift();
      if (!fname) {
        doc.log("Error in LOAD. Please give a filename " + options.join(" | "));
        return false;
      }
      var name = options.shift();
      if (!name) {
        name = fname;
      }
      var newdoc;
      if (doc.repo.hasOwnProperty(fname)) {
        if (Array.isArray(doc.repo[fname])) {
          // loading
          doc.repo[fname].push([doc, name]);
          doc.loading[name] = true;
        } else {
          // already loaded
          newdoc = doc.repo[fname];
          doc.loaded[name] = newdoc;
          newdoc.parents.push([doc, name]);
        }
        return true;
      } else {
        // never seen before
        doc.repo[name] = [doc, name];
        doc.loading[name] = true;
      }
      var file, i, n, par;
      file = fs.readFile(fname, 'utf8', function (err, data) {
        var tempdoc, tempname, newdoc;
        if (err) {
          doc.log("Issue with LOAD: " + fname + " " + name + " " + err.message);
          par = doc.repo[fname];
          delete doc.repo[fname];
          n = par.length;
          for (i = 0; i < n; i += 1) {
            tempdoc = par[i][0];
            tempname = par[i][1];
            delete tempdoc.loading[tempname];
            // may want to abort instead?
            if (Object.keys(doc.loading).length === 0) {
              doc.compile();
            }
          }
        } else {
          par = doc.repo[fname];
          newdoc = doc.repo[name] = (new Doc(data, {
            standardPlugins: doc.standardPlugins,
            postCompile: doc.postCompile,
            filterCompileFiles: options,
            parents: par,
            fromFile: fname
          }));
          n = par.length;
          for (i = 0; i < n; i += 1) {
            tempdoc = par[i][0];
            tempname = par[i][1];
            delete tempdoc.loading[tempname];
            tempdoc.loaded[tempname] = newdoc;
            if (Object.keys(doc.loading).length === 0) {
              doc.compile();
            }
          }

        }
      });
      return true;
    },
    "require": function (options) {
      var doc = this;
      var name = options.shift();
      if (!name) {
        doc.log("Error in REQUIRE. Please give a module filename " + options.join(" | "));
        return false;
      }
      var bits;
      try {
        if (name[0] === "/") {
          name = process.cwd() + name;
        }
        bits = require(name);
      } catch (e) {
        doc.log("Issue with REQUIRE: " + name + " " + options + " " + e.message);
        return false;
      }
      var bit;
      if (options.length === 0) {
        for (bit in bits) {
          if ((bits.hasOwnProperty(bit)) && (typeof bits[bit] === "function")) {
            bits[bit](doc); //each one is responsible for modifying
          }
        }
      } else {
        var i, n = options.length;
        for (i = 0; i < n; i += 1) {
          bit = options[i];
          if ((bits.hasOwnProperty(bit)) && (typeof bits[bit] === "function")) {
            bits[bit](doc); //each one is responsible for modifying
          }
        }
      }
    },
    "set": function (options) {
      var doc = this;
      if (options.length >= 2) {
        var name = options[0].toLowerCase();
        var newc = {};
        newc[name] = options.slice(1).join("|"); // a hack to undo pipe splitting--loses whitespacing
        doc.addConstants(newc);
      } else {
        doc.log("Error with SET directive. Need exactly 2 arguments.");
      }
    },
    "define": function (options) {
      var doc = this;
      var hcur = doc.hcur;
      var code;
      var fname = options.shift().toLowerCase();
      if (!fname) {
        doc.log("Error with DEFINE directive. Need a name.");
        return false;
      }
      code = hcur.code[hcur.cname].join("\n");
      var macrof;
      eval("macrof=" + code);
      var newm = {};
      newm[fname] = macrof;
      doc.addMacros(newm);
    }
  };

  this.commander = function (commands, code, passin, final) {
    var i = 0,
      n = commands.length;
    if (!passin.lengths) {
      passin.lengths = [];
    }
    var next = function (code) {
      if (code) {
        passin.lengths.push([i, code.length]);
      } else {
        passin.lengths.push([i, 0]);
      }

      if (i < n) {
        var command = commands[i];
        i += 1; // prime it for next loop
        if (command[0].callback) {
          code = command[0].call(passin, code, command[1], next);
        } else {
          code = command[0].call(passin, code, command[1]);
          next(code);
          return null;
        }
      } else {

        // all done
        final.call(passin, code);
        return null;
      }
    };

    next(code); // begin!

    return null;
  };
  this.commands = {
    "eval": function (code) {
      try {
        this.state.obj = eval("(function(){" + code + "})()");
        if (typeof this.state.obj === "undefined") {
          return "";
        } else {
          return this.state.obj.toString();
        }
      } catch (e) {
        this.doc.log("Eval error: " + e + "\n" + code);
        return "";
      }
    },
    "nocompile": function () {
      return "";
    },
    "raw": function () {
      var block = this.block;

      return block.full.join("\n");
    },
    "clean raw": function () {
      var block = this.block;
      var full = block.full;
      var i, n = full.length,
        ret = [],
        line;
      for (i = 0; i < n; i += 1) {
        line = full[i];
        if (line.match(/^(?:\#|\.[A-Z]|[A-Z]{2})/)) {
          continue;
        }
        if (line.match(/^ (?:\#|[A-Z.])/)) {
          ret.push(line.slice(1));
        } else {
          ret.push(line);
        }
      }
      return (ret.join("\n")).trim();
    },
    "indent": function (code, options) {
      var begin, middle;
      if (options.length === 2) {
        begin = Array(parseInt(options[0], 10) + 1).join(" ");
        middle = "\n" + Array(parseInt(options[1], 10) + 1).join(" ");
      } else if (options.length === 1) {
        begin = "";
        middle = "\n" + Array(parseInt(options[0], 10) + 1).join(" ");
      } else {
        this.state.indented = true;
        return code;
      }
      code = begin + code.replace("\n", middle);
      this.state.indented = true;
      return code;
    },
    "log": function (code, options) {
      var doc = this.doc;
      var name = this.name;
      if (options[0]) {
        doc.log(options[0] + "\n" + code);
      } else {
        doc.log(name + ":\n" + code);
      }
      return code;
    },
    "substitute": function (code, options) {
      var i, n = options.length,
        reg;
      for (i = 0; i < n; i += 2) {
        if (!options[i + 1]) {
          break; // should only happen if n is odd
        }
        reg = new RegExp(options[i], "g"); // global replace
        code = code.replace(reg, options[i + 1]);
      }
      return code;
    },
    "stringify": function (code) {
      code = code.replace(/\\/g, '\\\\');
      code = code.replace(/"/g, '\\' + '"');
      var arr = code.split("\n");
      var i, n = arr.length;
      for (i = 0; i < n; i += 1) {
        arr[i] = '"' + arr[i] + '"';
      }
      code = "[" + arr.join(",\n") + '].join("\\n")';
      return code;
    }
  };

  this.macros = {};

  this.repo = repo; // defined in module scope; 

  this.processors = [].concat(this.defaultProcessors);


  if (options) {
    var key;
    for (key in options) {
      this[key] = options[key];
    }
  }

  this.addPlugins(this.standardPlugins);
  this.parseLines(); // which then initiates .compile().process().end(); 

  return this;
};

Doc.prototype.defaultIndent = "    ";

Doc.prototype.maxsub = 1e5;

Doc.prototype.oneSub = function oneSub(code, ignore, done) {

  var passin = this;
  var cblock = passin.cblock;
  var doc = passin.doc;
  var hblock = passin.hblock;

  var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|(?:([A-Z][A-Z.]*[A-Z])(?:\(([^)]*)\))?))/g;

  var rep = [];
  var waiting = false;
  var match, lower, args, ext;
  var names, temp, reqhblock, otherdoc, pipes, fullname, gotcblock, macro;

  var next, final, go, preprep, pushrep;

  next = function () {
    //console.log("Next called", passin.fullname, ( match ? match.index : "--"), passin.status);
    if ((match = reg.exec(code)) !== null) {
      if (match[2]) {
        //console.log(match[2]);
        pipes = match[2].split("|").trim();
        fullname = pipes.shift().toLowerCase();

        names = {
          fullname: fullname
        };

        temp = fullname.split("::").trim();
        if (temp.length === 1) {
          names.litpro = "";
          temp = temp[0];
        } else {
          names.litpro = temp[0];
          temp = temp[1];
        }
        // no ":"
        if (temp.indexOf(":") === -1) {
          if ((ext = temp.lastIndexOf(".")) !== -1) {
            // has a period indicating extension
            names.cname = temp.slice(ext);
            names.heading = temp.slice(0, ext);
          } else {
            names.cname = "";
            names.heading = temp;
          }
        } else {
          temp = temp.split(":").trim();
          names.cname = temp[1];
          names.heading = temp[0];
        }

        if (names.litpro) {
          if (doc.repo.hasOwnProperty(names.litpro)) {
            otherdoc = doc.repo[names.litpro];
            if (otherdoc.hblocks.hasOwnProperty(names.heading)) {
              reqhblock = otherdoc.hblocks[temp];
            } else {
              doc.log("No such block " + names.heading + " in literate program " + names.litpro);
              next("no block");
              return null;
            }
          } else {
            doc.log("No such literate program loaded: " + names.litpro);
            next("no litpro");
            return null;
          }
        } else {
          // this doc
          if (names.heading) {
            if (doc.hblocks.hasOwnProperty(names.heading)) {
              if (match[1] && match[1].length > 1) {
                rep.push([match[0], match[0].slice(1)]);
                next("multilevel");
                return null;
              }
              reqhblock = doc.hblocks[names.heading];
            } else {
              // no block to substitute; ignore
              next("no block to sub");
              return null;
            }
          } else {
            // use the code already compiled in codeBlocks
            if (match[1] && match[1].length > 1) {
              rep.push([match[0], match[0].slice(1)]);
              next("multilevel");
              return null;
            }
            reqhblock = hblock;
          }
        }

        gotcblock = doc.getBlock(reqhblock, names.cname);

        if (passin.gocall) {
          console.log("go called again", passin.gocall, names.fullname, gotcblock.cname);
        } else {
          passin.gocall = names.fullname;
          if (gotcblock.isCompiled) {
            //console.log("about to gather ", names.fullname, " --- ", gotcblock.compiled.length);
            go(gotcblock.compiled);
          } else {
            //console.log("gonna wait for ", names.fullname, " --- ", gotcblock.cname, gotcblock.waiting.length, passin.fullname);
            //console.log(gotcblock.waiting.length);
            gotcblock.waiting.push(go);
          }
        }
      } else if (match[3]) {
        if (match[1] && match[1].length > 1) {
          rep.push([match[0], match[0].slice(1)]);
          next("multilevel");
          return null;
        }

        rep.push([match[0], eval(match[3])]);
        next("eval");
        return null;
      } else {
        lower = match[4].toLowerCase();
        args = (match[5] || "").split(',').trim();
        if (doc.macros.hasOwnProperty(lower)) {
          macro = doc.macros[lower];
          if (macro.callback) {
            doc.macros[lower].call(passin, args, pushrep); //the macro should call the second argument: pushrep
          } else {
            rep.push([match[0], doc.macros[lower].apply(passin, args)]);
            next("macro");
            return null;
          }
        } else {
          next("no macro");
          return null;
        }
      }
    } else {
      final("from next");
    }

  };

  final = function () {

    //console.log("final called", passin.status, passin.fullname, rep.length);
    //do the replacements or return false
    if (rep.length > 0) {
      for (var i = 0; i < rep.length; i += 1) {
        if (typeof rep[i][1] === "string") {
          code = code.replace(rep[i][0], rep[i][1].rawString());
        } else {
          // error
          console.log("ERROR in replacing:", rep[i][0], rep[i][1]);

          code = code.replace(rep[i][0], "");
        }
      }
      cblock.compiled = code;
    } else {
      passin.status = "compiled";
      // cblock.compiled = code; 
    }
    done.call(passin, cblock.compiled);
  };

  go = passin.go = function (reptext) {
    //console.log("substituting", passin.gocall, " into ", passin.fullname, " --- ", reptext.length);
    delete passin.gocall;
    doc.piping.call(passin, pipes, reptext, preprep);
  };

  preprep = function (ret) {
    var passin = this;
    var ind, linetext, middle, space, spacereg = /^(\s*)/;
    if (!passin.state.indent) {
      if (!match) {
        //console.log(ret, rep);
        //console.log(passin, ret);
      }
      ind = match.index - 1;
      while (ind > 0) {
        if (code[ind] === "\n") {
          break;
        } else {
          ind -= 1;
        }

      }
      if (ind === 0 || ind === match.index - 1) {
        // no indent
      } else {
        linetext = code.slice(ind + 1, match.index);
        space = linetext.match(spacereg);
        if (space[1].length === linetext.length) {
          //all spaces
          middle = space[1];
        } else {
          middle = space[1] + doc.defaultIndent;
        }
        ret = ret.replace(/\n/g, "\n" + middle);
      }
    }
    pushrep(ret);

  };

  pushrep = function (ret) {
    rep.push([match[0], ret]);
    next("rep pushed");
  };

  next("first");

};
Doc.prototype.oneSub.callback = true;

Doc.prototype.fullSub = function fullSub(hblock) {
  var doc = this;
  var cname, cblock, compiling = {};
  var cblocks = hblock.cblocks;

  var final;

  var next = function (code) {
    var passin = this;
    var cblock = passin.cblock;
    if (code.length !== 0) {
      cblock.compiled = code;
    } else {
      console.log("ERROR: Blank code", passin.fullname);
    }
    var doc = passin.doc;
    var commands;

    if (passin.status === "done") {
      return;
    }

    if (passin.status === "compiled") {
      // run post commands, final
      commands = cblock.commands["Infinity"] || [];
      doc.commander(commands, code, passin, final);
    } else {
      commands = cblock.commands[passin.status] || [];
      passin.status += 1;
      commands.push([doc.oneSub, []]);
      // run commands
      doc.commander(commands, code, passin, next);
    }

  };

  final = function (code) {
    var passin = this;
    var doc = passin.doc;
    var cblock = passin.cblock;
    var fullname = passin.fullname;

    cblock.isCompiled = true;
    passin.status = "done";
    var waiting = cblock.waiting || [];
    //console.log(waiting, passin.fullname);
    while (waiting.length > 0) {
      (waiting.shift())(code); // runs the go function
    }
    //console.log("DONE", fullname);

    delete doc.waiting[fullname];

    // check for other waiting
    if (Object.keys(doc.waiting).length === 0) {
      doc.process();
    }
    //console.log(passin.fullname, " ---- ", cblock.compiled.length, passin.status); 

  };

  for (cname in cblocks) {
    cblock = cblocks[cname];
    cblock.compiled = cblock.lines.join("\n");
    compiling[cname] = {
      status: 0,
      cblock: cblock,
      commands: cblock.commands || [],
      hblock: hblock,
      next: next,
      final: final,
      doc: doc,
      name: cname,
      fullname: hblock.heading + ":" + cname,
      state: {
        indent: false
      },
      lengths: [cblock.compiled.length]
    };
  }

  for (cname in compiling) {
    //console.log("Starting " + compiling[cname].fullname);
    compiling[cname].next(cblocks[cname].compiled);
  }
};

Doc.prototype.defaultProcessors = [

function (line, doc) {
  var hcur = doc.hcur;
  var reg = /^\t* {4}(.*)$/;
  var match = reg.exec(line);
  if (match) {
    hcur.cblocks[hcur.cname].lines.push(match[1]);
    return true;

  } else if (line.match(/^\s*$/)) {
    var carr = hcur.cblocks[hcur.cname];
    if (carr && carr.lines.length > 0 && carr.lines[carr.lines.length - 1] !== "") {
      hcur.cblocks[hcur.cname].lines.push(line);
    }
    return false; // so that it can be added to the plain parser as well

  } else {
    return false;
  }
},

function (line, doc) {
  var hcur, heading;
  var head = /^(\#+)\s*(.+)$/;
  var match = head.exec(line);
  if (match) {
    heading = match[2].trim().toLowerCase();

    var cname;
    var oldh = doc.hcur;
    if (oldh) {
      for (cname in oldh.cblocks) {
        if (oldh.cblocks[cname].lines.length === 0) {
          delete oldh.cblocks[cname];

        }
      }
    }

    hcur = new HBlock();
    hcur.heading = heading;
    hcur.cname = doc.type;
    hcur.cblocks[hcur.cname] = doc.makeCode(cname);


    doc.hblocks[heading] = hcur;
    doc.hcur = hcur;
    // new processors for each section
    doc.processors = [].concat(doc.defaultProcessors);

    return true;
  }
  return false;
},

function (line, doc) {

  var fileext = /^\.([A-Z]*)(?:$|\s+(.*)$)/;
  var match = fileext.exec(line);
  if (match) {
    doc.switchType(match[1], match[2]);
    return true;
  }

  var reg = /^([A-Z][A-Z\.]*[A-Z])(?:$|\s+(.*)$)/;
  var options, name;
  match = reg.exec(line);
  if (match) {
    name = match[1].toLowerCase();
    if (doc.directives.hasOwnProperty(name)) {
      options = (match[2] || "").split("|").trim();
      doc.directives[name].call(doc, options);
      return true;
    } else if (doc.types.hasOwnProperty(name)) {
      doc.switchType(match[1], match[2]);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
},

function (line, doc) {
  doc.hcur.plain.push(line);
  return true;
}];

Doc.prototype.switchType = function (type, options) {
  var doc = this;
  var hcur = doc.hcur;
  var cname;

  type = type.toLowerCase();
  if (typeof options === "undefined") {
    options = "";
  }
  options = options.split("|").trim();
  var name = options.shift();
  if (name) {
    name.trim();
    cname = name.toLowerCase() + "." + type;
  } else {
    cname = "." + type;
  }
  hcur.cname = cname;

  if (!hcur.cblocks.hasOwnProperty(cname)) {
    hcur.cblocks[cname] = doc.makeCode(cname);
  }

  var codearr = hcur.cblocks[cname];

  var funname, ind, funargs, match, funreg = /^(\d*)\s*([^(]+)(?:\(([^)]*)\))?$/;
  var i, n = options.length,
    option;
  for (i = 0; i < n; i += 1) {
    option = options[i].trim();
    match = option.match(funreg);
    if (match === null) {
      doc.log("Failed parsing (" + name + " ): " + option);
      continue;
    }

    funname = match[2].trim();

    if (match[3]) {
      funargs = match[3].split(",").trim();
    } else {
      funargs = [];
    }

    if (match[1]) {
      ind = parseInt(match[1], 10);
    } else {
      ind = "Infinity";
    }

    if (doc.commands.hasOwnProperty(funname)) {

      if (codearr.commands.hasOwnProperty(ind)) {
        codearr.commands[ind].push([doc.commands[funname], funargs]);
      } else {
        codearr.commands[ind] = [
          [doc.commands[funname], funargs]
        ];
      }
    }
  }

};

Doc.prototype.makeCode = function (cname) {
  var doc = this;
  return {
    lines: [],
    commands: {
      0: [doc.trimCode]
    },
    isCompiled: false,
    compiled: "",
    waiting: [],
    cname: cname
  };
};

Doc.prototype.trimCode = [function (code) {
  return code.trim();
}, []];

Doc.prototype.log = function (text) {
  this.logarr.push(text);
};

Doc.prototype.parseLines = function () {
  var doc = this;
  var i, line, nn;

  var lines = doc.litpro.split("\n");
  var n = lines.length;
  for (i = 0; i < n; i += 1) {
    line = lines[i];
    nn = doc.processors.length;
    for (var ii = 0; ii < nn; ii += 1) {
      if (doc.processors[ii](line, doc)) {
        doc.hcur.full.push(line);
        break;
      }
    }
  }

  var cname;
  var oldh = doc.hcur;
  if (oldh) {
    for (cname in oldh.cblocks) {
      if (oldh.cblocks[cname].lines.length === 0) {
        delete oldh.cblocks[cname];

      }
    }
  }

  if (Object.keys(doc.loading).length === 0) {
    doc.compile();
  }

  return doc;
};

Doc.prototype.getBlock = function (hblock, cname, ext) {
  var doc = this;
  ext = ext || ""; // only relevant in compiling file type
  var cblocks = hblock.cblocks;

  if (!cblocks) {
    doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
    return {
      compiled: "",
      isCompiled: true
    };
  }

  cname = cname.toLowerCase();

  // an exact match! yay!
  if (cblocks.hasOwnProperty(cname)) {
    return cblocks[cname];
  }

  var keys = Object.keys(cblocks);

  // just one key
  if (keys.length === 1) {
    return cblocks[keys[0]];
  }

  // no code segments
  if (keys.length === 0) {
    doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
    return {
      compiled: "",
      isCompiled: true
    };
  }

  if (doc.types.hasOwnProperty(cname)) {
    // main.js
    if (cblocks.hasOwnProperty("main." + cname)) {
      return cblocks["main." + cname];
    }
    // .js
    if (cblocks.hasOwnProperty(cname)) {
      return cblocks["." + cname];
    }
  }

  // try and find a match for the internal
  var newkeys = keys.filter(function (val) {
    if (val.match(cname)) {
      return true;
    } else {
      return false;
    }
  });

  if (newkeys.length === 1) {
    return cblocks[newkeys[0]];
  }

  if (newkeys.length === 0) {
    doc.log("Name not found: " + cname + " of " + hblock.heading);
    return {
      compiled: "",
      isCompiled: true
    };
  }

  //so we have multiple matches to cname (cname could be/ probably is "")
  // use extension ext if it has anything.

  var extkeys = newkeys.filter(function (val) {
    if (val.match(ext)) {
      return true;
    } else {
      return false;
    }
  });

  if (extkeys.length === 1) {
    return cblocks[extkeys[0]];
  }

  var finalkeys;
  if (extkeys.length > 0) {
    finalkeys = extkeys;
  } else {
    finalkeys = newkeys;
  }

  var morekeys = finalkeys.filter(function (val) {
    if (val.match("main")) {
      return true;
    } else {
      return false;
    }
  });

  if (morekeys.length > 0) {
    return cblocks[morekeys[0]];
  }

  // pick shortest one which could be the empty name
  return cblocks[finalkeys.sort(function (a, b) {
    if (a.length < b.length) {
      return -1;
    } else {
      return 1;
    }
  })[0]];

};

Doc.prototype.compile = function () {
  var doc = this;

  var heading, cblocks, cname;
  for (heading in doc.hblocks) {
    cblocks = doc.hblocks[heading].cblocks;
    for (cname in cblocks) {
      doc.waiting[heading + ":" + cname] = true;
    }
  }

  for (heading in doc.hblocks) {
    doc.fullSub(doc.hblocks[heading]);
  }

  return doc;
};

Doc.prototype.addConstants = function (obj) {
  var doc = this;
  var name;
  var newobj = {};
  for (name in obj) {
    newobj[name] = doc.wrapVal(obj[name]);
  }
  doc.addMacros(newobj);
};

Doc.prototype.wrapVal = function (val) {
  return function () {
    return val;
  };
};

Doc.prototype.piping = function (pieces, code, final) {

  var doc = this.doc;
  var passin = this;

  var com, cmatch, funname, funargs, comreg = /^\s*([^(]+)(?:\(([^)]*)\))?$/,
    comarr;

  comarr = [];

  while (pieces.length > 0) {

    com = pieces.shift();

    cmatch = com.match(comreg);

    if (com === null) {
      doc.log("No match " + com);
      continue;
    }

    funname = cmatch[1].trim();

    if (cmatch[2]) {
      funargs = cmatch[2].split(",").trim();
    } else {
      funargs = [];
    }

    if (doc.commands.hasOwnProperty(funname)) {
      comarr.push([doc.commands[funname], funargs]);
    } else {
      doc.log("Issue with " + com);
    }
  }

  doc.commander(comarr, code, passin, final);

  return null;
};

Doc.prototype.addMacros = function (newobj) {
  var doc = this;
  var oldobj = doc.macros;
  var name;
  for (name in newobj) {
    if (oldobj.hasOwnProperty(name)) {
      doc.log("Replacing " + name);
    }
    oldobj[name] = newobj[name];
  }
};

Doc.prototype.addCommands = function (newobj) {
  var doc = this;
  var oldobj = doc.commands;
  var name;
  for (name in newobj) {
    if (oldobj.hasOwnProperty(name)) {
      doc.log("Replacing " + name);
    }
    oldobj[name] = newobj[name];
  }
};

Doc.prototype.addTypes = function (newobj) {
  var doc = this;
  var oldobj = doc.types;
  var name;
  for (name in newobj) {
    if (oldobj.hasOwnProperty(name)) {
      doc.log("Replacing " + name);
    }
    oldobj[name] = newobj[name];
  }
};

Doc.prototype.addDirectives = function (newobj) {
  var doc = this;
  var oldobj = doc.directives;
  var name;
  for (name in newobj) {
    if (oldobj.hasOwnProperty(name)) {
      doc.log("Replacing " + name);
    }
    oldobj[name] = newobj[name];
  }
};

Doc.prototype.addPlugins = function (plugobj) {
  var doc = this;
  if (!plugobj) {
    return false;
  }
  var type;
  for (type in plugobj) {
    if ((plugobj.hasOwnProperty(type)) && (typeof plugobj[type] === "function")) {
      plugobj[type](doc); //each one is responsible for modifying
    }
  }
  return true;
};

Doc.prototype.process = function () {
  var doc = this;
  var type;

  var files = doc.files;
  var cFiles = doc.compiledFiles = {};
  var file, hblock, fname, text, litpro, headname, cname, fdoc;
  var i, n = files.length,
    passin;
  var final = function (text) {
    var doc = this.doc;
    var fname = this.name;
    cFiles[fname] = text;
    doc.processing -= 1;
    if (doc.processing < 1) {
      doc.end();
    }
  };
  doc.processing = n;

  //console.log(files);

  for (i = 0; i < n; i += 1) {
    file = files[i];
    fname = file[0];
    litpro = file[1][0];
    headname = file[1][1];
    cname = file[1][2] || "";
    if (litpro) {
      if (doc.repo.hasOwnProperty(litpro)) {
        fdoc = doc.repo[litpro];
      } else {
        doc.log(fname + " is trying to use non-loaded literate program " + litpro);
        continue;
      }
    } else {
      fdoc = doc;
    }
    if (headname) {
      if (fdoc.hblocks.hasOwnProperty(headname)) {
        hblock = fdoc.hblocks[headname];
      } else {
        doc.log(fname + " is trying to load non existent block '" + headname + "'");
        continue;
      }
    } else {
      doc.log(fname + " has no block " + litpro + " :: " + headname);
      continue;
    }
    type = fname.split(".")[1].trim(); //assuming no other period in name
    text = fdoc.getBlock(hblock, cname, type).compiled;
    passin = {
      doc: fdoc,
      hblock: hblock,
      name: fname,
      state: {
        indent: false
      }
    };
    fdoc.piping.call(passin, file.slice(2), text, final);
  }

  return doc;
};

Doc.prototype.end = function () {

  var doc = this;
  var pc = doc.postCompile;
  var i, n = pc.length,
    fun, obj;
  for (i = 0; i < n; i += 1) {
    fun = pc[i][0];
    obj = pc[i][1];
    fun.call(doc, obj);
  }

  return doc;
};

HBlock = function () {

  this.cblocks = {};
  this.full = [];
  this.plain = [];

  return this;
};

module.exports.Doc = Doc;