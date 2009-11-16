/**
 * @fileoverview A simple (ascii) view of the executed JavaScript.
 * @author ibolmo@gmail.com (Olmo Maldonado)
 * @requires Injectigator
 */


(function(){

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
 *
 * @param {Object} opt_root An optional root to use instead the global
 *     Injectigator root.
 * @constructor
 */
var AsciiView = Injectigator.AsciiView = function() {

  /**
   * String buffer. Each element is a row.
   * @type {Array.<string>}
   * @private
   */
  this.buffer_ = [''];
};


/**
 * Map of Ascii symbols used by the View.
 * @type {Object}
 */
AsciiView.SymbolType = {
  START: '\u2510',
  NODE: '\u251C',
  DELAYED: '\u255F',
  PERIODICAL: '\u2560'
};


/**
 * Internal pointer to the last known line.
 * @private
 * @type number
 */
AsciiView.prototype.l_ = 0;


/**
 * Recursively parses the node and its children and in the process populates the
 * the string buffer with the output. The {@see #toString} method returns the
 * result.
 *
 * @param {Object} node The node to parse.
 */
AsciiView.prototype.parseNode = function(node) {
  var prefix = this.pad_(this.buffer_[this.l_].length);
  while (node) {
    if (node.curry) {
      this.buffer_[++this.l_] = prefix + [
        AsciiView.SymbolType.NODE,
        (node.curry.$name || 'anon') + ',',
        node.elapsed, 'ms'
      ].join(' ');
    }
    if (node.first) {
      this.buffer_[this.l_] += (node.curry ? ' ' : '') +
                               AsciiView.SymbolType.START;
      this.parseNode(node.first);
    }
    node = node.next;
  }
};


/** @return The ASCII representation of the graph. */
AsciiView.prototype.toString = function() {
  return this.buffer_.join('\n');
};


/**
 * Returns a string composed of spaces.
 * @param {number} len The length of the string.
 * @return {string} The pad string.
 */
AsciiView.prototype.pad_ = function(len) {
  return new Array(len).join(' ');
};


})();
