/* global require */
var tests = require('literate-programming-cli-test')("node ../../index.js");

var files = [["first",  "first.md second.md -s ."],
    ["testpro",  "period.md testpro.md -s ."],
    ["primes",  "primes.md -s . -z primes:20"],
    ["sample", "sample.md -s ."],
    ["template", "templating.md simpletemp.md -s ."],
    ["blackwhitehats", "blackwhitehats.md -s ."],
    ["cinnamon", "cinnamon.md -s ."],
    ["fence", "fence.md -s ."],
    ["jstidy", "jstidy.md -s ."],
    ["fizzbuzz", "fizzbuzz.md -s ."],
    ["matrix", "matrix.md -s ."],
    ["logs", "logs.md -s ."],
    ["cheerio", "cheers.md -s ."],
    ["integrated", "integrated.md -s ."],
    ["date"],
    ["csv"],
    ["lodash"]
   ].slice();
tests.apply(null,  files);
