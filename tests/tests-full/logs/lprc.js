/*global module, require */
module.exports = function(Folder, args) {

    Folder.requires.merge(Folder.plugins.snippets, {
        jquery : '<script type="text/javascript"' + 
            'src="https://ajax.googleapis.com/ajax/libs/jquery/' + 
            'ARG0||1.9.0|/jquery.min.js"></script>', 
        geogebra: "http://geogebra.org",
        mathjax : '<script type="text/x-mathjax-config">' +
            'MathJax.Hub.Config({'+
            'extensions: ["tex2jax.js"],'+
            'jax: ["input/TeX", "output/HTML-CSS"],'+
            'tex2jax: {'+
            'inlineMath: [ [\'$\',\'$\'], ["\\(","\\)"] ],'+
            '  displayMath: [ [\'$$\',\'$$\'], ["\\[","\\]"] ],'+
            '  processEscapes: true'+
            '},'+
            '"HTML-CSS": { availableFonts: ["TeX"] }, '+
            'TeX: {'+
            'Macros: {'+
            '  R: "{\\mathbb{R}}",'+
            '  C: "{\\mathbb{C}}"    }'+
            '}'+
            '}); '+
            '</script><script type="text/javascript" ' +
            'src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?' +
            'config=TeX-AMS-MML_HTMLorMML"> </script> ',
        bootswatch : '<link rel="stylesheet" href="http://bootswatch.com/' +
            'ARG0||journal|/bootstrap.min.css">',
        katex : '<link rel="stylesheet" ' + 
        'href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' +
        '0.6.0/katex.min.css">' +
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' +
        '0.6.0/katex.min.js"></script>'+
        '<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' + 
        '0.6.0/contrib/auto-render.min.js"></script>',
        'katex-body' : '<script>renderMathInElement(document.body);</script>',
        'katex-style': '<link rel="stylesheet" ' + 
        'href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/' +
        '0.6.0/katex.min.css">'

    });

    var mdp = Folder.plugins.md;

    // we replace def because we want to anchorify all. 
    mdp.old = mdp.def;
    mdp.def = mdp.req(mdp.options).
            use(require('markdown-it-anchor', {renderPermalink:true}));
    

};


