var litpro = require('./index.js');

var log = function (err, doc) {
    console.log("error", err);
    console.log("doc", doc);
};

console.log(litpro);

litpro("#hi", log);