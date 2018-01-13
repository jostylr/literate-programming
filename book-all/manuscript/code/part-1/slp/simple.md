# Saying Hi

We want to write a little javascript command that says hi, waits one second,
and then says bye. We will save it in [teens.js](# "save:")

Greetings are great, right?

    console.log("hi");

Timer is in milliseconds, so 1000. We'll call the function `bye` defined
elsewhere

    setTimeout(bye, 1000);

And now let's define the bye function. For no apparent reason, we use a named
fence block. Hey, maybe we'll get some syntax highlighting!

```js
function bye () {
    console.log("bye");
}
```

Hey, we're all done!
