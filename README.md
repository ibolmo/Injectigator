Injectigator
------------
**Inject and Investigate**

Overview
========

The premise for injestigator is that there are no cross browser solution to 
the profiling question. Firebug is solely FFx, Internet Developer Toolbar is
inadequate, and inspectors in Webkit variants are still maturing.

Injectigator doesn't try to replace these efforts, however. Think of
Injectigator as a short term solution with purposeful tools to help you
understand the performance of your JavaScript code.

How Injectigator Works
======================

Injectigator is a two-way system. The first stage takes a JavaScript file as the
input and injects code which will record metrics of your code.

The second stage visualizes and aggregates information for you. These signals
will be useful to understand if your code is performing according to your
expectations and will also help you understand where the critical paths and
bottlenecks of your code are in your system.

Note
====
_You may use Injectigator during development._

The preprocessing is only useful if you're working with legacy code or you're
unwilling to use our stripping service to remove any trace of Injectigator.-

Take a look at the Injectigator JS API for usage examples.
