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

    Injectigator.enter(node);

    assertEquals('The scoped called variable should still be 0.', called, 0);

    // TODO(ibolmo): May be inappropriate to access these internal variables
    // directly during testing. Use public interface once available.
    assertEquals('The node has been called once', node.$called, 1);
    assertNotNull('The node should have a start time', node.$start);
    assertNull('The node should not have an end time', node.$end);
    assertEquals('For the simplest case, the node\'s parent is the root node.',
                 node.$parent,
                 Injectigator.ROOT);
    assertEquals('Previous node should be the ROOT for the first node',
                  Injectigator.ROOT,
                  node.$prev);
    assertEquals('First child of the parent (ROOT) is the node',
                  node,
                  Injectigator.ROOT.$first);
    assertEquals('Last child of the parent (ROOT) is the node',
                  node,
                  Injectigator.ROOT.$last);

    // TODO(ibolmo): Consider calling enter on the same node twice.
  },

  testExit: function() {
    var called = 0;
    var node = Injectigator.fn(function() {
      called++;
    });

    var result = Injectigator.enter(node).exit(node, 'result');

    assertEquals('Exit should return the passed result.', 'result', result);
    // TODO(ibolmo): Same as above. Use public interface once available.
    assertNotNull('The node should have an end time.', node.$end);
    assertNotNull('The node should have recorded an elapsed time.',
                  node.$elapsed[0]);
    assertEquals(
        'For the simplest case, the exit should not modify the previous node.',
        node,
        Injectigator.getPreviousNode());

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
                 Injectigator.getPreviousNode());
    innerNode();
    assertEquals(called, 1);
    assertEquals('should be at innerNode',
                 innerNode,
                 Injectigator.getPreviousNode());

    assertEquals('current parent should be ROOT',
                 Injectigator.ROOT,
                 innerNode.$parent);

    assertEquals(innerNode, rootNode.$next);
    assertEquals(rootNode, innerNode.$prev);

    assertEquals('parent first child is rootNode',
                 rootNode,
                 Injectigator.ROOT.$first);
    assertEquals('parent last child is innerNode',
                 innerNode,
                 Injectigator.ROOT.$last);
  },

  testFnAndOneEmbeddedCall: function() {
    var childNode;
    var rootNode = Injectigator.fn(function(){
      childNode = Injectigator.fn(function(){});
      childNode();
      return Injectigator.fn(function(){});
    });
    var innerNode = rootNode();

    assertEquals('should be at rootNode since child exited',
                 rootNode,
                 Injectigator.getPreviousNode());

    assertEquals(rootNode, Injectigator.ROOT.$first);
    assertEquals('Child should not be the last node for the ROOT',
                 rootNode,
                 Injectigator.ROOT.$last);

    assertEquals('rootNode should have a child',
               childNode,
               rootNode.$first);
    assertEquals(childNode, rootNode.$last);

    assertEquals('childNode has rootNode as parent',
                 rootNode,
                 childNode.$parent);

    innerNode();
    assertEquals('should be at innerNode',
                 innerNode,
                 Injectigator.getPreviousNode());

    assertEquals('current parent should be ROOT',
                 Injectigator.ROOT,
                 innerNode.$parent);

    // Check that links are correct.
    assertEquals(innerNode, rootNode.$next);
    assertEquals(rootNode, innerNode.$prev);

    assertEquals('parent first child is rootNode',
                 rootNode,
                 Injectigator.ROOT.$first);
    assertEquals('parent last child is innerNode',
                 innerNode,
                 Injectigator.ROOT.$last);

    // Ensure that nothing has happened to the child.
    assertEquals('Child should not be the last node for the ROOT',
                 innerNode,
                 Injectigator.ROOT.$last);

    assertEquals('rootNode should have a child',
               childNode,
               rootNode.$first);
    assertEquals(childNode, rootNode.$last);

    assertEquals('childNode has rootNode as parent',
                 rootNode,
                 childNode.$parent);
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
    assertFalse(!!node.$parent);
    assertFalse(!!Injectigator.ROOT.$first);
    assertFalse(!!Injectigator.ROOT.$last);

    assertEquals('Since the node executed, the next node is the delayed fn',
                 Injectigator.ROOT.$next);
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
