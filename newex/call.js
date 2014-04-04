var litpro = require("../index.js");

var doc = litpro("# example \n some stuff \n\n    code\n\n"+
    '## another block\n\n more stuff\n\n    _"example"', 
    function (data) {
        console.log(data["another block"]);
    });