# Widget

Here we define a widget. This widget will be amazing!

We will save two files from here 

* [widget.js](#js "save:")
* [widget.css](#css-for-widget "save:")

## Files link

This is the loading tags for our pages

    <link rel="stylesheet" href="widget.css" />
    <script src="widget.js"></script>

## HTML

Here we put the html for our widget. We have a top and a bottom. The top
contains the div and a heading.  The minor block syntax can be either of the
below. 

[top]()

    <div class="widget">
        <h2>Click a button</h2>

[bottom](# ":")

    <button>Awesome!</button>
    </div>

## JS

When the button is clicked, we add the big class to the h2 element in the
widget 

    document.addEventListener("DOMContentLoaded", function () {
        _":add click"
    });
   
[add click]()

Here we add a click listener to the button. It should add a class to make the
text big and then one second later remove it.

    var button = document.querySelector(".widget button");
    var h2 = document.querySelector(".widget h2").classList;
    button.addEventListener("click", function () {
        h2.add("big");
        setTimeout(_":remove class", 1000);
    });

[remove class]()

This removes the big class

    function () {
        h2.remove("big");
    }

## CSS for widget

We want the h2 to have a red background!

    .widget h2 {
        background-color : red;
    }

    .big {
        font-size: 5em;
    }
