Sub reg -- testing the regular expression part of the sub command
---
Substitutes with regexs

    _"| echo This is great | sub reg(s\s), S-"
    _"| echo This is great | sub reg(_"reg"), _"rep | funify" "
    _"| echo This is greater | sub _"creg", 
        ec("Reverse and some scrambling: $'-$1-$`-$&-$1:") "


# reg

A reg

    ([aeiou])(?:[aeiou])

[creg](# "store:| regify ")

# rep

    function (match, one) {
      return one.toUpperCase() + 9;
    }

---
ThiS-iS-great
This is grE9t
This is grReverse and some scrambling: ter-e-This is gr-ea-e:ter 
