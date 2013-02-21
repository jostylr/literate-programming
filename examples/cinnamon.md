# Cinnamon

This is a literate program version of what was once found at https://github.com/thomaspark/cinnamon.js  It does not reflect the current state and is just another example.

The goal wass to add synonyms to the text for Ctrl+F purposes.

There are two versions. One is for loading a single file that handles both CSS and JavaScript. 

## Files 

FILE "One file" cinnamon.js  | jshint

And then there is the more mebeddable, separated version. 

FILE "Making it hidden.css" cinnamon.css

FILE "Embedded" cinnamon_emb.js  | jshint

And the example file, 

FILE "A sample document" cinnamon.html 

## One file

    // Cinnamon.js
    // Version: 1.0.0
    // Author: Thomas Park
    // License: MIT

    (function () {

        _"For single file"

        _"Adding the synonyms"
    })();


## Embedded

Here we have the CSS separate. 

    // Cinnamon.js
    // Version: 1.0.0
    // Author: Thomas Park
    // License: MIT

    (function () {

        _"Dealing with Safari"

        _"Adding the synonyms"
    })();




## Adding the synonyms

Grab the elements with data-cinnamon. Looping over those, we get the synonyms by splitting on commas and then add in span elements with the words. 

Note that this should be at the end of the body so that it has all the elements to work with. 

    // Add elements
    var cinnamons = document.querySelectorAll('[data-cinnamon]');

    for (var i = 0; i < cinnamons.length; i++) {

        var cinnamon = cinnamons[i],
            synonyms = cinnamon.getAttribute('data-cinnamon').split(','),
            image = cinnamon.getElementsByTagName('img')[0];

        if (image && image.getAttribute('alt')) {
            synonyms.push(image.getAttribute('alt'));
        }

        for (var j = 0; j < synonyms.length; j++) {
            var e = document.createElement('span');
            e.className = 'cinnamon';

            // IE8 doesn't support textContent
            if ((e.textContent) && (typeof (e.textContent) !== "undefined")) {
                e.textContent = synonyms[j];
            } else {
                e.innerText = synonyms[j];
            }

            cinnamon.appendChild(e);
        }
    }


## Making it hidden

HTML
    
    <style>
        _":CSS"
    </style>

CSS

    [data-cinnamon] { 
        position: relative; 
        display: inline-block; 
    } 
    .cinnamon { 
        z-index: -1; 
        position: absolute; 
        top: 0; left: 0; 
        display: inline-block; 
        height: 100%; 
        width: 100%; 
        color: rgba(0,0,0,0); 
        _":Default over font"
    }
    @media all and (device-width: 768px) and (device-height: 1024px) {
        .cinnamon { 
            z-index: 1; 
            opacity: 0.25; } 
    }

CSS  Default over font

    overflow: hidden; font-size: 999px; 

CSS Safari over font

    overflow: visible; font-size: inherit; 

CSS Dealing with Safari

Safari has some issues so we need to do some replacing in that case. 

    // Alternate styles for Safari
    if ((navigator.userAgent.indexOf('Safari') !== -1 ) && ( navigator.userAgent.indexOf('Chrome') === -1)) {
        css.replace('_":default over font"', '_":Safari over font"' );        
    }



### For single file

This is for attaching the style. 
    
    // Add styles
    var overflow = 'hidden',
        fontsize = '999px';

    var  css = _"Making it hidden | stringify()";

    _"Making it hidden : Dealing with Safari"

    _"Adding CSS"


## Dealing with Safari

    // Alternate styles for Safari
    if ((navigator.userAgent.indexOf('Safari') !== -1 ) && ( navigator.userAgent.indexOf('Chrome') === -1)) {
        var css = ".cinnamon { _"Making it hidden : safari over font" }";

        _"Adding CSS"
    }

## Adding CSS

This is how we add CSS stylistically. 

    var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    
    style.type = 'text/css';

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);


## A sample document

    <!DOCTYPE html>
    <html>
      <head>
        <title>Cinnamon.js</title>
        _"Making it hidden:.html"
      </head>
      <body style="padding: 20px 200px 200px;">
        <h1>Cinnamon.js</h1>

        <p>A visitor to your site wants to follow your Twitter account. You have a link to it in your footer, but their search for "Twitter" comes up empty and they move on &mdash; unfortunately, you happened to name the link "@username" instead.</p>

        <p>Cinnamon.js is a script that allows users to find elements by their synonyms, using the browser's built-in Find feature. To see it in action, search this page for "Twitter", "Spice", "Email" or "Contact".</p>

        <blockquote>

          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque cursus orci ut mi laoreet rhoncus. Pellentesque congue urna tincidunt tortor rhoncus dapibus. Duis faucibus dolor a sem ultrices at facilisis risus cursus. Cras vel euismod nisl. Ut vitae risus et libero sagittis ultrices et vitae ligula. Aliquam at turpis id diam placerat consequat at vitae est. Aenean tellus magna, lacinia vitae facilisis facilisis, egestas ut sapien. Follow me at <a href="http://twitter.com/thomashpark" data-cinnamon="Twitter">@thomashpark</a>. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec tincidunt dapibus dui luctus rhoncus. Nam sagittis egestas blandit. Nulla imperdiet tincidunt enim, a tempus sapien volutpat a. Maecenas sed elit ipsum, ut tristique odio. Suspendisse potenti.</p>

          <p><span data-cinnamon="Spice"><img src="http://farm4.staticflickr.com/3039/2660995478_fa23f10c6e.jpg" alt="Cinnamon"></span><br>Photo by <a href="http://www.flickr.com/photos/27369469@N08/2660995478/">kobiz7</a></p>

          <p>Etiam et elit enim, quis semper metus. Nunc sodales posuere turpis, viverra vestibulum lectus vehicula sed. Nulla quis augue nec nibh varius pharetra adipiscing non felis. Etiam lobortis vestibulum luctus. Cras non felis enim, id gravida libero. Vivamus vulputate nisi at tellus pulvinar faucibus sodales mi feugiat. <span data-cinnamon="Email,Contact">Reach</span> me <a href="mailto:hello@thomaspark.me">here</a>. Proin id est ut quam dictum venenatis ac non risus. Ut porttitor mattis odio vel elementum. Aliquam molestie lorem nec diam pharetra et malesuada diam condimentum. Cras feugiat pulvinar sollicitudin. Etiam id diam fermentum quam varius laoreet. Quisque nibh nunc, ullamcorper et bibendum at, ultrices et lorem. Cras vitae euismod felis. Donec lectus libero, ornare eget luctus nec, dictum et sapien. Proin viverra justo ac augue pellentesque aliquet.</p>

        </blockquote>

        <p>To add to your page, include <a href="cinnamon.js">cinnamon.js</a>. Then wrap your element of choice (such as in <code>span</code> tags) and give the <code>data-cinnamon</code> attribute a comma-separated list of terms. For example, <code>&lt;span data-cinnamon="azure,cerulean,cobalt"&gt;<span data-cinnamon="azure,cerulean,cobalt">blue</span>&lt;/span&gt;</code>. If you wrap an image, its alt text will also be used, as in the example above.</p>

        <!-- <p>Should you use this? Probably not. It's not great for SEO (though the synonyms added by JavaScript aren't seen by crawler, Google frowns on hidden text and might penalize you for it). As far as accessiblility, it adds noise for screen readers. Copying and pasting also has unwelcome additions. But it's there if you want to use it.</p> -->


        <script>_"Embedded"</script>
      </body>
    </html>