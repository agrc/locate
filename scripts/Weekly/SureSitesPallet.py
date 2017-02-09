#!/usr/bin/env python
# * coding: utf8 *
'''
SureSitePallet.py

A forklift pallet for suresites data
'''

import arcpy
import requests
from collections import OrderedDict
from forklift import seat
from forklift.models import Pallet
from json import loads
from os.path import basename
from os.path import exists
from time import clock
from time import strftime
from unidecode import unidecode


class SureSitePallet(Pallet):
    def build(self):
        self.arcgis_services = [('BBEcon', 'MapServer')]
        self.bbecon = 'C:\\Scheduled\\staging\\bbecon.gdb'
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

    #: execute this pallet weekly
    def is_ready_to_ship(self):
        ready = strftime('%A') == 'Monday'
        if not ready:
            self.success = (True, 'This pallet only runs on Monday.')

        return ready

    #: copy this gdb on the same schedule as ship
    def requires_processing(self):
        ready = strftime('%A') == 'Monday'
        if not ready:
            self.success = (True, 'This pallet only copies to Prod on Monday.')

        return ready

    def ship(self):
        start_seconds = clock()
        r = requests.get('http://utahsuresites.com/rest/properties-all', timeout=30)
        self.log.debug('utahsuresites.com receieved in %s with response code %s', seat.format_time(clock() - start_seconds), r.status_code)

        r.raise_for_status()
        sites = r.json()

        self._create_workspace(self.bbecon)
        self._create_destination_table(self.bbecon, self.destination_fc_name)

        json_properties = [value[0] for value in self._fields.values()]
        json_properties.append('Position')
        fields = self._fields.keys()
        fields.append('shape@')
        with arcpy.da.InsertCursor(in_table=self.destination_fc_name, field_names=fields) as cursor:
            for site in sites:
                row = self._map_site_to_row(site, json_properties)
                try:
                    cursor.insertRow(row)
                except Exception as e:
                    self.log.warn('could not insert row %s. %s', row[0], e.message)
                    for data, fields in zip(row, self._fields.values()):
                        if data is not None:
                            self.log.warn('%s: %d of %d, %s',  fields[0], len(data), fields[3], data)

    def _create_workspace(self, workspace):
        if exists(workspace):
            return

        gdb_name = basename(workspace)
        workspace = workspace.replace(gdb_name, '')

        arcpy.CreateFileGDB_management(workspace, gdb_name, 'CURRENT')

    def _create_destination_table(self, workspace, name):
        env = arcpy.env
        arcpy.env.workspace = workspace

        try:
            arcpy.TruncateTable_management(name)
            return
        except arcpy.ExecuteError:
            #: table doesn't exist
            pass

        arcpy.CreateFeatureclass_management(out_path=workspace, out_name=name, geometry_type='POINT', spatial_reference=self.destination_coordinate_system)

        for field, props in self._fields.iteritems():
            if len(props) == 4:
                arcpy.AddField_management(in_table=name,
                                          field_name=field,
                                          field_alias=props[0],
                                          field_type=props[1],
                                          field_is_nullable=props[2],
                                          field_length=props[3])
            else:
                arcpy.AddField_management(in_table=name, field_name=field, field_alias=props[0], field_type=props[1], field_is_nullable=props[2])

        arcpy.env = env

    def _map_site_to_row(self, site, fields):
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

            if field == 'Position':
                #: latitude/longitude geojson string
                geojson = loads(data)['coordinates']
                data = arcpy.PointGeometry(arcpy.Point(geojson[0], geojson[1]), self.latlon)
                data = data.projectAs(self.webmerc)

            row.append(data)

        return row