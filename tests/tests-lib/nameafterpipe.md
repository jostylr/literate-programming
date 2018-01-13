nameafterpipe.md -- testing for storing names after pipes
---
## Name after pipe

This tests the name after pipe idea. It should be done in two transforms and
one eval. 

    _"hot"
    _"cool"
    _"just right"

[out](# "save:")

## Eval

For our eval test, we will get mama bear.

    ret = "mama bear"

[|cool](# "eval:")

## Transform

    NAME bear

[|hot](# ":|sub NAME, papa")

## Other

[|just right](#transform ":| sub NAME,  baby")

---
papa bear
mama bear
baby bear
