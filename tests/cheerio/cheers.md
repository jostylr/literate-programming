# Testing cheerio

    <ul class="great">
      <li> great</li>
    </ul>
    <div id="geese"></div>
    <div class="right"></div>
    <div class="right"></div>
    

[out.html](# "save: | cheerio .great, append, <li>awesome</li> |
    ch-replace #geese, <p></p>, .right, <span></span> ")


## Failure

    _"testing cheerio| cheerio .great, replace, <p>hi</p> "


