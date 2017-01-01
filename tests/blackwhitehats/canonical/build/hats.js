var i, 
    n = 100,
    line = [],
    msg = [],
    remainder = [],
    //traitor = n+1, 
    traitor = Math.floor(Math.random()*n),
    success = 0,
    current, 
    oldParity, 
    parity;

var parityFun = function (arr) {
    var i, n = arr.length, count = 0;

    for (i = 0; i < n; i += 1) {
        if (arr[i] === "b") {
            count +=1;
        }
    }

    return count %2;
};

for (i = 0; i < n; i += 1) {
    if (Math.random() <= 0.5) {
        line.push("b"); 
    } else {
        line.push("w");
    }
}

remainder = line.slice(1);

parity = parityFun(remainder);
i = 0;
if (i === traitor) {
    msg.push("T"); 
    parity = (parity +1)%2;
} else {
    if (parity) {
        msg.push("b");
    } else {
        msg.push("w");
    }
    if (msg[i] === line[i]) {
        success += 1;
    }
}

while (remainder.length !== 0) {
    i += 1;
    current = remainder.shift();
    oldParity = parity; 
    parity = parityFun(remainder);
    if (i === traitor) {
        msg.push("T"); 
        parity = (parity +1)%2;
    } else {
        if (parity !== oldParity) {
            msg.push("b");
        } else {
            msg.push("w");
        }
        if (msg[i] === line[i]) {
           success += 1;
        }
    }
}

console.log(line.join(''));
console.log(msg.join(''));

console.log("traitor at "+ traitor + "\nNumber of Correct guesses: " + success);
