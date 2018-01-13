Reporting Logs - Tests the reportOut
---start:in
Need to call dir log and cmd log. 

    _"|echo great work people | log "
    _"|echo great work dogs | log animals "
    _"|echo great work cats | log animals, true(), ec("whatever,doc") "

[something](# "log:")
[val](# "log: dude | sub d, !")

---out:out
great work people
great work dogs
great work cats
---reports:
# DOC: in
## COMMAND LOG
### 
great work people
* * *
### animals
great work dogs
* * *
great work cats
~~~
true
~~~
whatever,doc
## DIRECTIVE LOG
val
`````
!u!e
`````
* * *
something
`````
great work people
great work dogs
great work cats
`````
