#!/usr/bin/env python
# * coding: utf8 *
'''
pallet.py

A module that contains the pallet for bb-econ
'''
import arcpy
from forklift.models import Pallet
from os.path import join
from os.path import basename


class BBEconPallet(Pallet):
    #: Note. This pallet assumes that bbecon.gdb exists in staging. It has data in it that
    #: does not come from any parent database.
    def __init__(self):
        super(BBEconPallet, self).__init__()

        self.arcgis_services = [('BBEcon/GenerateReport', 'GPServer'),
                                ('BBEcon/MapService', 'MapServer')]

        self.staging = 'C:\\Scheduled\\staging'

        self.sgid = join(self.garage, 'SGID10.sde')
        self.fiberverification_sde = join(self.garage, 'FiberVerification.sde')

        self.bbecon = join(self.staging, 'bbecon.gdb')
        self.broadband = join(self.staging, 'broadband.gdb')
        self.cadastre = join(self.staging, 'cadastre.gdb')
        self.economy = join(self.staging, 'economy.gdb')
        self.fiberverification = join(self.staging, 'fiberverification.gdb')
        self.health = join(self.staging, 'health.gdb')
        self.location = join(self.staging, 'location.gdb')
        self.society = join(self.staging, 'society.gdb')
        self.transportation = join(self.staging, 'transportation.gdb')
        self.utilities = join(self.staging, 'utilities.gdb')

        self.copy_data = [self.bbecon,
                          self.broadband,
                          self.cadastre,
                          self.economy,
                          self.fiberverification,
                          self.health,
                          self.location,
                          self.society,
                          self.transportation,
                          self.utilities]

    def build(self, target):
        self.configuration = target
        self.add_crate(('EnterpriseZones', self.sgid, self.economy))
        self.add_crate(('HealthCareFacilities', self.sgid, self.health))
        self.add_crate(('LandOwnership', self.sgid, self.cadastre))
        self.add_crate(('Schools', self.sgid, self.society))
        self.add_crate(('ZoomLocations', self.sgid, self.location))

        self.add_crates(['AirportLocations',
                         'CommuterRailRoutes_UTA',
                         'CommuterRailStations_UTA',
                         'LightRailStations_UTA',
                         'LightRail_UTA',
                         'Railroads',
                         'Roads'],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.transportation})

        self.add_crates(['ElectricalService',
                         'NaturalGasService_Approx',
                         'RetailCulinaryWaterServiceAreas',
                         'RuralTelcomBoundaries'],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.utilities})

        self.add_crates(['BB_Service', 'BB_Providers_Table'],
                        {'source_workspace': join(self.garage, 'UBBMAP.sde'),
                         'destination_workspace': self.broadband})

        self.add_crates(['Hexagons', 'ProviderServiceAreas'],
                        {'source_workspace': self.fiberverification_sde,
                         'destination_workspace': self.fiberverification})

    def process(self):
        previous_workspace = arcpy.env.workspace
        arcpy.env.workspace = self.sgid

        for n in [1, 9]:
            self.dissolve_fiber(n)

        railroads = join(self.bbecon, 'Railroads')
        self.dissolve(railroads, "TYPE = 'Heavy'", join(self.sgid, 'SGID10.TRANSPORTATION.Railroads'))

        self.log.info('chop up railroads by county')
        railroads_dissolved = '{}_dissolved'.format(railroads)
        if arcpy.Exists(railroads_dissolved):
            arcpy.Delete_management(railroads_dissolved)
        arcpy.Identity_analysis(railroads, 'SGID10.BOUNDARIES.Counties', railroads_dissolved)
        arcpy.Delete_management(railroads)

        arcpy.env.workspace = previous_workspace

        self.build_polygon_data()

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

        self.dissolve(fc, query, join(self.fiberverification_sde, 'FiberVerification.FIBERADMIN.Hexagons'))

    def build_polygon_data(self):
        county_fields = ['Avg_MonthlyIncome',
                         'Avg_HouseIncome',
                         'Median_Age',
                         'educationHighSchoolGraduate',
                         'educationBachelorOrGreater'] + ['TI_{}'.format(f) for f in range(1, 11)]
        datasets = [(join(self.fiberverification, 'Hexagons'), ['HexID'], None),
                    (join(self.broadband, 'BB_Service'), ['UTProvCode'], 'TRANSTECH NOT IN (60, 80)'),
                    (join(self.utilities, 'ElectricalService'), ['PROVIDER', 'WEBLINK'], None),
                    (join(self.utilities, 'RuralTelcomBoundaries'), ['PROVIDER', 'WEBLINK'], None),
                    (join(self.utilities, 'NaturalGasService_Approx'), ['PROVIDER', 'WEBLINK'], None),
                    (join(self.bbecon, 'Airport_SLinternational_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'Airport_RegionalCommercial_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'Airport_Local_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'HigherEd_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'CountyDemographics'), county_fields, None),
                    (join(self.economy, 'EnterpriseZones'), ['OBJECTID', 'ZONENAME', 'EXPYR', 'POC_NAME', 'POC_PHONE', 'POC_EMAIL'], None),
                    (join(self.bbecon, 'NatlParks_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'StParksAndMonuments_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'SkiArea_DriveTime'), ['Name', 'ToBreak'], None),
                    (join(self.bbecon, 'RoadsBuffer'), ['FULLNAME'], None)]

        roads = join(self.transportation, 'Roads')
        roadsBuffer = join(self.bbecon, 'RoadsBuffer')
        arcpy.Delete_management(roadsBuffer)
        arcpy.MakeFeatureLayer_management(roads, 'roads_lyr', "CARTOCODE in ( '1', '2', '3', '4', '5')")
        arcpy.Buffer_analysis('roads_lyr', roadsBuffer, '1 Miles', dissolve_option='LIST', dissolve_field='FULLNAME')
        arcpy.Delete_management('roads_lyr')

        polygonData = join(self.bbecon, 'PolygonData')
        arcpy.TruncateTable_management(polygonData)
        with arcpy.da.InsertCursor(polygonData, ['SOURCE', 'DATA', 'SHAPE@']) as ucur:
            for source, fields, where in datasets:
                print(source)
                with arcpy.da.SearchCursor(source, fields + ['SHAPE@'], where_clause=where) as cur:
                    for row in cur:
                        ucur.insertRow((basename(source), ';'.join([str(x) for x in row[:-1]]), row[-1]))
