Property set, get, store -- testing these commands
---

    _"obj | pget a, 1 "
    _"obj | pset c, 5 | pget b, j | done c "
    _"obj | when c | pget c "
    _"|echo Awesome | pstore _"obj", d, num(2) | echo _'obj' | pget d, 2"


[storing]()

    Nothing really
    
[obj](# "store: | echo  kv(a, arr(0, 3), b, kv(j, 45, l, 9)) ")
---
3
45
5
Awesome
