import arcpy
import re
import json
import settings_ib as settings

from settings_ib import fieldnames
from os.path import basename
from time import time


start_time = time()


def timer():
    return time() - start_time


def get_intersect_layer(point, feature_class):
    lyr = arcpy.MakeFeatureLayer_management(feature_class, feature_class + '_layer')
    arcpy.SelectLayerByLocation_management(lyr, 'INTERSECT', point)
    return lyr


def get_fiber(data):
    hex_id = data[basename(settings.HEXAGONS)][0]

    records = []
    provs = []  # for preventing duplicates
    with arcpy.da.SearchCursor(settings.SERVICE_AREAS,
                               [fieldnames.ServiceClass, fieldnames.ProvName],
                               '{} = {} AND {} <> 0'.format(fieldnames.HexID, hex_id, fieldnames.ServiceClass)) as sa_cursor:
        for sa in sa_cursor:
            if sa[1] not in provs:
                records.append({fieldnames.ServiceClass: settings.FIBER_TERMS[sa[0]],
                                fieldnames.ProvName: sa[1]})
                provs.append(sa[1])
    add_provider_info(records, fieldnames.ProvName)

    records.sort(key=lambda row: row[fieldnames.ProvName])
    return records


def add_provider_info(items, code_field):
    fields = [
        fieldnames.Colloquial,
        fieldnames.URL,
        fieldnames.ContactName,
        fieldnames.ContactPhone,
        fieldnames.ContactEmail
    ]
    for it in items:
        where = '{} = \'{}\''.format(fieldnames.Code, it[code_field])
        with arcpy.da.SearchCursor(settings.PROVIDERS,
                                   fields,
                                   where) as prov_cursor:
            try:
                prov = prov_cursor.next()
                it.update({fieldnames.Colloquial: prov[0],
                           fieldnames.URL: prov[1],
                           fieldnames.ContactName: prov[2],
                           fieldnames.ContactPhone: prov[3],
                           fieldnames.ContactEmail: prov[4]})
            except:
                it.update({fieldnames.Colloquial: 'n/a',
                           fieldnames.URL: 'n/a',
                           fieldnames.ContactName: 'n/a',
                           fieldnames.ContactPhone: 'n/a',
                           fieldnames.ContactEmail: 'n/a'})


def get_fixed(data):

    providers = get_records(data[basename(settings.FIXED)], [fieldnames.UTProvCode], fieldnames.UTProvCode)
    add_provider_info(providers, fieldnames.UTProvCode)

    # remove duplicate providers
    names = []
    new = []
    for p in providers:
        if p[fieldnames.UTProvCode] not in names:
            new.append(p)
        names.append(p[fieldnames.UTProvCode])

    return new


def get_records(data, fields, sort_field, titlecase_fields=[]):
    records = []
    for data_element in data:
        data_elements = data_element.split(';')
        d = {}
        i = 0
        for f in fields:
            if f in titlecase_fields:
                d[f] = data_elements[i].title()
            else:
                d[f] = data_elements[i]
            i += 1
        records.append(d)

    return sorted(records, key=lambda r: r[sort_field])


def get_topten(record, fields):
    results = []
    i = 1
    for fld in fields:
        results.append({'rank': i,
                        'desc': record[fld]})
        i += 1

    return results


def get_county_demographics(data):

    tt_fields = ['TI_{}'.format(f) for f in range(1, 11)]
    fields = [fieldnames.Avg_MonthlyIncome,
              fieldnames.Avg_HouseIncome,
              fieldnames.Median_Age,
              fieldnames.educationHighSchoolGraduate,
              fieldnames.educationBachelorOrGreater]

    record = get_records(data[basename(settings.COUNTIES)], fields + tt_fields, fieldnames.Avg_MonthlyIncome)[0]
    record['topten'] = get_topten(record, tt_fields)
    return record


