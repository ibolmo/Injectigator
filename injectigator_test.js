/**
 * @fileoverview The Injectigator Unit Tests. See
 * {@ link http://code.google.com/p/js-test-driver/wiki/GettingStarted} on how
 * to get started.
 *
 * NOTE(ibolmo): You'll need to have ../jsunit/jsUnitMockTimeout.js from
 * http://bit.ly/jsUnitMockTimeout.
 *
 * @author ibolmo@gmail.com (Olmo Maldonado)
 */


TestCase('Injectigator', {

  setUp: function() {
    Injectigator.initialize();
  },

  testMockClock: function() {
    assertTrue('ensure jstd loaded Clock mock first',
               (setTimeout+'').indexOf('Injectigator') != -1);
  },

  testIsNode: function() {
    var node = function(){};
    assertFalse('A normal function is not an Injectigator node.',
                Injectigator.isNode(node));

    node = Injectigator.fn();
    assertTrue('A method from Injectigator.node is an Injectigator node',
               Injectigator.isNode(node));

    node = Injectigator.fn(function(){});
    assertTrue(Injectigator.isNode(node));
  },

  testGetPreviousNode: function() {
    assertEquals('At time 0, the previous node is the ROOT node.',
                 Injectigator.ROOT,
                 Injectigator.getPreviousNode());
  },

  testEnter: function() {
    var called = 0;
    var node = Injectigator.fn(function(){
      called++;
    });

    var enode = {start: +new Date, curry: node};
    Injectigator.enter(enode);

    assertEquals('The scoped called variable should still be 0.', called, 0);

    // TODO(ibolmo): May be inappropriate to access these internal variables
    // directly during testing. Use public interface once available.
    assertEquals('The node has been called once', enode.curry.$called, 1);
    assertNotNull('The node should have a start time', enode.start);
    assertFalse('The node should not have an end time', !!enode.end);
    assertEquals('For the simplest case, the node\'s parent is the root node.',
                 enode.parent,
                 Injectigator.ROOT);
    assertEquals('First child of the parent (ROOT) is the node',
                  enode,
                  Injectigator.ROOT.first);
    assertEquals('Last child of the parent (ROOT) is the node',
                  enode,
                  Injectigator.ROOT.last);

    // TODO(ibolmo): Consider calling enter on the same node twice.
  },

  testExit: function() {
    var called = 0;
    var node = Injectigator.fn(function() {
      called++;
    });

    var enode = {start: +new Date, curry: node};
    var result = Injectigator.enter(enode).exit(enode, 'result');

    assertEquals('Exit should return the passed result.', 'result', result);
    // TODO(ibolmo): Same as above. Use public interface once available.
    assertNotNull('The node should have an end time.', enode.end);
    assertNotNull('The node should have recorded an elapsed time.',
                  enode.elapsed);

    // TODO(ibolmo): Consider calling exit on the same node twice.
  },

  testFn: function() {
    var called = 0;
    var node = Injectigator.fn(function() {
      called++;
    });

    node();
    assertEquals('called should be 1', 1, called);
    node();
    assertEquals('ensure fn is not broken after the first use', 2, called);

    var AClass = function(){};
    AClass.prototype.called = 0;
    AClass.prototype.incr = Injectigator.fn(function(){
      this.called++;
    });

    var A = new AClass();
    A.incr();

    assertEquals('Instance called should be 1', 1, A.called);

    AClass.prototype.set = Injectigator.fn(function(){
      this.args = Array.prototype.slice.call(arguments);
    });

    var B = new AClass();
    var args = ['0', 1, null];
    B.set.apply(B, args);
    assertEquals('Arguments should pass correctly.', B.args, args);
  },

  testFnAndReturnedEmbeddedNode: function() {
    var called = 0;
    var rootNode = Injectigator.fn(function() {
      return Injectigator.fn(function() {
        called++;
      });
    });

    var innerNode = rootNode();

    assertEquals('called should still be 0', 0, called);
    assertEquals('should be at rootNode',
                 rootNode,
                 Injectigator.getPreviousNode().curry);
    innerNode();
    var enode = Injectigator.getPreviousNode();
    assertEquals(called, 1);
    assertEquals('should be at innerNode',
                 innerNode,
                 enode.curry);

    assertEquals('current parent should be ROOT',
                 Injectigator.ROOT,
                 enode.parent);

    assertEquals('parent first child is rootNode',
                 rootNode,
                 Injectigator.ROOT.first.curry);
    assertEquals('parent last child is innerNode',
                 innerNode,
                 Injectigator.ROOT.last.curry);

    assertEquals(innerNode, Injectigator.ROOT.first.next.curry);
    assertEquals(rootNode, Injectigator.ROOT.last.previous.curry);
  },

  testFnAndOneEmbeddedCall: function() {
    var childNode;
    var rootNode = Injectigator.fn(function(){
      childNode = Injectigator.fn(function(){});
      childNode();
      return Injectigator.fn(function(){});
    });
    var innerNode = rootNode();

    var enode = Injectigator.getPreviousNode();
    assertEquals('should be at rootNode since child exited',
                 rootNode,
                 enode.curry);

    assertEquals(rootNode, Injectigator.ROOT.first.curry);
    assertEquals('Child should not be the last node for the ROOT',
                 rootNode,
                 Injectigator.ROOT.last.curry);

    assertEquals('rootNode should have a child', childNode, enode.first.curry);
    assertEquals(childNode, enode.last.curry);

    assertEquals('childNode has rootNode as parent',
                 rootNode,
                 enode.first.parent.curry);

    innerNode();
    enode = Injectigator.getPreviousNode();
    assertEquals('should be at innerNode',
                 innerNode,
                 enode.curry);

    assertEquals('current parent should be ROOT',
                 Injectigator.ROOT,
                 enode.parent);

    // Check that links are correct.
    assertEquals(innerNode, enode.previous.next.curry);
    assertEquals(rootNode, enode.previous.curry);

    assertEquals('parent first child is rootNode',
                 rootNode,
                 Injectigator.ROOT.first.curry);
    assertEquals('parent last child is innerNode',
                 innerNode,
                 Injectigator.ROOT.last.curry);

    // Ensure that nothing has happened to the child.
    assertEquals('Child should not be the last node for the ROOT',
                 innerNode,
                 Injectigator.ROOT.last.curry);

    assertEquals('rootNode should have a child',
                 childNode,
                 enode.previous.first.curry);
    assertEquals(childNode, enode.previous.last.curry);

    assertEquals('childNode has rootNode as parent',
                 rootNode,
                 enode.previous.first.parent.curry);
  },

  testSetTimeoutFns: function() {
    var called = 0;
    var node = Injectigator.fn(function() {
      called++;
    });

    setTimeout(node, 1000);
    Clock.tick(1000);

    assertEquals('function gets called normally', 1, called);

    // TODO(ibolmo): Use a public method when available.
    assertTrue('Node should be marked as delayed', node.$delayed);

    // The node should not have a parent or be considered a child of the root.
    var enode = Injectigator.getPreviousNode();
    assertFalse(!!enode.parent);
    assertFalse(!!Injectigator.ROOT.first);
    assertFalse(!!Injectigator.ROOT.last);

    // TODO(ibolmo): For the edge case that the only function used is delayed,
    // need a way to access that node.
    //assertEquals('Since the node executed, the next node is the delayed fn',
    //             Injectigator.ROOT.$next);
  },

  testSetTimeoutFnWithChild: function() {
    var called = 0;
    var childNode;
    var rootNode = Injectigator.fn(function() {
      childChild = Injectigator.fn(function(){
        called++;
      });
      childChild();
    });

    setTimeout(rootNode, 1000);
    Clock.tick(1000);
  }

});
