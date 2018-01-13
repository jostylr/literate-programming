Empty Main - testing that we can call the empty section
---start:in
# Something wicked

    _"emptyhead::"

    _"emptyhead:::weird"

    _"emptyhead::^"

    _"emptyhead::^:weird"

[emptyhead](emptyhead "load:")

[out](# "save:")

---in:emptyhead
This is great

    Bob

    
[weird]()

    yeah

---out:out
Bob

yeah

Bob

yeah
