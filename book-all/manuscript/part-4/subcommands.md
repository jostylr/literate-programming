# Subcommands

Existing in a weird argument world...

## Built-in Subcommands

With command arguments, one can run commands on arguments to get them in some
appropriate form or use, including passing in objects or arrays. You can use
them as `cmd a, subcmd(arg1, arg2, arg3)` would have subcmd acting on the args
and the result of that would be the argument place
 The `a` would be passed into cmd as the first
argument, but anything might get passed into cmd by subcmd's return value. It
could also store an object into a state for configuration. 

There are several built-in subcommands. Note that these are case insensitive. 

* `e` or `echo`  This expects a quote-delimited string to be passed in and
  will strip the quotes. This is useful as the appearance of a quote will mask
  all other mechanics. So `e("a, b and _this")` will produce a literal
  argument of `a, b, and _this`. Multiple arguments will be stripped and
  passed on as multipel arguments.  
* `j` or `join` The first entry is the joiner separator and it joins the rest
  of the arguments. For arrays, they are flattened with the separator as well
  (just one level -- then it gets messy and wrong, probably). 
* `a` or `arr` or `array` This creates an array of the arguments.
* `arguments` or `args` Inverse of array. This expects an array and each
  element becomes a separate argument that the command will see. E.g., `cmd
  arguments(arr(3, 4))` is equivalent to `cmd 3, 4`. This is useful for
  constructing the args elsewhere. In particular, `args(obj(_"returns json of
  an array"))` will result in the array from the subsitution becoming the
  arguments to pass in. 
* `o` or `obj` or `object` This presumes that a JSON stringed object is ready
  to be made into an object.
* `merge` Merge arrays or objects, depending on what is there.
* `kv` or `key-value` This produces an object based on the assumption that a
  `key, value` pairing are the arguments. The key should be text. Multiple
  pairs welcome.  
* `act` This allows one to do `obj, method, args` to apply a method to an
  object with the slot 2 and above being arguments. For example, one could do
  `act( arr(3, 4, 5), slice, 2, 3)` to slice the array to `[5]`.
* `prop` or `property`. This will take the arguments as a property chain to
  extract the value being pointed to. 
* `json` This will convert an object to JSON representation.
* `set` The presumption is that an object is passed in whose key:values should
  be added to the command state.  `gSet` does this in a way that other
  commands in the pipe chain can see it. `set(kv(name, val, ...))` would
  probably be the typical way.  
* `get` This retrieves the value for the given key argument. `gGet` does the
  same for the pipe chain. Multiple keys can be given and each associated
  value will be returned as distinct arguments. 
* `n` or `#` or `number` This converts the argument(s) to numbers, using js
  Number function. `n(1, 2, 3)` will create three arguments of integers. To
  get an array, use `arr(n(1, 2, 3)`
* `eval` will evaluate the argument and use the magic `ret` variable as the
  value to return. This can also see doc (and doc.cmdName) and args has the
  arguments post code.  Recommend using backticks for quoting the eval; it
  will check for that automatically (just backticks, can do echo for the
  others if needed).
* `log` This logs the argument and passes them along as arguments.
* `t` or `true`. This returns the true value.
* `f` or `false`. This returns the false value.
* `null`. This returns the null value. 
* `doc`. This returns the doc variable. This could be useful in connection to
  the property method and the log subcommand.
* `skip`. This returns no arguments. 

To build one's own command, you can attach a function whose arguments will be
the arguments passed in. The `this` is the doc object. The current name (say
for scope storing) is in doc.cmdName. This will point to within a whole pipe
chunk. Pop off the last part (delimited by triple colon) to get to the whole
command scope. The return value will be used as in an argument into the
command or another subcommand. If it is an array and the flag `args` is set to
true, then each entry in the array will be expanded into a set of arguments.
So instead of 1 argument, several could be returned. If nothing is returned,
then no arguments are passed on and it is as if it wasn't there.    

