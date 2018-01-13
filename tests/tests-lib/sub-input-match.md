Sub-input-match -- Testing subcommand input and boolean match
---

    _":text | if ?match(input(), some), sub, some, wow"
    _":text | if ?not(?match(input(), reg('ae'))), sub, rand, !!!!"

    _"sum | ifelse arr(?>(input(), num(15)), echo, Time to make a chart), 
        arr(?<=(input(), num(15)), echo, Expand out each point)"
    
    
[text]()

    This is some random text

[sum](# "store:  0 | echo arr(num(1, 2, 3)) 
    | # we want to add them up. should be 16 with the start of 10
    | .reduce fun(`function (sum, el) { return sum + el; }`), num(10) ")
    

---
This is wow random text
This is some !!!!om text

Time to make a chart
