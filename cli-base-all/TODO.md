
Most of these are done. New todo: review todo. 

test the command line functions; currently a manual process as need to write
new ones tha are not dynamic. I suppose can test using the echo function. 

preview, diff command mode


readfile, directory, writefile commands for use from a litpro doc.

maybe a built in watcher program, using nodemon?  
command line: read file, readdir, write file, file encodings, curling, 

split http stuff into own module and split testing into own module.

default litpro to project.md. add an option for toggling standard input. If
no project.md and no litpro, exit. 

plugins: jshint, jstidy, jade, markdown,

development versus deployment? Maybe manage it with different lprc files. So
default is development, but then one production ready, switch to lprc-prod.js
which could send to a different build directory. Also minify commands, etc.,
could be available in both, but changed so that in development they are a
passthru noop. 

testing. a module export that gives a nice test function that allows for easy
testing. 

