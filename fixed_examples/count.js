var numarr = [], start=1, end = 11, step = 1;

var i;
for (i = start; i < end; i += step) {
    numarr.push(i);
}

console.log("The numbers are: ", numarr.join(", ") );