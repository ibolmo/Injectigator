# Copyright (C) 2009- Olmo Maldonado
# Author: Olmo Maldonado
# Contact: ibolmo@gmail.com

"""Injectigator JS (pre) Processing Module

This can be run as library or as a standalone application.
"""

import logging
import optparse

def main():
  """The entrypoint when using this file as an entry point."""
  logging.basicConfig(format='injectigator.py: %(message)s', level=logging.INFO)
  
  usage = 'usage: %prog [options] output_file.js'
  parser = optparse.OptionParser(usage)
  parser.add_option('-i',
                    '--input',
                    dest='inputs',
                    action='append',
                    help='The input file to process.')
  (options, args) = parser.parse_args()
  
  

if __name__ == '__main__':
  main()