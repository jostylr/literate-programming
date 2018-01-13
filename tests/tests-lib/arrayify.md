Arrayify - testing the array making function
---
# First

    _":main | arrayify | .map _"f|evil" | .toString"
    _":other | arrayify ec(' ') | .join -"
    _":more | arrayify | mapc compile, , what, 75 "

[out](# "save:")

[main]() 

    5
    3
    2
    1

[other]() 

    ab ji lo\ we

[more]()

    \_":main"
    _":other"
    \_":what"

# f

A map function to act on the array.
    
    ret = function (el) {
        return el*2;
    }

---
10,6,4,2
ab-ji-lo we
5
3
2
1,ab ji lo\ we,75
