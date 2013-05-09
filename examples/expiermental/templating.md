# Templating

The idea is that we want to write something which gets used over and over again. This is a common pattern. 

## Brackets

A common templating covnention is double brackets we will use that. Perhaps we will use handlebars

    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>{{title}}</title>
        </head>
        <body>
        {{body}}
        {{scripts}}
        </body>
    </html>

## File usage

We could then invoke this with 

FILE "First page" first.html | hbar(brackets)

That is, we use the template function taking the template from the parenthetical, parsing it as a name of a section. The context for the template is the text being fed in from the pipe

## First page

This first page is a bunch of content in a context that gets filled in

JSON

    {
        title : "Great",
        body : _":some content",
        scripts : SCRIPT(jQuery, d3, canvg, "http://great.com/zooks.js") 
    }

MD  some content | marked

    I once was a mathematician

    But then I became a programmer

    How could that be

    How not

As for the SCRIPT macro, that should output the script tags for each of them with src and whatever. Maybe there can be a config file the lit pro loads to get a bunch of these things predefined? Start with the global and then descend down into the project and maybe have a directive like CONFIG jquery http://link to file. 

## Named sub

We can use hbar(brackets, varname)  to replace varname with the piped content.


