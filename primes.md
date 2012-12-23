# Printing the first 1000 primes

This is an example of literate programming as written in [Knuth Literate Programming](http://www.literateprogramming.com/knuthweb.pdf).

## Basic Outline

This program will produce a function that takes in an integer `m` and returns an array of the first `m` primes. 

This is intended to be used in a browser. A single object will be returned with two methods: one that returns an array of the first `m` primes and another that returns a string that puts the primes into a table. 

FILE: primes.js
  
    module.export = (function () {

      return {
        m : _"Compute first m primes", 
        table: _"Make a table from an array"
      };
    })();


#### Doc

The file primes.js exports a single object with two methods:

arr .m (int m )  Computes the first m primes and returns them as an array.

str .table (arr in, int cols=10, str cell fun(val) mod= noop) Returns a string that is an HTML Table with the array into a table with the given cols or default of 10. One can also supply a function that will take in the entry value under consideration and return a customized html string (for applying classes, styles, id, ...). 

#### Test

FILE: test/primes.js

MODULE: npm install jostylr_test, totally madeup. Insert real one sometime

  primes = require('../primes.js');

  test = require('test');

  test.isEqual(primes.m(5), [2, 3, 5, 7, 11]);

  test.isEqual(primes.table(5), "");

POSTCOMMAND: test test/primes.js
  
## Compute first m primes

We need a function that takes in an integer m and gives us an array of the first m primes. 


    function (m) {

      _"Check m makes sense"

      var primes = [2];

The variable `primes` will hold the array. 

HEREVARS "Is it prime", "Modify limit"



      var current = 3;

      while (primes.length < m) {

We continue to loop until the primes array is filled. 

        _"Is it prime"

        _"If prime"

        _"Modify limit"

        current += 1;

      }

      return primes;


    };

### Is it prime

We loop through all computed primes up to a limit testing whether they divide the current number. If one does, then it is not prime. Even none divide, then it is prime, assuming the limit is appropriately used. 

VARS 
    
    isPrime = true
    i = 1
    // external: primes, current, limit


CODE

    isPrime = true;
    for (i = 1; i < limit; i += 1) {
      if (current % primes[i] === 0) {
          isPrime = false;
          break;
      }
    }


###### Test

SET 
    
    primes = [2, 3, 5]
    limit = [9]

TEST
  
    

  current = 5

RESULT 

  isPrime === true;

TEST 

  current = 6

RESULT
   
  isPrime === false;

SET
  primes = [2, 3, 5, 7]
  limit  = [25]

TEST

    current = 7




### If prime

This is simple; just append the prime to the primes list:

    primes.push(current);


### Modify limit

Because of being divisible by the square root of a number if it is non-prime, we can see that it must be less than the next even square. But we can say even more as we are safe as long as the current is less than the square of the smallest prime that could be the smallest divisor. 

For example, if the limit is 2, this will check divisibility by 3. This works for the numbers 5, 7, and 9. At 9, we are at the square 9 and we must step up. The next prime is 5. So now we are good until 25. Indeed, 11, 13, 15, 17, 19, 21, 23 are mostly primes and if not, they are divisible by 3 or 5. 

VARS
    limit = 2
    square = 9
    //external current, pimes

CODE

    if (current === square) {
      limit += 1; 
      square = primes[limit]*primes[limit];
    }

Knuth raises the point that `primes[limit]` needs to be defined. It happens that this is so, but it is not trivial. 




### Make primes list

This is the mathematical work of the program. 

We will need a isPrime function 

LP layout: isPrime, firstPrimes, printPrimes, run


   firstPrimes = function (m) {
      _vh()
      
      _var(primes = new Array(m),
      counter = 1)

      _"isPrime"

      _"make primes list"
  
      return primes;
    }

Nothing too interesting here. Just the basic structure. We could hold all the primes in an array. We can pass in m as a length to initialize the length of the array which involves keeping a counter variable or we could use push. Let's make an array that has a fixed length;

We can also create an html table by taking in that array and an optional col variable

    js.fun#printPrimes
    printPrimes = function (primes, col) {
      _vh()
      
      _var(
        table = '<table><tbody>', 
        tableEnd = '</tbody></table>'
      )

      _"make rows";
  
      return table+tableEnd;
    }

and then the final bit is to run the code: 

    js.needs(firstPrimes, printPrimes)[run.insert.edit[]]#main
    printPrimes(firstPrimes(30));


## Printing the rows

To make the rows, we go over the array adding elements to the string `row` with `col` in a row. We append the row to `table`

    js#make rows
    _var(
      i, 
      n = primes.length,
      row = "<tr>"
      )
    
    col = col || 10;  
    
    for (i = 0; i < n; i += 1) {
      row += '<td>'+primes[i]+'</td>';
      if ( ((i+1) % col === 0) && (i !== n-1) ) {
        row += '</tr>';
        table += row;
        row = '<tr>';
      }
    }
    
    table += row + "</tr>";

## Computing primes

Now we write an algorithm for computing the primes. 

We will ignore all even numbers. To do this, we add 2 to the array to start and then add 2 to `current` having started as an odd

    js#make primes list
    _var(current = 3
    )
    primes[0] = 2;
    while (counter < m) { //want the first m primes!
      if (isPrime(current) ) {
        primes[counter] = current;
        counter += 1;
      }
      current += 2;
      _"modify limit"
    }

The hard work is about to begin with the function isPrime. Actually, we will make it easy on ourselves. A non-prime number is divisible by a number less than the square root of itself. Thus, we only need to check the primes less than the square root of itself. We'll call the number we need to check   `limit`. We start at `primes[1]` because we are only dealing with odds. 

    js#isPrime
    isPrime = function () {
      var i; 

    return true;      
    }  

Note in Knuth's presentation a table of multiples is kept in place. Here we just rely on division as it will be fast in our environment and we need not worry about size issues or possible slowness from memory retrieval. Benchmarking might be interesting here to do.

## Limit

