load - loading multiple files
---start:first
# Loading

We want to have multiple files accessing each other's stuff. 

[s](second "load:")


[out](# "save:utf-16")


    This is a great setup

    _"s::cool"

    _"t::rickets | sub !, c"

    _"t::last:sound"


[t](third "load:abc")

## Sound

    chirp
---in:second

# Cool

Nice and simple

    cool

---in:third

# Rickets

    !rickety _"first::sound" _"s::cool"


## Last

[sound]()

    crush

---out:out
This is a great setup

cool

crickety chirp cool

crush
