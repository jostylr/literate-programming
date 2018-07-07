Directives control the flow of the document parsing. They may call out async
stuff, but they themselves are not async. 

We list here the directives, in the order presented in the documentation.
These are processed to generate a block of directive names that are camel
cased (spaces allowed in the list below get converted to such) and are the
keys that all point to functions with the same info except the function name. 

    save
    load
    directive
    command
    subcommand


