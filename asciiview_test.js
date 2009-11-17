/**
 * @fileoverview AsciiView Unit Tests. See the Injectigator Unit Tests for
 * information on how to run the tests.
 *
 * @author ibolmo@gmail.com (Olmo Maldonado)
 */


(function() {

function node(name, next, opt_opts) {
  opt_opts = opt_opts || {};
  var enode = {
    curry: { $name: name },
    elapsed: opt_opts.elapsed || 0,
    next: next
  };
  if (opt_opts.delayed) {
    enode.curry.$delayed = true;
  }
  if (opt_opts.periodical) {
    enode.curry.$periodical = true;
  }
  return enode;
}

TestCase('AsciiView', {

  setUp: function(){
    this.view = new Injectigator.AsciiView();
    this.symbols = Injectigator.AsciiView.SymbolType;
  },

  testParseNodeEmpty: function(){
    this.view.parseNode({});
    assertEquals('', this.view.toString());
  },

  testParseNodeSiblings: function() {
    var tree = {first: node(undefined, node('1', node('2'), {elapsed: 10}))};
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' anon, 0 ms',
      this.symbols.NODE + ' 1, 10 ms',
      this.symbols.NODE + ' 2, 0 ms'
    ].join('\n');
    this.view.parseNode(tree);
    assertEquals(expected, this.view.toString());
  },

  testParseNodeDelayedSibling: function() {
    var tree = {
      first: node(undefined,
               node('delayed',
                 node('2'), {delayed: true, elapsed: 10}))};
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' anon, 0 ms',
      this.symbols.DELAYED + ' delayed, 10 ms',
      this.symbols.NODE + ' 2, 0 ms'
    ].join('\n');
    this.view.parseNode(tree);
    assertEquals(expected, this.view.toString());
  },

  testParseNodePeriodicalSibling: function() {
    var tree = {
      first: node(undefined,
               node('periodical',
                 node('2'), {periodical: true, elapsed: 10}))};
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' anon, 0 ms',
      this.symbols.PERIODICAL + ' periodical, 10 ms',
      this.symbols.NODE + ' 2, 0 ms'
    ].join('\n');
    this.view.parseNode(tree);
    assertEquals(expected, this.view.toString());
  },

  testParseNodeChildren: function() {
    var root = {};
    root.first = node('parent', node('sibling'));
    root.first.first = node('1st', node('2nd'));
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' parent, 0 ms ' + this.symbols.START,
      '               ' + this.symbols.NODE + ' 1st, 0 ms',
      '               ' + this.symbols.NODE + ' 2nd, 0 ms',
      this.symbols.NODE + ' sibling, 0 ms',
    ].join('\n');
    this.view.parseNode(root);
    assertEquals(expected, this.view.toString());
  },

  testParseNodeNestedChildren: function() {
    var root = {};
    root.first = node('parent', node('sibling'));
    var second = node('2nd', node('3rd'));
    root.first.first = node('1st', second);
    second.first = node('a', node('b'));
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' parent, 0 ms ' + this.symbols.START,
      '               ' + this.symbols.NODE + ' 1st, 0 ms',
      '               ' + this.symbols.NODE + ' 2nd, 0 ms ' + this.symbols.START,
      '                           ' + this.symbols.NODE + ' a, 0 ms',
      '                           ' + this.symbols.NODE + ' b, 0 ms',
      '               ' + this.symbols.NODE + ' 3rd, 0 ms',
      this.symbols.NODE + ' sibling, 0 ms'
    ].join('\n');
    this.view.parseNode(root);
    assertEquals(expected, this.view.toString());
  }

});

})();
