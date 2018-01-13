# JSTidy option

So this is inspired from an issue and is good to have a stand-alone plugin
test. 

The goal is to get code formatted well. 

* [jstidytest.js](# "save:original|jstidy")


[original](# )

    var newDomNodes = domNodes.enter()
      .insert('g', '.root')
      .attr('class', function (node) {
    var classes = ['node', 'enter'];
      node.root && classes.push('root');
      return classes.join(' ');
    })
      .attr('id', function (node) {
      return node.id;
    });

