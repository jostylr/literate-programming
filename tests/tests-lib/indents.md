indents - want substitution indentation to go well
---
# Indents

This is to see if we can get code indented correctly. 

    if () {
        var f = _":fun";
    }

[out](# "save:")

[fun]()

A simple function

    function (a, b) {
        var hello;
        if () {
            _":truth"
        }
    }

[truth]() 

    a = b;
    c = d;
---
if () {
    var f = function (a, b) {
        var hello;
        if () {
            a = b;
            c = d;
        }
    };
}
