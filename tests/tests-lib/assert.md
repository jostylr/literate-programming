Assert - testing assert
---start:in
# Something

    this is Grate

[out](# "save: | sub Grate, Great | assert this is Great, not |
    assert this is Grate, intended ")

---out:out
this is Great
---log:
!FAIL: intended
ACTUAL: this is Great
EXPECTED: this is Grate
!
