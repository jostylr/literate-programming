storing -- testing the storing directive with pipes
---
# Storing

This tests the directive for storing. 

    Jack runs up
    Jack runs down

[](# "transform: |sub Jack, Jill | store subbed")

[](# ": |sub Jack, Jane | store janed")

[generic:great|dude](# "store: ")

[ pushy me |1](# "push: ")
[pushy me| 2](# "push:")

[just one | a](# "push:")

## Cat

    _"storing"

    _"subbed"

    _"generic:great"

    _"janed"

    _"pushy me| .join +"

    _"just one | .join -"

[out](# "save:")

---
Jack runs up
Jack runs down

Jill runs up
Jill runs down

dude

Jane runs up
Jane runs down

1+2

a
