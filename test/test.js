// a simple test file that will check to see whether the two example directories are in sync after litproing the .mds in examples

var fs = require('fs');
var spawn = require('child_process').spawn;
var diff = require('diff');

process.chdir('./test/');

var outlist = fs.readFileSync('outlist.txt', {"encoding":"utf8"}).split('\n');
var inlist = fs.readFileSync('inlist.txt', {"encoding":"utf8"}).split('\n');

//console.log(outlist.join("\n"));

var check = function () {
    process.chdir('..');

    outlist.forEach(function (el) {
        if (! el) { return ;}
        var ex, fix;
        ex = fs.readFileSync('./examples/'+el, {"encoding":"utf8"});
        fix = fs.readFileSync('./fixed_examples/'+el, {"encoding":"utf8"});
        if (ex !== fix) {
            console.log(diff.diffLines(ex, fix));
            throw el+" does not have equal contents";
        } else {
            console.log("ok", el);
        }
    });
};


var count = 0;

process.chdir('../examples');

outlist.forEach(function (file) {
    try {
        fs.unlinkSync(file);
    } catch (e) {
    }
});


inlist.forEach(function (file) {
    var err = '', 
        out = '';
    count += 1;
    litpro = spawn('node',  ['../bin/literate-programming.js', file]);

    litpro.stdout.on('data', function (data) {
        out += data;
    });

    litpro.stderr.on('data', function(data) {
        err += data;
    });

    litpro.on('close', function () {  //code is first parameter
        //console.log(txtfile, "compiled. Exit code", code);
        if (err) {
            throw err;
        }

        //console.log("FILE:\n-----\n", file, out);
        count -=1;
        if (count < 1) {
            check();
        }
    });

});

