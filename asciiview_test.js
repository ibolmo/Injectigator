/**
 * @fileoverview AsciiView Unit Tests. See the Injectigator Unit Tests for
 * information on how to run the tests.
 *
 * @author ibolmo@gmail.com (Olmo Maldonado)
 */


(function() {

function node(name, elapsed, next) {
  return {
    curry: { $name: name },
    elapsed: elapsed,
    next: next
  };
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
    var tree = {first: node(undefined, 0, node('1', 10, node('2', 0)))};
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' anon, 0 ms',
      this.symbols.NODE + ' 1, 10 ms',
      this.symbols.NODE + ' 2, 0 ms'
    ].join('\n');
    this.view.parseNode(tree);
    assertEquals(expected, this.view.toString());
  },

  testParseNodeChildren: function() {
    var root = {};
    root.first = node('parent', 0, node('sibling', 0));
    root.first.first = node('1st', 0, node('2nd', 0));
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
    root.first = node('parent', 0, node('sibling', 0));
    var second = node('2nd', 0, node('3rd', 0));
    root.first.first = node('1st', 0, second);
    second.first = node('a', 0, node('b', 0));
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
