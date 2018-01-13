error eval -- testing evals for errors
---
# Errors

Wanted to catch and report eval errors. 

    _":text|eval join(\n, _"ev", _"more", _"and")"
    _":text|async join(\n, _"ev", _"more", _"and")"
    _"log1"
    _"log2"

[out](# "save:")

[text]()

    Some text.

## Define

    _"more"

[junk](# "define:")


## Log surgery

So we need to intercept `doc.log` calls and store them into incrementing
variables. Well, need is a bit strong, but this is neat, yeah?

    var inc = 1;
    doc.log = function (text) {
        doc.store("log"+inc, text);
        inc += 1;
    };

[](# "eval:")

## Ev

    a = 1+2;

## More

    b = c;

[](# "eval:")

## And

    d= 5;
---
ReferenceError:c is not defined
a = 1+2;
b = c;
d= 5;

ACTING ON:
Some text.
ReferenceError:c is not defined
a = 1+2;
b = c;
d= 5;

ACTING ON:
Some text.
ReferenceError:c is not defined
b = c;
ReferenceError:c is not defined
f=b = c;
