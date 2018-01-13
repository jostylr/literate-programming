# Command

A test for command execution.

    _"lines | exec grep \"awe\" "

    _"|execfresh date "

    _"|execfresh node -e 'console.log(Date.now())'"
    _"|execfresh node -e 'console.log(Date.now())'"

[cmdout](# "save:")

## lines

    awe this is great
    not so much
    but what awesomeness
    truly awed
    oh gosh.
