Failure -- getting helpful messages on failure
---
# Marked Failure

This is longer necessary since commonmark does not seem to generate thrown
errors upon syntax issues. 

This deals with failure while parsing marked. The test will be to have three
sections with the middle one having a failure of a directive (missing end
quote). Then upon failure of that, the log should go to the out file.

    doc.log = function (text) {
        var gcd = doc.gcd;
        gcd.emit("file ready:out", text);
    }

[](# "eval:")


# Just a section

    hi there

# Middle one

This should fail

    adf

[a sub]() 

    more good stuff

[good](# "define:)

# Never seen

This section should never get seen.

    left blank

---
Markdown parsing error. Last heading seen: middle one⫶a sub
