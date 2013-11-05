// Cinnamon.js
// Version: 1.0.0
// Author: Thomas Park
// License: MIT

(function () {

    // Alternate styles for Safari
    if ((navigator.userAgent.indexOf('Safari') !== -1 ) && ( navigator.userAgent.indexOf('Chrome') === -1)) {
        var css = ".cinnamon { overflow: visible; font-size: inherit;  }";
    
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        
        style.type = 'text/css';
        
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        
        head.appendChild(style);
    }

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
})();