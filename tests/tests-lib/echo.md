Echo - the echo subcommand has a problem
---
# Main
The echo subcommand allows one to have strings without problems

Actually, the problem is with the sub command. It was not being run through
the sync wrapper and thus the arguments were not being prepped. 

    _"| echo Cool beank | sub ec("k", 's'), echo('b','')"

[out](# "save:")

---
Cool eans
