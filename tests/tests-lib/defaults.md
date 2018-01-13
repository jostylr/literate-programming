defaults -- testing a default command maker
---
# Defaults

So this tests the function wrapDefaults.

    ["info", "used", function (text, args) {
        return text.replace(/used/g, args[0]);
    }]


[info](# "define: defaults")

## Many


    ["many", "used", "unused", "rocking", function (text, args) {
        return text.replace(/used/g, args[0]) + args[2];
    }]


[many](# "define: defaults")

## rocking

This is great. 

    !!!!

## used

Just something

    pants


## out

    great used
    _"|cat used, dude, used |info jack, jill"
    _"|cat used, dude, used |many , jill"
    _"|cat used, dude, used |many , jill, ???? "


[out](# "save: | info ")
    
---
great pants
jackdudejack
pantsdudepants!!!!
pantsdudepants????
