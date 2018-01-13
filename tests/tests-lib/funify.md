funify - checking the use of function defining
---
## Object

We will do a reduce here

    jack : 2
    ka : 7
    jilli : 3

[out](# "save: | objectify | forin _'f', num(0), true() ")

## Function

This takes the length of the key and multiplies it by the value and we sum
over that. 
   
    function (prop, key, val) {
        return val + ( key.length * parseInt(prop,10) );
    }

[f](# "store: | funify ")
---
37
