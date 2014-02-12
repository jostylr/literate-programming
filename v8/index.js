var marked = require('marked');
var fs = require('fs');
var EventWhen = require('event-when');

var litpro = function (md, options, callback) {
    var doc = {},
        gcd = new EventWhen();

    [md, options, callback].forEach(function (el) {
        switch (typeof el) {
            case "string" : 
                md = el;
            break;
            case "function" :
                callback = el;
            default : 
                if (el) {
                    options = callback;
                }   
        }
    });
    if (!callback) {
        return "provide a callback function or event";
    }
    if (!options) {
        options = {};
    }
    if (!md) {
        md = "";
    }    
    doc.gcd = gcd = new EventWhen(); 
    doc.docTracker = gcd.when("doc parsed", function () {
        callback(null, doc);
    });
    gcd.on("error", function (err) {
        callback(err, doc);
    });

    doc.md = md;

    gcd.emit("doc parsed");

    return false;
};

module.exports = litpro;