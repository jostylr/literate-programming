dash.md -- testing the dash command
---
# Evaling

First we need to create two dash objects to check. 

    var greet = {
        "hello" : function (input, arg1, arg2) {
            return "Hi " + arg1 +  " " + arg2 + ",\n\n" + input;
        },
        "bye" : function (input, arg1, arg2) {
            return input + "blah";
        }
    };
    var byegreet = Object.create({
        "bye" : function (input, arg1, arg2) {
            return input + "\n\nSincerely,\n" + arg1 +  " " + arg2 + "\n";
        }
    });
    doc.Folder.sync("greetings", function (input, args) {
        var method = args[0];
        args[0] = input;
       return greet[method].apply(greet, args);
    });
    doc.Folder.sync("byegreet", function (input, args) {
        var method = args[0];
        args[0] = input;
       return byegreet[method].apply(greet, args);
    });
    doc.dash.greetings = [greet, 2];
    doc.Folder.dash.byegreet = [byegreet, 1];

[greet](# "eval:")

## Using

    _"| echo Something or other 
        | -hello Jack, the Great 
        | - bye, James, Taylor"

    _"| echo -bye(-hello(ec("Great to see you!") , Jack, the Great), James, Taylor) "

[out](# "save:")

---
Hi Jack the Great,

Something or other

Sincerely,
James Taylor


Hi Jack the Great,

Great to see you!

Sincerely,
James Taylor
