This is the object that holds subcommands. Commands with unique requirements
can use this as a prototype.  

    (function () {
        var ret = {};
        
        ret.echo = ret.ec = _"echo";
       
        ret.join = _"join";
        
        ret.array = ret.arr = _"array";

        ret.object = ret.obj =  _"object";

        ret.merge = _"merge";

        ret["key-value"] = ret.kv = _"key value";

        ret.act = _"act";

        ret.property = ret.prop = _"property";

        ret.json = _"json";

        ret.set = _"set";

        ret.gset = _"gSet";

        ret.get = _"get";

        ret.gget = _"gGet";

        ret.arguments = ret.args = _"arguments";

        ret.number = ret.num = _"number";

        ret.date = _"date";

        ret.function = ret.fun = _"function";

        ret.eval = ret.ev =  _"eval";

        ret.log = _"log";

        ret.dash = ret["-"] = _"dash";
        ret.dot = ret["."] = _"dot";
        ret.bool = ret["?"] = _"boolean";

        ret.true  = function () {return true;}; 
        ret.false = function () {return false;}; 
        ret.null = function () {return null;}; 
        ret.doc =  function () {return this;}; 
        ret.skip = function () {return ;}; 
        ret.type = function (obj) {
            _"|globals typeit"
            return typeit(obj);
        };
        ret.reg = ret.regexp = function (text, flags) {
            _"|globals doc"
            _"commands::regify:core | sub cmd:regify, subcmd:reg"
        };

        return ret;
    })()

## Attach Subcommands

This attaches subcommands to plugins and folders. Note that this will attach
to the appropriate object based on the `this` whether it be Folder, folder, or
doc. 

    function (sub, f, cmd) {
        var subs, cmdplug,  cmdsub;

        if (cmd) {
            cmdplug = this.plugins[cmd];
            if (!cmdplug) {
                cmdplug = this.plugins[cmd] = {};
            } 
            cmdsub = cmdplug.subCommands;
            if (!cmdsub) {
                cmdsub = cmdplug.subCommands = {};
            }
            cmdsub[sub] = f;
        } else {
            subs = this.subCommands;
            subs[sub] = f; 
        }
    }




### Echo

This simply returns the input, but if it is surrounded by quotes, we remove
them. 

    function () {
        var arr = Array.prototype.slice.call(arguments);
        
        var ret = arr.map(function (str) { 
            if (("\"'`".indexOf(str[0]) !== -1) && 
                (str[0] === str[str.length-1]) ) {
                
                return str.slice(1, -1);
            } else {
                return str;
            }
        });

        ret.args = true;

        return ret;
    }

### Join


The first entry is the joiner separator and it joins the rest
  of the arguments. For arrays, they are flattened with the separator as well
  (just one level -- then it gets messy and wrong, probably).

    function (sep) {
        var args = Array.prototype.slice.call(arguments, 1);
        var ret = [];
        
        args.forEach( function (el) {
            if ( Array.isArray(el)) {
                ret.push(el.join(sep));
            } else {
                ret.push(el);
            }
        });

        return ret.join(sep);

    }

### Array 

This creates an array of the arguments.

    function () {
        return Array.prototype.slice.call(arguments, 0);
    }


### Object

This presumes that a JSON stringed object is ready
  to be made into an object.

    function (str) {
        var ret, doc = this;
        try {
            ret = JSON.parse(str);
            if (Array.isArray(ret) ) {
                return ["val", ret];
            } else {
                return ret;
            }
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad json parse:" + this.cmdname, 
                [e, e.stack, str]);
            return ["error", e];
        }
    }


### Merge

Merge arrays or objects, depending on what is there.

To merge the arrays, we use concat with the first argument as this and the
rest as arguments from slicing the arguments. 

For objects, we use the first object, iterate over the keys, adding. The later
objects will overwrite the earlier ones. 

    function (a) {
        var ret, args; 
        if (Array.isArray(a) ) {
            args = Array.prototype.slice.call(arguments, 1);
            return Array.prototype.concat.apply(a, args);
        } else {
            args = Array.prototype.slice.call(arguments, 1);
            ret = a;
            args.forEach( function (el) {
                var key;
                for (key in el) {
                    ret[key] = el[key];
                }
            });
            return ret; 
        }
    }

### Key Value

This produces an object based on the assumption that a
  `key, value` pairing are the arguments. The key should be text. 

    function () {
        var ret = {};
        var i, n = arguments.length;
        for (i = 0; i < n; i += 2) {
            ret[arguments[i]] = arguments[i+1];
        }

        return ret;
    }

### Property

This takes in an object and a list of keys to access something along the
property chain. 

    function () {
        var props = Array.prototype.slice.call(arguments, 0);
        var obj;
        try {
            obj = props.reduce(function (prev, cur) {
                return prev[cur];
            });
            return obj;
        } catch (e) {
            this.gcd.emit("error:bad property access:" +
                this.cmdname, [e, e.stack, props]);
            return;
        }
    }

