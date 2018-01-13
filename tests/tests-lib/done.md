# Done -- testing the done abilities
---
# Done and when

This tests the ability to have stuff happen using the commands `done` and
`when`. The idea is to support external operations that are not returning
text, but whose actions need to be completed before something else happens.
For example, saving some tex files, generating some pictures, and then calling
the tex compiler on that stuff. 

To do this test, we will define a directive that issues some events that we
will listen for. And then act on it. We will do some nefarious hacking to
ensure that the ordering is faithful. 

    _"|cat ct | store fourth| done fourth"

    _"|when first, second, third, fourth| join \ and\ , _"1", _"second", _"3", _"fourth""

    _"|cat cool |store 3 | done third"

[out](# "save:")

## Directive define

This defines the directive. It will take in a string and store it manually in
the doc. `[value](# "whenstore: vname, ename")`

    doc.directives.whenstore = function (args) {
        var parts = args.input.trim().split(",");
        var value = args.link;
        var vname = parts[0];
        var ename =parts[1];

        var doc = this;
        doc.vars[vname] = value; 

        var dgcd = doc.parent.done.gcd;
        dgcd.once(ename, "done");
        process.nextTick(function () {
            dgcd.emit(ename);
        });

    };

[](# "eval:")

[jack](# "whenstore:1,first")
[diane](# "whenstore:second,second")


---
ct

jack and diane and cool and ct

cool
