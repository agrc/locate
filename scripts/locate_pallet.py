#!/usr/bin/env python
# * coding: utf8 *
'''
pallet.py

A module that contains the pallet for bb-econ
'''
from os import path

import arcpy
from forklift import core
from forklift.models import Pallet

taxEntities = 'TaxEntities2017'


class LocatePallet(Pallet):
    def build(self, target):
        self.arcgis_services = [('BBEcon/GenerateReport', 'GPServer'),
                                ('BBEcon/MapService', 'MapServer')]

        self.sgid = path.join(self.garage, 'SGID.sde')
        self.fiberverification_sde = path.join(self.garage, 'FiberVerification.sde')

        bbecon_name = 'bbecon.gdb'
        self.bbecon = path.join(self.staging_rack, bbecon_name)
        self.bbecon_static = path.join(r'C:\forklift\data\static', 'bbecon-static.gdb')
        self.broadband = path.join(self.staging_rack, 'broadband.gdb')
        self.cadastre = path.join(self.staging_rack, 'cadastre.gdb')
        self.economy = path.join(self.staging_rack, 'economy.gdb')
        self.fiberverification = path.join(self.staging_rack, 'fiberverification.gdb')
        self.health = path.join(self.staging_rack, 'health.gdb')
        self.location = path.join(self.staging_rack, 'location.gdb')
        self.society = path.join(self.staging_rack, 'society.gdb')
        self.transportation = path.join(self.staging_rack, 'transportation.gdb')
        self.utilities = path.join(self.staging_rack, 'utilities.gdb')
        self.polygon_data = path.join(self.bbecon, 'PolygonData')

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
        self.static_data = [self.bbecon_static]

        self.add_crates(['EnterpriseZones', taxEntities],
                        {'source_workspace': self.sgid,
                         'destination_workspace': self.economy})
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
                        {'source_workspace': path.join(self.garage, 'UBBMAP.sde'),
                         'destination_workspace': self.broadband})

        self.add_crates(['Hexagons', 'ProviderServiceAreas'],
                        {'source_workspace': self.fiberverification_sde,
                         'destination_workspace': self.fiberverification})

        #: since bbecon.gdb does not directly participate in any crates
        #: we need to manually create it if necessary
        if not arcpy.Exists(self.bbecon):
            arcpy.CreateFileGDB_management(self.staging_rack, bbecon_name)

    def requires_processing(self):
        return super(LocatePallet, self).requires_processing() or not arcpy.Exists(self.polygon_data)

    def process(self):
        self.joinTaxEntityCountyContacts()

        arcpy.env.overwriteOutput = True

        for n in [1, 9]:
            self.dissolve_fiber(n)

        railroads = path.join(self.bbecon, 'Railroads')
        self.dissolve(railroads, "TYPE = 'Heavy'", path.join(self.sgid, 'SGID.TRANSPORTATION.Railroads'))

        self.log.info('chop up railroads by county')
        railroads_dissolved = '{}_dissolved'.format(railroads)
        arcpy.Identity_analysis(railroads, path.join(self.sgid, 'SGID.BOUNDARIES.Counties'), railroads_dissolved)

        self.build_polygon_data()

    def joinTaxEntityCountyContacts(self):
        self.log.info('joining county contacts to tax entities')
        #: join contact info with taxentities
        for crate in self.get_crates():
            new_tax_entities = path.join(self.bbecon, taxEntities)
            if crate.destination_name == taxEntities and (crate.was_updated() or not arcpy.Exists(new_tax_entities)):
                if arcpy.Exists(new_tax_entities):
                    arcpy.management.Delete(new_tax_entities)
                arcpy.management.Copy(crate.destination, new_tax_entities)

                new_fields = ['NAME', 'PHONE', 'EMAIL', 'WEBSITE']
                for field in new_fields:
                    arcpy.management.AddField(new_tax_entities, field, 'TEXT', field_length=100)

                countyEconDevContacts = 'CountyEconDevContacts'
                layer = arcpy.management.MakeFeatureLayer(new_tax_entities)
                arcpy.management.AddJoin(layer, 'ENT_CO', path.join(self.bbecon_static, countyEconDevContacts), 'COUNTY_NUMBER')
                for field in new_fields:
                    arcpy.management.CalculateField(layer,
                                                    '{}.{}'.format(crate.destination_name, field),
                                                    '!{}.{}!'.format(countyEconDevContacts, field))

    def dissolve(self, fc, query, name):
        self.log.info('making feature layer')
        arcpy.env.outputCoordinateSystem = arcpy.SpatialReference(3857)
        arcpy.env.geographicTransformations = 'NAD_1983_To_WGS_1984_5'
        lyr = arcpy.FeatureClassToFeatureClass_conversion(name,
                                                          core.scratch_gdb_path,
                                                          '{}_DissolveLayer'.format(path.basename(fc)),
                                                          where_clause=query)
        arcpy.env.outputCoordinateSystem = None
        arcpy.env.geographicTransformations = None

        self.log.info('dissolving')
        arcpy.Dissolve_management(lyr, fc)

        self.log.info('simplifying')
        arcpy.Generalize_edit(fc, 50)

    def dissolve_fiber(self, num):
        self.log.info('{} month...'.format(num))

        query = 'HexID IN (SELECT HexID FROM PROVIDERSERVICEAREAS WHERE ServiceClass = {})'.format(num)
        fc = r'{}\Fiber_Dissolved_{}Month'.format(self.bbecon, num)

        self.dissolve(fc, query, path.join(self.fiberverification_sde, 'FiberVerification.FIBERADMIN.Hexagons'))

    def build_polygon_data(self):
        self.log.info('building PolygonData feature class...')
        county_fields = ['Avg_MonthlyIncome',
                         'Avg_HouseIncome',
                         'Median_Age',
                         'educationHighSchoolGraduate',
                         'educationBachelorOrGreater'] + ['TI_{}'.format(f) for f in range(1, 11)]
        datasets = [(path.join(self.fiberverification, 'Hexagons'), ['HexID'], None),
                    (path.join(self.broadband, 'BB_Service'), ['UTProvCode'], 'TRANSTECH NOT IN (60, 80)'),
                    (path.join(self.utilities, 'ElectricalService'), ['PROVIDER', 'WEBLINK'], None),
                    (path.join(self.utilities, 'RuralTelcomBoundaries'), ['PROVIDER', 'WEBLINK'], None),
                    (path.join(self.utilities, 'NaturalGasService_Approx'), ['PROVIDER', 'WEBLINK'], None),
                    (path.join(self.bbecon_static, 'Airport_SLinternational_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'Airport_RegionalCommercial_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'Airport_Local_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'HigherEd_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'CountyDemographics'), county_fields, None),
                    (path.join(self.economy, 'EnterpriseZones'), ['OBJECTID', 'ZONENAME', 'EXPYR', 'POC_NAME', 'POC_PHONE', 'POC_EMAIL'], None),
                    (path.join(self.bbecon, 'TaxEntities2017'), ['OBJECTID', 'ENT_DESC', 'NAME', 'PHONE', 'EMAIL', 'WEBSITE'], 'ENT_NBR >= 8000'),
                    (path.join(self.bbecon_static, 'NatlParks_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'StParksAndMonuments_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon_static, 'SkiArea_DriveTime'), ['Name', 'ToBreak'], None),
                    (path.join(self.bbecon, 'RoadsBuffer'), ['FULLNAME'], None),
                    (path.join(self.bbecon_static, 'OpportunityZones'), ['OBJECTID', 'ZoneName', 'GEOID'], None)]

        self.log.info('buffering roads')
        roads = path.join(self.transportation, 'Roads')
        roadsBuffer = path.join(self.bbecon, 'RoadsBuffer')
        arcpy.Delete_management(roadsBuffer)
        arcpy.MakeFeatureLayer_management(roads, 'roads_lyr', "CARTOCODE in ( '1', '2', '3', '4', '5')")
        arcpy.Buffer_analysis('roads_lyr', roadsBuffer, '1 Miles', dissolve_option='LIST', dissolve_field='FULLNAME')
        arcpy.Delete_management('roads_lyr')

        if arcpy.Exists(self.polygon_data):
            arcpy.TruncateTable_management(self.polygon_data)
        else:
            arcpy.CreateFeatureclass_management(self.bbecon, 'PolygonData', 'POLYGON', spatial_reference=arcpy.SpatialReference(3857))
            arcpy.AddField_management(self.polygon_data, 'DATA', 'TEXT', field_length=1000)
            arcpy.AddField_management(self.polygon_data, 'SOURCE', 'TEXT', field_length=50)
        with arcpy.da.InsertCursor(self.polygon_data, ['SOURCE', 'DATA', 'SHAPE@']) as ucur:
            for source, fields, where in datasets:
                self.log.info('loading: ' + source)
                with arcpy.da.SearchCursor(source, fields + ['SHAPE@'], where_clause=where) as cur:
                    for row in cur:
                        ucur.insertRow((path.basename(source), ';'.join([str(x) for x in row[:-1]]), row[-1].generalize(100)))
