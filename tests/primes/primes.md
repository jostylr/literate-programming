# Printing the first 1000 primes

This is an example of literate programming as written in [Knuth Literate Programming](http://www.literateprogramming.com/knuthweb.pdf).

## Basic Outline

This program will produce a function that takes in an integer `m` and returns an array of the first `m` primes. 


    var firstPrimes = _"Compute first m primes";


##  Using it 

This is a command line literate program. We evaluate the basic outline and output it

[](# ":| eval _':cmdline' ")

    /*global console, inputs*/
    _"Basic Outline"
    var inputs = doc.parent.stdin.primes
    console.log("The first "+inputs +" primes are: " + firstPrimes(inputs));

[cmdline]()

    eval(text);


## Doc

The file primes.js exports a single object with two methods:

arr .m (int m )  Computes the first m primes and returns them as an array.

  
## Compute first m primes

We need a function that takes in an integer m and gives us an array of the first m primes. 

The variable `primes` will hold the array. 

We continue to loop until the primes array is filled. 

    function (m) {

        _"Check m makes sense"

        _"Is it prime:vars"
        _"Modify Limit:vars"

        var primes = [2];
        var current = 3;

        while (primes.length < m) {

            _"Is it prime:code"

            _"If prime"

            _"Modify limit:code"

            current += 2;

        }

        return primes;


    }

### Is it prime

We loop through all computed primes up to a limit testing whether they divide the current number. If one does, then it is not prime. Even none divide, then it is prime, assuming the limit is appropriately used. 

[vars]()
    
    var isPrime = true;
    var i = 1;
    // external: primes, current, limit


[code]()

    isPrime = true;
    for (i = 1; i < limit; i += 1) {
      if (current % primes[i] === 0) {
          isPrime = false;
          break;
      }
    }


### If prime

This is simple; just append the prime to the primes list:

    if (isPrime) {
        primes.push(current);
    }


### Modify limit

Because of being divisible by the square root of a number if it is non-prime, we can see that it must be less than the next even square. But we can say even more as we are safe as long as the current is less than the square of the smallest prime that could be the smallest divisor. 

For example, if the limit is 2, this will check divisibility by 3. This works for the numbers 5, 7, and 9. At 9, we are at the square 9 and we must step up. The next prime is 5. So now we are good until 25. Indeed, 11, 13, 15, 17, 19, 21, 23 are mostly primes and if not, they are divisible by 3 or 5. 


[vars]()

    var limit = 2;
    var square = 9;
    //external current, pimes

[code]()

    if (current === square) {
      limit += 1; 
      square = primes[limit]*primes[limit];
    }

Knuth raises the point that `primes[limit]` needs to be defined. It happens that this is so, but it is not trivial. 

### Check m makes sense

Is m a positive integer?

    m = parseInt(m, 10);
    if (m <= 0) {
        console.log("error: need a positive m");
        return [];
    }

