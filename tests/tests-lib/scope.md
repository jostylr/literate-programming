scope - an attempt to test scope creation and variable storage, retrieval
---
# Scope

Let's create some scopes and variables and then use them. 

    _"a" _"b" _"other :: c"

    _"more" _"another :: more"
    
    _"more" _"yester::more"

[out](#scope "save:")

##  Variables for storing

We use directives to do the storing for this first bit. 

[a](# "store:!!")

[b](# "store:??")

[yester](# "link scope:another")

[other::c](# "store:--")

[other](# "new scope:")

[another](# "link scope:other")


## less

This is a bit that will store some stuff into a variable using a command

    _"less:fodder|sub !, k|store more"

    _"less:fodder|sub !, c|store other::more"

[fodder]()

    !ool !rickets

---
!! ?? --

kool krickets cool crickets

kool krickets cool crickets
