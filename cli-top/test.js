/* global require */
var tests = require('literate-programming-cli-test')("node ../../litpro.js");

tests( 
    ["first",  "first.md second.md -s ."]
);
