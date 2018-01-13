log - testing log features
---start:hi
# Logging

This will test the logging features, both the log directive, the out directive
(Save, but logging), and the log command.

[nothing](#start "save:")

[start](#start "out:")

[out piping](#other "out:|sub !, c")


## Start

Just some stuff

    great sound
    _":cool|log dude, to"

[hi:start\\:12](# "monitor: start")

[cool]()

    COOL

[](# "monitor:")

## Other

    !ool !rickets
---out:nothing
great sound
COOL
---log:
!EVENT: block needs compiling:hi:start⫶cool DATA: undefined
!EVENT: text ready:hi:start⫶12⫶20⫶24 DATA: dude
!EVENT: text ready:hi:start⫶12⫶20⫶30 DATA: to
!EVENT: command parsed:hi:start⫶12⫶20 DATA: hi,log,text ready:hi:start⫶12⫶20
!EVENT: stitch fragment:hi:start⫶cool⫶0 DATA: COOL
!EVENT: block substitute parsing done:hi:start⫶cool DATA: undefined
!EVENT: ready to stitch:hi:start⫶cool DATA: block substitute parsing done:hi:start⫶cool,,stitch fragment:hi:start⫶cool⫶0,COOL
!EVENT: minor ready:hi:start⫶cool DATA: COOL
!EVENT: text stored:hi:start⫶cool DATA: COOL
!EVENT: text ready:hi:start⫶cool DATA: COOL
!EVENT: text ready:hi:start⫶12⫶14 DATA: COOL
!EVENT: arguments ready:hi:start⫶12⫶20 DATA: text ready:hi:start⫶12⫶14,COOL,command parsed:hi:start⫶12⫶20,hi,log,text ready:hi:start⫶12⫶20,text ready:hi:start⫶12⫶20⫶24,dude,text ready:hi:start⫶12⫶20⫶30,to
!COOL
~~~
dude
~~~
to
!EVENT: text ready:hi:start⫶12⫶20 DATA: COOL
!EVENT: substitution chain done:hi:start⫶12 DATA: text ready:hi:start⫶12⫶14,COOL,text ready:hi:start⫶12⫶20,COOL
!EVENT: text ready:hi:start⫶12 DATA: COOL
!out piping:
cool crickets
~~~

!EVENT: stitch fragment:hi:start⫶12 DATA: COOL
!start:
great sound
COOL
~~~

!
