define - testing defining commands
---
# Define

Here we will test defining commands. We will have three commands, one for each
kind (async, sync, raw) and one of these will involve threading from other
blocks. 

[out](#start "save:")

[hot-cool](#hotty "define:raw")

## Start

Alright. We will have three commands that will produce three lines. 

    _"cool | beans"
    _"warm | blanket two, three| sub two, 2"
    _"|hot-cool chocolate"




## Cool

    cool crickets

## Cmd Beans

This is the command beans

    function (input) {
        var doc = this;
        
        return doc.file + ": " + input + "! garbanzo beans";
    }

[be-ans](# "define:")

## Warm

    warm

## Cmd blanket


[blanket](# "define: async| sub --, :")

    function (input, args, cb) {
        var doc = this;
        setTimeout(function () {
            cb(null, doc.file + "-- " + input + " " + args.join(", "));
        }, 1);
    }

## Hotty

This is where we get some nice warm drinks

    function (input, args, name) {
        var doc = this;


        doc.gcd.emit("text ready:" + name, doc.file + ": hot " + args[0]);

    } 
---
in: cool crickets! garbanzo beans
in: warm 2, three
in: hot chocolate
