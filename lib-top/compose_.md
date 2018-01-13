Compose -- testing simple composition
---

Need to test composing.

    _"stuff | split \n-!-\n "

    _"stuff | longsplit \n-!-\n, arr(;, some, more) "

    _"tb | compsplit _'template'  "
    
    _"t | nlsplit temp2  "

    _"| arrtest"


[longsplit](# "compose: split $0 | join @1, kool, @1")

[split](# "compose: .split $0 | *trim | .join 5 ")

[nlsplit](# "compose: .split \n---\n | minors title, body | ->$1 | 
    | *store $0, *KEY* | get template | compile $0  
    | ->$2 | $1->*clear$2-> $0, *KEY*  ")

[compsplit](# "compose: .split \n---\n |  minors title, body  
    | templating $0 ")

[arrtest](# "compose: echo this | ->@0 | echo that\nhar\n | ->@0
    | $0->| | *trim | .join ! ")


## template

    \_":title"
    \_":body"

## tb

    ttl
    ---
    body
    body

## t

    ttl

## stuff

    this is
    -!-
    great
    -!-
    Does it 
    work
    -!-
    Yes
---
this is5great5Does it 
work5Yes

this is5great5Does it 
work5Yes;kool;some;more

ttl
body
body

ttl


this!that
har
