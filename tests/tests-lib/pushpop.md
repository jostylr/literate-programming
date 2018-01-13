Push Pop -- pusing and popping state variables in the pipes
---
# Push and Pop

This is a bit excessive, but this takes the incoming text and pushes it on a
stack and then pops it out again. 

    some text. THIS

[out](# "save: |push 
    | sub THIS, bye 
    | store modified 
    | pop 
    | cat \n, _'modified'
")
---
some text. THIS
some text. bye
