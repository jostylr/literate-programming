function () {
    var doc = this;
    var emitter = doc.emitter;
    var parser = doc.parser = new EventWhen;

    _"setup parser listeners"

    parser.on("ready to process text", [doc, function (text, parser) {
            var doc = this;
        
        }]

    //parser events

    parser.emit("ready to process text", doc.litpro);

    var i, nn, original; 

    var lines = doc.litpro.split("\n");
    var n = lines.length;
    for (i = 0; i < n; i += 1) {
        doc.currentLine = original = lines[i];
        nn = doc.processors.length;
        for (var ii = 0; ii < nn; ii += 1) {
            if (doc.processors[ii](doc.currentLine, doc, original)) {
                break;
            }
        }
        doc.hcur.full.push(original);
    }

    var cname;
    var waiting, f;
    var oldh = doc.hcur; 
    if (oldh) {
        if (oldh.waiting) {
            waiting = oldh.waiting;
            while (waiting.length > 0) {
                f = waiting.pop();
                if (typeof f === "function") {
                    f.call(doc);
                } else {
                    doc.log("Error. Expected function in waiting list of hblock " + oldh.heading);
                }
            }
        } 
        
        var cblock = oldh.cblocks[oldh.cname];
        if (cblock && cblock.hasOwnProperty("switchWaiting")) {
            waiting = cblock.switchWaiting;
            while (waiting.length > 0) {
                f = waiting.pop();
                if (typeof f === "function") {
                    f.call(doc);
                } else {
                    doc.log("Error. Expected function in waiting list of cblock " + cname);
                }
            }
            delete cblock.switchWaiting; 
        } 
    
        for (cname in oldh.cblocks) {
            if (oldh.cblocks[cname].lines.join("").match(/^\s*$/) ){
                delete oldh.cblocks[cname];
            }
        }
    }

    _":Check for compile time"

    return doc;
}