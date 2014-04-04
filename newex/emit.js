var litpro = require("../index.js");

var doc = litpro(),
    gcd = doc.gcd;

gcd.makeLog();

gcd.on("doc compiled", function (data, evObj) {
    console.log(data["another block"]);
});

gcd.emit("new doc", "# example \n some stuff \n\n    code\n\n"+
    '## another block\n\n more stuff\n\n    _"example"');

process.on("exit", function () {
    console.log(gcd.log.logs());
});