# Testing

So each code snippet that is included should be tested and generated. 

All code is under the manuscript/code/...

Each part of the book has its own directory under the code though it can be broken up further if one wishes. 

Inside that first directory is a manifest.txt file

Its first line should be `default: ...`  where the `...` is replaced with whatever argument flags are to be applied generically. 

The following lines are either directories, litpro documents to compile or the results of such compilation (indented lines). 

	dir
    	litpro doc : arguments
        	output 1
            output 2
            
            
So we have a directory which becomes the root. Then it compile the litpro doc with either the provided arguments after the colon (if there is a colon) or with the default.             

The testing tool goes through each one and checks the outputs compared to the ones in done. If there are none in done, it saves them and outputs the creation. If they have the outputs have the same checksum, they are considered identical and the tests pass. If not, then it produces a failed test. 
