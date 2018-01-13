cycle -- cycle tester of blocks pointing to each other
---
# Cycle

What happens if we have blocks that point to each other? Hopefully nothing.  


    _"block"

## Block

    _"cycle"  _"block:switch"  _"block"

[switch]()

    _"cycle"

## Output

This actually puts the output that we want to see
    
    _"|async _"timeout""

[out](#output "save:")


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
PROBLEM WITH: _"block" IN: cycle FILE: in
PROBLEM WITH: _"cycle" IN: block FILE: in
PROBLEM WITH: _"block:switch" IN: block FILE: in
PROBLEM WITH: _"block" IN: block FILE: in
PROBLEM WITH: _"cycle" IN: block FILE: in
PROBLEM WITH: _"|async _"timeout"" IN: output FILE: in
