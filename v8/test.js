var litpro = require('./index.js');

var log = function (err, doc) {
    if (err) {
        console.log("error", err);
        return false;
    }
    var keys = Object.keys(doc);
    keys = keys.filter(function (el) {
        if (["gcd", "docTracker"].indexOf(el) !== -1) {
            return false;
        } else {
            return true;
        }
    });
    keys.forEach(function(key) {
        console.log(key, ":", doc[key]);
    });
};

litpro("#hi", log);