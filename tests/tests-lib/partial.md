Partial - exploring the partial directive
---
# Partials

Let's start simple. Let's make a stub of join and one of subs

    To be or not to be
    That is the question

[joinc](# "partial: join  | echo :")
[subr](# "partial: sub, 1 | echo r")
[dude](# "partial: soli ")

## Using it

    This is cool.

    _"|echo 5 |dude 9"

[out](# "save: | joinc two, five | subr o")


## Cmd define

This defines soli

    function (input, args) {
        return args[0] + input + args[1];
    }

[soli](# "define: sync")

---
This is crrl.

Tr be rr nrt tr be
That is the questirn59:twr:five
