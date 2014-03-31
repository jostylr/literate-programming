var marked = require('marked');
var fs = require('fs');
var EventWhen = require('event-when');

var proto = {
    marked : marked,
    markedOptions : {},
    init : function (md, options) {
            var doc = this,
                gcd = doc.gcd,
                key;
        
            doc.md = md;
            doc.options = options;
        
            if (options.merge) {
                for (key in options.merge) {
                    doc[key] = options[key];
                }
            }
        
            doc.hblocks = {
            };
        
            doc.current = {
                heading : "",
                subheading : ""
            };
        
            _"event setup"
        }
};

var litpro = function (md, options, callback) {
    var doc = Object.create(proto),
        gcd = doc.gcd = new EventWhen();

    var arr = [md, options, callback];
    md = options = callback = null;
    arr.forEach(function (el) {
        switch (typeof el) {
            case "string" : 
                md = el;
            break;
            case "function" :
                callback = el;
            break;
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
    doc.docTracker = gcd.when("doc ready", function () {
        callback(null, doc);
    });
    gcd.on("error", function (err) {
        callback(err, doc);
    });

    doc.init(md, options);

    gcd.emit("initialized", doc);

    // just for testing
    gcd.emit("doc ready");

    return false;
};

module.exports = litpro;