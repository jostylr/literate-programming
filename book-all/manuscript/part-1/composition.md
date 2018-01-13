# Composition

Another point of view of what literate programming provides is a static
composition view. 

Composition is at the heart of much of the power in higher-level programming.
The difficulty of low-level programming (machine code, assembly) is not in the
complexity of the statements, but rather the opposite. To assemble something
of great intricacy from such small building blocks is quite difficult. I
presume this since I have never done it, but that's what seems to be
the difficulty. 

The abstractions that are then introduced are essentially those of
composition. Even a simple print statement is composed of something that
handles the complexity of printing to a medium with the actual text to be
printed. That is, even a simple "basic" function is already a composition. All
function evaluations can be viewed in that lens. 

Most programming languages will allow for the composition of functions. Not
all languages that programmers need to deal with, however, allow for that.
HTML and CSS are prime examples of languages that lack the primitives to do
dynamic composition of small elements. Much of the drive behind preprocessors
is to allow for variables (simple composition, if you like) and more
complicated compositions, such as mixins. 

But even with languages that have composition, there can be difficulties
because what they offer is dynamic composition, not static composition. That
is to say, the compositions are not compiled, but are rather done during the
evaluation. 

A mathematical example may help in clarifying the difference. Let's say we
have `f(x) = x^2 +1` and `g(x) = 2^3`.  Then `f(g(2)) =  f( 2^3 ) = f(8) =
8^2 + 1 = 65`. This is dynamic composition. Static composition is to compute
the composition ahead of time:  `h(x) = f(g(x)) = (x^3)^2 + 1 = x^6 +1` So
`f(g(2)) = h(2) = 2^6 + 1 = 65`. 

Both versions of composition can be useful. The dynamic composition allows for
inspecting in the middle of a computation, minimizing computations, and
reusing values, for example.  The static composition, however, can, in the
appropriate circumstances, give better insight. In the above example, it is
clear that the composition `h(x)` is a six degree polynomial and for massive
`x`, it is approximately `x^6`. One can also instantly see that this is going
to look exactly like `x^6`, but shifted up one. This is global insight based
on the formula.  Thinking about x^3 being fed into x^2 +1 makes that graphical
insight obscured at best and, presumably, the only way the insight does come
in is doing the static composition implicitly in one's mind. 

Static composition is a technique that is more difficult than dynamic
composition and not always useful. For example, 
`g(f(x)) = (x^2 + 1)^3  = x^6 + 3 x^4 + 3 x^2 + 1` requires much more work
for any single value than computing the two functions separately. Indeed,
computing `g(f(2)) = (2^2 + 1)^3 = 5^3 = 125` is a just a few steps while
`g(f(2)) = 2^6 + 3*2^4 + 3*2^2 + 1 = 64 + 48 + 12 + 1 = 65 + 60 = 125` is
quite a number of computations. 

This is where judgement, context, and need come into play. Static composition
is useful as a tool of understanding and analysis, but dynamic composition is
the choice for plug-n-chug.

Literate programming allows for static composition. This is not always
appropriate, but when it is, it can be very useful. 

While dynamic composition in programming allows for short distinct pieces to
be evaluated when needed, static composition allows for one to see how the
composition fits together. 

A basic rule is that if a piece of composition is going to be reused more than
three or so times, than it is probably best to do that dynamically when
possible. The sweet spot of literate programming is to insert compositions at
places where it would not usually be used, but doing so is advantageous. 

A clear example is that of error checking. These are generally particular to a
part of the code, but distracting from the main purpose. So we push that to
one side with literate programming. 

Another typical example is that of the main body of a program, in which we can
sketch out how it fits together, without the actual code getting in the way.
Literate programming then composes these pieces into the skeletal outline and
we can view the result. 

For languages without dynamic composition, literate programming provides for
that as well. It needs to be carefully used as it can lead to an explosion of
length in the target compilation which can have negative consequences.

Literate programming, as implemented in this tool, does use dynamic
composition in the compile process. This is essentially what the commands are
doing. 
