block off - turning code blocks on and off
---
# Block on and off

So we want to test turning off code blocks and their nesting. 

    Some code

[off](# "block:")

    more code

[off](# "block:")

[out](# "save:")

[on](# "block:")

    more ignored code

[on](# "block:")

    great
---
Some code
great
