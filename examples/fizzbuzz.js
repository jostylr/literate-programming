var overwrite = function (arr, m, str) {
  var n = arr.length;
  for (i = m - 1; i < n; i += m) {
    arr[i] = str;
  }
};

var numarr = new Array(100);
var i;
for (i = 0; i < 100; i += 1) {
  numarr[i] = i + 1;
}

overwrite(numarr, 3, "Fizz");
overwrite(numarr, 5, "Buzz");
overwrite(numarr, 15, "FizzBuzz");

console.log(numarr.join(", "));