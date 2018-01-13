h5 edge cases - two h5 of same name in section and no h5
---start:in
# H5 is cool

So we like the h5 paradigm, but we need to account for oddities. 

[nostuff](#no "h5:")
[hstuff](#h "h5:")
[this](#this "h5: | .join \n ")

#####  h

    some code

##### h

    some more code


##### this

    hi

## Result

    _"hstuff | .join \n "
    _"nostuff | .join -"

[out](# "save:")

[dude|what](# "store: | sub what, _'this'")

[read](#dude "save:")

##### h

    har matey

##### this    

    Bye

---out:out
some code
some more code
har matey
---out:read
hi
Bye
