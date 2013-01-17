/*global require, module*/
/*jslint evil:true*/

var beautify = require('js-beautify').js_beautify;
var jshint = require('jshint').JSHINT;
var marked = require('marked');

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

module.exports.compile = function (md, options) {

  var Block, Doc;

  Doc = function (options) {
    this.blocks = {};
    this.cur = new Block();
    this.files = [];
    this.log = [];
    this.subtimes = 0;
    this.type = ".";

    this.types = {
      js: 1,
      md: 1,
      html: 1,
      css: 1
    };

    this.directives = {
      "FILE": function (options) {
        var doc = this;
        options = options.trim();
        var match = options.match(/^(\S+)\s*(.*)$/);
        if (match) {
          doc.files.push([match[1], doc.name, match[2]]);
          doc.cur.file = match[1];
        } else {
          doc.log("No file name for file: " + options + "," + doc.name);
        }
      }
    };

    this.commander = function (commands, code) {
      var i, n = commands.length,
        command;
      for (i = 0; i < n; i += 1) {
        command = commands[i];

        code = command[0].call(command[2], code, command[1]); //if performance is issue, check here
      }

      return code;
    };

    this.commands = {
      "eval": function (code) {
        return eval(code);
      },
      "jshint": function (code) {
        var doc = this.doc;
        var block = {}; //currently not stored anywhere

        jshint(code, options || {});
        var data = jshint.data();

        block.jshint = {
          data: data,
          errors: [],
          implieds: [],
          unused: []
        };
        var lines = code.split("\n");
        var log = [],
          err, i;
        for (i = 0; i < jshint.errors.length; i += 1) {
          err = jshint.errors[i];
          log.push("E " + err.line + "," + err.character + ": " + err.reason +
            "  " + lines[err.line - 1]);
          block.jshint.errors.push({
            "line#": err.line,
            character: err.character,
            reason: err.reason,
            line: lines[err.line - 1]
          });
        }
        if (data.hasOwnProperty("implieds")) {
          for (i = 0; i < data.implieds.length; i += 1) {
            err = data.implieds[i];
            log.push("Implied Gobal " + err.line + ": " + err.name +
              "  " + lines[err.line[0] - 1]);
            block.jshint.implieds.push({
              "line#": err.line,
              name: err.name,
              line: lines[err.line[0] - 1]
            });

          }
        }
        if (data.hasOwnProperty("unused")) {
          for (i = 0; i < data.unused.length; i += 1) {
            err = data.unused[i];
            log.push("Unused " + err.line + ": " + err.name +
              "  " + lines[err.line - 1]);
            block.jshint.unused.push({
              "line#": err.line,
              name: err.name,
              line: lines[err.line - 1]
            });

          }
        }

        if (log.length > 0) {
          log = ("!! JSHint:" + this.name + "\n" + log.join("\n"));
        } else {
          log = ("JSHint CLEAN: " + this.name);
        }

        doc.log.push(log);
        return code;
      },
      "jstidy": function (code, options) {
        options = options.join(",").trim();
        return beautify(code, options || {
          indent_size: 2,
          "jslint_happy": true
        });
      },
      "marked": function (code, options) {

        var block = this.block;

        var lpsnip = [],
          mathsnip = [];

        var masklit = function (match) {
          lpsnip.push(match);
          return "LITPROSNIP" + (lpsnip.length - 1);
        };

        var maskmath = function (match) {
          mathsnip.push(match);
          return "MATHSNIP" + (mathsnip.length - 1);
        };

        var unmasklit = function (match, number) {
          return lpsnip[parseInt(number, 10)];
        };

        var unmaskmath = function (match, number) {
          return mathsnip[parseInt(number, 10)];
        };

        code = code.replace(/\_+(\"[^"]+\"|\`[^`]+\`)/g, masklit);
        code = code.replace(/\$\$[^$]+\$\$|\$[^$\n]+\$|\\\(((?:[^\\]|\\(?!\)))+)\\\)|\\\[((?:[^\\]|\\(?!\]))+)\\\]/g, maskmath);
        code = marked(code);
        if (options.length > 0) {
          var elem = options[0];
          options = options.slice(1);
          var i, option, attributes = "",
            klass = [],
            temp,
            id = block.name.replace(/\s/g, "_"); // id may not contain spaces
          for (i = 0; i < options.length; i += 1) {
            option = options[i];
            if (option.indexOf("=") !== -1) {
              // attribute found, check if id
              temp = option.split(/\s+/);
              if (temp[0] === "id" && temp[1] === "=") {
                id = temp[2];
              } else {
                attributes += option;
              }
            } else { // class
              klass.push(option.trim());
            }
          }
          attributes = "id='" + id + "' " + "class='" + klass.join(" ") + "' " + attributes;
          code = "<" + elem + " " + attributes + ">" + code + "</" + elem + ">";
        }
        code = code.replace(/LITPROSNIP(\d+)/g, unmasklit);
        code = code.replace(/MATHSNIP(\d+)/g, unmaskmath);
        return code;

      }
    };

    this.constants = {};

    this.processors = [].concat(this.defaultProcessors);


    if (options) {
      var key;
      for (key in options) {
        this[key] = options[key];
      }
    }

    return this;
  };

  Doc.prototype.maxsub = 1e5;

  Doc.prototype.oneSub = function oneSub(codeBlocks, name, block) {

    var doc = this;

    if (doc.subtimes >= doc.maxsub) {
      console.log("maxed out", block.name);
      return false;
    } else {
      doc.subtimes += 1;
    }


    var code = codeBlocks[name];

    var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|([A-Z][A-Z.]*[A-Z]))/g;
    var rep = [];
    var match, ret, type, pieces, where, comp, ctype, ext;
    var com, cmatch, funname, funargs, comreg = /^\s*([^(]+)(?:\(([^)]*)\))?$/,
      comarr, passin;

    var blocks = doc.blocks;

    while ((match = reg.exec(code)) !== null) {

      //multi-level 

      if (match[2]) {

        //split off the piping
        pieces = match[2].split("|").trim();
        where = pieces.shift().toLowerCase();

        if (where) {
          if (doc.blocks.hasOwnProperty(where)) {
            if (match[1] && match[1].length > 1) {
              rep.push([match[0], match[0].slice(1)]);
              continue;
            }
            comp = doc.fullSub(blocks[where]);
          } else {
            // no block to substitute; ignore
            continue;
          }
        } else {
          // use the code already compiled in codeBlocks
          if (match[1] && match[1].length > 1) {
            rep.push([match[0], match[0].slice(1)]);
            continue;
          }
          comp = codeBlocks;
        }

        type = pieces.shift();

        ext = name.split(".")[1].trim().toLowerCase();

        if (type) {
          type = type.toLowerCase();
          ret = comp[type] || comp["." + type] || comp[type + "." + ext] || comp[type + "."];
          if (!ret) {
            for (ctype in comp) {
              if (ctype.match(type)) {
                ret = comp[ctype];
                break;
              }
            }
          }
        } else {
          // try the extension from this type or try the no extension
          ret = comp["." + ext] || comp["."];
        }

        // grab something!
        if (!ret) {
          for (ctype in comp) {
            ret = comp[ctype];
          }
        }

        comarr = [];
        passin = {
          doc: doc,
          block: block,
          name: where + type
        }; //? what is needed for this?
        while (pieces.length > 0) {

          com = pieces.shift();

          cmatch = com.match(comreg);

          if (com === null) {
            doc.log("No match " + com);
            continue;
          }

          funname = cmatch[2].trim();

          if (cmatch[3]) {
            funargs = cmatch[3].split(",").trim();
          } else {
            funargs = [];
          }

          if (doc.commands.hasOwnProperty(funname)) {
            comarr.push([doc.commands[funname], funargs, passin]);
          } else {
            doc.log("Issue with " + com);
          }

        }

        ret = doc.commander(comarr, ret);

        rep.push([match[0], ret]);
        //console.log(ret);

      } else if (match[3]) {
        // code
        if (match[1] && match[1].length > 1) {
          rep.push([match[0], match[0].slice(1)]);
          continue;
        }

        rep.push([match[0], eval(match[3])]);

      } else {
        // constant
        if (doc.constants.hasOwnProperty(match[4])) {
          rep.push([match[0], doc.constants[match[4]]]);
        }
      }

    }
    //do the replacements or return false
    if (rep.length > 0) {
      for (var i = 0; i < rep.length; i += 1) {
        code = code.replace(rep[i][0], rep[i][1].rawString());
      }

      codeBlocks[name] = code;

      return 1;

    } else {
      return 0;
    }
  };
  Doc.prototype.fullSub = function fullSub(block) {
    var doc = this;
    var name;
    var code = {}, blockCode;

    if (block.hasOwnProperty("compiled")) {
      return block.compiled;
    } else {
      block.compiled = {};
    }

    for (name in block.code) {
      blockCode = block.code[name];
      code[name] = blockCode.join("\n");
      if (blockCode.commands.hasOwnProperty(0)) {
        code[name] = doc.commander(blockCode.commands[0], code[name]);
      }

    }

    var counter = 0,
      go = 1;
    while (go) {
      go = 0;
      counter += 1;
      for (name in code) {
        go += doc.oneSub(code, name, block);

        blockCode = block.code[name];

        if (blockCode.commands.hasOwnProperty(counter)) {
          code[name] = doc.commander(blockCode.commands[counter], code[name]);
        }
      }
    }


    for (name in code) {
      blockCode = block.code[name];

      if (blockCode.commands.hasOwnProperty("Infinity")) {
        code[name] = doc.commander(blockCode.commands["Infinity"], code[name]);
      }
      block.compiled[name] = code[name];
    }

    return block.compiled;
  };

  Doc.prototype.defaultProcessors = [

  function (line, doc) {
    var cur = doc.cur;
    var reg = /^(?: {4}|(?:\t {4}))(.*)$/;
    var match = reg.exec(line);
    if (match) {
      cur.code[cur.type].push(match[1]);
      return true;

    } else if (line.match(/^\s*$/)) {
      var carr = cur.code[cur.type];
      if (carr && carr.length > 0 && carr[carr.length - 1] !== "") {
        cur.code[cur.type].push(line);
      }
      return false; // so that it can be added to the plain parser as well

    } else {
      return false;
    }
  },

  function (line, doc) {
    var level, oldLevel, cur, name, cname;
    var head = /^(\#+)\s*(.+)$/;
    var match = head.exec(line);
    if (match) {
      name = match[2].trim().toLowerCase();
      oldLevel = doc.level || 0;
      level = match[1].length;

      cur = doc.cur;
      for (cname in cur.code) {
        if (cur.code[cname].length === 0) {
          delete cur.code[cname];
        }
      }

      cur = new Block();
      cur.name = name;
      cur.type = doc.type;
      cur.code[cur.type] = doc.makeCode();

      // this shortcircuits if it is a directive heading
      if (level >= oldLevel + 2) {
        level = oldLevel;
        cur.parent = doc.cur.parent || doc.cur;

        doc.cur = cur;
        cur.parent.subdire.push(cur);
        return true;
      }

      doc.blocks[name] = cur;
      doc.cur = cur;
      doc.level = level;
      doc.name = name;
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
    match = reg.exec(line);
    if (match) {
      if (doc.directives.hasOwnProperty(match[1])) {
        doc.directives[match[1]].call(doc, match[2]);
        return true;
      } else if (doc.types.hasOwnProperty(match[1].toLowerCase())) {
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
    doc.cur.plain.push(line);
    return true;
  }];

  Doc.prototype.switchType = function (type, options) {
    var doc = this;
    var cur = doc.cur;

    type = type.toLowerCase();
    if (typeof options === "undefined") {
      options = "";
    }
    options = options.split("|");
    var name = options.shift();
    if (name) {
      name.trim();
      cur.type = name.toLowerCase() + "." + type;
    } else {
      cur.type = "." + type;
    }

    if (!cur.code.hasOwnProperty(cur.type)) {
      cur.code[cur.type] = doc.makeCode();
    }

    var codearr = cur.code[cur.type];

    var passin = {
      doc: doc,
      block: cur,
      type: type,
      name: name
    }; // for command stuff

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
          codearr.commands[ind].push([doc.commands[funname], funargs, passin]);
        } else {
          codearr.commands[ind] = [
            [doc.commands[funname], funargs, passin]
          ];
        }
      }
    }

  };

  Doc.prototype.makeCode = function () {
    var doc = this;
    var ret = [];
    ret.commands = {
      0: [doc.trimCode]
    };
    return ret;
  };

  Doc.prototype.trimCode = [function (code) {
    return code.trim();
  }, [], {}];

  Block = function () {

    this.code = {};
    this.full = [];
    this.plain = [];
    this.subdire = [];

    return this;
  };

  var lineparser = function (lp, options) {
    var i, line, nn;
    var doc = new Doc(options);

    var lines = md.split("\n");
    doc.cur.level = 0;
    var n = lines.length;
    for (i = 0; i < n; i += 1) {
      line = lines[i];
      nn = doc.processors.length;
      for (var ii = 0; ii < nn; ii += 1) {
        if (doc.processors[ii](line, doc)) {
          doc.cur.full.push(line);
          break;
        }
      }
    }
    return doc;
  };

  Doc.prototype.lineparser = lineparser;
  Doc.prototype.makeFiles = function () {
    var doc = this;
    var compiled = doc.compiled = {};
    var files = doc.files;
    var fname, blockname, ext, type, ret, ctype, comp;
    for (var i = 0; i < files.length; i += 1) {
      fname = files[i][0];
      blockname = files[i][1];
      comp = doc.fullSub(doc.blocks[blockname]);
      type = files[i][2];
      ext = fname.split(".");
      ext = ext[ext.length - 1].trim();
      if (type) {
        ret = comp[type] || comp["." + type] || comp[type + "." + ext] || comp[type + "."];
        if (!ret) {
          for (ctype in comp) {
            if (ctype.match(type)) {
              ret = comp[ctype];
              break;
            }
          }
        }
      } else {
        // try the extension from this type or try the no extension
        ret = comp[fname] || comp["." + ext] || comp["."];
      }

      compiled[fname] = [ret, blockname];
    }
  };

  var doc = lineparser(md, options);

  doc.makeFiles();

  return doc;
};