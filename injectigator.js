(function() {

var II = this.Injectigator = {};

II.isNode = function(node) {
  return !!node.$jsrNode;
};

II.enter = function(node) {
  node.$called++;
  node.$start = new Date;
  if (!II.head.length) {
    II.head.push(node);
  }
  return this;
};

II.exit = function(node, result) {
  node.$end = new Date;
  node.$elapsed[node.$called] = node.$end - node.$start;
  return result;
};

II.fn = function(fn) {
  var node = function() {
    return II.enter(node).exit(node, fn.apply(this, arguments));
  };
  node.$jsrNode = true;
  node.$called = 0;
  node.$elapsed = [];
  return node;
};

// Override setInterval or setTimeout. Helpful for the visualization stage.
var oI = this.setInterval;
this.setInterval = function(fn, interval){
  if (II.isNode(fn)) {
    fn.$periodical = true; 
  }
  return oI(fn, interval);
};

var oT = this.setTimeout;
this.setTimeout = function(fn, timeout) {
  if (II.isNode(fn)) {
    fn.$delayed = true;
  }
  return oT(fn, timeout);
};

})();