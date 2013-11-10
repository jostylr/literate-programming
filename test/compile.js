var spawn = require('child_process').spawn;

var err = '',
    out = '';

process.chdir('../examples');

sptest = spawn('pwd', []);

sptest.stdout.on('data', function (data) {
    console.log(data+"");
});

litpro = spawn('node',  ['../bin/literate-programming.js', "logs.md"]);

litpro.stdout.on('data', function (data) {
    out += data;
});

litpro.stderr.on('data', function(data) {
    err += data;
});

litpro.on('close', function () {  //code is first parameter
    //console.log(txtfile, "compiled. Exit code", code);
    if (err) {
        console.log("ERROR", err);
        return;
    }
    if(out.match(/!!/)) {
        console.log("Compile problem:", out);
        return;
    } else {
        console.log("output", out);
    }
});
