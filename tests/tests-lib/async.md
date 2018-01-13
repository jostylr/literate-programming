async - async testing
---
# Async

Let's get async going. So we'll start simple with a straight read file command
done asynchronously. 

This is the command "readfile(text)" It does not use the input into it at all
so it would most likely be used as an argument in another command with an
empty pipe in front or just an empty pipe sub.

So something like  `sub *, _"|readfile stuff.txt"`

Let's see if we can that working.

[out](#subbing "save:")

## Text

Some text.

    This is great. I can just insert a snippet here:
    
    _"|readfile stuff"

    or perhaps eval some code and use its output

    _"async|readfile hello|eval text = eval(text)"

    or using the sub 

    *

## Subbing

A subbing is done. 

    _"text|sub *, _"|readfile stuff""

---
This is great. I can just insert a snippet here:

Hello world. I am cool.

or perhaps eval some code and use its output

Hello world. I am js.

or using the sub 

Hello world. I am cool.
