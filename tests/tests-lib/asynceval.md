aync eval - an eval that uses async
---
# Async Eval

We'll do a setTimeout and then report some text. This should establish whether
eval async is working. 

[out](#start "save:")

## Eval Stuff

This is the eval block

    setTimeout(function () {
        callback(null, "cool !eans");
    }, 1);

## Start

We simply run the eval and pipe into a sub.

    great. _"|async _"eval stuff" | sub !, b"
    
---
great. cool beans
