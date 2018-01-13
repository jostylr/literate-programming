anon -- testing the annonymous commands
---
This tests the anonymous commands.

    _"|echo Awesome | anon return input + '!' "
    _"|echo Awesome | anon (input, args) => input + args.join('!'), 5, 6"
    _"|echo Awesome | anon fun(`function (input, args) {
        return input + args.join('!');}`), 9, 10 "
    _"|echo Awesome | anonasync 
        ec(`return callback(null, input + '!' + args[0])`), 2 "

---
Awesome!
Awesome5!6
Awesome9!10
Awesome!2
