# Artistic programming

And so we reach the third and final level of our journey. The other two levels
are pretty much complete in explaining them and how to use them. What follows
for the rest of this tome is all about the third level. 

The third level is the shedding of constraints. We take those snippets of code
from the second level and we run them through code transformations. This
enables us to do just about anything. Even more, we can call out to external
programs, feeding the snippets in as standard input and receiving the output
as the next form of the snippet.

This is the level of complete artistry. We can write little mini-languages to
make efficient input. We can use a wide variety of text transformations of one
language to the next all smoothly in the code. We can weave in user-end documentation, tests, sanity checks, compile contexts, and whatever else we can dream of, to make the job of coding, and all of its ancillary tasks, efficient and enjoyable. 

The basic command syntax uses pipe syntax. Instead of just a reference,
such as `_"name"`, we can pipe the incoming text into a command, or series of
commands, such as `_"name | cat  awesome, _"dude" | sub A, b"`. This would
take the text in the reference `name` and send it through the command `cat` which
concatenates stuff together. In particular it would join the incoming text
with awesome and the stuff in the `dude` section. Then that resulting text
goes through the sub command and all instances of `A` get replaced with `b`.
Note that section names can be referenced in the command arguments. 


### Sub

To start with, let's say we want to create functions for the arithmetic
operators. That is, we want to be able to write `add(4, 5)` instead of `4+5`.
In JavaScript, we could do

    var add = function (a, b) {
        return a + b;
    }

And that would be fine. We could then do that for subtraction, multiplication,
and division. But that is a bit repetitive. So instead we can do

{lang=text}
<<(code/part-1/ap/operators.md)

And that generates the following in a file called ops.js.

<<(code/part-1/ap/ops.js)
    
This is not that exciting of an example. And there are a number of ways we
could have approached this with a simple copy and paste being one of them. Indeed,
the four lines of litpro code is copy and pasted (it is also possible to run
some custom code to do this more elegantly, but this is a simple
introduction). 

But you may wonder what is the advantage? The creative effort is about the
same level, but now all four are dependent on each other. This may be good, it
may not be good. It is good if you later decide to modify this. For example,
you may want to check that the operators are numbers. Or you may want to round
the result or cast it into some other form. By modifying the originating
function, we get all of them modified at once. That is, the benefit is in the
maintenance. 

The downside is that they are coupled. So, for example if we want to inject a
test for division by zero, we need to add something to facilitate that. One
solution is to put in a comment line that gets replaced with what you need. 

{lang=text}
<<(code/part-1/ap/ops2.md)

Turning into:

<<(code/part-1/ap/ops2.js)

This could easily become cumbersome. As is generally true with this style of
programming, it is a matter of artistic choice as to which is the most useful
and clear in any given situation. It is likely to evolve over time just as
repeating similar code often evolves into pulling it out to functions. This
is just one of the stops along the way.  


## Web

As another example, let's say we are creating a web page. We want to have the
content written in markdown, but we want to create the structure in [pug](https://pugjs.org/) (formerly the jade language).
Let's presume that the commands to convert them are `md` and `pug`,
respectively.

{lang="text"}
<<(code/part-1/ap/web.md)

This yields

<<(code/part-1/ap/web.html)

The easiest way to run this is with `literate-programming` which has both markdown and pug included. 

But to run this with `litpro`, one needs to use the lprc.js file that defines these commands.
There are other methods that we'll discuss later, but this is perhaps the most useful method.  

The lprc.js file requires the modules markdown-it and pug. We also
include jshint which was done to check the script that we snuck in there. 

<<(code/part-1/ap/lprc.js)

We will discuss a lot of what is going on in this example as time goes on. But
notice how we can cut up our assembly of the material, run them through
commands, and get a nice compiled output. 

The backslashes are escaping the substitution in the first round as mixing
pug with compiled HTML content does not lead to good results. So we compile
the pug and then when that is ready, we call the compile command to run that
through our standard compiler. In this example, we need to include the
structure named section as the overarching section.
