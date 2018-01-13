join filter -- testing the join and filter commands
---
We want to test the join and filter functions 

    0^^^
    _"obj | join \n, dud, cool "
    1^^^
    _"obj | filter dud, cool | join \n"
    2^^^
    _"obj | join \n, eval(`ret = /dud/`), eval(`ret=/dud$/`) "
    3^^^
    _"obj | filter eval(`ret = /dud/`), eval(`ret=/dud$/`) | join \n "
    4^^^
    _"obj | join \n, fun(`function(key, val) {
            if (typeof(val) === 'number') {
                return true;   
            } }`) "
    5^^^
    _"obj | filter fun(`function(key, val) {
            if (typeof(val) === 'number') {
                return true;   
            } }`) | join \n "
    6^^^
    _"arr | join \,\ "
    7^^^
    _"arr | join \,\ , num(1), 2"
    8^^^
    _"arr |  filter num(1), 3 | join \,\ "
    9^^^
    _"arr | join \,\ , 1:2"
    10^^^
    _"arr | filter :1 | join \,\ "
    11^^^
    _"arr | filter 2: | join \,\ "
    12^^^
    _"arr | filter 2x-3 | join \,\ "
    13^^^
    _"arr | filter -2x-1 | join \,\ "
    14^^^
    _"arr | join \,\ , 3x"
    15^^^
    _"arr | join \,\ , x-2, 2x+1, 1:3"
    16^^^
    _"arr |  join \,\ , 3:1"
    17^^^
    _"arr | filter fun(`function(el, ind) {
        return (el[0] === 'j');
    }`) | join \,\ "



[to load]()

[obj](# "store: | echo kv(dude, num(1), dud, what, cool, hah)")
[arr](# "store: | echo arr(num(4), jack, jane, kate, num(6)) ")

---
0^^^
what
hah
1^^^
hah
what
2^^^
what
1
what
3^^^
what
1
4^^^
1
5^^^
1
6^^^
4, jack, jane, kate, 6
7^^^
jack, jane
8^^^
jack, kate
9^^^
jack, jane
10^^^
4, jack
11^^^
jane, kate, 6
12^^^
jane, 6
13^^^
6, jane, 4
14^^^
4, kate
15^^^
kate, 6, jack, kate, jack, jane, kate
16^^^
kate, jane, jack
17^^^
jack, jane
