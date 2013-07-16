# Templating

The idea is that we want to write something which gets used over and over again. This is a common pattern. 

We want to implement various scenarios. One is to have subcblocks that can be used to fill in the template. Another is to have a list of items that get wrapped. The third is to allow for smart insertion somehow. Let's try to figure this stuff out. 

We will use the new syntax that is coming. 

## Boilerplate

We use asterisks in the usual litpro quotes. 

    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>_"*:title"</title>
        </head>
        <body>
        <h1>_"*:title"</h1>
        _"*:body"
        _"*:scripts"
        </body>
    </html>

## File usage

We could then invoke this with 

[first.html](#First-page "Save: *boilerplate")

We look at the section first-page and pull out the relevant subsections. This is hard to accomplish at the moment as the feeder evaluates this stuff first. But probably it can get access to the cblocks. 

## First page

This first page is a bunch of content in a context that gets filled in

[title](# "js | jshint")

    Great Smokey Mountains

[body](# ".md | marked")

    These are the great and magnificent mountains.

    _":history"

[scripts](# )

    SCRIPT(jQuery,d3,canvg,http://great.com/zooks.js)
    _"scriptxt | wrap(script)"



[history](# )

    The mountains rose from the ground over so many years...
    
## Script and wrap

The SCRIPT macro would take in various comma-delimited texts and put them in the usual script format. 

The wrap will wrap the given content into an HTML script tag. This already exists, I believe. 

## BS Snippets

    <div class="row-fluid">
        <div class="span8">
            <div id="_"*:name"" _"*:attr">
                _"*:main"
            </div>
        </div>
        <div class="span4">
            <div id="_"*:name"Nav" _"*:attrNav">
                _"*:side"
            </div>
        </div>
    </div>

It is okay not to have it; then it is just a blank. 


## Example snippet

Some nice stuff

[name](# ) 

    Scratch

[main](# )

    yadda yadda 

[side](# )

    more yadda yadda but with sliders

[script](# )

    somejavascript


### Body

    _"Example Snippet*bs snippets"
