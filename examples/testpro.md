# Test Literate Program

We just need a place to do some minor tests.

FILE "Body" testpro.js  |jshint | jstidy

## Body

The body of the test

JS 

    te = (function () {
        return  _"f1";
    })();

    function () {
        _"cl"
    }


## f1

A function

    function () {
        great = 3;
        return great;
    }

## cl

    console.log("I was here");


## Now for some bad stuff

What happens if to blocks refer to each other? 

. Alice

    Alice needs _":Bob"

. Bob

    Bob needs _":Alice"

