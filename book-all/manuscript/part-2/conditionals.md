# Conditionals

We can set flags for which environment is being run and this can cause
different things to happen. One example might be production versus
development, but that case might be better handled by simply compiling two
versions every time with the output going to two separate places. 

The example we will explore here, a real example, is that of a website which
needs some information occasionally displayed. The website in our example is a
school's website that needs to display closing information in the event of
inclement weather. As some pages have different setups, the exact placement of
the announcement varies. Command line flags allow for convenient toggling of
the announcements. 

## Flags

The two command line flags we will focus on here are the `-f` and `-z` flags.
The `-f` flag is for setting the name that follows to true. So `-f closed`
would set the boolean variable `closed` to `false`. 

The other flag, `-z`, is a generic flag for passing in information. The term
that follows should be of the form `varname:value` and the program will store
the value into the variable name. In particular, one can extract that variable
from the `Folder.inputs.varname` variable which is what is done in the
`:custom` section piped into the `evil` command. 

But there is a better way, implemented after this bit of code. Namely, the `z`
command:  `z msg`  does the same.

## Conditional Syntax

We have several conditional related syntax. 

There is the `if` command which takes in a flag name, a command with
arguments, and executes that command if the flag is true. This is what we use
below. 

There is also an `if` directive which basically does the same; the directive
executes if the flag is present. We can also use a flag directive to set
flags. 


## Full Example

Here is the actual relevant snippet from the school website generating
literate program:

    ## Status

    We have some command line flags for operating announcements or other options. 

    Flag c  denotes being closed

    Flag l means liberal leave

    Flag o is for open (but questionable)

    Flag z  is a custom flag and looks for the announcement in the
    msg variable: `-z msg:...`. 

    Example: `literate-programming -f l -f z -z "msg:Two hour delay; opening at 10AM";`


    The flags are cumulative. 

        _"  |  if c, cat, _":closing | html-wrap p, danger" 
            |  if l, cat, _":liberal |  html-wrap p, warning "
            |  if o, cat, _":open | html-wrap p, okay "
            |  if z, cat, _":custom | evil | html-wrap p, custom" "
        
    [closing]()

        WE ARE CLOSED.


    [liberal]()

        We are on liberal leave today. Please notify us if you are not attending.

    [open]()

        We are open today. 

    [custom]()

        ret = doc.Folder.inputs.msg +'';

    [css]()

        .danger, .warning, .okay, .custom {
            padding-top:5px;
            padding-bottom:3px;
            text-align:center;
        }
        .danger  { background-color: red; }
        .warning  { background-color: yellow; color:black; }
        .okay  { background-color: green;color:whitesmoke;}
        .custom { background-color:blue; color:whitesmoke;}


    [big]()

        This for the homepage in which the announcement text is in h4 size.

        _"status | sub <p, <h4, </p, </h4"

This gets referenced in different ways. For the sidebar present in many of the
pages, the block `_status` is inserted in the sidebar announcement html. If
no flags are present, then `_status` will simply be empt. 

The big announcement block is inserted into the home page's content which
happens to be in markdown, but that is not a problem as html gets ignored in
the conversion. 

For the calendar page, however, it gets generated in a way which is hard to
put it in before compiling. So we add it afterwards as part of the save
command: ` "save: | cheerio article, prepend, _'status:big' ") ` which says to
put at the top of the `article` element the announcement. 


## Multiple Compiles
