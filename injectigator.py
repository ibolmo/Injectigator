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

def _print_header():
  """Return the header text for a processed JS"""
  return '''
  /**
   * This file has been modified by Injectigator (v. %(version)s).
   * For more information: http://github.com/ibolmo/Injectigator
   */
  ''' % {'version': __version__}

def process(js):
  """Process the JS file and inject the Injectigator API in the JS code.

  Arguments:
  js -- the js file content

  Returns:
  processed_js -- the processed JavaScript in a string.

  """
  processed_js = _print_header()

  

  return processed_js


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
    processed_js = process(input_file.read())
  except:
    input_file.close()
    parser.error('An unexpected error occurred while reading the input file.')

  if processed_js is not None:
    output_file = open(output_file, 'w')
    output_file.write(processed_js)
    output_file.close()

if __name__ == '__main__':
  _main()
