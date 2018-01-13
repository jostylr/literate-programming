module.exports = function(Folder, args) {

    if (args.file.length === 0) {
        args.file = ["lp.md"];
    }
     args.build = ".";
     args.src = ".";

    //require('litpro-jshint')(Folder, args);

};
