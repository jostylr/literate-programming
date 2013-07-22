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
  this.actions = {};
  this.logarr = [];
  this.subtimes = 0;
  this.processing = 0;
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
      var heading, cname, fullname, litpro, filename, temp;

      temp = options[0].split('"').trim();
      if (temp.length === 1) {
        // no quotes presumably
        filename = temp[0];
        fullname = "";
      } else if (temp.length === 3) {
        filename = temp[2];
        fullname = temp[1];
      } else {
        //error
        doc.log('Error in File Directive specification. Please use: "block name" filename.ext | to specify the input and output. ' + options.join[" | "] + "," + doc.hcur.heading);
        return false;
      }

      if (!filename) {
        doc.log("No file name for file: " + options.join[" | "] + "," + doc.hcur.heading);
        return false;
      }
      if (!fullname) {
        litpro = "";
        heading = doc.hcur.heading;
        cname = doc.hcur.cname;
      } else {

        fullname = fullname.toLowerCase();
        //litpro :: fullname
        temp = fullname.split("::").trim();
        if (temp.length === 1) {
          litpro = "";
        } else {
          litpro = temp[0];
          fullname = temp[1];
        }

        // heading : cname
        temp = fullname.split(":").trim();
        heading = temp[0];
        cname = temp[1] || "";
        if (!heading && litpro) {
          doc.log("Need block name for external program." + options.join[" | "] + "," + doc.hcur.heading);
          return false;
        }

        if (heading && !cname) {
          //check for a period
          if ((temp = heading.indexOf(".")) !== -1) {
            cname = heading.slice(temp);
            heading = heading.slice(0, temp);
          }
        }

        if (!heading) {
          //current block
          heading = doc.hcur.heading;
          cname = cname || doc.hcur.cname;
        }
      }

      var type = filename.split(".");
      if (type.length > 1) {
        type = type[type.length - 1];
      } else {
        type = "";
      }

      doc.actions["File not saved: " + filename] = {
        f: function (text) {
          doc.postCompile.call(this, text);
        },
        litpro: litpro,
        heading: heading,
        cname: cname,
        pipes: options.slice(1),
        filename: filename,
        msg: "File not saved: " + filename,
        state: {
          indent: false
        },
        type: type
      };
    },
    "save": function (options, filename, link) {

      var doc = this;
      var heading, cname, litpro = "";

      if (!filename) {
        doc.log("No file name for saving: " + filename + link + options.join("|"));
        return false;
      }

      var type = filename.split(".");
      if (type.length > 1) {
        type = type[type.length - 1];
      } else {
        type = "";
      }

      heading = (link || "").slice(1).replace(/-/g, " ").toLowerCase();

      cname = options.shift();

      if (!heading) {
        //current block
        heading = doc.hcur.heading;
        cname = cname || doc.hcur.cname;
      }

      var newcb, newhb;
      if (cname[0] === "*") {
        newcb = doc.makeCode();
        newcb.lines = ['_"' + heading + cname + options.join("|") + '"'];
        newhb = new HBlock();
        newhb.heading = heading + cname;
        newhb.cblocks[filename] = newcb;
        doc.hblocks[newhb.heading] = newhb;
        heading = newhb.heading;
        cname = filename;
      }

      doc.actions["File not saved: " + filename] = {
        f: function (text) {
          doc.postCompile.call(this, text);
        },
        litpro: litpro,
        heading: heading,
        cname: cname,
        pipes: options,
        filename: filename,
        msg: "File not saved: " + filename,
        state: {
          indent: false
        },
        type: type
      };
    },
    "version": function (options, docname) {
      var doc = this;

      if (arguments.length === 3) {
        doc.addConstants({
          docname: (docname || ""),
          docversion: (options[0] || "0.0.0")
        });
      } else {
        doc.addConstants({
          docname: (options[0] || ""),
          docversion: (options[1] || "0.0.0")
        });
      }
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
        doc.repo[fname] = [
          [doc, name]
        ];
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
      code = hcur.cblocks[hcur.cname].lines.join("\n");
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
    "eval": function (code, options) {
      var doc = this.doc;
      var state = this.state;
      // just cli environment? 
      var program;
      program = this.program || {};
      var inputs;
      inputs = doc.inputs || [];
      options = options || [];
      try {
        state.obj = eval("(function(){" + code + "})()");
        if (typeof state.obj === "undefined") {
          return "";
        } else {
          return state.obj.toString();
        }
      } catch (e) {
        doc.log("Eval error: " + e + "\n" + code);
        return "";
      }
    },
    "nocompile": function () {
      return "";
    },
    "raw": function () {
      var hblock = this.hblock;

      return hblock.full.join("\n");
    },
    "clean raw": function () {
      var hblock = this.hblock;
      var full = hblock.full;
      var i, n = full.length,
        ret = [],
        line;
      for (i = 0; i < n; i += 1) {
        line = full[i];
        if (line.match(/^(?:\#|\.[A-Z]|[A-Z]{2})/)) {
          continue;
        }
        if (line.match(/^ (?:\#|[A-Z.]|\=|\-)/)) {
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

  var reg = /(?:(\_+)(?:(?:\"([^"*][^"]*)\")|(?:\`([^`]+)\`))|(?:([A-Z][A-Z.]*[A-Z])(?:\(([^)]*)\))?))/g;

  var rep = [];
  var match, lower, args, ext;
  var names, temp, reqhblock, otherdoc, pipes, fullname, gotcblock, macro;

  var next, final, go, preprep, pushrep;

  next = function () {
    if ((match = reg.exec(code)) !== null) {
      if (match[2]) {
        pipes = match[2].split("|").trim();
        fullname = pipes.shift().toLowerCase();

        names = {
          fullname: fullname
        };
        var insert;

        temp = fullname.split("*");

        if (temp.length === 2) {
          insert = temp[0];
          temp = temp[1];
        } else {
          temp = temp[0];
        }

        passin.question = temp.split("?")[1];
        temp = temp.split("::").trim();
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
              reqhblock = doc.hblocks[names.heading];
            } else {
              // no block to substitute; ignore
              next("no block to sub");
              return null;
            }
          } else {
            // use the code already compiled in codeBlocks ?: looks like using current?
            reqhblock = hblock;
          }
        }

        gotcblock = doc.getcblock(reqhblock, names.cname);

        if (gotcblock === false) {
          if (typeof passin.question !== "undefined") {
            gotcblock = {
              isCompiled: true,
              compiled: passin.question
            };
            doc.logpop();
          } else {
            doc.log("No cblock found with givename:" + names.cname);
            next();
            return null;
          }
        }

        if (match[1] && match[1].length > 1) {
          rep.push([match[0], match[0].slice(1)]);
          next("multilevel");
          return null;
        }

        // do star replacement
        var newcb, newhb;
        if (insert) {
          newcb = doc.makeCode();
          newcb.lines = gotcblock.lines.map(function (el) {
            return el.replace(/_"\*([^"]*)"/g, '_"' + insert + '$1"');
          });
          newhb = new HBlock();
          newhb.heading = fullname;
          newhb.cblocks[names.heading] = newcb;
          doc.hblocks[newhb.heading] = newhb;
          doc.fullSub(newhb);
          gotcblock = newcb;
        }

        if (passin.gocall) {
          doc.log("go called again", passin.gocall, names.fullname, gotcblock.cname);
        } else {
          passin.gocall = names.fullname;
          if (gotcblock.isCompiled) {
            go(gotcblock.compiled);
          } else {
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

    //do the replacements or return false
    if (rep.length > 0) {
      for (var i = 0; i < rep.length; i += 1) {
        code = code.replace(rep[i][0], rep[i][1].toString().rawString());
      }
      cblock.compiled = code;
    } else {
      passin.status = "compiled";
      // cblock.compiled = code; 
    }
    done.call(passin, cblock.compiled);
  };

  go = passin.go = function (reptext) {
    delete passin.gocall;
    doc.piping.call(passin, pipes, reptext, preprep);
  };

  preprep = function (ret) {
    var passin = this;
    var ind, linetext, middle, space, spacereg = /^(\s*)/;
    if (!passin.state.indent) {
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

  var prune = function (arr) {
    var begin, barr = [],
      earr = [],
      end, n = arr.length;
    for (begin = 0; begin < n; begin += 1) {
      if (arr[begin] === "") {
        continue;
      } else if (arr[begin].match(/^\s+$/)) {
        barr.push(arr[begin].slice(1));
      } else {
        break;
      }
    }
    for (end = n - 1; end > -1; end -= 1) {
      if (arr[end] === "") {
        continue;
      } else if (arr[end].match(/^\s+$/)) {
        earr.push(arr[end].slice(1));
      } else {
        break;
      }
    }
    return barr.concat(arr.slice(begin, end + 1), earr.reverse());
  };

  var next = function (code) {
    var passin = this;
    var cblock = passin.cblock;
    if (code.length !== 0) {
      cblock.compiled = code;
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
    cblock.compiled = code; // make sure the compiled code is there
    var waiting = cblock.waiting || [];
    while (waiting.length > 0) {
      (waiting.shift())(code); // runs the go function
    }

    delete doc.waiting[fullname];

  };

  for (cname in cblocks) {
    cblock = cblocks[cname];
    cblock.compiled = prune(cblock.lines).join("\n");
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
      doc.lastLineType = "code";
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
    var reg = /\[([^\]]*)\]\s*\(([^")]*)"([^:"]*)\:(.*)"\s*\)/g;
    doc.currentLine = line.replace(reg, function (match, name, link, dir, options, offset, str) {
      if (str[offset - 1] === "`") {
        return match;
      }
      name = (name || "").trim();
      link = (link || "").toLowerCase().trim();
      dir = (dir || "").toLowerCase().trim();
      options = (options || "").toLowerCase().split("|").trim();
      if (doc.directives.hasOwnProperty(dir)) {
        doc.directives[dir].call(doc, options, name, link);
        doc.lastLineType = "directive";
        return name;
      } else {
        doc.log("Directive link with no known directive:" + line, 1);
        return match;
      }
    });
    return false;
  },

  function (line, doc) {
    var hcur, heading;
    var head = /^(\#+)\s*(.+)$/;
    var match = head.exec(line);
    var setext = /^(=+|-+)\s*$/;
    var matchse = setext.exec(line);
    if (match) {
      heading = match[2].trim().toLowerCase().replace(/(\#+)$/, '').trim();
    } else if (matchse) {
      if (doc.lastLineType === "text") {
        heading = doc.hcur.plain.pop().trim().toLowerCase();
      }
    }
    if (heading) {
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

      doc.lastLineType = "heading";
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
        doc.lastLineType = "directive";
        return true;
      } else if (doc.types.hasOwnProperty(name)) {
        doc.switchType(match[1], match[2]);
        doc.lastLineType = "type switch";
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },

  function (line, doc) {

    var reg = /^\[([^\]]*)\]\s*\(([^")]*)(?:"([^"].*)")?\s*\)\s*$/;
    var options, name, link, title, type;
    var match = reg.exec(line);
    if (match) {
      name = (match[1] || "").toLowerCase().trim();
      link = (match[2] || "");
      title = (match[3] || "");
      options = title.split("|").trim();
      type = options.shift() || "";
      doc.switchType(name, type, options);
      doc.lastLineType = "type switch";
      return true;
    } else {
      return false;
    }
  },

  function (line, doc) {
    doc.hcur.plain.push(line);
    if (line.match(/^\s*$/)) {
      doc.lastLineType = "empty line";
    } else {
      doc.lastLineType = "text";
    }
    return true;
  }
];

Doc.prototype.switchType = function (a, b, c) {
  var name, type, options;
  var doc = this;
  var hcur = doc.hcur;
  var cname;

  if (arguments.length === 2) {
    type = a.toLowerCase();
    options = (b || "").split("|").trim();
    name = options.shift();
    if (name) {
      cname = name.toLowerCase() + "." + type;
    } else {
      cname = "." + type;
    }
  } else {
    name = a.toLowerCase();
    type = b.toLowerCase() || "";
    options = c;
    if (name) {
      cname = name.toLowerCase() + "." + type;
    } else {
      cname = "." + type;
    }

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
  }, []
];

Doc.prototype.log = function (text, flag) {
  this.logarr.push([text, flag]);
};
Doc.prototype.logpop = function () {
  return this.logarr.pop();
};

Doc.prototype.parseLines = function () {
  var doc = this;
  var i, nn, original;

  var lines = doc.litpro.split("\n");
  var n = lines.length;
  for (i = 0; i < n; i += 1) {
    doc.currentLine = original = lines[i];
    nn = doc.processors.length;
    for (var ii = 0; ii < nn; ii += 1) {
      if (doc.processors[ii](doc.currentLine, doc, original)) {
        break;
      }
    }
    doc.hcur.full.push(original);
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

Doc.prototype.getcblock = function (hblock, cname, ext) {
  var doc = this;
  ext = ext || ""; // only relevant in compiling file type
  var cblocks = hblock.cblocks;

  if (!cblocks) {
    if (cname) {
      doc.log("No code blocks in " + hblock.heading + " The request was for " + cname);
    }
    return false;
  }

  cname = cname.toLowerCase();

  // an exact match! yay!
  if (cblocks.hasOwnProperty(cname)) {
    return cblocks[cname];
  }

  var keys = Object.keys(cblocks);

  // just one key
  if (keys.length === 1) {
    if (keys[0].match(cname)) {
      return cblocks[keys[0]];
    } else {
      if (cname) {

        doc.log("1 Key, no match in " + hblock.heading + " The request was for " + cname);
      }
      return false;
    }
  }

  // no code segments
  if (keys.length === 0) {
    if (cname) {
      doc.log("Code length 0 in " + hblock.heading + " The request was for " + cname);
    }
    return false;
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
    return false;
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

  doc.processActions();

  for (heading in doc.hblocks) {
    doc.fullSub(doc.hblocks[heading]);
  }

  doc.postCompile.call({
    doc: doc
  }, "");

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

Doc.prototype.processActions = function () {
  var doc = this;
  var type;

  var actions = doc.actions;
  var action, hblock, cblock, litpro, headname, cname, fdoc, go;

  var goFact = function (passin) {
    return function (text) {
      fdoc.piping.call(passin, passin.action.pipes || [], text, action.f);
    };
  };

  var aname;
  for (aname in actions) {
    action = actions[aname];
    litpro = action.litpro;
    headname = action.heading;
    cname = action.cname || "";
    if (litpro) {
      if (doc.repo.hasOwnProperty(litpro)) {
        fdoc = doc.repo[litpro];
      } else {
        doc.log("Trying to use non-loaded literate program " + litpro);
        doc.log(action.msg);
        delete actions[action.msg];
        continue;
      }
    } else {
      fdoc = doc;
    }
    if (headname) {
      if (fdoc.hblocks.hasOwnProperty(headname)) {
        hblock = fdoc.hblocks[headname];
      } else {
        doc.log("Trying to load non existent block '" + headname + "'");
        doc.log(action.msg);
        delete actions[action.msg];
        continue;

      }
    } else {
      doc.log("No block " + litpro + " :: " + headname);
      doc.log(action.msg);
      delete actions[action.msg];
      continue;
    }

    type = (action.type || "").trim();
    cblock = fdoc.getcblock(hblock, cname, type);
    if (cblock === false) {
      fdoc.piping.call({
        doc: fdoc,
        hblock: hblock,
        cblock: {},
        name: action.filename,
        state: action.state,
        action: action,
        star: action.star
      }, action.pipes || [], hblock.full.join("\n"), action.f);
    } else {
      go = goFact({
        doc: fdoc,
        hblock: hblock,
        cblock: cblock,
        name: action.filename,
        state: action.state,
        action: action
      });
      cblock.waiting.push(go);
    }
  }
};

HBlock = function () {

  this.cblocks = {};
  this.full = [];
  this.plain = [];

  return this;
};

module.exports.Doc = Doc;