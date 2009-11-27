# Copyright (C) 2009- Olmo Maldonado
# Author: Olmo Maldonado
# Contact: ibolmo@gmail.com

"""Injectigator JS (pre) Processing Module Unit Tests"""

import injectigator
import difflib
import pprint

def assert_equals(original, expected):
  """Helper for creating a legible string comparsion traceback"""
  msg = '\n'.join(difflib.unified_diff(expected.splitlines(),
                                       original.splitlines()))
  assert original == expected, msg
def test_parse():
  # None or invalid line
  for test in [
    '',
    '"unction";',
    'var a = "function";',
    'delete Function.prototype.bind;']:

    fnType, data = injectigator.parse(test)
    assert fnType == injectigator.FunctionType.NONE, \
           'type: %s, for: %s' % (injectigator.FunctionType.get_(fnType), test)
    assert 'name' not in data, 'name: %s for: %s' % (data['name'], test)

  # Assigned
  for test in [
    'var a = function(',
    'var a = function(){',
    'var a = function(){};',
    'var a = function(){ return $rand(); };',
    'var a = function(){ return function(){ var b = 1; } };']:

    fnType, data = injectigator.parse(test)
    assert fnType == injectigator.FunctionType.ASSIGNED, \
           'type: %s, for: %s' % (injectigator.FunctionType.get_(fnType), test)
    assert 'name' in data, 'no name found for: %s' % test
    assert data['name'] == 'a', 'name: %s for: %s' % (data['name'], test)

  # Anonymous
  for test in [
    '(function(){})();',
    'function(){',
    'function(){}']:

    fnType, data = injectigator.parse(test)
    assert fnType == injectigator.FunctionType.ANONYMOUS, \
           'type: %s, for: %s' % (injectigator.FunctionType.get_(fnType), test)
    assert 'name' not in data, 'name: %s, for: %s' % (data['name'], test)

  # Named
  for test in [
    'function a(){',
    '(function a(_, __, ___){})();',
    '(function a(_){ return function(){}; })();']:

    fnType, data = injectigator.parse(test)
    assert fnType == injectigator.FunctionType.ASSIGNED, \
           'type: %s, for: %s' % (injectigator.FunctionType.get_(fnType), test)
    assert 'name' in data, 'no name found for: %s' % test
    assert data['name'] == 'a', 'name: %s for: %s' % (data['name'], test)


def test_process():
  header = injectigator.process('') + '\n'
  assert 'github.com/ibolmo' in header

  # Assignment
  assert_equals(injectigator.process('''
  var a = function(_, __, ___) {
    var b = {};
    for (var c in b) {
      // nothing
    }
  };
  '''.splitlines()), header + '''
  var a = Injectigator.fn('a', 1, function(_, __, ___) {
    var b = {};
    for (var c in b) {
      // nothing
    }
  });
  ''')
  return

  # Inlined functions
  assert_equals(injectigator.process('''
  var a = function(_, __, ___) {
    var b = function(){};
  };
  '''), header + '''
  var a = Injectigator.fn('a', 1, function(_, __, ___) {
    var b = Injectigator.fn(2, function(){});
  });
  ''')

  # Curried functions
  assert_equals(injectigator.process('''
  var a = function(_, __, ___) {
    return function() {
      var b = 0;
    };
  };
  '''), header + '''
  var a = Injectigator.fn('a', 1, function(_, __, ___) {
    return Injectigator.fn(2, function() {
      var b = 0;
    });
  });
  ''')

  # Named functions
  assert_equals(injectigator.process('''
  (function() {
    function helper() {
      return 'help';
    };
    var a = function() {
      var b = 1;
    };
  });
  '''), header + '''
  Injectigator.fn(1, function() {
    var helper = Injectigator.fn('helper', 2, function() {
      return 'help';
    });
    var a = Injectigator.fn(5, 'a', function() {
      var b = 1;
    });
  })();
  ''')
