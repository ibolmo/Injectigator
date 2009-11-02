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

  testInjectigatorEnter: function() {
    var called = 0;
    var fn = Injectigator.fn(function(){
      called++;
    });

    Injectigator.enter(fn);

    assertEquals(called, 0);

    assertEquals(fn.$called, 1);
    assertNotNull(fn.$start);
    assertNull(fn.$end);

    assertEquals(fn.$parent, Injectigator.ROOT);
  },

  testInjectigatorExit: function() {

  },

  testInjectigatorFn: function() {

  }


});
