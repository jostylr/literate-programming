
This page details upgrading from pre0.9.0 to 0.9.0 and above. 

The core syntax and idea has not changed. That is, `_"block name"` is the same
and when encountered in a code block will trigger the insertion of the code
from section `block name` at that point. 

What is a code block now completely conforms to the commonmark spec. It is
being parsed by the reference implementation of that spec. This means that if
you have list items and have indented after that, it will be seen as a
paragraph, not a code block. You can always use code fences in that instance. 

Directive syntax is largely unaffected as well. The placement of switch
directives is now irrelevant. A switch block is now triggered when a link of
the form `[section name]()` is found or when `[section name](whatever ":|...") is
found. If it is of the form `[](start ":|...")` or `[|des](start ":|...") then
it is a transform which will act on the text in `start` and do something with
pipes to it; one will need to store it somewhere. Maybe we could have the link
text store it? If start is `#` then the current block is used.  



