dirpush -- checking the push directive
---
# push

This tests out the push directive. 

The idea is that we have some text spread out that we want to put in a single
location, but we want to push that content there instead of pulling it.
Usually this is a little bits of connective text. 

    Some text

    _"awesome| . join, ec(", ")"

    _"awesome| . length"

[out](# "save:")

[bit1]()

    5 for fighting

[awesome](# "push:")

[bit2]()

    joe walsh

[awesome](# "push: | . toUpperCase")

---
Some text

5 for fighting, JOE WALSH

2
