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

module.exports.compile = function (md, options) {

  var Block, Doc;

  Doc = function (options) {
    this.blocks = {};
    this.cur = new Block();
    this.files = [];
    this.log = [];
    this.subtimes = 0;

    this.directives = {
      "FILE": function (options, doc) {
        options = options.trim();
        doc.files.push([options, doc.name]);
        doc.cur.file = options;
      },
      "RAW": function (options, doc) {
        doc.cur.pre = function () {
          return "";
        };

        doc.cur.post = function (code, block) {
          return block.plain.join("\n");
        };
      },



      "JS.TIDY": function (options, doc) {
        var post = doc.cur.post;
        doc.cur.post = function (code, block, doc) {
          code = post(code, block, doc);
          return beautify(code, options || {
            indent_size: 2,
            "jslint_happy": true
          });
        };
      },
      "JS.HINT": function (options, doc) {
        var post = doc.cur.post;
        doc.cur.post = function (code, block, doc) {
          code = post(code, block, doc);
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
            log = ("!! JSHint:" + block.file + "\n" + log.join("\n"));
          } else {
            log = ("JSHint CLEAN: " + block.file);
          }

          doc.log.push(log);
          return code;
        };
      },
      "MD.HTML": function (options, doc) {

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

        var modify = function (code, block, doc, options) {
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
        };

        options = options.split(",") || [];

        if (options.length === 0) {
          options.push(0);
        }

        var tempnum, tempmod;

        if ((tempnum = parseInt(options[0], 10)) == options[0]) {
          if (tempnum === -1) {
            tempmod = doc.cur.pre;
            doc.cur.pre = function (code, block, doc) {
              code = tempmod(code, block, doc);
              code = modify(code, block, doc, options.slice(1));
              return code;
            };
          } else if (tempnum > 0) {
            tempmod = doc.cur.during;
            doc.cur.during = function (code, block, doc, counter) {
              code = tempmod(code, block, doc, counter);
              if (counter === tempnum) {
                code = modify(code, block, doc, options.slice(1));
              }
              return code;
            };
          } else {
            tempmod = doc.cur.post;
            doc.cur.post = function (code, block, doc) {
              code = tempmod(code, block, doc);
              code = modify(code, block, doc, options.slice(1));
              return code;
            };
          }
        }

      },
      "JS.PRE": function (options, doc) {

        var modify = function (code, block, doc, options) {
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
          code = code.replace(/</g, "&lt;");
          code = code.replace(/>/g, "&gt;");
          code = code.replace(/\&/g, "&amp;");
          return "<pre " + attributes + "><code>" + code + "</code></pre>";
        };

        options = options.split(",") || [];

        if (options.length === 0) {
          options.push(0);
        }

        var tempnum, tempmod;

        if ((tempnum = parseInt(options[0], 10)) == options[0]) {
          if (tempnum === -1) {
            tempmod = doc.cur.pre;
            doc.cur.pre = function (code, block, doc) {
              code = tempmod(code, block, doc);
              code = modify(code, block, doc, options.slice(1));
              return code;
            };
          } else if (tempnum > 0) {
            tempmod = doc.cur.during;
            doc.cur.during = function (code, block, doc, counter) {
              code = tempmod(code, block, doc, counter);
              if (counter === tempnum) {
                code = modify(code, block, doc, options.slice(1));
              }
              return code;
            };
          } else {
            tempmod = doc.cur.post;
            doc.cur.post = function (code, block, doc) {
              code = tempmod(code, block, doc);
              code = modify(code, block, doc, options.slice(1));
              return code;
            };
          }
        }

      }
    };

    this.constants = {};


    this.processors = [].concat(this.defaultProcessors);

    console.log(this.processors);

    if (options) {
      var key;
      for (key in options) {
        this[key] = options[key];
      }
    }

    return this;
  };

  Doc.prototype.maxsub = 1e5;

  Doc.prototype.oneSub = function oneSub(code) {

    var doc = this;

    if (doc.subtimes >= doc.maxsub) {
      return false;
    } else {
      doc.subtimes += 1;
    }


    var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|([A-Z][A-Z.]*[A-Z]))/g;
    var rep = [];
    var toRun, match;

    var blocks = doc.blocks;

    while ((match = reg.exec(code)) !== null) {

      //multi-level 

      if (match[2]) {
        // section
        if (blocks.hasOwnProperty(match[2])) {
          if (match[1] && match[1].length > 1) {
            rep.push([match[0], match[0].slice(1)]);
            continue;
          }
          rep.push([match[0], doc.fullSub(match[2])]);
        }
      } else if (match[3]) {
        // code
        if (match[1] && match[1].length > 1) {
          rep.push([match[0], match[0].slice(1)]);
          continue;
        }
        toRun = doc.fullSub(match[3]);
        rep.push([match[0], eval(toRun)]);

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
      return code;

    } else {
      return false;
    }
  };
  Doc.prototype.fullSub = function fullSub(name) {
    var doc = this;
    var block;

    if (doc.blocks.hasOwnProperty(name)) {
      block = doc.blocks[name];
      if (block.hasOwnProperty("compiled")) {
        return block.compiled;
      }
    } else {
      // need to fix up and create a new block; code blocks are in mind here.
      console.log(name);
      return name;
    }



    var code = block.code.join("\n");

    code = block.pre(code, block, doc);

    var newText = code;
    var counter = 0;
    while (1) {
      counter += 1;
      if ((newText = doc.oneSub(code)) === false) {
        break;
      }

      code = newText;

      code = block.during(code, block, doc, counter);
    }

    code = block.post(code, block, doc);

    block.compiled = code;

    return code;
  };

  Doc.prototype.defaultProcessors = [

  function (line, doc) {
    var reg = /^(?: {4}|\t)(.*)$/;
    var match = reg.exec(line);
    if (match) {
      doc.cur.code.push(match[1]);
      return true;


    } else if (line.match(/^\s*$/)) {
      doc.cur.code.push(line);
    } else {
      return false;
    }
  },

  function (line, doc) {
    var level, oldLevel, cur, name;
    var head = /^(\#+)\s*(.+)$/;
    var match = head.exec(line);
    if (match) {
      name = match[2].trim();
      oldLevel = doc.level || 0;
      level = match[1].length;

      cur = new Block();


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
      doc.cur.name = name;
      doc.level = level;
      doc.name = name;
      // new processors for each section
      doc.processors = [].concat(doc.defaultProcessors);

      return true;
    }
    return false;
  },

  function (line, doc) {
    var reg = /^([A-Z][A-Z\.]*[A-Z])(?:$|\s+(.*)$)/;
    var match = reg.exec(line);
    if (match) {
      if (doc.directives.hasOwnProperty(match[1])) {
        doc.directives[match[1]](match[2], doc);
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

  Block = function () {

    this.code = [];
    this.full = [];
    this.plain = [];
    this.subdire = [];

    return this;
  };

  Block.prototype.pre = function (code) { //, block, doc) {
    return code.trim();
  };

  Block.prototype.post = function (code) { //, block) { //, doc) {
    return code;
  };

  Block.prototype.during = function (code) { //, block, doc, counter) {
    return code;
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
    var fname, blockname, text;
    for (var i = 0; i < files.length; i += 1) {
      fname = files[i][0];
      blockname = files[i][1];
      text = doc.fullSub(blockname);
      compiled[fname] = [text, blockname];
    }
  };

  var doc = lineparser(md, options);

  doc.makeFiles();

  return doc;
};