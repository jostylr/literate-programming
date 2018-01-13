Mapc and minors -- testing a bunch of iterative features
---
Tests that replace miniaugment.

    _"just some text| echo ignore it all"

    _"just some text | array 1, 2, 3 | .join -- "

    _"splitting | .split -- | *trim | 
        *.split /  | *pget 1 | *trim | *rev | .join ! "

    _"splitting | .split \n--\n | *trim | 
        *.split / | minors title | *trim |
        | push | clone | 
        apply some, echo,  great | store obj | 
        *store nav:*KEY* | echo _"temp" | compile nav
        | store final | 
        | pop | pset new, rad | *store cool:*KEY* | echo _"final" "

    _"cool:some"

    _"cool:new"

    _"obj | pget title "


## Temp

    \_":title"

    \_":this is"

    \_":some"

[sub]()

    hey

## just some text

Huh?

    Text and more

    this is great

## splitting

    this is / geese 
    --
    some /
    text
    --
    kicking

## Command

Let's define a command to use for mapc

    function (input) {
        return input.split('').reverse().join('');
    }

[rev](# "define:")

---
ignore it all

Text and more

this is great--1--2--3

eseeg!txet!

kicking

geese

great

text

rad

kicking
