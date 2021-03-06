import unittest
import sys
import os

import arcpy

from scripts import generate_report
from scripts.settings import fieldnames
from scripts.settings import *


sys.path.append(os.getcwd() + '../')


def make_point(x, y):
    return arcpy.PointGeometry(arcpy.Point(x, y), arcpy.SpatialReference(26912))


class GenerateReportTests(unittest.TestCase):
    def setUp(self):
        x = 421080.8375008911
        y = 4495496.979720714

        self.point = make_point(x, y)

    def test_get_fiber_data(self):
        result = generate_report.get_fiber(self.point)

        self.assertEqual(len(result), 3)
        item = result[1]
        self.assertEqual(item[fieldnames.ServiceClass], 'Short term (1-3 month avg)')
        self.assertEqual(item[fieldnames.Colloquial], 'Comcast')
        self.assertEqual(item[fieldnames.URL], 'http://www.comcast.com/')

    def test_get_utilities(self):
        result = generate_report.get_utilities(self.point)

        elec = result['electrical'][0]
        self.assertEqual(elec[fieldnames.PROVIDER], 'Rocky Mountain Power')
        self.assertEqual(elec[fieldnames.WEBLINK], 'https://www.rockymountainpower.net')

        rur = result['rural'][0]
        self.assertEqual(rur[fieldnames.PROVIDER], 'Centurylink')
        self.assertEqual(rur[fieldnames.WEBLINK], 'http://www.centurylink.com/')

        ng = result['natural_gas'][0]

        self.assertEqual(ng[fieldnames.PROVIDER], 'Questar Gas')
        self.assertEqual(ng[fieldnames.WEBLINK], 'http://www.questargas.com')

    def test_get_roads(self):
        results = generate_report.get_roads(self.point)

        self.assertEqual(len(results), 2)

    def test_get_airports(self):
        results = generate_report.get_airports(self.point)

        sl = results['sl']
        self.assertEqual(sl['name'], 'Salt Lake International')
        self.assertEqual(sl['drive_time'], '< 30 mins')

        self.assertEqual(len(results['regional_commercial']), 4)
        rc = results['regional_commercial'][0]
        self.assertEqual(rc['name'], 'Ogden-Hinckley')
        self.assertEqual(rc['drive_time'], '< 1 hour')

    def test_get_fixed(self):
        results = generate_report.get_fixed(self.point)

        self.assertEqual(len(results), 6)
        self.assertEqual(results[0][fieldnames.Colloquial], 'The Blue Zone')
        self.assertEqual(results[0][fieldnames.URL], 'http://www.thebluezone.com/')

    def test_get_utilities_sort(self):
        lyr = generate_report.get_intersect_layer(self.point, SKI)
        results = generate_report.get_records(lyr, [fieldnames.ToBreak], fieldnames.ToBreak)

        self.assertEqual(results[0][fieldnames.ToBreak], 45)
        self.assertEqual(results[-1][fieldnames.ToBreak], 240)

    def test_get_county_demographics(self):
        results = generate_report.get_county_demographics(self.point)

        self.assertEqual(len(results['topten']), 10)
        self.assertEqual(results['topten'][0], {'rank': 1,
                                                'desc': 'Elementary and Secondary Schools'})
        self.assertEqual(results[fieldnames.Avg_MonthlyIncome], '3,796')

    def test_format_drive_time(self):
        self.assertEqual(generate_report.format_drive_time(30), '< 30 mins')
        self.assertEqual(generate_report.format_drive_time(60), '< 1 hour')
        self.assertEqual(generate_report.format_drive_time(90), '< 1.5 hours')
        self.assertEqual(generate_report.format_drive_time(120), '< 2 hours')

    def test_get_enterprise_zones(self):
        results = generate_report.get_enterprise_zone(self.point)

        self.assertEqual(0, len(results))
