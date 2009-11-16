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
 * ┘
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
  END: '\u2518',
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


AsciiView.prototype.parseNode = function(node) {
  this.buffer_[this.l_] += AsciiView.SymbolType.START;
  while (node && node.curry) {
    this.buffer_[++this.l_] = [
      AsciiView.SymbolType.NODE,
      (node.curry.$name || 'anon') + ',',
      node.elapsed, 'ms'
    ].join(' ');
    node = node.next;
  }
  this.buffer_[++this.l_] = AsciiView.SymbolType.END;
};


/** @return The ASCII representation of the graph. */
AsciiView.prototype.toString = function() {
  var str = this.buffer_.join('\n');
  console.log(str);
  return str;
};

})();
