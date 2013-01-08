# Factorial

This post is about computing factorials via the logarithm. We use loops to compute it. 


## Structure

    _"Introduction"

    _"Computing 1000!"

    __"Factorial for all"

    __"Behind the scenes"

    _"Comments"

MD.HTML 1
FILE logs.htm

## Introduction

Introduce the problem

    # Big Factorial? Log it down to size


    ## Problem
    
    Factorials get too big too fast. For example, $69! \approx 1.7\times 10^{98}$ is the maximum factorial a calculator can handle. And Google maxes out around 170!

    The issue is that the numbers 

    ## Key Insight 
    
    Logarithms cut numbers down to size, but we cannot use the logarithm of the answer without computing it. Or can we?

    The logarithm of a product is the sum of the logarithms...


## Computing 1000!

Here we work out step by step how to compute out 1000!

    ## Solution
    Using logarithms, I claim $1000! \approx 4.02\times 10^{2567}$. 

    To start with, computing $\ln(1000!)$ does not help since $1000!$ is computed first before the logarithm can act. 

    But remember that logarithms convert products to sums: 
    $$\begin{align*} \ln(1000* 999* 998* ... *3 *2 *1) = \ln(1000) + \ln(999) + \ln(998) + ... + \ln(3)+\ln(2) + \ln(1) $$

    For example, if you run the following command in [GeoGebra](http://geogebra.org): `sum(sequence(ln(n), n, 1, 1000))` you will get $5912.13$.

    Now we cannot exponentiate that directly since it would generate too large a number. It is currently in base $e$, i.e., \(e^{5912} \approx 1000!\) 
     
    How do we get it to base 10? Divide by $\ln(10)$

    Once in base 10, the integer part is the power of 10. The fractional part could then be exponentiated. 

    `sum(sequence(ln(n), n, 1, 1000))/ln(10) = 2567.6046`

    Therefore, 
    $$1000! \approx  10^{0.6046} \times 10^{2567} \approx 4.02 \times 10^{2567}$$



## Comments

    ##Conclusion
    Factorials are large. For example, suffling a deck of cards leads to about $52! \approx 8.13 \times 10^{67}$ different possible outcomes. That is a number with 67 digits. To put that into perspective, the number of estimated molecules in the observed universe is about $10^{80}$. 

    While Google maxes out at $170!$, one can use [Wolfram Alpha](http://www.wolframalpha.com/input/?i=1000%21) to compute the factorial and check our work. 

    Always keep in mind the power of logarithms. 

## Factorial for all

Here we give a little calculator to compute factorials of large size. Could even get larger using Stirling's approximation stuff:  (x – 1/2) log(x) – x  + (1/2) log(2 π)  from [Endeavor](http://www.johndcook.com/blog/2010/08/16/how-to-compute-log-factorial/)

    ## Factorial Computer

    To use, put in a positive integer.

    __"HTML calculator"


MD.HTML 1

## Behind the scenes

Give an editable code block that can be edited and run.

    ## Working code

    Would you like to play around with the code that generated this? Try editing the follow code block:

    __"Code block for factorial"

    This is the implementation described above. We first compute the some of the logarithms, then we compute the logarithm relative to 10. The final line is just an attempt to present the result nicely. 

    Feel free to modify the code to see how it works. 

MD.HTML 1


## HTML calculator

We need an input box and a way to run it. We will have a button that implements it.

    <input type="text" name="n" id="n"></input><button id="computeFactorial">Compute!</button>
    
    <div id="factorial"></div>

    _"JS Calculator"


### JS Calculator

We will attach a function to the click action 

    $("#computeFactorial").click(function () {
        var n = $("#n").val();
        _"Check n"
        _"Common factorial"
      $("#factorial").text(n+"! = " + ) );      
    });

JS.PRE 0, hide, run


### Check n

We need to make sure that n is a positive integer.

    if ((n < 0) || (Math.floor(n) !== n) ) {
        $("#factorial).text("Input a positive integer");
    }


## Code block for factorial


    var n = 1000;
    _"Common factorial"

JS.PRE 0, editable, runnable

## Common factorial

Here we define the loop, get the result and format it appropriately. n is already defined as its definition differs. 

    var lf = 0;
    //sum ove the logs
    var i; 
    for (i = 0; i < n; i += 1) {
      lf += Math.log(i+1);
    }
    var lf10 = lf/Math.LN10;
    var text = n + "! = " + 
        ( lf10 < 6 ? Math.round(Math.pow(10, lf10) ) : Math.pow(10, lf10-Math.floor(lf10)).toPrecision(6) + "E" + Math.floor(lf10) 
    

## Stand alone page


    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Log and Factorial</title>
        <link rel="stylesheet" href="style.css">
      </head>
      <body>
        _"Structure"
      </body>
    </html>

FILE logs.html
