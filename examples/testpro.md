# Test Literate Program

We just need a place to do some minor tests.

[testpro.js](#Body "js|jshint")

## Body

The body of the test

[](# "js")

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

[Alice](# )

    Alice needs _":Bob"

[Bob](# )

    Bob needs _":Alice"

## Now for some bad stuff

What happens if to blocks refer to each other? 

[Alex](# )

    Alex is good.

[Bobby](# "|log" )

    Bobby needs _":Alex"

