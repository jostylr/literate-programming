# Requires

Here are some utility functions that may be of some general use and reside in
the Folder.requires object. 

### Unique counter

This is a little helper counter that one can use to generate a unique count
for event names. Best to avoid if possible, but this will deal with
non-uniqueness effectively.

`doc.uniq`

    function () {
        var counter = 0;
        return function () {
            return counter += 1;
        };
    }


## Merge

This is modified from yeikos https://github.com/yeikos/js.merge 
with `Copyright 2014 yeikos - MIT license`

This is for relatively simple objects. 

The first two arguments are to determine whether the object should be cloned
and, if so, whether it should be done recursively, that is, whether subitems
should be cloned. 
    
    function (bclone, recursive) {
        var merge_recursive = _":merge recurse";
        var merge = _":top merge";
        if ( typeit(bclone) !== 'boolean' ) {
           return merge(false, false, arguments);
        } else if (typeit(recursive) !== 'boolean') {
            return merge(bclone, false, arguments);
        } else {
            return merge(bclone, recursive, arguments);
        }
    }



[merge recurse]()

	function merge_recursive(base, extend) {

		if ( typeit(base) !== 'object') {
			return extend;
        }
        
        var i, key;
        var keys = Object.keys(extend);
        var n = keys.length;
        for (i = 0; i < n; i += 1) {
            key = keys[i];
			if ( (typeit(base[key]) === 'object') && 
                 (typeit(extend[key]) === 'object') ) {
				base[key] = merge_recursive(base[key], extend[key]);
			} else {
				base[key] = extend[key];
			}
		}
		return base;
	}


[top merge]()

This merges two or more objects, recursively. 

	function merge(bclone, recursive, argv) {

		var result = argv[0];
		var n = argv.length;

        if (bclone || typeit(result) !== 'object') {
			result = {};
        }

        var item, sitem, key, i, type, j, m, keys;
		for ( i=0; i<n ; i+= 1 ) {

			item = argv[i];
		    type = typeit(item);

			if (type !== 'object') {
                continue;
            }

            keys = Object.keys(item);
            m = keys.length;
            for (j=0; j < m; j +=1) {
                key = keys[j];
				sitem = bclone ? clone(item[key]) : item[key];
				if (recursive) {
					result[key] = merge_recursive(result[key], sitem);
				} else {
					result[key] = sitem;
				}
			}
		}
		return result;
	}

### Clone

This is a recursive clone of the object. 

    function clone (input) {
		var output = input;
		var	type = typeit(input);
		var	i, n, keys;
		if (type === 'array') {
			output = [];
			n = input.length;
			for ( i=0 ; i < n; i+=1 ) {
			    output[i] = clone(input[i]);
            }
		} else if (type === 'object') {
			output = {};
            keys = Object.keys(input);
            n = keys.length;
            for ( i=0; i <n; i+=1) {
				output[keys[i]] = clone(input[keys[i]]);
            }
		}
		return output;
	}

## Typeit

Mainly because of array typeof being object and null type. If a second
argument is given, then it is compared to the type and returns a boolean.
Otherwise, the type is returned. 
    
    function (input, test) {
  
        var type = ({}).toString.call(input);
      
        if (type === '[object Object]') {
          type = 'object';
        } else if (type === '[object Array]') {
          type = 'array';
        } else if (type === '[object String]') {
          type = 'string';
        } else if (type === '[object Number]') {
          type = 'number';
        } else if (type === '[object Function]') {
          type = 'function';
        } else if (type === '[object Null]') {
          type = 'null';
        } else if (type === '[object Bolean]') {
            type = 'boolean';
        } else if (type === '[object Date]') {
            type = 'date';
        } else if  (type === '[object RegExp]') {
            type = 'regexp';
        } else {
            type = 'undefined';
        }
        if (test) {
            if (test[0] === '!') {
                return type !== test.slice(1);
            } else {
                return (type === test);
            }
        } else {
            return type;
        }
    }
