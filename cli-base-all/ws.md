# Remove whitespace

    file1 = "index.js";
    file2 = "old/index.js";
    out1 = "newws.txt";
    out2 = "oldws.txt";

    fs = require('fs');

    text1 = fs.readFileSync(file1, {encoding:"utf8"});
    text2 = fs.readFileSync(file2, {encoding:"utf8"});

    fs.writeFileSync(out1, text1.replace(/\s+/g, ''));
    fs.writeFileSync(out2, text1.replace(/\s+/g, ''));
   
    

[ws.js](# "save:")
