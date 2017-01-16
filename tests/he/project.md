This does some html encoding and decoding. 

    _"text | html-encode"

    _"encoded | html-decode"

    _"normal | html-qescape"

    _"normal | html-qescape | html-unescape"

    _"normal | html-qescape | html-decode"

    _"normal | html-escape"
    
    _"normal | html-escape | html-unescape"
    

[out.txt](# "save:")

## Text

    foo © bar ≠ baz α qux 

## encoded

    foo &copy; bar &ne; baz &#x1D306; qux

## normal

    <p dude="right">Hey &ne; there.</p>

