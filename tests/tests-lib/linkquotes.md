Link Quotes -- link quotes
---
# Links

This tests out whether there are any issues with quotes in links.
Specifically, if we use a pipe command with a substitution, can we use any of
the quotes? 

[out](# "save: | join \ \\,\n\ ,_'|cmd1', _`|cmd1` ,  _'|cmd1'")


[cmd1](# 'define:| cat  _"Cmd 1"')

## Cmd 1

    function (text) {
        return text + "1";
    }
---
1 ,
 1 ,
 1
