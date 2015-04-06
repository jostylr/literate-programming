module.exports = function(Folder, args) {

    if (args.file.length === 0) {
        args.file = ["lp.md"];
    }
    args.build = ".";
    args.src = ".";

    require('litpro-jshint')(Folder, args); 

    Folder.directives.version = function (args) {
        var doc = this;
        var colon = doc.colon;

        var ind = args.input.indexOf(";");

        doc.store(colon.escape("g::docname"), 
            args.link.trim());
        doc.store(colon.escape("g::docversion"),
            args.input.slice(0, ind).trim());
        doc.store(colon.escape("g::tagline"), 
            (args.input.slice(ind+1).trim() || "Tagline needed" ) );

    };
};
