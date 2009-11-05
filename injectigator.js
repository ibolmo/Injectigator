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
  prevNode = this.ROOT = this.fn();
  prevNode.$parent = prevNode;
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
 * Records the start time and links the prev/next and first/last node and
 * child of the node and the parent node, respectively.
 * @param {Function} node An InjectigatorNode (function).
 * @returns {Object} The Injectigator class.
 */
Injectigator.enter = function(node) {
  node.$start = now();
  node.$end = null;
  node.$called++;

  if (prevNode.$end) {
    prevNode.$next = node;
    node.$prev = prevNode;
  }

  // If the node is delayed or a periodical, then it doesn't have a parent.
  if (!node.$delayed && !node.$periodical) {
    if (prevNode.$end) {
      node.$parent = prevNode.$parent;
    } else {
      node.$parent = prevNode;
      node.$parent.$first = node;
    }
    node.$parent.$last = node;
  }

  prevNode = node;

  return this;
};


/**
 * Records the end, elapsed time, and resets the parent if the sub-nodes
 * finished executing.
 * @param {Function} node An InjectigatorNode.
 * @param {*} result The result of calling the function.
 * @returns {*} The result of the original function.
 */
Injectigator.exit = function(node, result) {
  node.$end = now();
  node.$elapsed[node.$called - 1] = node.$end - node.$start;

  prevNode = node;
  return result;
};


/**
 * Wraps a normal function with the {@see #enter} and {@see #exit}
 * Injectigator utility functions.
 * @param {Function} fn The original function.
 * @returns {Function} An InjectigatorNode.
 */

Injectigator.fn = function(fn) {
  var node = function() {
    return Injectigator.enter(node).exit(node, fn.apply(this, arguments));
  };
  node.$jsrNode = true;
  node.$called = 0;
  node.$elapsed = [];
  return node;
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
