#!/usr/bin/env python
# * coding: utf8 *
'''
pallet.py

A module that contains the pallet for bb-econ
'''
import arcpy
from os import path
from forklift.models import Pallet


class BBEconPallet(Pallet):
    def __init__(self):
        super(BBEconPallet, self).__init__()

        self.arcgis_services = [('BBEcon/GenerateReport', 'GPServer'),
                                ('BBEcon/MapService', 'MapServer')]

        self.staging = 'C:\\Scheduled\\staging'

        self.sgid = path.join(self.garage, 'SGID10.sde')

        self.economy = path.join(self.staging, 'Economy.gdb')
        self.health = path.join(self.staging, 'Health.gdb')
        self.location = path.join(self.staging, 'Location.gdb')
        self.society = path.join(self.staging, 'Society.gdb')
        self.transportation = path.join(self.staging, 'Transportation.gdb')
        self.utilities = path.join(self.staging, 'Utilities.gdb')
        self.cadastre = path.join(self.staging, 'Cadastre.gdb')
        self.broadband = path.join(self.staging, 'Broadband.gdb')
        self.bbecon = path.join(self.staging, 'BBEcon.gdb')

        self.copy_data = [self.economy,
                          self.health,
                          self.location,
                          self.society,
                          self.transportation,
                          self.utilities,
                          self.cadastre,
                          self.broadband,
                          self.bbecon]

    def build(self, target):
        self.configuration = target
        self.add_crate(('EnterpriseZones', self.sgid, self.economy))
        self.add_crate(('HealthCareFacilities', self.sgid, self.health))
        self.add_crate(('ZoomLocations', self.sgid, self.location))
        self.add_crate(('Schools', self.sgid, self.society))
        self.add_crate(('LandOwnership', self.sgid, self.cadastre))

        self.add_crates(['AirportLocations',
                         'CommuterRailRoutes_UTA',
                         'CommuterRailStations_UTA',
                         'LightRailStations_UTA',
                         'LightRail_UTA',
                         'Railroads'],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.transportation})

        self.add_crates(['ElectricalService',
                         'NaturalGasService_Approx',
                         'RetailCulinaryWaterServiceAreas',
                         'RuralTelcomBoundaries'],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.utilities})

        self.add_crates(['BB_Service'],
                        {'source_workspace': path.join(self.garage, 'UBBMAP.sde'),
                         'destination_workspace': self.broadband})

    def process(self):
        self.log.info('copying BBEcon.gdb to staging...')
        if arcpy.Exists(self.bbecon):
            arcpy.Delete_management(self.bbecon)
        arcpy.Copy_management(path.join(config.get_config_prop('copyDestinations')[0], 'BBEcon.gdb'), self.bbecon)

        previous_workspace = arcpy.env.workspace
        arcpy.env.workspace = self.sgid

        for n in [1, 9]:
            self.dissolve_fiber(n)

        railroads = path.join(self.bbecon, 'Railroads')
        self.dissolve(railroads, "TYPE = 'Heavy'", path.join(self.sgid, 'SGID10.TRANSPORTATION.Railroads'))

        self.log.info('chop up railroads by county')
        railroads_dissolved = '{}_dissolved'.format(railroads)
        if arcpy.Exists(railroads_dissolved):
            arcpy.Delete_management(railroads_dissolved)
        arcpy.Identity_analysis(railroads, 'SGID10.BOUNDARIES.Counties', railroads_dissolved)
        arcpy.Delete_management(railroads)

        arcpy.env.workspace = previous_workspace

    def dissolve(self, fc, query, name):
        if arcpy.Exists(fc):
            self.log.info('deleting previous feature class')
            arcpy.Delete_management(fc)

        self.log.info('making feature layer')
        lyr = arcpy.MakeFeatureLayer_management(name, 'DissolveLayer', query)

        self.log.info('dissolving')
        arcpy.Dissolve_management(lyr, fc)

        self.log.info('simplifing')
        arcpy.Generalize_edit(fc, 100)

        self.log.info('deleting layer')
        arcpy.Delete_management(lyr)

    def dissolve_fiber(self, num):
        self.log.info('{} month...'.format(num))

        query = 'HexID IN (SELECT HexID FROM PROVIDERSERVICEAREAS WHERE ServiceClass = {})'.format(num)
        fc = '{}\Fiber_Dissolved_{}Month'.format(self.bbecon, num)

        self.dissolve(fc, query, path.join(self.garage, 'FiberVerification.sde', 'FiberVerification.FIBERADMIN.Hexagons'))
