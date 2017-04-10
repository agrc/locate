# Broadband Economic Development

[![Build Status](https://travis-ci.org/agrc/bb-econ.svg?branch=master)](https://travis-ci.org/agrc/bb-econ)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-bb-econ.svg)](https://saucelabs.com/u/agrc-bb-econ)

Production URL: [locate.utah.gov](http://locate.utah.gov)  
Staging URL: [test.mapserv.utah.gov/bb-econ](http://test.mapserv.utah.gov/bbecon)

[User Stories](https://docs.google.com/a/utah.gov/document/d/1OsXuQaPs9DkRke6lsi1HiD7dWLRLVjrcKL1rO51KuQk/edit)

[Layers Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheets/d/1CqW3iXKG36D5Hd9m2gOqUtbJC44PWFsySogWJ49sjSE/edit#gid=0)

## Python Script

#### [🚜 Pallets](https://github.com/agrc/forklift)

[Dependency Installation](/scripts/readme.md)

`scripts/ironing_board_pallet.py` updates and processes data for this app via
`scripts/SureSitesPallet.py` - updates the sure sites data

#### GP Scripts Deployment

1. Publish `maps/MapService.mxd` as `BBEcon/MapService`
1. Publish `scripts/Toolbox.tbx/Generate Report` as `BBEcon/GenerateReport`
    - Test point: `x: -12452500, y: 4979214`
    - The `settings` folder does not get copied to the server when publishing the GenerateReport gp tool. This has to be done manually.
