ifelse -- tests the ifelse and boolean commands
---

This should test the ifelse command. 

    _"| echo something
        | ifelse arr(?and(true(), false()), sub, thing, dude),
            arr(?flag(whatever), sub, thing, last),
            arr(?==(num(1), 1), sub, thing, finally)  "
   
    _"|echo something 
        | if-else arr(?!=(2, 3, 4, 5, 5, 7), sub, some, stone),
           arr(?!=(2, 3, 4, 5, 6, 7), sub, some, rock) "

---
somefinally

rockthing
