# Configuration

Literate programming is about setting up the work environment to suit your
needs and the needs of those who follow. The tool in this book allows one
great flexibility in the structure of the program and how it gets compiled. 

But it is helpful to have good defaults that are sensible. So here are my
recommendations for setting up a project.

1. The main entry point should be `project.md`. This is the default file the
   program looks for. This is the file that should explain the layout of the
   project and load up the various files that are needed. Ideally, this is
   also where the files to save are saved from.
2. Put other literate programming docs that are called from project.md in the
   `src` directory. This is where the tool automatically looks. If you want an
   alternate source directory, you can command line flag it as `-s <src dir>`.
   One can also put it in the lprc.js file. 
3. The target directory is, by default, `build`. This is a fine target, but
   needs may vary. Again a command line flag is available: `-b <target>`. You
   may want to version control the build directory as well, depending on the
   project. 
4. For files such as lprc.js, .gitignore, and other project management files,
   one should use a separate litpro doc for it. I use `setup.md` in the main
   directory. 
5. Literate programming will export to the console the initial (if untitled)
   section if there are no save directives. My recommendation is to have
   sub-litpro docs export via an initial untitled block. This allows for it to
   be run independently to console to see the output and then to compose more
   easily with the rest of the program. It is possible to export an object as
   well which could be an option if one wants multiple exports.
