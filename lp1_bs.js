fs = require('fs');


var filename, md;
filename = process.argv[2];
md = fs.readFileSync(filename, 'utf8');

filename  = filename.substring(0, filename.lastIndexOf('.'));


var lines, line, i, n, match, head, code, name,
    blocks = {}, fullblocks = {}, current = [], curfull = [];
lines = md.split("\n");
n = lines.length;
head = /^\s*(\#+)\s*(.+)$/;
code = /^ {4}(.+)$/;
for (i = 0; i < n; i += 1) {
  line = lines[i];
  match = head.exec(line);
  if (match) {
    current = blocks[match[2]] = [];
    curfull = fullblocks[match[2]] = [];
  } else {
    curfull.push(line);
    match = code.exec(line);
    if (match) {
      current.push(match[1]);
    } 
  }
}
for (name in blocks) {
  blocks[name] = blocks[name].join("\n");
}


var plan, items = [],  listitem;  //i, n, match,
plan = fullblocks["The Plan"];
n = plan.length;
listitem = /\s*\d+\.\s*(.*)$/;
for (i = 0; i < n; i += 1) {
  match = listitem.exec(plan[i]);
  if (match) {
    if (blocks.hasOwnProperty(match[1]) ) {
      items.push([match[1], blocks[match[1]]]);
    } else {
      console.log("no section named", match[1]);
    }
  } 
}


var item, out;
n = items.length;
for (i = 0; i < n; i += 1) {
  item = items[i];
  items[i] = "\n//" + item[0] + "\n" + item[1]; 
  console.log("\n//"+item[0]);
}
out = items.join("\n");


var ext = '', outexp;
plan = fullblocks["The Plan"];
n = plan.length;
outexp = /\s*OUT\:\s*(\w+)/;
for (i = 0; i < n; i += 1) {
  match = outexp.exec(plan[i]);
  if (match) {
    ext = "." + match[1];
  } 
}    


filename = filename+ext;
fs.writeFileSync(filename, out, 'utf8');


