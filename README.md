literate-programming
====================
Creating a literate programming tool using itself. 
The first step is done. lp1.js is compiles lp1.md to make lp1.js. It will also be used to compile lp2.md.
To use, install node.js and use node lp1.js  lp.1.md   which produces lp1.js  
    
    node lp1.js lp2.md   
will produce lp2.js
    node lp2.js lp2b.md
will produce lp2b.js which will compile lp2b.md to lp2b.js. 
## A bit more
This project aims to get a fully working literate programming environment for the browser. 
One of its targets is to allow for the compiling of scripted writing documents allowing for a simplification of the scripted writing script. See [scripted writing](https://github.com/jostylr/scriptedwriting)
## Levels
lp1: Assemble the code out of order, each section has code that gets assembled into one code block.
lp2: Multiple files, substitutions using  _"My code block"  
lp3: Macros: test, debug, fiddle with parameters, examples. Project stuff?
lp4: In-Browser editor? 
## LICENSE
[MIT-LICENSE](https://github.com/jostylr/literate-programming/blob/master/LICENSE)