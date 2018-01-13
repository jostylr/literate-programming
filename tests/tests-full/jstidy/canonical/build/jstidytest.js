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
