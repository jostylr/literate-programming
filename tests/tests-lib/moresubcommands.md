Testing more subcommands -- date, function, dot
---

This tests the new additions to subcommands: fun, date, and dot. The dash will
be tested in the dash test. 

    _"| echo .getUTCFullYear(date(num(277510050003))) "

    _"| echo arr(3, 4, 5) 
        | .map fun(`function (el) {return el*args[0];}`, num(3))
        | .join ec(",") "

---
1978

9,12,15
