# Copyright (C) 2009- Olmo Maldonado
# Author: Olmo Maldonado
# Contact: ibolmo@gmail.com

"""Injectigator JS (pre) Processing Module Unit Tests"""

import injectigator
import difflib
import pprint

def assert_equals(original, expected):
  """Helper for creating a legible string comparsion traceback"""
  assert original == expected, '\n'.join(difflib.ndiff(expected.splitlines(),
                                                       original.splitlines()))

def test_process():
  header = injectigator.process('')
  assert 'github.com/ibolmo' in header

  # Assignment
  assert_equals(injectigator.process('''
  var a = function(_, __, ___) {
  var b = {};
    for (var c in b) {
      // nothing
    }
  };
  '''), header + '''
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
