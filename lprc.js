/*global module, require */
module.exports = function(Folder, args) {

    if (args.file.length === 0) {
        args.file = ["project.md"];
    }

    require('litpro-jshint')(Folder, args);

};
