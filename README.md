# Broadband Economic Development

[![build status](https://github.com/agrc/locate/actions/workflows/nodejs.yml/badge.svg)](https://github.com/agrc/locate/actions/workflows/nodejs.yml)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-bb-econ.svg)](https://saucelabs.com/u/agrc-bb-econ)

Production URL: [locate.utah.gov](https://locate.utah.gov)
Staging URL: [locate.dev.utah.gov](https://locate.dev.utah.gov)

[User Stories](https://docs.google.com/a/utah.gov/document/d/1OsXuQaPs9DkRke6lsi1HiD7dWLRLVjrcKL1rO51KuQk/edit)

[Layers Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheets/d/1CqW3iXKG36D5Hd9m2gOqUtbJC44PWFsySogWJ49sjSE/edit#gid=0)

## Python Script

### [🚜 Pallets](https://github.com/agrc/forklift)

[Dependency Installation](/scripts/readme.md)

`scripts/locate_pallet.py` updates and processes data for this app via

### GP Scripts Deployment

1. Publish `maps/MapService.mxd` as `BBEcon/MapService`
1. Publish `scripts/Toolbox.tbx/Generate Report` as `BBEcon/GenerateReport`
    - Test point: `x: -12452500, y: 4979214`
    - The `settings` folder does not get copied to the server when publishing the GenerateReport gp tool. This has to be done manually.

### Updating TaxEntities Contact Data

1. Update table in `bbecon-static.gdb`
1. Delete `economy.gdb\TaxEntities20**` so that the join will be triggered on next forklift run.

### Incrementing TaxEntities20** Data Year

1. [Update `locate_pallet.py` and `scripts/settings_ib/__init__.py`](https://github.com/agrc/locate/commit/675fe46ae5c358d961fd5933ce925043c7d860b1).
    - `__init__.py` will need to be updated on both mapserv machines.
1. Delete old feature class in `hashing/bbecon.gdb` and `hashing/economy.gdb`
1. `forklift special-delivery locate_pallet.py`
1. Update layer in `maps/MapService.mxd` and republish.

### Updating Historic Enterprise Zone Layers

1. Update definition queries in `maps\MapService.mxd`.
    - `Historic1` is current year minus one. `Historic2` is current year minus two and so forth.
    - For years 2018+ the data is contained in SGID (`ECONOMY.EnterpriseZones`) and individual years can be queried using the `EXPYR` field (e.g. for 2020: `EXPYR NOT IN ('2018', '2019')`).
1. Update labels in `lib/app/templates/EnterpriseZones.html`

### Updating data in `bbecon-static.gdb`

1. Update the relevant data in `C:\forklift\data\static\bbecon-static.gdb` on the forklift machine.
1. Delete `bbecon-static.gdb\PolygonData` so that it gets rebuilt on the next forklift run.
