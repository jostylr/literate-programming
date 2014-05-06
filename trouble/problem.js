site_url : "http://mord.jostylr.com",
author : "Mord Drom of Drok",
managingEditor : "Janord Drom",
webMaster : "James Taylor",
language : "en",
categories : ["fantasy"],
pubDate : now.toString(),
ttl: '1440',
copyright : now.getFullYear() + " James Taylor"
var feedNew = new RSS({
    title: "Mord",
    description : "I am Mord. I serve my lord Kord with my greatsword.",
    feed_url : "http://mord.jostylr.com/rss.xml",
    
});

var rssUpdate = new RSS ({
    site_url : "http://mord.jostylr.com",
    author : "Mord Drom of Drok",
    managingEditor : "Janord Drom",
    webMaster : "James Taylor",
    language : "en",
    categories : ["fantasy"],
    pubDate : now.toString(),
    ttl: '1440',
    copyright : now.getFullYear() + " James Taylor"
    title: "Mord Update",
    description : "I am Mord. I serve my lord Kord with my greatsword. Misspeak I do.",
    feed_url : "http://mord.jostylr.com/rssupdate.xml", 
});

var news, udates;
try {
     news = read("rssnew.txt", "utf8") ;
} catch (e) {
    news = [];
}
try {
    updates = read("rssupdates.txt", "utf8") ;
} catch (e) {
    updates = [];
}