ife - immediate function expression
---
# fun

    for (i = 0; i < n; i+=1) {
        jack += 7;
    }

[out](# "save: | ife i, n=7, jack=jill")
---
(function ( i, n, jack ) {for (i = 0; i < n; i+=1) {
    jack += 7;
}
} ( i,7,jill ) )
