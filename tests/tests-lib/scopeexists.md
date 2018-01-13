scope exists -- test for scope exists problem
---
# Scope exists

So there was a problem with asking for a variable before the scope exists.
This is to test for that problem.

    _"butter::tasty"

[out](# "save:")

## Eval

We create the scope and the variable using a timeout

    setTimeout(function () {
        var folder = doc.parent;
        folder.createScope("butter");
        doc.store(doc.colon.escape("butter::tasty"), "hi");
    }, 1);

[](#, "eval:")

---
hi
