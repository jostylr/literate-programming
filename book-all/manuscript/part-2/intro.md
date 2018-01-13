-# Cookbook

This is where we do a variety of specific examples of use. It mainly focuses
on examples from the web stack. In particular, the programming is almost
entirely JavaScript. 

### Constants

We can define constants once with explanations and then put them into whatever
files need them. 

### Eval

How to run some JavaScript

### Boilerplate

If you have need of boilerplate, then we can do that with some substitutions
for templating it as well.

### Making a Command

Commands are very useful. This is how to make them in a literate program. 

### Making a Directive

Inline custom directives are not that useful, but it can be insightful in
going towards making plugins. 

### Project Files

Often there are other files needing managing for a project other than just
code. For example,  .gitignore, readme, package.json, ... These can all live
in a single literate programming document that generates these files. It could
also be setup to have variables that you define once and then use when needed,
such as the version number. 

### Making a lprc.js file

What constitutes a lprc.js file. This is where directives and commands are
ideally added, either directly or from plugins. 

### Other languages

If you want to write in your own style or language or whatever, it can do that
as well. Write in a way comfortable to you and have it compile it into any
target language. 

### Making a Plugin

Making a plugin leads to good consistent behavior. 

### Data Entry

Dealing with little bits of data is a difficult problem. Here we look at
inline data entry using a quick split style as well as reading in data from an
external file. This pertains more to generating written output, then code
itself, but it could be needed there as well such as if you want to pull in
secrets from a file outside of the repo and put it in the compiled code that
is also stored outside of the repo. 

### Conditionals

We may want to do one thing or another depending on command line options or
based on some programmatic condition. We can do that. 

### Domain Specific Languages

We can write full blown domain specific languages and have them translated at
build time. Or you can use standard languages that get transformed, such as
markdown into html. 

### Making a Subcommand

These allow for doing complex actions in arguments. These are different from
commands that expect to be a part of a pipe flow. 

### Linting

We can lint pieces of our code. It would even be possible to lint the pieces
in isolation to see what shared variables might pop up. 

### h5 and h6 Headers

These are headers that generate path-escaped references using the most recent
main block reference as the root path. These sections can not only be useful
for commonly named parts, but can also have custom behavior automatically
acting on the parts.  

### Testing

Testing should be easy. Here we give a strategy for testing little bits of
code (unit testing) as well as testing the combined pieces (integrated
testing). 

Having fake data specified as well as expected output is also easy. 

### Documentation

While literate programming is designed to be the documentation for the
maintenance programmer, there is still the little issue of user documentation.
While that may call for a separate document, it could be included in the same
literate program as well using the h5 and h6 mechanism, keeping it with the
code. 

### Debugging

Debugging can be supported by conditional commands. 
