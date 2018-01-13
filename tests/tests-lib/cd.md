Cd - changing the paths
---start:in
# CD

This will be a lot of saving and loading.

[one/](# "cd: load")
[dude](dude.md "load:")
[dude2](dude2.md "load:")
[](# "cd: load")

[first/](# "cd: save")
[one](#dude::here "save:")
[two](#dude2::here "save:")
[](# "cd: save")

## Reports

This actually puts the output that we want to see
    
    _"|async _"timeout""

[reports](# "save:")

## Timeout 

This is where we do a bit of black magic to pop it out of the flow. This
delays it to allow the rest of the stuff to compile and be waiting. 

    setTimeout(function () {
        var a = doc.parent.simpleReport().join("\n");
        var b = doc.parent.reportwaits().join("\n");
       callback(null, b + "\n" + a);
    }, 1); 
    

---in:one/dude.md
# Here

    Something

---in:one/dude2.md
# Here

    Bye
---out:first/one
Something
---out:first/two
Bye
---out:reports
NOT SAVED: reports AS REQUESTED BY: in NEED: reports
PROBLEM WITH: _"|async _"timeout"" IN: reports FILE: in
