compile - compiling in a command and backslashing
---start:in
# Compiling

This tests compiling a block of text. The idea is to use the backslashing of
the subs and then see if it can make it through. 

[first](first.md "load:")

[out](#start "save:")

## Start

    Cool. _"beans | store stub | compile || "

    Raw. _"stub"

    _"stuff | compile dude"

    _"stuff | compile "

    _"stuff | compile first::filler"

    _"first::template | compile"

[cool]()

    ice

[hot]()

    steam


## Beans

We will have beans and more

    beans and \_"more"

## More

    kale


## Stuff

    This is a template \_":cool"

    A second block \_":hot"

## dude 

[cool]()

    is cool.

[hot]() 

    whatever.

---in:first.md

# filler

This is a template section. 

[hot]()

    Rocking

[cool]()

    Sleeping

## Template

This is a simple template to see if it works as well.

    \_":cool"

    \_":hot"

---out:out

Cool. beans and kale

Raw. beans and _"more"

This is a template is cool.

A second block whatever.

This is a template ice

A second block steam

This is a template Sleeping

A second block Rocking

ice

steam
