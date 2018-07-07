let commonmark = require('commonmark');


let text = '[*lib*::*`ind*ex*.js`>index<&' + "'" + '"](~#$%^&-* "this:more|asdf|")';

text += '\n```js\ncool\n\nwow\n```';

let lines = text.split('\n');


console.log(lines.length, lines);


let reader = new commonmark.Parser();
let parsed = reader.parse(text); 

let walker = parsed.walker();

let ltext = false, lcode;

while (event = walker.next()) {
    let node = event.node;
    if (node.type === 'link') {
        if (event.entering) {
            ltext = [];
            lcode = true;
        } else {
            console.log(ltext.join(''), decodeURI(node.destination), node.title, lcode);
        }
    }
    if ( (node.type === 'text' ) && ltext) {
        ltext.push(node.literal);
        if (node.literal === "'") {
            console.log('saw quote', ltext);
        }
    }
    if (node.type === 'code') {
        lcode = node.literal;
    }

    console.log(event.entering, node.type, node.sourcepos, node.literal);
}


