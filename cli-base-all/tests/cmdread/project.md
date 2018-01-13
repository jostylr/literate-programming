# Command read

We want to test reading in files and directories as well as writing a file
from a command.

    _"|readdir sample |.sort | .join \n"

    _"|readfile samplefile.txt 
        | push 
        | cat this is cool, \n 
        | savefile sample2.txt
        | pop"

    _"|readfile ../some.txt"

[sam.txt](# "save:")

