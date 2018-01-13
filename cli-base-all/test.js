/*global require */

var tests = require('literate-programming-cli-test')("node ../../litpro.js",
    "hideConsole");

tests.apply(null, [ 
    ["first",  "first.md second.md -s ."],
    ["build", "-b seen test.md; node ../../litpro.js -b seen/ test.md" ],
    ["checksum", "-b . --checksum awesome  project.md"],
    ["diff-change", "first.md; node ../../litpro.js -d second.md"],
    ["diff-static", "first.md; node ../../litpro.js -d second.md"],
    ["diff-new", "first.md; node ../../litpro.js -d second.md"],
    ["encoding", "-e ucs2 ucs2.md -b ."],
    ["files", "--file=first.md --file=second.md  third.md"],
    ["nofile", ""],
    ["nofilenoproject", "", { "out.test" : function (canonical, build) {
            build = build.toString().replace(": no such file or directory, ", ", ");
            canonical = canonical.toString().replace(": no such file or directory, ", ", ");
            return build.trim() === canonical.toString().trim();
        }
    }],
    ["badfiles", "", {   "out.test" : tests.split(function (a, e) {
            return a.slice(0, 10) === e.slice(0,10);
        }),
        "build/.checksum" : tests.json
    }],
    ["flag", "-b dev; node ../../litpro.js -b deploy -f eyes"], 
    ["lprc", ""],
    ["stringbuild", ""],
    ["cmdread", ""],
    ["scopes", " --scopes"],
    ["args", "-z cache:cool"],
    ["z", ' -z "msg:Awesome work" -z arr:25:27:29 ']
    ].slice()
);
