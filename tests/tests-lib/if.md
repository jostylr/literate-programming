if -- testing the if constructs
---start:in
# If 

We test the if setup

    doc.out = '';

[](# "eval:")

[out](#out "save:")

## Cmd jack

This should execute after the flag is read

    _":some text  
    | if ?flag(jack), eval, _":some code" 
    | if ?flag(jill), eval, _":bad code"
    | store first "
    

    _"first| eval _":reporting" | store out"

[some text]()

    Just a bit of text

    _"res::boy"
    


[some code]()
    
    doc.out += "\n" + text;
    

[bad code]()

    doc.out = "boo";

[reporting]() 

    text = doc.out;

## No jack

    doc.out += 'not added';

[](# "if: jack; eval:")


[jack](# "flag:")


## Jacked

    doc.out += 'this is added';


[](# "if: jack; eval:")

[res](yes "if: jack; load:")
[res](not "if: jill; load:")
[dude](res::boy "if: jack; save:| sub loaded, cool")
---in:not
# Hey

    Not loaded
---in:yes
# Boy

    Very loaded

---out:out
this is added
Just a bit of text

Very loaded
---out:dude
Very cool


