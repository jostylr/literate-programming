matrix row col - testing the row col stuff
---
    
    _"data | matrixify 
        | .rows _"f | funify"
        | .cols _"g | funify" 
        | .print ec(','), \n"

# data

    4, 5, 7, 8
    2, 3, 4, 5
    9,10, 12, 23

# f

    function (row, ind) {
        return row.map(function (el) {
            return el * 5*(ind+1);
        });
    }

# g

    function (col, ind) {
        return col.map(function (el) {
            return el - 7*(ind+1);
        });
    }


---
13,11,14,12
13,16,19,22
128,136,159,317
