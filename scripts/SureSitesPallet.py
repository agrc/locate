#!/usr/bin/env python
# * coding: utf8 *
'''
SureSitePallet.py

A forklift pallet for suresites data
'''

from collections import OrderedDict
from json import loads
from os.path import basename, exists, join
from time import clock, strftime

import arcpy
import generate_report
import requests
from forklift import seat
from forklift.models import Pallet
from unidecode import unidecode
from geocoding import Geocoder
import settings_ib as settings


class EmptyGeometryError(Exception):
    pass


class SureSitePallet(Pallet):
    def build(self, config):
        self.arcgis_services = [('BBEcon/MapService', 'MapServer')]
        self.bbecon = join(self.staging_rack, 'bbecon.gdb')
        self.destination_fc_name = 'SureSites'
        self.latlon = arcpy.SpatialReference(4326)
        self.webmerc = arcpy.SpatialReference(3857)
        self._fields = OrderedDict([
            ('Site_ID', ['Nid', 'LONG', 'NULLABLE']),
            ('Zoning', ['Zoning', 'TEXT', 'NULLABLE', 255]),
            ('Address', ['Address', 'TEXT', 'NULLABLE', 255]),
            ('City', ['City', 'TEXT', 'NULLABLE', 255]),
            ('State', ['State', 'TEXT', 'NULLABLE', 255]),
            ('County', ['County', 'TEXT', 'NULLABLE', 255]),
            ('Country', ['Country', 'TEXT', 'NULLABLE', 5]),
            ('Zip', ['ZIP', 'TEXT', 'NULLABLE', 255]),
            ('Description', ['Description', 'TEXT', 'NULLABLE', 1000000]),
            ('Divisible', ['Divisible', 'TEXT', 'NULLABLE', 255]),
            ('Water', ['Water', 'TEXT', 'NULLABLE', 255]),
            ('Name', ['Site Name', 'TEXT', 'NULLABLE', 255]),
            ('Type', ['Property Type', 'TEXT', 'NULLABLE', 255]),
            ('Acreage', ['Total Acreage', 'DOUBLE', 'NULLABLE']),
            ('Sale_Price', ['Sale Price per SF', 'TEXT', 'NULLABLE', 100]),
            ('Lease_Price', ['Lease Price per SF', 'TEXT', 'NULLABLE', 100]),
            ('Ceiling_Height', ['Ceiling Height', 'DOUBLE', 'NULLABLE']),
            ('Lease_Type', ['Lease Type', 'TEXT', 'NULLABLE', 255]),
            ('Square_Footage', ['Total Building SF', 'DOUBLE', 'NULLABLE']),
            ('Minimum_Footage', ['Minimum Available SF', 'DOUBLE', 'NULLABLE']),
            ('Maximum_Footage', ['Maximum Available SF', 'DOUBLE', 'NULLABLE']),
            ('Year', ['Year Built', 'TEXT', 'NULLABLE', 255]),
            ('Doc_Doors', ['Number of Dock High Doors', 'DOUBLE', 'NULLABLE']),
            ('Parking_Ratio', ['Parking Ratio', 'TEXT', 'NULLABLE', 255]),
            ('Rail', ['Rail Available', 'TEXT', 'NULLABLE', 255]),
            ('Electrical', ['Type of Electric Service', 'TEXT', 'NULLABLE', 255]),
            ('Gas', ['Natural Gas Service', 'TEXT', 'NULLABLE', 255]),
            ('Contact_Name', ['Local Economic Development Contact', 'TEXT', 'NULLABLE', 255]),
            ('Contact_Email', ['Local Economic Development Email', 'TEXT', 'NULLABLE', 255]),
            ('Contact_Phone', ['Local Economic Development Phone', 'TEXT', 'NULLABLE', 255]),
            ('Flyer', ['Link to Real Estate Flyer', 'TEXT', 'NULLABLE', 1000000]),
            ('Broker', ['Broker Company', 'TEXT', 'NULLABLE', 255]),
            ('Broker_Name', ['Broker Name', 'TEXT', 'NULLABLE', 255]),
            ('Broker_Email', ['Broker Email', 'TEXT', 'NULLABLE', 1000000]),
            ('Broker_Phone', ['Broker Phone', 'TEXT', 'NULLABLE', 255]),
            ('Broker2_Name', ['Broker 2 Name', 'TEXT', 'NULLABLE', 255]),
            ('Broker2_Email', ['Broker 2 Email', 'TEXT', 'NULLABLE', 1000000]),
            ('Broker2_Phone', ['Broker 2 Phone', 'TEXT', 'NULLABLE', 255]),
            ('Classification', ['Office Space Classification', 'TEXT', 'NULLABLE', 255]),
            ('Images', ['Property Images', 'TEXT', 'NULLABLE', 1000000]),
            ('Electric_Service', ['Electric Service', 'TEXT', 'NULLABLE', 255]),
            ('Geo_Assessment', ['Geo-Technical Assessment Available', 'TEXT', 'NULLABLE', 255]),
            ('Environmental_Report', ['Phase I Environmental Report Available', 'TEXT', 'NULLABLE', 255])
        ])

        self.copy_data = [self.bbecon]

    def should_run(self):
        return strftime('%A') == 'Monday'
        # return True  #: for testing only

    def requires_processing(self):
        ready = self.should_run() or not arcpy.Exists(join(self.bbecon, self.destination_fc_name))
        if not ready:
            self.success = (True, 'This pallet only copies to Prod on Monday.')

        return ready

    def process(self):
        env = arcpy.env
        arcpy.env.workspace = self.bbecon

        start_seconds = clock()
        r = requests.get('https://utahsuresites.com/rest/properties-all.json', timeout=300)
        self.log.debug('utahsuresites.com receieved in %s with response code %s', seat.format_time(clock() - start_seconds), r.status_code)

        r.raise_for_status()
        sites = r.json()

        self._create_workspace(self.bbecon)
        self._create_destination_table(self.bbecon, self.destination_fc_name + '_temp')

        json_properties = [value[0] for value in self._fields.values()]
        fields = list(self._fields.keys())
        fields.append('shape@')
        fields.append('Report_JSON')
        with arcpy.da.InsertCursor(in_table=self.destination_fc_name + '_temp', field_names=fields) as cursor:
            geocoder = Geocoder(settings.API_KEY, cache_results=True)
            for site in sites:
                self.log.debug('processing site: %s', site[self._fields['Site_ID'][0]])
                try:
                    row = self._map_site_to_row(site, json_properties, geocoder)
                except EmptyGeometryError:
                    self.log.warn('unable to match address (%s, %s) or find coords (%s) for Nid: %s. Skipping...',
                                  site['Address'], site['ZIP'], site['Position'], site[self._fields['Site_ID'][0]])
                    continue

                try:
                    point = row[-1].firstPoint
                    row.append(generate_report.get_report(point.X, point.Y))
                    # row.append('report goes here')  #: for testing only
                except Exception:
                    row.append(None)

                try:
                    cursor.insertRow(row)
                except Exception as e:
                    self.log.warn('could not insert row %s. %s', row[0], e.message)
                    for data, fields in zip(row, self._fields.values()):
                        if data is not None:
                            self.log.warn('%s: %d of %d, %s',  fields[0], len(data), fields[3], data)

        #: if no errors, then load temp data into production
        self._create_destination_table(self.bbecon, self.destination_fc_name)
        arcpy.management.Append(self.destination_fc_name + '_temp', self.destination_fc_name)

        arcpy.env = env

    def _create_workspace(self, workspace):
        if exists(workspace):
            return

        gdb_name = basename(workspace)
        workspace = workspace.replace(gdb_name, '')

        arcpy.CreateFileGDB_management(workspace, gdb_name, 'CURRENT')

    def _create_destination_table(self, workspace, name):
        try:
            arcpy.TruncateTable_management(name)
            return
        except arcpy.ExecuteError:
            #: table doesn't exist
            pass

        arcpy.CreateFeatureclass_management(out_path=workspace, out_name=name, geometry_type='POINT', spatial_reference=self.destination_coordinate_system)

        def add_field(field, props):
            arcpy.AddField_management(in_table=name,
                                      field_name=field,
                                      field_alias=props[0],
                                      field_type=props[1],
                                      field_is_nullable=props[2],
                                      field_length=props[3])
        for field, props in self._fields.items():
            if len(props) == 4:
                add_field(field, props)
            else:
                arcpy.AddField_management(in_table=name, field_name=field, field_alias=props[0], field_type=props[1], field_is_nullable=props[2])

        #: add this field separately because it's not included in the json that we get from utahsuresites.com
        add_field('Report_JSON', ['Cached Report JSON', 'TEXT', 'NULLABLE', 15000])

    def _map_site_to_row(self, site, fields, geocoder):
        row = []
        for field in fields:
            data = site[field]
            #: handle empty array's and strings
            if data is None or len(data) < 1:
                data = None
            elif isinstance(data, list):
                data = ', '.join(data)

            if data is not None:
                data = unidecode(data)
                data.encode('ascii')

            row.append(data)

        #: geocode address
        try:
            geocode_result = geocoder.locate(site['Address'], site['ZIP'])

            location = geocode_result['location']

            row.append(arcpy.PointGeometry(arcpy.Point(location['x'], location['y']), self.webmerc))

            return row
        except Exception as error:
            self.log.warn(error)
            self.log.info('attempting to use coords from "Position" field')

            try:
                geojson = loads(site['Position'])['coordinates']
            except TypeError:
                raise EmptyGeometryError()
            data = arcpy.PointGeometry(arcpy.Point(geojson[0], geojson[1]), self.latlon)
            data = data.projectAs(self.webmerc)

            row.append(data)

            return row
