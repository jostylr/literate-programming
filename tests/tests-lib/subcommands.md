subCommands -- testing our subcommands
---

    _"echo"

    _"join"

    _"json"

    _"act"

    _"eval"

    _"set"

    _"prop"

    _"primitives"

    _"regexp"



## echo

    _"|join echo(' :: ', `first up`), ec("Cool, beans."), ec(koo\"like)"

## join

    _"|cat join(ec(" -- "), arr(this, that), the other)"

## json

    _"|cat json( merge( obj({"a" : 2, "c" : "j"}), 
        kv(b, merge(arr(3, 4), arr(t, f)), c, k ) ) )"

## act

    _"|join :, args(act(arr (4, 5, 6), slice, num(1) ) )"

## eval

    _"|join :, eval(_":code", arr(num(1, 2, 3, 4, 5))), 
        ev(`ret = 70;`)"



[code]()

    ret = args[0].reduce(function (prev, cur) {
        return prev + cur;
    });

## set

This is going to see if the get and sets work

    _"| cat 5, gSet(obj({"a": [1, 2, 3]}))  |
        join :=:, set(kv(cool, gGet(a))), 
            args(eval( `ret = args[0].concat(args[1]);`,
                     get(cool, cool)))"
 
## prop

    _"|join :, property(doc(), colon, v ), property(doc(), cmdName)"

## primitives

    _"|join :, arr(true(), true() skip(5), false(), false(), null())"

## regexp

This tests the regexp construct.

    _"| echo Awesome | .replace reg(e, g), i"

---
first up :: Cool, beans. :: koo"like

this -- that -- the other

{"a":2,"c":"k","b":["3","4","t","f"]}

5:6

15:70

5:=:1:=:2:=:3:=:1:=:2:=:3

⫶:in:prop⫶0⫶3

true,true,false,false,

Awisomi
