backslash -- backslash testing
---
# Backslashing

This tests the backslashing numbering scheme. 

[sub test]()

    _"oops"
    _"oops | compile"
    _"oops | compile | compile"

    _"woops | compile jack | compile jean"

[out](# "save:")


## Woops

    \_":this"

    \2_":this"

## jack

[this]()

    hi

## jean

[this]()

    bye


## Oops

    \2_"awesome | sub oo, _"self" | sub \", \' "

## awesome

    shoo

## self

    irt

---
\1_"awesome | sub oo, _"self" | sub \", \' "
\0_"awesome | sub oo, _"self" | sub \", \' "
shirt

hi

bye
