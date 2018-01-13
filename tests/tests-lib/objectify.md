objectify - testing the objectify method
---
# Basic

    _":object | objectify | pget this is great "
    _":object 
        | objectify 
        | forin fun(` (val, key, ret) => ret + key + '!' + val + '&'`), 
            ec(''), key"
    _":object | objectify | toJSON"
    _":json | fromJSON | pget c"


[out](# "save:")

[object]()

    5: jack
    jack :jane
    this is great : whatever


[json]()

    {"a":"b","c":"d"}


---
whatever
5!jack&jack!jane&this is great!whatever&
{"5":"jack","jack":"jane","this is great":"whatever"}
d
