Line Terminate - allow line terminators
---
# Line terminate

Terminating a line with a command with no blanks is a problem. This errors out
below in old ways. 

    _"dude | sub k, s  |trim
    | sub j, r"

[out](# "save:")

# dude

What?

    something

---
something
