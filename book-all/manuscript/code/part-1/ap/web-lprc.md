# lprc

    module.exports = function (Folder, args) {

        if (args.file.length === 0) {
            args.file = ["web.md"];
        }


        if (!Folder.prototype.local) {
            Folder.prototype.local = {};
        }

        require('litpro-jshint')(Folder, args);

        _':modules'

    };    
 
[lprc.js](# "save:")

[modules]()

    _":pug"

    _":md"



[pug]()    

Pug converts the pug syntax into html. It is mainly used for structures as
opposed to content. `some pug text...|pug`

    var pug = require('pug');

    Folder.sync("pug" , function (code, args) {
        options = args.join(",").trim();
        if (options) {
            options = JSON.parse(options);
        } else {
            options = {'pretty':true};
        }
        return pug.render(code, options); 
    });


[md]()

This uses markdown-it and an add-on of markdown-it-anchor that makes headers
into anchors as on GitHub.  `markdown text...|md`  

    var md = require('markdown-it')({
        html:true,
        linkify:true
    });
    

    Folder.prototype.local.md = md; 

    Folder.sync( "md", function (code, args) {
        return  md.render(code);
    });
