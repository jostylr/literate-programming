var marked = require('marked');
var fs = require('fs');
var EventWhen = require('event-when');

var litpro = function me (md, options, callback) {
    if ( !(this instanceof me) ) {
        return new me(md, options, callback);
    }

    var doc = this,
        gcd = doc.gcd = new EventWhen(),
        docs = doc.docs = [];

    gcd.doc = doc;

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
            case "undefined" :
            break;
            default : 
                options = el;
        }
    });

    gcd.on("new doc", "add doc", docs);
    
    gcd.action("add doc", function (data, evObj) {
            var gcd = evObj.emitter;
            
            var top = {};
            if (typeof data === "string") {
                top.raw = data;
            } else if ( Array.isArray(data) ) {
                if (typeof data[0] === "string") {
                    top.raw = data[0];
                    gcd.on("doc compile", data[1]);
                 }
            }
            
            var docs = this;
            
            docs.push(top);
            var place = docs.length - 1;
            
            gcd.scope(place, top);
            
            gcd.emit("doc text:"+place);
            
            // just fake
            var repeat = {
                raw : 'me = _"example"',
                compiled: "me = code"
            };
            
            gcd.emit("doc compiled", {
                "example" : {raw : "code", compiled: "code"},
                "another block" : repeat,
                "example/another block" : repeat
            });
        }
    );

    if (options !== null) {
        gcd.emit("options received", options);
    }

    if (md !== null) {
        gcd.emit("new doc", [md, callback]);
    }

    return false;
};

module.exports = litpro;