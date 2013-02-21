# Welcome

So you want to make a literate program? Let's have a program that outputs all numbers between 1 to 10.

Let's save it in file count.js

FILE "Structure" count.js

## Structure 

We have some intial setup. Then we will generate the array of numbers. We end with outputting the numbers. 

    var numarr = [], start=1, end = 11, step = 1;

    _"Loop"

    _"Output"

## Output 

At this point, we have the array of numbers. Now we can join them with a comma and output that to the console.

    console.log("The numbers are: ", numarr.join(", ") );

## Loop

Set the loop up and push the numbers onto it. 

    var i;
    for (i = start; i < end; i += step) {
        numarr.push(i);
    }