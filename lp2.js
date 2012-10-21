
//Load modules
/*global require, process, console*/
var fs = require('fs');

//Save files
var save = function (name, text) {
      fs.writeFileSync(name, text, 'utf8');
};

//Load file
var filename, md;
filename = process.argv[2];
md = fs.readFileSync(filename, 'utf8');
filename  = filename.substring(0, filename.lastIndexOf('.'));

//Get comment function
var fileTypes = { 
  js : function (type, name) {
    return "//"+type+" "+name+"\n";
  },
  html : function (type, name) {
    return "<!--"+type+" "+name+"!-->\n";
  },
  css : function (type, name) {
    return "/*"+type+" "+name+"*/\n";
  },
  md : function (type, name) {
    return ""; 
  },
  none : function (type, name) {
    return ""; 
  }
};
var typeComment = function (filename) {
  var dots = filename.split(".");
  var type = dots[dots.length -1];
  return fileTypes[type] || fileTypes.none;
};

//Directive execute
var files = {};
var dire = {
  FILE : function (options, code, full) {
    var reg = /^([a-zA-z0-9\/.]+)(?:\s*\,\s*(\S+))?/;
    var match = reg.exec(options);
    if (match) {
      var filename = match[1],
          sub = (match[2]) ? (new RegExp(match[2])) : /\_\"([^"]+)"/;
      files[filename] = [sub, code, full, typeComment(filename)];
    } else {
        console.log("error", options);
    }
  }
};

//Chunk headings
var lines, line, i, n, match, head, headlevel, code, name, directive,
    blocks = {}, fullblocks = {}, current = [], curfull = [],
    headcrumbs = [];
lines = md.split("\n");
n = lines.length;
head = /^\s*(\#+)\s*(.+)$/;
code = /^ {4}(.+)$/;
directive = /^\s*([A-Z]+)\:\s*(.*)$/;
for (i = 0; i < n; i += 1) {
  line = lines[i];
  match = head.exec(line);
  if (match) {
    headlevel = match[1].length;
    while (headlevel <= headcrumbs.length) {
      headcrumbs.shift();
    }
    while (headlevel > headcrumbs.length + 1) {
      headcrumbs.unshift("");
    }
    headlevel += 1; 
    headcrumbs.unshift(match[2]);
    current = blocks[match[2]] = [];
    curfull = fullblocks[match[2]] = [];
  } else {
    curfull.push(line);
    match = code.exec(line);
    if (match) {
      current.push(match[1]);
    } else {
      match = directive.exec(line);
      if (match && (dire.hasOwnProperty(match[1]))) {
        dire[match[1]](match[2], current, curfull);
      }
    }
  }
}

//DoSub
var doSub = function doSub (sub, code, name, comment) {
  var i, n = code.length, line, match, blockname,
      ret = [comment("begin", name)] , newLines;
  for (i = 0; i < n; i += 1) {
    line = code[i];
    match = sub.exec(line);
    if (match) {
      blockname = match[1];
      if (blocks.hasOwnProperty(match[1])) {
        newLines = doSub(sub, blocks[blockname], blockname, comment); 
        ret = ret.concat(newLines);
      } else {
        console.log("no matching block name", blockname, line);
        ret.push(line);
      }
    } else {
      ret.push(line);
    }
  } // end for
  ret.push(comment("end", name));
  return ret;
};

//Make substitutions
var fname, file;
for (fname in files) {
  file = files[fname];
  save(fname, doSub(file[0], file[1], fname, file[3]).join("\n"));
}