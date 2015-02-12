Broadband Economic Development
==============================
[![Build Status](https://travis-ci.org/agrc/bb-econ.svg?branch=master)](https://travis-ci.org/agrc/bb-econ)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-bb-econ.svg)](https://saucelabs.com/u/agrc-bb-econ)

Production URL: [locate.utah.gov](http://locate.utah.gov)  
Staging URL: [test.mapserv.utah.gov/bb-econ](http://test.mapserv.utah.gov/bb-econ)

[User Stories](https://docs.google.com/a/utah.gov/document/d/1OsXuQaPs9DkRke6lsi1HiD7dWLRLVjrcKL1rO51KuQk/edit)

[Layers Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheets/d/1CqW3iXKG36D5Hd9m2gOqUtbJC44PWFsySogWJ49sjSE/edit#gid=0)

Nightly Script
==============

There is a nightly script in `scripts/Nightly` that dissolves the fiber data and puts it in the file geodatabase associated with this project.

It's checked out to .56 using [git sparse checkout](http://briancoyner.github.io/blog/2013/06/05/git-sparse-checkout/).

Build Notes
===========

The `settings` folder does not get copied to the server when publishing the GenerateReport gp tool. This has to be done manually.
