/**
 * @fileoverview The Injectigator JS API.
 * @author ibolmo@gmail.com (Olmo Maldonado)
 */


(function() {

/**
 * @type {Object} The Injectigator structure.
 */
var Injectigator = this.Injectigator = {};

// Local (private) variable.
var prevNode;

/**
 * Initializes the ROOT and resets the previous known Node to the ROOT.
 */
Injectigator.initialize = function() {
  // TODO(ibolmo): Ensure previous ROOT is properly garbage collected.
  prevNode = this.ROOT = {};
};


/**
 * @returns {Function} The previous Injectigator node.
 */
Injectigator.getPreviousNode = function() {
  return prevNode;
};


/**
 * Whether the passed in function is an InjectigatorNode.
 * @param {Function} node A function that may be a {@see #InjectigatorNode}.
 * @returns {boolean} Whether the function passed is an InjectigatorNode.
 */
Injectigator.isNode = function(node) {
  return !!node.$jsrNode;
};


/**
 * Wraps a normal function with the {@see #enter} and {@see #exit}
 * Injectigator utility functions. This function can take one to three arguments
 * according to how much information can be provided. See the argument
 * definitions for guidelines on how to use this function.
 *
 * @param {string|Function} opt_fnNameOrFn The name of the function or
 *     the actual function.
 * @param {?number} opt_lineNbr The line in this file the function is on.
 * @param {?Function} opt_fn The original function.
 * @returns {Function} An InjectigatorNode.
 */

Injectigator.fn = function(opt_fnNameOrFn, opt_lineNbr, opt_fn) {
  if (!opt_fn) {
    opt_fn = opt_fnNameOrFn;
  }
  var node = function() {
    var enode = {start: now(), curry: node};
    return Injectigator.enter(enode).exit(enode, opt_fn.apply(this, arguments));
  };
  if (arguments.length == 3) {
    node.$name = opt_fnNameOrFn;
    node.$lineNbr = opt_lineNbr;
  }
  node.$jsrNode = true;
  node.$called = 0;
  return node;
};


/**
 * Records the start time and links the prev/next and first/last node and
 * child of the node and the parent node, respectively.
 * @param {Object} enode An execution node.
 * @returns {Object} The Injectigator class.
 */
Injectigator.enter = function(enode) {
  enode.curry.$called++;

  if (prevNode.end) {
    prevNode.next = enode;
    enode.previous = prevNode;
  }

  // If the node is delayed or a periodical, then it doesn't have a parent.
  if (!enode.curry.$delayed && !enode.curry.$periodical) {
    if (prevNode.end) {
      enode.parent = prevNode.parent;
    } else {
      enode.parent = prevNode;
      enode.parent.first = enode;
    }
    enode.parent.last = enode;
  }

  prevNode = enode;
  return this;
};


/**
 * Records the end, elapsed time, and resets the parent if the sub-nodes
 * finished executing.
 * @param {Object} enode An execution node.
 * @param {*} result The result of calling the function.
 * @returns {*} The result of the original function.
 */
Injectigator.exit = function(enode, result) {
  enode.end = now();
  enode.elapsed = enode.end - enode.start;

  prevNode = enode;
  return result;
};


// Initialization
Injectigator.initialize();

// Override setInterval or setTimeout. Helpful for the visualization stage.
var oI = this.setInterval;
this.setInterval = function(fn, interval){
  if (Injectigator.isNode(fn)) {
    fn.$periodical = true;
  }
  return oI(fn, interval);
};

var oT = this.setTimeout;
this.setTimeout = function(fn, timeout) {
  if (Injectigator.isNode(fn)) {
    fn.$delayed = true;
  }
  return oT(fn, timeout);
};

// Utility
var now = Date.now || function(){
	return +new Date;
};

})();
