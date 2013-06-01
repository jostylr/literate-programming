# [Factorial](# 'Version: 0.1.0')

This post is about computing factorials via the logarithm. We use loops to compute it. 

Starting from the parent directory, type `literate-programming -r examples logs.md` to compile.

This literate program compiles into the following files: 

* [logs.htm](#structure 'Save: ":main"')
* [logs.html](#Stand-alone-page 'Save')

Structure
=========

[main](#Strucutre '.md| 1 marked')

    _"Introduction"

    _"Computing 1000!"

    __"Table of Factorials"

    __"Factorial for all"

    __"Behind the scenes"

    _"Comments"



Introduction
===== 

Introduce the problem

[](# '.MD')

    # Big Factorial? Log it down to size


    ## Problem
    
    Factorials get too big too fast. For example, $69! \approx 1.7\times 10^{98}$ is the maximum factorial a calculator can handle. And Google maxes out around 170!

    The issue is that the numbers get too big for the computer to store in memory in its default way to store numbers.

    ## Key Insight 
    
    Logarithms cut numbers down to size, but we cannot use the logarithm of the answer without computing it. Or can we?

    The logarithm of a product is the sum of the logarithms...


## Computing 1000!

Here we work out step by step how to compute out 1000!

[](# '.MD')


    ## Solution
    Using logarithms, I claim $1000! \approx 4.02\times 10^{2567}$. 

    To start with, computing $\ln(1000!)$ does not help since $1000!$ is computed first before the logarithm can act. 

    But remember that logarithms convert products to sums: 
    $$\ln (1000* 999* 998* ... *3 *2 *1) = \ln(1000) + \ln(999) + \ln(998) + \cdots + \ln(3)+\ln(2) + \ln(1) $$

    For example, if you run the following command in [GeoGebra](http://geogebra.org): `sum(sequence(ln(n), n, 1, 1000))` you will get $5912.13$.

    Now we cannot exponentiate that directly since it would generate too large a number. It is currently in base $e$, i.e., \(e^{5912} \approx 1000!\) 
     
    How do we get it to base 10? Divide by $\ln(10)$

    Once in base 10, the integer part is the power of 10. The fractional part could then be exponentiated. 

    `sum(sequence(ln(n), n, 1, 1000))/ln(10) = 2567.6046`

    Therefore, 
    $$1000! \approx  10^{0.6046} \times 10^{2567} \approx 4.02 \times 10^{2567}$$




## Comments

[](# '.MD')

    ##Conclusion
    Factorials are large. For example, suffling a deck of cards leads to about $52! \approx 8.13 \times 10^{67}$ different possible outcomes. That is a number with 67 digits. To put that into perspective, the number of estimated molecules in the observed universe is about $10^{80}$. 

    While Google maxes out at $170!$, one can use [Wolfram Alpha](http://www.wolframalpha.com/input/?i=1000%21) to compute the factorial and check our work. 

    Always keep in mind the power of logarithms. 

## Factorial for all

Here we give a little calculator to compute factorials of large size. Could even get larger using Stirling's approximation stuff:  (x – 1/2) log(x) – x  + (1/2) log(2 π)  from [Endeavor](http://www.johndcook.com/blog/2010/08/16/how-to-compute-log-factorial/)

[](# '.MD| 1 marked ')

    ## Factorial Computer

    To use, put in a positive integer.

    __"Calculator : html"


## Behind the scenes

Give an editable code block that can be edited and run.


[](# '.MD| 1 marked ')

    ## Working code

    Would you like to play around with the code that generated this? Try editing the follow code block:

    __"Code block for factorial"

    __"Code block for factorial:html"

    This is the implementation described above. We first compute the some of the logarithms, then we compute the logarithm relative to 10. The final line is just an attempt to present the result nicely. 

    Feel free to modify the code to see how it works. 



## Calculator

We need an input box and a way to run it. We will have a button that implements it.

[](# '.HTML')

    <input type="text" name="n" id="n"></input><button id="computeFactorial">Compute!</button>
    
    <div id="factorial"></div>

    __":js|jshint|escape|wrap(div, hide, run)"

We will attach a function to the click action 

[](# '.JS')

    /*global $*/
    $("#computeFactorial").click(function () {
        var n = $("#n").val();
        _"Check n"
        _"Common factorial"
        var text = n + "! = " + nf;
        $("#factorial").text(text );      
    });


### Check n

We need to make sure that n is a positive integer.

[](# '.JS')

    if ((n < 0) || (Math.floor(n) !== n) ) {
        $("#factorial").text("Input a positive integer");
    }


## Code block for factorial

[](# '.JS | jshint | wrap(textarea, runnable, cols="120", rows = "10") ')

    var n = 1000;
    _"Common factorial"
    $("#result").text(nf); 

[](# '.HTML')

    <p>The result of the above computation is <span id="result"></span>.</p>


## Common factorial

Here we define the loop, get the result and format it appropriately. n is already defined as its definition differs. 

[](# '.JS')

    var lf = 0, nf;
    //sum ove the logs
    var i; 
    for (i = 0; i < n; i += 1) {
      lf += Math.log(i+1);
    }
    var lf10 = lf/Math.LN10;
    nf = lf10 < 6 ? Math.round(Math.pow(10, lf10) ) : Math.pow(10, lf10-Math.floor(lf10)).toPrecision(6) + "E" + Math.floor(lf10);



## Table of Factorials

It might be nice to see a variety of factorials. We'll do a cresendo of 1, 5, 10, 50, 100, 500, ....

[](# '.MD |1 marked ')

    ## A few factorials

    To see the growth of the factorial, let's compute a few of them. 

    __":Factorial Table| eval  | htmltable(rowswheader)"

[Factorial Table](# '.JS  |jshint')

    var i = 1;
    var fact = function (n) {
        _"Common factorial|indent(4,4)"
        return [n, nf, lf10.toPrecision(3)];
    };
    var tarr = [["n", "n!", "\\(\\log_{10}(n!)\\)"]];
    while (i < 1e6) {
        i *= 5;
        tarr.push(fact(i));
        i *= 2;                 
       tarr.push(fact(i));
    }

    return tarr;

## Jquery version

Not active as we have a default jquery macro in the common standard plugins. But here as an example of how to define a macro until another example comes up. Remove leading space in front of DEFINE to get it to be active. 

    function (v) {
        return '<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/' + 
        (v || '1.9.0') + '/jquery.min.js"></script>';
    }

[](# 'DEFINE: jquery')

## Testing the factorial

Let's make sure our factorial function is working. 

[](# 'JS  |jshint | eval')

    (function () {
        var factorial = function (n) {
            _"common factorial"
            return nf;
        };
        var factorials = {1 : 1, 2: 2, 3: 6, 4: 24, 5:120, 6:720};
        var n, flag = false; 
        for (n in factorials) {
            if (factorial(n) != factorials[n] ) {
                console.log(n + " does not work");
                flag = true;
            }
        }
        if (flag) {
            console.log( "factorial function had errors");
        } else {
            console.log("factorial function passed test");  
        }
        return "";
    })();


Stand alone page
=============

Boiler plate taken from the well-written page: [SitePoint](http://www.sitepoint.com/a-minimal-html-document-html5-edition/)



    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Log and Factorial</title>
        JQUERY(1.9.0)
        MATHJAX
        _"Scripted Writing : css"
        _"Scripted Writing : js"
        BOOTSWATCH(simplex)



      </head>
      <body>
        <div class="container">
            _"Structure"
        </div>
      </body>
    </html>




Scripted Writing
-----------

Our own homebrew solutions for a bit of scripted writing action. This will be split off into its own place, but for now it is here for demo purposes.

[](# '.CSS  | wrap(style) ')

    .runnable { border : 3px solid lightblue; width : 100%}



    .hide { display : none} 

[](# '.JS  | jshint | wrap(script) ')

    $(document).ready(function ()  {

         _":run"

        _":runnable"

    });

[run](# '.JS  ')

The class .run should have runnable, escaped code that we unescape and then run. 

    $(".run").each(function () {
        var code = $(this).text();
        code = code.replace(/\&lt\;/g, "<");
        code = code.replace(/\&gt\;/g, ">");
        code = code.replace(/\&amp\;/g, "&");
        eval(code);
    });

[runnable](# '.JS')

    $(".runnable").each(function () {
        var el$ = $(this);
        el$.blur(function () {
            eval(el$.val());
        }).blur();

    });


    


