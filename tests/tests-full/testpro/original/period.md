# Period problem

A bug is reported that if there is a period on the next line from a swtich,
then there is an error in parsing. Let's see

## Begin

Hi there
 
    _"start"

    _"start:end"


## Start

again? 

    just some stuff

[end]()
.

    more stuff
