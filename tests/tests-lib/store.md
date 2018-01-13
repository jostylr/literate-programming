storing -- testing the storing directive
---start:in
# Storing

This tests the directive for storing. 

    Jack runs up
    Jack runs down

[](# "transform: |sub Jack, Jill | store subbed")

[](# ": |sub Jack, Jane | store janed")

[generic:great](# "store:dude")

[:good](# "store:programming")

[whatever]()

[:bad](# "store:work")

## Cat

    _"storing"

    _"subbed"

    _"generic:great"

    _"janed"

    _"storing:bad"

    _"storing:good"

    _"first::head:right"

[out](# "save:")
[first](first.md "load:")

---in:first.md
# Head

This is to check that the storage directive works with multiple files.

    something

[:right](# "store:")

---out:out
Jack runs up
Jack runs down

Jill runs up
Jill runs down

dude

Jane runs up
Jane runs down

work

programming

something
