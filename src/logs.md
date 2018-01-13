This deals with the log data

    _":fp | sub SEP, '\n* * *\n', FEN, '\n`````\n', ARG, '\n~~~\n'  " 

[fp]()

    Folder.prototype.log = _"log";
    Folder.prototype.error= _"error";
    Folder.prototype.warn= _"warn";
    Folder.prototype.dirlog = _"directive log";
    Folder.prototype.cmdlog = _"command log";
    Folder.prototype.eventlog = _"events";
    Folder.prototype.formatters = {
        _"|formatters error, warn, out, log, command log, 
            one arg, directive log, events | compile "
    };
    Folder.prototype.reportOut = _"out reporter";
    Folder.prototype.logLevel = 0;

[formatters]()

    function (input, args) {
        return args.
            map( el => '"' + el + '": \_`' + el + ':formatter`').
            join(",\n");
    }

[formatters](# "define:")

[junk]() 

```ignore
        error: _"error:formatter",
        warn : _"warn:formatter",
        out : _"diagnostics:formatter",
        log : _"log:formatter",
        "command log" : _"diagnostics:cmd log formatter",
        "one arg" : _"diagnostics:one arg",
        "directive log" : "directive log:formatter"
```

## Doc

This is for the doc constructor. 

    this.logs = _"diagnostics";
    this.log = this.parent.log;
    this.error = this.parent.error;
    this.warn = this.parent.warn;
    this.dirlog = this.parent.dirlog;
    this.cmdlog = this.parent.cmdlog;
    this.eventlog = this.parent.eventlog;

## Diagnostics

We have error, warnings, and logs of various levels. They get collected into a
single object whose keys are errors, warnings, and numbered log entries. Each
keyed entry points to an array. This is created for each doc. 

    {
        error : [],
        warn : [],
        events : [],
        "command log" : [],
        "directive log" : {},
        out : {},
        0 : []
    }

### Out

[formatter]()

    function (obj) {
        return Object.keys(obj).
            map(function (key) {
                return  "### " + key + "\n`````\n" + obj[key] + "\n`````";
            }).
            join(SEP);
    }



[cmd log formatter]() 
junk

This is for the command log. 

    function (list) {
        _"|globals typeit"

        var ret = list.map(function (arr) {
            var ret = '';
            var t = typeit(input); 
            var input = arr.shift();
            var args = arr.shift();
            var msg = args.shift();
            if (msg) {
                ret += "ID: " + msg;
            }
            if (t === 'undefined' || t === 'null') {
               ret += "TYPE: " + t;
            } else if (t !== 'string') {
                ret += "TYPE: " + t + "\n" + input.toString();
            } else {
                ret += input;
            }
            ret += args.join(ARG);
            return ret;
        }).
        join(SEP);

        return ret;
    }


### One Arg

[formatter]()

This is a function suitable for logging types that just have one (short)
argument that does not need a separator.  

    function (list) {
        var ret = '';
        ret += list.map(
            function (args) {
                return args.shift();
            }).
            join("\n");
        return ret;
    } 
 



### Out Reporter

This creates a reporter. The filter is a function that filters out the keys of
the diagnostic tools. The idea is, for example, to just get a specific kind of
log message for debugging purposes. 

It is designed to eliminate any parts that are empty of content. 

    function (filter) {
        var folder = this;
        var formatters = folder.formatters;
        var docs = Object.keys(folder.docs);
        var ret = '';
        docs.forEach(function (key) {
              var dig = folder.docs[key].logs;
              _":text generation | sub DOCSTRING,
                ec('"# DOC: " + key + "\n" ') "
        });
        var dig = this.logs;
        _":text generation | sub DOCSTRING, 
            ec('"# FOLDER LOGS\n"') "

The fences may add too many newlines, so we remove one.

        ret = ret.replace(FEN + "\n", FEN);
        return ret;
    }

[text generation]()

This is the common part of the text. 

    var temp = '';
    var keys =  Object.keys(dig);
    if (typeit(filter, 'function') ) {
        keys = keys.filter(filter);
    }
    temp += keys.map (function (typ) {
        var str = '';
        if (typeit(formatters[typ], 'function') ) {
            str += formatters[typ](dig[typ]);
        } else {
            str += formatters.log(dig[typ], typ);
        }
        if (str) {
            str = "## " + typ.toUpperCase() + "\n" + str;
        }
        return str;
    }).
    filter(function (el) {return !!el;}).
    join("\n");
    if (temp) {
      ret +=  (ret ? "\n" : "") + DOCSTRING + temp;
    } 

[details]()

    if (args.length) {
        ret += "\n    * " + 
            args.join("\n    * ");
    }


### Log

This is the logging function

    function (msg, level) {
        var out = this.logs;
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(msg);
        if (typeit(level, "undefined")) {
            out[0].push(args);
        } else {
            if (typeit(out[level], "array") ) {
                out[level].push(args);
            } else {
                out[level] = [args];
            }
        } 
            
    }

[formatter]()

    function (list) {
        return list.map(
                function (args) {
                    var msg = args.shift();
                    var ret = "* " + msg;
                    _"out reporter:details"
                    return ret;
            }).
            join(SEP);
    }



### Error

This creates an error function that can be called. It can be overwritten on
the `Folder.prototype.error` or individually on a doc. 

    function () {
        var doc = this;
        var gcd = doc.gcd;
        var args = Array.prototype.slice.call(arguments);

        doc.logs.error.push(args); 
        //shuts off all further processing
        gcd.stop();
    }

[formatter]()

This can be used to do a foreach on the error argument. 

    function (list) {
        return list.map(
            function (args) {
                var kind = args.shift();
                var description = args.shift();
                var ret = "### " + kind + "\n" + description + "\n";
                if (args.length) {
                    ret += args.join("\n* ");
                }
                return ret;
            }).
            join("\n");
    }


### Warn

Same as error, except no stopping of execution. 

    function () {
        var doc = this;
        var args = Array.prototype.slice.call(arguments);

        doc.logs.warn.push(args);
    }


[formatter]()

    _"error:formatter"

### Events

This has the form event, label, data. The label allows us to group them. 

    function (event, lbl, data) {
        var out = this.logs;
        out.events.push([lbl, event, data]);
    } 
            
[pre-formatter]()

Sort by lbl, then use lbl as a `###` heading and have `event` on its own line
followed by code fences and data.

    function (list) {
        var types = {};
        list.forEach(function (el) {
            var lbl = el[0];
            if (!(types[lbl]) ) {
                types[lbl] = [];
            }
            types[lbl].push(el.slice(1));
        });
        return Object.keys(types).map(function (el) {
            var str = "### " + el + "\n";
            str += types[el].map(function (evd) {
                var event = evd[0];
                var data = evd[1];
                return event + 
                    DATA;
            }).
            join(SEP);
            return str;
        }).
        join(SEP);
    }

[formatter]()

    _":pre-formatter | sub DATA, _':data'"

[data]()

This is for the data.

    (data ? (FEN + data + FEN) : '')

### command log

Has the form input, type (first arg as grouping), other args. Basically the
same function as event log with a bit of change in names. 

    _"events | sub out.events, out['command log'], event, input"

[formatter]()

Similar idea to event log, but the data are the args of the log (except for
first one) and thus we want to join the data
    
    _"events:pre-formatter | sub DATA, _':args'"
    
[args]()

    (data.length ? (ARG + data.join(ARG) ) : '' )

### directive log

Has the form `name, data`. We expect the name and store it in an object. 

    function (name, data) {
        _"|globals doc"
        var out = doc.logs;
        if (!name) {
            name = 'dirlog'+this.uniq();
            doc.warn('dir:log', 'need unique name for directive log', name);
        }
        out["directive log"][name] = data;
    } 

[formatter]()

We want to sort by name and then do `name \n fence data`

    function (obj) {
        var keys = Object.keys(obj);
        return keys.map(function (name) {
            var data = obj[name];
            return name + FEN + data + FEN;
        }).
        join(SEP);
    }
    

