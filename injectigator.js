/* Notes

Goals
  - Converter
    . Takes a normal JS and outputs a Injectigator-ready JS for runtime analysis.
  - Injectigator JS API
    . Takes running code and creates a running graph of the JS.
  - Runtime Visualization
   . timeline representation
    |      c---d
    |     /     \
    |    a---b   e
    0 .. n
   . graph
     a -(n-times)- > b
      \
       -(n-times) -> c -(n-times)-> d
                \
                 -> e
    . across files
     - Core.js -> Function.js -> ..
    
    
  Injectigator API
   - # of times a function is called
   - in and out path
   
   stretch:
    - paths inside of function
      var a = function(){
        if () {
          ...
        } else {
          ...
        }
        for (var i = 0, l = ..length; i < l; i++) {
        
        }
      }
      
   - Crossbrowser
   - Directives.. 
    var a = function(){
      //JSR: break if $calls > 0
      //JSR: break if $runtime > 150 ms
      //JSR: break if $loops > 10
      //JSR: warn if ...
      //JSR: info .. 
      //JSR: log $loops
      //JSR: log 'something'
*/

Injectigator = {
  head: []
};

Injectigator.isNode = function(node) {
  return !!node.$jsrNode;
};

Injectigator.enter = function(node) {
  node.$called++;
  node.$start = new Date;
  if (!Injectigator.head.length) {
    Injectigator.head.push(node);
  }
  return this;
};

Injectigator.exit = function(node, result) {
  node.$end = new Date;
  node.$elapsed[node.$called] = node.$end - node.$start;
  return result;
};

Injectigator.fn = function(fn) {
  var node = function() {
    return Injectigator.enter(node).exit(node, fn.apply(this, arguments));
  };
  node.$jsrNode = true;
  node.$called = 0;
  node.$elapsed = [];
  return node;
};

// Override setInterval or setTimeout.
var oI = setInterval;
setInterval = function(fn, interval){
  if (Injectigator.isNode(fn)) {
    fn.$periodical = true; 
  }
  return oI(fn, interval);
};

var oT = setTimeout;
setTimeout = function(fn, timeout) {
  if (Injectigator.isNode(fn)) {
    fn.$delayed = true;
  }
  return oT(fn, timeout);
};
