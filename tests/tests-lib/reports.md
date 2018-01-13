reports -- testing the report mechanism
---
# Reports

Want to try to get some reports going.

[out](#output "save:")

[never](#hopeless "save:")

## Hopeless

Here we ask for some things that will never happen.

    _"dude"

    _"|bogus art, dee"

    _"|sub *, _"not here""

    _"hey now"

    _"just::kidding"

    _"actual"

    _"actual:not here"

    _"not a var"


[just::kidding](# "store:hi there")

### Actual

    This works.

### hey now

And one more hopelessness

    _"|async _":ev""

[ev]()

This does not call the callback.

    1 + 1;

## Output

This actually puts the output that we want to see
    
    _"|async _"timeout""

## Timeout 

This is where we do a bit of black magic to pop it out of the flow. This
delays it to allow the rest of the stuff to compile and be waiting. 

    setTimeout(function () {
        var a = doc.parent.simpleReport().join("\n");
        var b = doc.parent.reportwaits().join("\n");
       callback(null, b + "\n" + a);
    }, 1); 
    
---
NOT SAVED: out AS REQUESTED BY: in NEED: output
NOT SAVED: never AS REQUESTED BY: in NEED: hopeless
NEED SCOPE: just FOR SAVING: kidding IN FILE: in
NEED SCOPE: just FOR RETRIEVING: kidding IN FILE: in
PROBLEM WITH: _"dude" IN: hopeless FILE: in
PROBLEM WITH: _"|bogus art, dee" IN: hopeless FILE: in
PROBLEM WITH: _"|sub *, _"not here"" IN: hopeless FILE: in
PROBLEM WITH: _"hey now" IN: hopeless FILE: in
PROBLEM WITH: _"just::kidding" IN: hopeless FILE: in
PROBLEM WITH: _"actual:not here" IN: hopeless FILE: in
PROBLEM WITH: _"not a var" IN: hopeless FILE: in
PROBLEM WITH: _"|async _":ev"" IN: hey now FILE: in
PROBLEM WITH: _"|async _"timeout"" IN: output FILE: in
COMMAND REQUESTED: bogus BUT NOT DEFINED. REQUIRED IN: hopeless FILE: in
