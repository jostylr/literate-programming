# Semi-literate programming

Here we explain the simplest use of litpro: elevating comments to readable
paragraphs. 

The idea here is quite simple. Write paragraphs for comments. Then use either
indented blocks or code fences to write code blocks. 

Here is a simple example: 

<<(code/part-1/slp/simple.md)

With that text saved in a file, we can run litpro on it and it should produce
the file `teens.js` consisting of 

<<(code/part-1/slp/teens.js)

This uses the save directive which is, at its simplest, `[filename](# "save:")`
where filename is where to save the file. The hash symbol says to use the current section; we'll see later how to reference other sections.
