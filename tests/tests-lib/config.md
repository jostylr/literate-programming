config -- testing a configuration style pass-in
---

The point of this is to demonstrate how configuration information can be
passed into a function -- think of it as named parameters, if you like.

    _"|paired set(kv(1, +, 2, *, join, -- )),
                num(1, 2, 3, 4, 5), clog(!!!hey)"
    _"|paired set(kv(1, *, 2, + )), 
        num(1, 2, 3, 4, 5), clog(!!!reversed) | store arr |
        slice num(1, 2) | cat !"
    _"|paired args(act( _"arr", concat, _"arr"))"


## op

Define your own two step action. First it does the operation of 1, pairwise in
sequence, generating a n-1 list, then it does it again with 2, giving n-2. The
result is returned

    var f = function (input, args, name) {
        var i, n=args.length, doc = this, arr = [];
        var conf = doc.gcd.scope(name) || {};
        var first = conf[1] || "+";
        var second = conf[2] || "*";
        ops = {
            '+' : function (l, r) { return l + r;}, 
            '*' : function (l, r) { return l*r;}
        }
        for (i = 0; i < n-1 ; i +=1 ) {
            arr.push(ops[first](args[i], args[i+1]));
        }
        for (i = 0; i < n-2;  i +=1 ) {
            arr[i] = ops[second](arr[i], arr[i+1]);
        }
        arr.pop(); //get rid of last one
        if (conf.join) {
            return arr.join(conf.join);
        } else {
            return arr;
        }
    }


    f = doc.sync("paired", f);

    f.subCommands = Object.create(doc.subCommands);

    f.subCommands.clog = function (text) {
        console.log(text);
    };

    
    doc.gcd.emit("command defined:paired");
    
[eval](# "eval:")

## sli

This is to test whether things other than text can be piped.

    function (arr, args) {
        return arr.slice(args[0], args[1]);
    }
 
[slice](# "define:")

---
15--35--63
18!
1300,2000,1040,1300
