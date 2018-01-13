var add = function (a, b) {
    if (Number.isNumber(a) && Number.isNumber(b) ) { 
        //rep
        return a + b;
    } else {
        return NaN;
    }
}
var mul = function (a, b) {
    if (Number.isNumber(a) && Number.isNumber(b) ) { 
        //rep
        return a * b;
    } else {
        return NaN;
    }
}
var div = function (a, b) {
    if (Number.isNumber(a) && Number.isNumber(b) ) { 
        if (b === 0) {
            if (a > 0) {
                return Infinity;
            } else if (a < 0) {
                return -Infinity;
            } else {
                return 1;
            }
        }
        return a / b;
    } else {
        return NaN;
    }
}
var sub = function (a, b) {
    if (Number.isNumber(a) && Number.isNumber(b) ) { 
        //rep
        return a - b;
    } else {
        return NaN;
    }
}
