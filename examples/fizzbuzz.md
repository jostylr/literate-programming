# FizzBuzz

FizzBuzz is a trivial program that [weeds out programmers](http://www.codinghorror.com/blog/2007/02/why-cant-programmers-program.html).  

The goal of the program is to to print out the numbers from 1 to 100 except multiples of 3 should output Fizz, of 5 Buzz, and of both FizzBuzz. 

FILE fizzbuzz.js | structure | jstidy()

## Structure

We will approach this problem by making an array of all 100 numbers and then writing over the appropriate multiples by going over the array 3 more times though only touching the relevant multiples. 

JS | jshint 

    /*global console */
    var overwrite = _"Overwrite multiples in array";

    var numarr = new Array(100);
    _":Initial array"

    overwrite(numarr, 3, "Fizz");
    overwrite(numarr, 5, "Buzz");
    overwrite(numarr, 15, "FizzBuzz");

    _"Output array"


JS Initial array

This is a simple loop that puts in the right digit. Note that we want the value of the arrays to start at 1 while the index starts at 0. 

    var i; 
    for (i = 0; i < 100; i += 1) {
        numarr[i] = i+1;
    }

## Output array

We just join the array and output it.

    console.log(numarr.join(", "));

## Overwrite multiples in array

This is a function that takes in an array, a multiple, and a string and replaces each of the multiples with that string. 

    function (arr, m, str) {
        var n = arr.length;
        for (i = m-1; i < n; i += m) {
            arr[i] = str;       
        }
    }

## Immediate gratification

Because this is a literate program, we can pipe text through a command. In this case, we will evaluate it. 

JS | eval

    _"Structure"
