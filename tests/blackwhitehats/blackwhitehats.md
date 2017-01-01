# Black and White Hats

This is a literate program to implement strategies concerning the following
problem:

>You have 100 people in a line. Each is wearing a black or white hat, but they
>don't know which. Each hat is equally likely to be on each person's head.
>They are put in a line, and they can see all the people after them. Starting
>with the first, they are each asked to make a guess as to which color hat
>they are wearing. They can agree on a strategy and they can hear all previous
>guesses. There is also one person in the line that may not follow the
>strategy. What is the optimal strategy for maximizing the number of right
>guesses?

What follows below is the solution and can also be found on
[github](https://github.com/jostylr/literate-programming/blob/master/examples/blackwhitehats.md).
There is a live version on [JS
Bin](http://jsbin.com/UpeveZe/1/edit?js,console).

## [hats.js](#hats.js "save: | jshint")

We are going to simulate this with a nodejs program. We first generate the
line. Then we have a starting function followed by a function that works for
the later ones, using the guesses and the next line. 

Our strategy will be the first person indicates the parity of the number of
black hats in the line (black if odd, white if not). Then the rest will simply
say "black" if the parity changes and white otherwise. The one who does not
follow this will mess up the person following them, but that's it. At least
that's the assertion. 


    var i, 
        n = 100,
        line = [],
        msg = [],
        remainder = [],
        //traitor = n+1, 
        traitor = Math.floor(Math.random()*n),
        success = 0,
        current, 
        oldParity, 
        parity;
    
    var parityFun = _"parity";

    _"Make a line"

    remainder = line.slice(1);

    _"First guess"

    _"Rest of guesses"

    console.log(line.join(''));
    console.log(msg.join(''));

    console.log("traitor at "+ traitor + "\nNumber of Correct guesses: " + success);

## Make a line

We can start with making the line. 

    for (i = 0; i < n; i += 1) {
        if (Math.random() <= 0.5) {
            line.push("b"); 
        } else {
            line.push("w");
        }
    }

## Parity

We need to determine the parity of the number of blacks. 

    function (arr) {
        var i, n = arr.length, count = 0;

        for (i = 0; i < n; i += 1) {
            if (arr[i] === "b") {
                count +=1;
            }
        }

        return count %2;
    }

## First guess

If the parity is 1, we say "b" otherwise "w". Then we check for success.

    parity = parityFun(remainder);
    i = 0;
    if (i === traitor) {
        msg.push("T"); 
        parity = (parity +1)%2;
    } else {
        if (parity) {
            msg.push("b");
        } else {
            msg.push("w");
        }
        if (msg[i] === line[i]) {
            success += 1;
        }
    }


## Rest of guesses

Here we go through all the remaining ones. Different parity, then black hat.
Otherwise not. 


    while (remainder.length !== 0) {
        i += 1;
        current = remainder.shift();
        oldParity = parity; 
        parity = parityFun(remainder);
        if (i === traitor) {
            msg.push("T"); 
            parity = (parity +1)%2;
        } else {
            if (parity !== oldParity) {
                msg.push("b");
            } else {
                msg.push("w");
            }
            if (msg[i] === line[i]) {
               success += 1;
            }
        }
    }





