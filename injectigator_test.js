/**
 * @fileoverview The Injectigator Unit Tests. See
 * {@ link http://code.google.com/p/js-test-driver/wiki/GettingStarted} on how
 * to get started.
 *
 * @author ibolmo@gmail.com (Olmo Maldonado)
 */


TestCase('Injectigator', {

  setUp: function() {
    Injectigator.initialize();
  },

  testIsNode: function() {
    var fn = Injectigator.fn();
    assertTrue(Injectigator.isNode(fn));

    fn = function(){};
    assertFalse(Injectigator.isNode(fn));
  },

  testGetPreviousNode: function() {
    assertEquals('At time 0, the previous node is the ROOT node.',
                 Injectigator.ROOT,
                 Injectigator.getPreviousNode());
  },

  testEnter: function() {
    var called = 0;
    var fn = Injectigator.fn(function(){
      called++;
    });

    Injectigator.enter(fn);

    assertEquals('The scoped called variable should still be 0.', called, 0);

    // TODO(ibolmo): May be inappropriate to access these internal variables
    // directly during testing. Use public interface once available.
    assertEquals(fn.$called, 1);
    assertNotNull(fn.$start);
    assertNull(fn.$end);
    assertEquals(fn.$parent, Injectigator.ROOT);
  },

  testExit: function() {
    var called = 0;
    var fn = Injectigator.fn(function() {
      called++;
    });

    var result = Injectigator.enter(fn).exit(fn, 'result');

    assertEquals('result', result);
    // TODO(ibolmo): Same as above. Use public interface once available.
    assertNotNull(fn.$end);
    assertNotNull(fn.$elapsed[0]);
  },

  testFn: function() {

  }


});
