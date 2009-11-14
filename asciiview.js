/**
 * @fileoverview A simple (ascii) view of the executed JavaScript.
 * @author ibolmo@gmail.com (Olmo Maldonado)
 * @requires Injectigator
 */

/**
 * Creates an ASCII representation of the executed nodes.
 *
 * Output Example:
 * ┐
 * ├ anon, 2 ms
 * ├ helloWorld, 100 ms ┐
 *                      ├ anon, 1 ms
 *                      ╟ anon (10, delayed), 5 ms ┐
 *                                                 ├ doSomething, 100 ms
 *                      ╠ log (periodical), 10 ms
 * ├ anon (210), 10 ms
 * ┘
 *
 * @param {Object} opt_root An optional root to use instead the global
 *     Injectigator root.
 * @constructor
 */
(function(){

var AsciiView = Injectigator.AsciiView = function(opt_root) {
  var root = opt_root || Injectigator.ROOT;

  /**
   * String buffer. Each element is a row.
   * @type {Array.<string>}
   * @private
   */
  this.buffer_ = ['ROOT'];
  this.lineLength = this.buffer[0].length;
  this.length = 1;
  this.parseNode(root);
};


/**
 * Map of Ascii symbols used by the View.
 * @type {Object}
 */
AsciiView.SymbolType = {
  START: '\u2510',
  END: '\u2518',
  NODE: '\u251C',
  DELAYED: '\u255F',
  PERIODICAL: '\u2560'
};


AsciiView.prototype.parseNode = function(node) {

};

})();
