Compose -- testing simple composition
---

Need to test composing.

    _"stuff | split \n-!-\n "

    _"stuff | longsplit \n-!-\n, arr(;, some, more) "

    _"tb | compsplit  "
    
    _"t | nlsplit temp2  "

    _"| arrtest"

    _"tb|botharrows rrl"


[longsplit](# "compose: split $0 | join @1, kool, @1")

[split](# "compose: .split $0 | *trim | .join 5 ")

[nlsplit](# "compose: .split \n---\n | minors title, body | ->$1 | 
    | *store $0, *KEY* | get template | compile $0 
    | ->$2 | $1->*clear $0, *KEY* | $2-> ")

[compsplit](# "compose: .split \n---\n |  minors title, body  
    | get->$0 template | templating $0 ")

[arrtest](# "compose: echo this | ->@0 | echo that\nhar\n | ->@0
    | $0->| | *trim | .join ! ")

[botharrows](# "compose: .split->$1 \n 
    | $0->sub->$2 r, t 
    | *sub $2, heck, ---, $0") 

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

heck
rrl
body
body
