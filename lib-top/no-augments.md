This is a brief note about the change of dropping the augment story. The
augments were there as a way to keep the footprint of commands small and
because arrays are not easily subclassed. 

By adding in a few commands, I intend to eliminate the augments. They were
cumbersome and rather a distraction, particularly as the augmentation had to
be kept track of and the properties would pollute the scope. 

Here is how all the features were replaced.

The key function is `mapc command`. This maps a command over an array or object
values. The shorthand notation is `*command`.  

Minidoc replacements:

* `minidoc` with `minors`
* `.compile` with `templating` though with the actual compile block, not the
  name, as first arg. For compositions, to use the name, one can do something
  like `->$1 | get template-name | ->$2 | $1-> | templating $2`. May want to
  look into allowing templating to choose or a smoother mechanism for storage,
  something like `get template-name -> $2`with the prevailing input just going
  along. 
* `.store blockname` replaced with `*store blockname:*KEY*` or `*store
  blockname, *KEY*`
* `.clear` same as store
* `.apply key, cmd, args` replaced with `apply`
* `.clone` with `clone`
* `.get` with `pget`
* `.set with `pset`
* `.keys` with ``forin fun(` (val, key) => return key`)``
* `.toString sep, valsep, fkey, fval` with ``forin fun(`(val, key, ret) => return
  fkey(key) + sep + fval(val) +  valsep`), ''``
* `.toJSON` with `toJSON`  Also added in `fromJSON`
* `.forin` with `forin`


Array replacements:

* `.trim` with `*trim`  
* `.splitsep` with `*.split \n---\n`
* `.mapc` with `mapc`
* `.pluck` `*pget`
* `.put` with `forin fun(`(val, key, init, input) => input[key] = init[key];
  return key;`), object/array whose keys match with values wanted`
* `.get` with `pget`
* `.set` with `pset`
* 
