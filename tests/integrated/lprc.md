# lprc

This is the lprc file. We also write this in a literate fashion. 

The main task is to load up any extras and the snippets.  

##

    /*global module, require */
    module.exports = function(Folder, args) {

        _"snippets"

    };
    
[lprc.js](# "save: |jshint ")

## snippets

We merge these snippets with the plugin snippets

    Folder.plugins.snippets = Folder.merge(Folder.plugins.snippets, 
        {
            scripts : _":scripts", 
            css : _":css"
        });

[scripts]()

This takes in a string of file names sans js and we should output a script.

    function () {
       var i, n = arguments.length;
       var ret = '';
       for (i=0; i < n; i += 1) {
        ret += '<script src="' + arguments[i] + '.js"></script>';
       }
       return ret;
    }

[css]()

This creates links.

    function () {
       var i, n = arguments.length;
       var ret = '';
       for (i=0; i < n; i += 1) {
        ret += '<link href="' + arguments[i] + '.css" rel="stylesheet"></script>';
       }
       return ret;
    }