### Act

This allows one to do `obj, method, args` to apply a method to an
  object with the slot 2 and above being arguments. For example, one could do
  `act( arr(3, 4, 5), slice, 2, 5)` to slice the array.

    function (obj, method) {
        try {
            return  obj[method].apply(obj, 
                Array.prototype.slice.call(arguments, 2)) ;
        } catch (e) {
            this.gcd.emit("error:arg prepping:bad method:" + this.cmdname, 
                [e, e.stack, obj, method,
                Array.prototype.slice.call(arguments)]);
            return ;
        }
    }

### JSON

This will convert an object to to JSON representation. If it fails (cyclical
structures for example), then it emits an error.

    function (obj) {
        try {
            return JSON.stringify(obj);
        } catch (e) {
            this.gcd.emit("error:arg prepping:bad json:" + this.cmdname, 
                [e, e.stack, obj]);
            return ;
        }
    }

### Set

The presumption is that this is an object passed in whose scope is to be used.
If one wants to bubble the argument up, one can use `pass` in third
argument.

    function (obj, retType) {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName;
        var scope, key; 
        
        scope = gcd.scope(name);
        if (!scope) {
            scope = {};
            gcd.scope(name, scope);
        }
        for (key in obj) {
            scope[key] = obj[key];
        }
        if (retType === "pass" ) {
            return obj;
        } else {
            return ;
        }
    }

### gSet
  
This does this in a way that other commands in the pipe chain can
  see it.

    _"set | sub  doc.cmdName , _":sub line" " 

[sub line]()

    doc.cmdName.slice(0, doc.cmdName.lastIndexOf(doc.colon.v)) 
    

### Get

This retrieves the value for the given key argument(s).

    function () {
        var doc = this;
        var gcd = doc.gcd;
        var name = doc.cmdName;
        var scope; 
        
        scope = gcd.scope(name);
        if (!scope) {
            gcd.emit("error:arg prepping:no scope:" + name);
            return ;
        }

        var i, n = arguments.length;
        var ret = [];
        for (i = 0; i < n; i +=1 ) {
            ret.push(scope[arguments[i]]);
        }
        ret.args = true; // each is separate 
        return ret;
    }

### gGet

This retrieves the value for the given key argument from the pipe chain.

    _"get | sub  doc.cmdName , _":sub line" " 

[sub line]()

    doc.cmdName.slice(0, doc.cmdName.lastIndexOf(doc.colon.v)) 
    

### Arguments

This expects an array and each element becomes a separate
  argument that the command will see. E.g., `cmd arguments(arr(3, 4))` is
  equivalent to `cmd 3, 4`. This is useful for constructing the args
  elsewhere. In particular, `args(obj(_"returns json of an array"))` will
  result in the array from the subsitution becoming the arguments to pass in.  

    function (arr) {
        var ret =  arr.slice(0); //make a shallow copy
        ret.args = true;
        return ret;
    }


### Number

This converts the argument(s) to numbers, using js Number function. Each
number becomes a separate argument. If there is no argument, then it returns
0. 

    function () {
        var ret = [], i, n = arguments.length;
        if ( n === 0 ) {
            return 0;
        }
        for (i = 0; i < n; i += 1) {
            ret.push(Number(arguments[i]));
        }
        ret.args = true;
        return ret;
    }

### Date

This converts the argument(s) to dates, using the date constructor.
Each date becomes a separate argument. If no argument, it returns the object
of now. 

    function () {
        var ret = [], i, n = arguments.length;
        if (n === 0) {
            return new Date();
        }
        for (i = 0; i < n; i += 1) {
            ret.push(new Date(arguments[i]));
        }
        ret.args = true;
        return ret;
    }

### Function 

This returns a function. Similar to eval, this will check for backticks as a
quote character. The function text should be what is in the first argument. 


    function (code) {
        var f, doc = this;
        var args = Array.prototype.slice.call(arguments, 1);

        if ( (code[0] === "`" ) && (code[code.length-1] === code[0]) ) {
            code = code.slice(1, code.length-1);
        }
       
        try {
            eval("f=" + code);
            return f;
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad function:" + doc.cmdname, 
                [e, e.stack, code, args]);
            return;
        }

    }


### Eval

Will evaluate the argument and use the magic `ret` variable as the value to
  return. This can also see doc and args has the arguments post code.
  Recommend using backticks for quoting the eval; it will check for
  that automatically (just backticks, can do echo for the others if needed).

    function (code) {
        var ret, doc = this;
        var args = Array.prototype.slice.call(arguments, 1);

        if ( (code[0] === "`" ) && (code[code.length-1] === code[0]) ) {
            code = code.slice(1, code.length-1);
        }
       
        try {
            eval(code);
            return ret;
        } catch (e) {
            doc.gcd.emit("error:arg prepping:bad eval:" + doc.cmdname, 
                [e, e.stack, code, args]);
            return;
        }
    }

