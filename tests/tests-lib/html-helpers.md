html-helpers - testing html helpers
---
# html

It's a drag sometimes. Here is some help

    _"|echo great | html-wrap div, wow, very, id=jack "

    _"some crazy text | html-escape "

    _"some escaped text | html-unescape "

    _"table | matrixify | html-table arr(name, place), signs, data-grid=tom"

[out](# "save:")

## some crazy text

    5 < x & y > 7

## some escaped text

    A &amp; I is &gt; you can believe. Betch you &lt;&gt;

## table 

    jack, zeke
    jane, sw
---
<div id="jack" class="wow very">great</div>

5 &lt; x &amp; y &gt; 7

A & I is > you can believe. Betch you <>

<table data-grid="tom" class="signs">
<tr><th>name</th><th>place</th></tr>
<tr><td>jack</td><td>zeke</td></tr>
<tr><td>jane</td><td>sw</td></tr>
</table>
