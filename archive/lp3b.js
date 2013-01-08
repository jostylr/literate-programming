/*global require, process, console*/
var fs = require('fs');
// Define the ES5 String.trim() method if one does not already exist.
// This method returns a string with whitespace removed from the start and end.
String.prototype.trim = String.prototype.trim || function() {
   if (!this) return this;                // Don't alter the empty string
   return this.replace(/^\s+|\s+$/g, ""); // Regular expression magic
};
var save = function (name, text) {
      fs.writeFileSync(name, text, 'utf8');
};
var directives = { 
    FILE :  
function (options, doc) {
    options = options.trim();
    doc.files.push([options, doc.name]);
}
    
};
var constants = {};
var filename, md;
filename = process.argv[2];
md = fs.readFileSync(filename, 'utf8');
var lineparser = function (lp) {
  var i, line, nn; 
  var doc = {
    blocks : {},
    cur : {
  code : [],
  full : [],
  subdire : [],
  prop : {}
},
    defaultProcessors : [ 
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
  if (match) {
    name = match[2].trim();
    oldLevel = doc.level || 0;
    level = match[1].length;
    cur = {
  code : [],
  full : [],
  subdire : [],
  prop : {}
};
        if (level >= oldLevel +2) {
        level = oldLevel; 
        doc.cur = cur; 
        doc.blocks[doc.name].subdire.push(cur);
        return true;
    }
    
    // new code block
    
    doc.blocks[name] = cur; 
    doc.cur = cur; 
    doc.level = level;
    doc.name = name;        
    doc.pre[name] = function (code, doc) {return code;};
    doc.post[name] = function (code, doc) {return code;};
    // new processors for each section
    doc.processors = [].concat(doc.defaultProcessors);
    
    return true;
  } 
  return false;
}, 
function (line, doc) {     
  var reg = /^([A-Z][A-Z.]*[A-Z])\s+(.*)$/;
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
} 
],
    files : [],
    pre : {}, 
    post : {}
  };
  doc.processors = [].concat(doc.defaultProcessors);
  var lines = md.split("\n");
  doc.cur.level = 0; 
  var n = lines.length;
  for (i = 0; i < n; i += 1) {
    line = lines[i];
    nn = doc.processors.length;
    for (var ii = 0; ii < nn; ii += 1) {
        if (doc.processors[ii](line, doc) ) {
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
var oneSub = function oneSub (code, name, doc) {
    
        if (subtimes >= maxsub) {
        return false;
    } else {
        subtimes += 1;
    }
            
    code = doc.pre[name](code, doc); 
    var reg = /(?:(\_+)(?:(?:\"([^"]+)\")|(?:\`([^`]+)\`))|([A-Z][A-Z.]*[A-Z]))/g;
    var rep = [];
    var toRun, newCode, match;
    
    var blocks = doc.blocks;
    while (match = reg.exec(code) ) {
        
        //multi-level 
    
        if (match[2]) {
            // section
            if (blocks.hasOwnProperty(match[2])) {
                                if (match[1] && match[1].length > 1) {
                    rep.push([match[0], match[0].slice(1)]);
                    continue;
                }
                // do a one-level sub
                newCode = blocks[match[2]].code.join("\n");
                // we use or for the case of no subs
                rep.push([match[0], oneSub(newCode, match[2], doc) || newCode]);
            }               
        } else if (match[3]) {
            // code
                            if (match[1] && match[1].length > 1) {
                    rep.push([match[0], match[0].slice(1)]);
                    continue;
                }
            toRun = fullSub(match[3]);
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
        code = doc.post[name](code, doc); 
        return code; 
        
    } else {
        return false;
    }
}
    ;
var fullSub = function (name, doc) {
    var compiled = doc.blocks[name].code.join("\n");
        
    var newText = compiled;
    while(newText) {
        compiled = newText;
        newText = oneSub(compiled, name, doc);
    }
        
    return compiled;
};
var makeFiles = function (doc) {
    var files = doc.files;
    var fname, blockname, text;
    for (var i = 0; i < files.length; i  += 1) {
        fname = files[i][0];
        blockname = files[i][1];
        text = fullSub(blockname, doc);
        save(fname, text);
    }
};
makeFiles(doc);