def get_utilities(data):
    fields = [fieldnames.PROVIDER, fieldnames.WEBLINK]
    return {'electrical': get_records(data[basename(settings.ELECTRICAL)], fields, fieldnames.PROVIDER, [fieldnames.PROVIDER]),
            'rural': get_records(data[basename(settings.RURAL_TEL)], fields, fieldnames.PROVIDER, [fieldnames.PROVIDER]),
            'natural_gas': get_records(data[basename(settings.NATURAL_GAS)], fields, fieldnames.PROVIDER, [fieldnames.PROVIDER])}


def get_roads(data):
    records = get_records(data[basename(settings.ROADS)], [fieldnames.FULLNAME], fieldnames.FULLNAME)
    # remove duplicates
    records = list(set([r[fieldnames.FULLNAME] for r in records]))
    records.sort()
    return records


def get_drive_time(data):
    records = []
    reg = re.compile(r'(^.*) : .* (.*$)')
    names = []
    for rec in get_records(data, [fieldnames.Name, fieldnames.ToBreak], fieldnames.ToBreak, [fieldnames.Name]):
        m = re.search(reg, rec[fieldnames.Name]).groups()

        # filter out duplicates with longer field names
        if m[0] not in names:
            records.append({'name': m[0],
                            'drive_time': format_drive_time(rec[fieldnames.ToBreak]),
                            'mins': float(rec[fieldnames.ToBreak])})
        names.append(m[0])
    return sorted(records, key=lambda rec: rec['mins'])


def format_drive_time(mins):
    mins = int(mins.split('.')[0])
    if mins < 60:
        return '< {} mins'.format(str(mins).replace('.0', ''))
    elif mins == 60:
        return '< 1 hour'
    else:
        hours = str(mins/60.00).replace('.0', '')
        return '< {} hours'.format(hours)


def get_airports(data):
    drive_time = format_drive_time(data[basename(settings.AIRPORT_INT)][0].split(';')[1])
    res = {'sl': {'drive_time': drive_time, 'name': 'Salt Lake International'},
           'regional_commercial': get_drive_time(data[basename(settings.AIRPORT_REG)]),
           'local': get_drive_time(data[basename(settings.AIRPORT_LOCAL)])}

    return res


def get_enterprise_zone(data):
    return get_records(data[basename(settings.ENTERPRISE_ZONES)], fieldnames.ENTERPRISE_FIELDS, 'OBJECTID')


def get_data_from_layer(lyr):
    data = {}
    for DS in settings.DATASETS:
        #: make sure that we have an empty array if there's not data for a specific source
        data[DS] = []
    with arcpy.da.SearchCursor(lyr, [fieldnames.SOURCE, fieldnames.DATA]) as cur:
        for row in cur:
            source, data_value = row
            data[source].append(data_value)

    return data


def get_report(x, y):
    print('getting report for {}, {}'.format(x, y))
    if type(x) == str:
        x = int(x)
        y = int(y)

    pnt = arcpy.PointGeometry(arcpy.Point(x, y), arcpy.SpatialReference(3857))

    lyr = get_intersect_layer(pnt, settings.POLYGON_DATA)

    data = get_data_from_layer(lyr)

    result = {'broadband': {'fiber': get_fiber(data),
                            'fixed': get_fixed(data)},
              'utilities': get_utilities(data),
              'transportation': {'roads': get_roads(data),
                                 'airports': get_airports(data)},
              'workforce': {'schools': get_drive_time(data[basename(settings.SCHOOLS)]),
                            'county_demographics': get_county_demographics(data),
                            'enterprise_zone': get_enterprise_zone(data)},
              'recreation': {'nat_parks': get_drive_time(data[basename(settings.NAT_PARKS)]),
                             'state_parks': get_drive_time(data[basename(settings.STATE_PARKS)]),
                             'ski': get_drive_time(data[basename(settings.SKI)])}}

    arcpy.Delete_management(lyr)

    #: development only
    # import pprint
    # pp = pprint.PrettyPrinter(indent=4)
    # pp.pprint(result)

    return json.dumps(result)


if __name__ == '__main__':
    x = arcpy.GetParameterAsText(0)
    y = arcpy.GetParameterAsText(1)

    arcpy.SetParameterAsText(2, get_report(x, y))
