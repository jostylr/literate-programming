# Fencing

So this is an example of code fencing a literate program. 

##  Files

Just one file, [fence.txt](#fence "save:")

## Fence

Here we start. 

```
some code here.
_"section a"
_"section b"
_":footer"
```


[footer]()

```js
for (i = 0; i < n; i += 1) {
    if (code) {
        return yay;
    }
}
```

### Section a

Let's make a list with some code. 

* This is great.
* Not so great.

    ```html
    <p>We got code.</p>
    <ul>
        <li>just me</li>
    </ul>
    ```
### section b

This is a choppy section

   ```
 This is a code block
    code fence not matched ```
``` 

 something ```
 this is in line code
    code fence matched ```



There be slicing and there be shifted boundaries. Need the ending code fence
on its own line. 




