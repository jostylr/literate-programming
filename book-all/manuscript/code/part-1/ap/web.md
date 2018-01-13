# Webpage

We are going to make a web page. 

[web.html](#structure "save:|log | jade | compile structure ")

## Structure

We use the HTML5 elements of nav, article and aside in their appropriate
roles. The nav is very lame. 

    nav
        .left Click
        .right Clack

    article \_":content |md "

    aside \_"announcements |md "

    script \_"js stuff | jshint "

[content]() 

Here we have some great body content

    # Best Webs Ever

    We have the best webs **ever**. 

    ## Silk

    Yeah, we got spider silk. [Kevlar strength](kevlar.html). Real cool.


### Announcements

Whatever we want to say

    _Open Now!_ 

## js Stuff

Just some random javascript. The jshint will check it for errors and such. 

    var a, b; 
    if (a = b) {
        a = 2;
    } else {
        // never reached;
    }

Jshint just loves it when one uses assignment instead of equality testing in a
boolean expression. 

Note that jshint still allows it to be built. It will just give a warning on
the command line.
