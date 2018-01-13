fsubcommand.md -- testing defining a subcommand
---
So we want to use a subcommand defined on a function. We use the plugins to do
this. 

    _"| cool report(dude), pig(dude) "


## cool 

    function (text, args) {
        return "cool as " + args[0] + " " + args[1];
    }

[cool](# "define:")

## subcommand

Subcommands for functions can be stored in .plugins
          
    function (arg1) {
        return arg1;
    }
    
    
[report](#cool "subcommand:")

## pig

This takes a word, puts the first letter at the end with ay appended. 

    doc.Folder.defSubCommand( "pig", function (arg) {
        return arg.slice(1) + arg[0] + "ay";
    });

[pig](# "eval:")
---
cool as dude udeday

