This is where we have some reporters. This is a section to be greatly
improved. 


    Folder.reporters = {
        save : _"directives::save:reporter",
        out : _"directives::out:reporter",
        "command defined" : _"directives::define directive:reporter",
        "scope exists" : _"stitching::create global scope:reporter",
        "text" : _"text reporter",
        "minor" : _"text reporter",
        "retrieval" : _"retrieval reporter",
        "cmd" : _"command reporter"
    
    };
    
    Folder.prototype.reportwaits = _"reporting on waiting";
    
    Folder.prototype.simpleReport = _"Simple Report";


## Simple Report

This generates a report of the stitch fragments that have not yet been
resolved. 

    function () {
        var folder = this;
        var recording = folder.recording;
        var gcd = this.gcd;
        var key, lname, ret = [], el, pieces;
        var v = this.colon.v;
        for (key in gcd.whens) {
            if (key.slice(0,15) === "stitch fragment") { 
                lname = key.slice(16);
                ret.push("PROBLEM WITH: " + recording[lname] + 
                    " IN: " + lname.slice(lname.indexOf(":")+1, 
                       lname.indexOf(v) ) +  
                    " FILE: " + lname.slice(0, lname.indexOf(":"))); 
            } 
        }
        for (key in gcd._onces) {
            el = gcd._onces[key];
            if ( el[0].slice(0, 15) === "command defined") {
                pieces = key.split(":");
                if (pieces.length < 3) {
                    gcd.error("error:simple report:"+ el[1]);
                    return ret;
                }
                ret.push("COMMAND REQUESTED: " + 
                    pieces[1] +  
                    " BUT NOT DEFINED. REQUIRED IN: " + 
                    pieces[3].slice(0, pieces[3].indexOf(v)) +  
                    " FILE: " + pieces[2] ); 
            }
        }
        return ret;
    }

### Reporting on waiting

This is a folder level function that goes through and reports on everything,
returning an array of waiting arguments. 

    function () {
        var report = this.reports;
        var reporters = this.reporters;
        var arr, msg, data, temp;

        arr = [];
        
        for (msg in report) {
            data = report[msg];
            if (reporters.hasOwnProperty(data[0]) ) {
                temp = reporters[data[0]].call(this, data.slice(1) );
                if (temp) {
                    arr.push(temp);
                } else { 
                   // console.log(msg, data);
                }
            }
        }

        return arr; 
    }


### Text Reporter

This function deals with text that we are waiting for. 

    function (data) {
        var hint = this.recording[data[0]];
        var parts = data[0].split(":").reverse();
        var block = parts[0].split(this.colon.v)[0];
        if (hint) {
            return "PROBLEM WITH: " + hint + " IN: " + block + 
                " FIlE: " + parts[1]; 
        } 

    }

### Retrieval Reporter

This function deal with waiting for a variable to be stored. 

    function (data) {
        return "NEED VAR: " + data[1] + " FROM: " + data[0];
    }

### Command Reporter

This reports on somebody waiting for a command. 
    
    function (data) {
        var ind = data[1].lastIndexOf(this.colon.v);
        if (ind === -1) {
            ind = data[1].length + 1;
        }
        var name = data[1].slice(0, ind);
        var hint = this.recording[name];
        return "NEED COMMAND: " + data[0] + " FOR: " + hint; 
    }

## var tracking

This is an attempt to report sections that have been asked for, but have not
been reported.

This was an idea, I tried, couldn't get it quite right, so nullifying it, but
leaving it here for now for inspiration. 

[initialize](# ": | echo ")

    this.varTrack = {};

[need var](# ": | echo ")

    doc.parent.varTrack[file + "::" + varname] = true;

[has var](# ": | echo ")

    doc.parent.varTrack[ file + "::" + varname ] = false;

[report](# ": | echo ")

    process.on('exit', function () {
        console.log(Object.keys(parent.varTrack).
            sort().
            reduce(function (prev, cur) {
                if (parent.varTrack[cur]) {
                    return prev + "\nNEED: " + cur;
                } else {
                    return prev;
                }
            }, '')
        );
    });
    
