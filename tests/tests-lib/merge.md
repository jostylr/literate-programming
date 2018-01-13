merge - checking the merge algorithms
---
# Merge

    a = {a:1, b:{e:2, f:4}, c: 3};
    b = {a:5, b:{e:3} };

    var merge = doc.Folder.requires.merge;
    merge(a, b);
    ret = JSON.stringify(a);


[out](# "save: |evil ")
---
{"a":5,"b":{"e":3},"c":3}
