Augmented array single - exploring mapc
---

So apparently mapc is returning a value instead of an array when there is only
one entry. This is to run a test that demonstrates this so we can squash this
bug. 

    _"arr"
    _"obj"
    _"str"

## Array

    This
    is
    crazy

[arr](# "store: | .split \n | mapc rev | .join \n")

[str](# "store: | mapc rev")

## Object

    well:cool
    dude:looks
    fine:you

[obj](# "store: | objectify | mapc rev | keymap")


## Command

Let's define a command to use for mapc

    function (input) {
        return input.split('').reverse().join('');
    }

[rev](# "define:")

## keymap

    function (input) {
        var ret = '';
        var keys = Object.keys(input).sort();
        keys.forEach(function (key) {
            ret += key + ':' + input[key] + "\n";
        });
        return ret;
    }

[keymap](# "define:")

---
sihT
si
yzarc
dude:skool
fine:uoy
well:looc

yzarc
si
sihT
