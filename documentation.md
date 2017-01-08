* **jshint** This takes the input and runs it through JSHint. The command
  is of the form 
  `js stuff | jshint options, globals, shortname, print clean`. 
  
  * The options is an object that corresponds to the [options that JShint
  accepts](http://jshint.com/docs/options/); you can use a subcommand to
  create the options object if you like.  Default is unused:true, else is
  their defaults. 
  * Globals is an array of global
  names; if they can be written over, pass in `name:true` instead of
  `name`. 
  * Shortname is the shortname to present in understanding what is being
    jshinted. Otherwise, it does its best to give you a cryptic but
    informative name. 
  * If the fourth argument is a boolean, `t()` or `f()` will do it,  then
    that toggles whether to print the message that it all went smoothly or
    not, respectively. The default is to not print it.
  * You can override the defaults repeatedly by modifying the
    `Folder.plugins.jshint` object with the names: `options`, `globals`, and
    `clean`.  
* **md** This takes the input as markdown and puts out html. The first
  argument is an optional string naming the renderer to use. The other
  arguments should be booleans, namely, `f()`, if one does not want
  preprocessing/post to occur. The default preprocessors, in order, are
  literate programming subs and math subs rendering to katex. 
  
  To create a renderer, you can use Folder.plugins.md.req as the markdoan
  object and then render it per the instructions (an options object
  `req(options).use(...)`. This is all best done in the lprc.js file.
  Store the rendered under the preferred name in plugins.md.
 
  See the logs test directory and its lprc.js. 
* **cheerio** This gives access to the cheerio module, a lightweight node
  version of jQuery-esque without the overhead of jsdom. It can't do
  everything, but it does most things: 
  [cheeriojs](https://github.com/cheeriojs/cheerio). To use, the incoming
  text is the html doc to modify, the first argument is the selector, the
  second the method, and then the arguments to the method, e.g., 
  `somehtml | cheerio h2.title, .text, Hello there!`
* **ch-replace** This is a convenience method for cheerio. This will use
  the first argument as a selector and the second argument as a
  html replacement. 
* **postcss** This takes incoming text and runs it through postcss. To do
  something useful, you need to have the arguments be the commands to use.
  At the moment, the only one shipping with this is autoprefixer, but
  others are likely to be added (minimizers and fixers, in particular).
  You can add them yourself by, in lprcs.js, saying (installing cssnano as
  example)
  `Folder.plugins.postcss[cssnano] = require('cssnano');` and ensuring
  that the cssnano module is installed in npm. 
* **tidy** This uses [js-beautify](https://www.npmjs.com/package/js-beautify)
The first argument is the type:  js, css, or html. The second argument are
options that get merged with the defaults. The js has a default of
`indent_size` of 4 and `jslint_happy` true. An unrecognized first argument
(or none) will default to js. 
* **minify** The first argument says the type of minifier: js, css, and
  html. js is the default if the first argument is not realized. The
  second argument is an object of options that get passed in. This uses
  uglify-js, clean-css, and 
  [html-minifier](https://www.npmjs.com/package/html-minifier), 
  respectively. For css, the
  second argument can be a boolean indicating whether to pass on the
  results object (if true, `t()` ) or just the css output text (default). 