### Log

This logs the argument and passes them along as arguments.

    function () {
        var doc = this, name = doc.cmdName;
        var args = Array.prototype.slice.call(arguments);
        doc.log("arguments in " + name + ":\n---\n" + 
            args.join("\n~~~\n") + "\n---\n");
        return args;  
    }

### Dash

This is a utility function and uses the same utility functions as the main
dash command. But here, the arguments are just the arguments; no incoming
input. 

    function (propname) {
        var doc = this;
        var dash = doc.dash;
        var cmd;

        var args = Array.prototype.slice.call(arguments, 1);

        _"commands::dash:found"

        if (!found) {
            doc.log("Subcommand dash: no such property: " +  propname +
                " with args: " + args.join("\, ") );
            doc.log("no such property on dash: ", propname);
            return '';
        } else {
            return dash[cmd][0][propname].apply(dash[cmd][0], args);
        }
    }

### Dot

This assumes that the first argument is a method of the second argument. It
then calls it all as such. No async stuff here, please. This also assumes that
the second argument is an object with property access. If there are not at
least two arguments, an empty string is returned. 

    function (method, obj) {
        var doc = this;
        var fun;

        if (arguments.length < 2) {
            doc.log("insufficient number of arguments for dot command:" +
                arguments.join(", "));
            return '';
        }

        var args = Array.prototype.slice.call(arguments, 2);
    
        fun = obj[method];
        if ( typeit(fun) === "function") {
            return fun.apply(obj, args);
        } else {
            return fun; //ex: .length(arr(1, 5) )
        }
    }

### Boolean

This is another leader kind of subcommand with the properties being functions
that return booleans. 

    function (propname) {
        var doc = this;
        var bool = doc.booleans;

        var args = Array.prototype.slice.call(arguments, 1);

        if ( bool[propname] ) {
            var ret = bool[propname].call(doc, args);
            return ret;
        } else {
            doc.log("no such boolean tester: ", propname);
            return false;
        }
    }

#### Booleans

These are the default boolean functions.

    { 
        "and" : function (args) {
            return args.every(function (el) {
                return !!el;
            });
        },
        "or" : function (args) {
            return args.some(function(el) {
                return !!el;
            });
        },
        "not" : function (args) {
            return !args[0];
        },
        "===" :  _":comparator | sub OP, ===",   
        "==" :  _":comparator | sub  OP, ==",   
        ">=" :  _":comparator | sub OP, >=",   
        ">" :  _":comparator | sub OP, >",   
        "<=" :  _":comparator | sub OP, <=",   
        "<" :  _":comparator | sub OP, <",   
        "!=" : _":compare all | sub OP, ==",   
        "!==" :  _":compare all | sub  OP, ===",
        "flag" : function (flag) {
            return this.parent.flags.hasOwnProperty(flag);
        },
        "match" : _":match",
        "type" : _":type"
    }
   
 [comparator]()

     function (args) {
            var prev = args.shift();
            var ret = args.every(function (el) {
                var one = prev;
                prev = el;
                return (one OP el);
            });
            return ret;
        }
[compare all]()

For something like not equals, we need to compare all the pairs. 

    function (args) {
        var i, j, n = args.length, cur;
        for (i = 0; i < n; i += 1) {
            cur = args[i];
            for (j = i + 1; j < n; j += 1) {
               if ( (cur OP args[j] ) ) {
                    return false;
               }
            }
        }
        return true;
    }

[match]()

This checks if the first argument has or matches the string/reg that followes
it. 

    function (args) {
        _"|globals doc, typeit"

        var str = args[0];
        var condition = args[1];

        if (typeit(str) !== 'string') {
            _":match-warn | sub DESC, 
                first argument needs to be a string"
        }

        var typ = typeit(condition);
        
        if (typ === 'string') {
            return (str.indexOf(condition) !== -1);
        } else if (typ === 'regexp') {
            return (condition.test(str)); 
        } else {
            _":match-warn | sub DESC,
                second argument needs to be string or regex"
        }

    }

[match-warn]()

    doc.warn("subcmd:boolean match",
        "DESC",
        "inputs: ", str, condition);
    return false;



[type]()

This uses typeit to check the type of the object and checks to see if it
matches any of the types. If the second argument is an exclamation point, it
checks to see if it is not any of the types that follow. 

    function (obj) {
        _"|globals typeit"

        var args = Array.prototype.slice.call(arguments, 1);

        var t = typeit(obj);

        if (args.length === 1) {
            return t === args[0];
        } else if (args[0] === '!') {
            args.shift();
            return args.every(function (el) {
                return t !== el;
            });
        } else {
            return args.some(function (el) {
                return t === el;
            });
        }

    }

