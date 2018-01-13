# Operators

We want to convert the operators to functions.

The ?? will be replaced with operator symbols. We check for something to be a
number and then do the computation. This is not really necessary nor perhaps
the best to do it, but there you have it.

    var OP = function (a, b) {
        if (Number.isNumber(a) && Number.isNumber(b) ) { 
            //rep
            return a ?? b;
        } else {
            return NaN;
        }
    }

 When done we will save it in [ops2.js](#math-ops "save:")

## Math ops

Let's create the operators

    _"operators| sub OP, add, ??, +"
    _"operators| sub OP, mul, ??, *"
    _"operators| sub OP, div, ??, /, //rep, _"division by zero" "
    _"operators| sub OP, sub, ??, -"

## Division by zero

The division by zero is so bad so let's deal it. Let's be bad mathematical
people and give some values of oo, -oo, and 1

    if (b === 0) {
        if (a > 0) {
            return Infinity;
        } else if (a < 0) {
            return -Infinity;
        } else {
            return 1;
        }
    }
