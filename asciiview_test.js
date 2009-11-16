
TestCase('AsciiView', {
  
  setUp: function(){
    this.view = new Injectigator.AsciiView();
    this.symbols = Injectigator.AsciiView.SymbolType;
  },
  
  testParseNodeEmpty: function(){
    this.view.parseNode({});
    assertEquals([
      this.symbols.START,
      this.symbols.END
    ].join('\n'), this.view.toString());
  },
  
  testParseNodeSiblings: function() {
    function createNode(name, elapsed, next) {
      return {
        curry: { $name: name },
        elapsed: elapsed,
        next: next
      };
    }
    // 0 -> 1 -> 2
    var tree = createNode('0', 0, createNode('1', 10, createNode('2', 0)));
    var expected = [
      this.symbols.START,
      this.symbols.NODE + ' 0, 0 ms',
      this.symbols.NODE + ' 1, 10 ms',
      this.symbols.NODE + ' 2, 0 ms',
      this.symbols.END
    ].join('\n');
    this.view.parseNode(tree);
    assertEquals(expected, this.view.toString());
  }
  
});
