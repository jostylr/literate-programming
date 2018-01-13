# Full HTML

Here we are building an HTML page. We will use a
[widget](load2.md "load:") that comes from another literate program. 

    <html>
        <head>
            _"widget::files link"
        </head>
        <body>
            <h2> Widgets for everybody!</h2>
            _"sp-load2.md::html:top"
            <p> snuck something in! </p>
            _"widget::html:bottom"
        </body>
    </html>

[full.html](# "save:")
