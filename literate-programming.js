/*global require, process, console, module*/
/*jslint evil:true*/
var beautify = require('js-beautify').js_beautify;
var jshint = require('jshint').JSHINT;
// Define the ES5 String.trim() method if one does not already exist.
// This method returns a string with whitespace removed from the start and end.
String.prototype.trim = String.prototype.trim || function () {
  if (!this) return this; // Don't alter the empty string
  return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
};
module.exports.compile = function (md) {
  var directives = {
    "FILE": function (options, doc) {
      options = options.trim();
      doc.files.push([options, doc.name]);
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
        var log = [],
          err;
        for (var i = 0; i < jshint.errors.length; i += 1) {
          err = jshint.errors[i];
          log.push(err.line + "," + err.character + ": " + err.reason);
        }
        console.log(log.join("\n"));
        return code;
      };
    }
  };
  var constants = {};

  var lineparser = function (lp) {
    var i, line, nn;
    var doc = {
      blocks: {},
      cur: {
        code: [],
        full: [],
        subdire: []
      },
      defaultProcessors: [

      function (line, doc) {
        var code = /^ {4}(.+)$/;
        var match = code.exec(line);
        if (match) {
          doc.cur.code.push(match[1]);
          return true;
        } else {
          return false;
        }
      },

      function (line, doc) {
        var level, oldLevel, cur, name;
        var head = /^(\#+)\s*(.+)$/;
        var match = head.exec(line);
        var pre = function (code, block, doc) {
          return code.trim();
        };
        var post = function (code, block, doc) {
          block.compiled = code;
          return code;
        };
        var during = function (code, block, doc, counter) {
          return code;
        };
        if (match) {
          name = match[2].trim();
          oldLevel = doc.level || 0;
          level = match[1].length;
          cur = {
            code: [],
            full: [],
            subdire: []
          };
          if (level >= oldLevel + 2) {
            level = oldLevel;
            cur.parent = doc.cur.parent || doc.cur;
            doc.cur = cur;
            cur.parent.subdire.push(cur);
            return true;
          }

          // new code block

          doc.blocks[name] = cur;
          doc.cur = cur;
          doc.cur.name = name;
          doc.level = level;
          doc.name = name;
          cur.pre = pre;
          cur.post = post;
          cur.during = during;
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
          if (directives.hasOwnProperty(match[1])) {
            directives[match[1]](match[2], doc);
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },

      function (line, doc) {
        doc.cur.full.push(line);
        return true;
      }],
      files: []
    };
    doc.processors = [].concat(doc.defaultProcessors);
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

  var doc = lineparser(md);

  var subtimes = 0;
  var maxsub = 1e5;

  var oneSub, fullSub;
  oneSub = function oneSub(code, doc) {

    if (subtimes >= maxsub) {
      return false;
    } else {
      subtimes += 1;
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
          rep.push([match[0], fullSub(match[2], doc)]);
        }
      } else if (match[3]) {
        // code
        if (match[1] && match[1].length > 1) {
          rep.push([match[0], match[0].slice(1)]);
          continue;
        }
        toRun = fullSub(match[3], doc);
        rep.push([match[0], eval(toRun)]);
      } else {
        // constant
        if (constants.hasOwnProperty(match[4])) {
          rep.push([match[0], constants[match[4]]]);
        }
      }
    }
    //do the replacements or return false
    if (rep.length > 0) {
      for (var i = 0; i < rep.length; i += 1) {
        code = code.replace(rep[i][0], rep[i][1]);
      }
      return code;

    } else {
      return false;
    }
  };
  fullSub = function fullSub(name, doc) {
    var block = doc.blocks[name];
    if (block.hasOwnProperty("compiled")) {
      return block.compiled;
    }
    var code = block.code.join("\n");

    code = block.pre(code, block, doc);
    var newText = code;
    var counter = 0;
    while (newText) {
      counter += 1;
      code = newText;
      newText = oneSub(code, doc);
      code = block.during(code, block, doc, counter);
    }

    code = block.post(code, block, doc);
    block.compiled = code;
    return code;
  };

  var makeFiles = function (doc) {
    if (doc.hasOwnProperty("pre")) {
      doc.pre();
    }
    var compiled = doc.compiled = {};
    var files = doc.files;
    var fname, blockname, text;
    for (var i = 0; i < files.length; i += 1) {
      fname = files[i][0];
      blockname = files[i][1];
      text = fullSub(blockname, doc);
      compiled[fname] = text;
    }
    if (doc.hasOwnProperty("post")) {
      doc.post();
    }
  };

  makeFiles(doc);
  return doc;
};