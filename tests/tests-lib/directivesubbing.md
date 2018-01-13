Directive Subbing -- Checking if local block names work in directives now
---start:in
# Directive Subbing


    THIS

[1](# "save:| sub THIS, _':this'")

[jack](jack "load:")

[this]()

    hey

[other]()

    THIS

[2](# "save:| sub THIS, _':this'")


## crazy

    bye

[3](#directive-subbing "save:| sub THIS, _':this'")

[4](#jack::great "save:| sub THIS, _':this'")
[5](#jack::great:other "save:| sub THIS, _':this'")
---in:jack
# Great

    THIS

[this]()

    hey

[other]()

    THIS

---out:1
hey
---out:2
hey
---out:3
hey
---out:4
hey
---out:5
hey
