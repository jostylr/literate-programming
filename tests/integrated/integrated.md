# A combo page

This should highlight the various technologies. 

So we will create a html structure with pug as the bones and md as the
content, using subbing and cheerio to do the substitutions. 

For css, we'll use postcss, autoprefixer, and cssfuture to make a snazzy css
file. Maybe a css linter?

For js, we'll simply jshint it. We'll have two files. 

After all that, we'll save the files in one directory in a tidy fashion. This
would be for developmet. 

In the other directory, we'll have the minified files. 

All the source code will be here. We will keep it short. 

## Files

* [dev/](# "cd: save")
* [index.html](#boilerplate "save: | pug | 
    compile content |
    ch-replace #scripts, _'|s scripts, main, side', 
        #css, _'|s css, main' |
    cheerio #quote, html, _'witticism|md'  |
    tidy html, kv(indent_size, 6)") 
* [main.js](#core-js "rave: ")
* [side.js](#side-js "rave:")
* [main.css](#css "rave:")
* [prod/](# "cd: save")
* [index.html](#boilerplate "save: | pug | compile content |
      ch-replace #scripts, _'|s scripts, all', 
        #css, _'|s css, main' | 
    cheerio #quote, html, _'witticism|md' |
    minify html, kv(removeComments, t(), 
        collapseWhitespace, t())")  
* [all.js](#core-js "rave: | join \n, _'side js' ")
* [main.css](#css "rave:")
* [](# "cd: save")

# boilerplate

    html
        head
            title \_`:title`
            #css
        body
            // main then quote then scripts
            main \_`:main`
            #quote
            #scripts


## Content

This goes the content of the page

[title]()

    Great Writing

[main]() 

    Some more *blathering* 


# witticism

    A bird in the hand is worth more than two in the bush. 
   



