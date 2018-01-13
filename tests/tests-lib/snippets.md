Snippets - testing out a snippet
---start:in
# default

We need to add a snippet. This should be done in lprc.js

    doc.plugins.snippets["js-t"] = 
      'ARG0 = (typeof ARG0 !== "undefined") : ARG0 ? ARG1'
    doc.plugins.snippets["dashes"] = function () {
        return Array.prototype.join.call(arguments, "---");
    }

[snips](# "eval:")

## Actual text

    function (a) {
        _'|s js-t, a, "flowers"';
    }
    _'|s dashes, k, l, m, n'
    _'|s unk, jr, dude'

[out](# "save:")
---out:out
function (a) {
    a = (typeof a !== "undefined") : a ? "flowers";
}
k---l---m---n
jr,dude
---log:
!Unknown snippet: jr, dude
!
