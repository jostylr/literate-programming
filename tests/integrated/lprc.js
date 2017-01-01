/*global module, require */
module.exports = function(Folder, args) {

    Folder.plugins.snippets = Folder.merge(Folder.plugins.snippets, 
        {
            scripts : function () {
               var i, n = arguments.length;
               var ret = '';
               for (i=0; i < n; i += 1) {
                ret += '<script src="' + arguments[i] + '.js"></script>';
               }
               return ret;
            }, 
            css : function () {
               var i, n = arguments.length;
               var ret = '';
               for (i=0; i < n; i += 1) {
                ret += '<link href="' + arguments[i] + '.css" rel="stylesheet"></script>';
               }
               return ret;
            }
        });

};
