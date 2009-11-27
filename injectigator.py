#!/usr/bin/env python

# Copyright (C) 2009- Olmo Maldonado
# Author: Olmo Maldonado
# Contact: ibolmo@gmail.com

"""Injectigator JS (pre) Processing Module

This can be run as library or as a standalone application.

Standalone Usage:
./injectigator.py -h

"""

__version__ = '0.0.1'

import logging
import optparse
import os
import re


class Enumerate(object):
  """Helper for creating enums in Python"""
  def __init__(self, names):
    self.enums = {}
    for number, name in enumerate(names.split()):
      value = 2 * number
      setattr(self, name, value)
      self.enums[value] = name

  def get_(self, value):
    """Return the string representation for the enum (int) value."""
    return self.enums.get(value)

FunctionType = Enumerate('NONE ANONYMOUS NAMED ASSIGNED')


def _print_header():
  """Return the header text for a processed JS."""
  return '''
  /**
   * This file has been modified by Injectigator (v. %(version)s).
   * For more information: http://github.com/ibolmo/Injectigator
   */
  ''' % {'version': __version__}

# RegExp for various function declarations.
function_re = re.compile(r'((?P<var>\w*)(?: *=|:) *)?function *(?P<fn>\w*)\(')


def parse(line):
  """Parse a line for function declarations.

  Args:
    line -- A JS code line.

  Returns:
    fnType -- The type of function found or FunctionType.NONE.
    data - A dictionary placeholder with additional information.

  """
  fnType = FunctionType.NONE
  data = {}
  if ('function' in line):
    m = function_re.search(line)
    if m is not None:
      fnType = FunctionType.ANONYMOUS
      var = m.group('var')
      fn = m.group('fn')
      if (fn):
        fnType |= FunctionType.NAMED
        data['name'] = fn
      if (var):
        fnType |= FunctionType.ASSIGNED
        data['name'] = var
  return fnType, data

def process(js):
  """Process the JS file and inject the Injectigator API in the JS code.

  Arguments:
  js -- the js file content. Must be iterable (by lines).

  Returns:
  processed_js -- the processed JavaScript in a string.

  """
  buffer_ = [_print_header()]

  ln = 0
  for line in js:
    ln += 1

    last = 0
    for m in re.finditer(r'function', line):
      substr = line[last : m.end() + 1]
      fnType, data = parse(substr)
      last = m.end()

    buffer_.append(line)
  return '\n'.join(buffer_)


def _validate_input(parser, args):
  """Checks that the length is correct and each input is a file."""
  if len(args) != 2:
    parser.print_help()
    parser.exit()

  input_file = os.path.abspath(args[0])
  output_file = os.path.abspath(args[1])

  if not os.path.isfile(input_file):
    parser.exit('Invalid input file: %s' % input_file)

  if not os.path.exists(os.path.dirname(output_file)):
    parser.exit('Ouput file directory, %s, is invalid' % output_dir )

  return input_file, output_file


def _main():
  """The entrypoint when using this file as an entry point."""
  logging.basicConfig(format='injectigator.py: %(message)s', level=logging.INFO)

  usage = 'Usage: %prog [options] input_file output_file'
  parser = optparse.OptionParser(usage)
  # TODO(ibolmo): Advanced options.
  (options, args) = parser.parse_args()

  input_file, output_file = _validate_input(parser, args)

  input_file = open(input_file)
  processed_js = None
  try:
    processed_js = process(input_file)
  except:
    input_file.close()
    parser.error('An unexpected error occurred while reading the input file.')

  if processed_js is not None:
    output_file = open(output_file, 'w')
    output_file.write(processed_js)
    output_file.close()

if __name__ == '__main__':
  _main()
