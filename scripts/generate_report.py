import re
import json

from arcpy import PointGeometry, Point, SpatialReference, MakeFeatureLayer_management, SelectLayerByLocation_management, GetCount_management, da, Buffer_analysis, GetParameterAsText, SetParameterAsText

from settings import *
from settings import fieldnames



def get_intersect_layer(point, feature_class, where='1 = 1'):
    lyr = MakeFeatureLayer_management(feature_class, feature_class + '_layer', where)
    SelectLayerByLocation_management(lyr, 'INTERSECT', point)
    return lyr


def get_fiber(point):
    lyr = get_intersect_layer(point, HEXAGONS)
    with da.SearchCursor(lyr, [fieldnames.HexID]) as cursor:
        hex_id = cursor.next()[0]

    records = []
    with da.SearchCursor(SERVICE_AREAS,
                         [fieldnames.ServiceClass, fieldnames.ProvName],
                         '{} = {} AND {} <> 0'.format(fieldnames.HexID, hex_id, fieldnames.ServiceClass),
                         sql_clause=(None, 'ORDER BY ' + fieldnames.ProvName)) as sa_cursor:
        for sa in sa_cursor:
            records.append({fieldnames.ServiceClass: FIBER_TERMS[sa[0]],
                            fieldnames.ProvName: sa[1]})
    add_provider_info(records, fieldnames.ProvName)

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
        with da.SearchCursor(PROVIDERS,
                             fields,
                             where) as prov_cursor:
            prov = prov_cursor.next()
            it.update({fieldnames.Colloquial: prov[0],
                       fieldnames.URL: prov[1],
                       fieldnames.ContactName: prov[2],
                       fieldnames.ContactPhone: prov[3],
                       fieldnames.ContactEmail: prov[4]})


def get_fixed(point):
    def get_data(fc, query):
        records = get_records(get_intersect_layer(point, fc, query),
                              [fieldnames.UTProvCode],
                              fieldnames.UTProvCode)
        add_provider_info(records, fieldnames.UTProvCode)

        return records

    providers = (get_data(WIRELESS, WIRELESS_QUERY) +
                 get_data(CENSUS, BB_QUERY) +
                 get_data(BUFFERED_ROAD, BB_QUERY))

    # remove duplicate providers
    names = []
    new = []
    for p in providers:
        if p[fieldnames.UTProvCode] not in names:
            new.append(p)
        names.append(p[fieldnames.UTProvCode])

    return new


def get_natural_gas(point):
    lyr = get_intersect_layer(point, NATURAL_GAS)

    count_result = GetCount_management(lyr)
    if int(count_result.getOutput(0)) > 0:
        return True
    else:
        return False


def get_records(lyr, fields, sort_field):
    records = []
    sql = (None, 'ORDER BY ' + sort_field)
    with da.SearchCursor(lyr, fields, sql_clause=sql) as cursor:
        for row in cursor:
            d = {}
            i = 0
            for f in fields:
                d[f] = row[i]
                i += 1
            records.append(d)

    return records


def get_topten(countyLyr):
    fields = ['TI_{}'.format(f) for f in range(1, 11)]
    results = []
    with da.SearchCursor(countyLyr, fields) as cursor:
        row = cursor.next()
        for i in range(0, 10):
            results.append({'rank': i+1,
                            'desc': row[i]})

    return results


def get_county_demographics(point):
    lyr = get_intersect_layer(point, COUNTIES)

    fields = [fieldnames.Avg_MonthlyIncome,
              fieldnames.Avg_HouseIncome,
              fieldnames.Median_Age,
              fieldnames.educationHighSchoolGraduate,
              fieldnames.educationBachelorOrGreater]

    record = get_records(lyr, fields, fieldnames.Avg_MonthlyIncome)[0]
    record['topten'] = get_topten(lyr)
    return record


def get_utilities(point):
    def process(fc):
        lyr = get_intersect_layer(point, fc)

        return get_records(lyr, [fieldnames.PROVIDER, fieldnames.WEBLINK], fieldnames.PROVIDER)

    return {'electrical': process(ELECTRICAL),
            'rural': process(RURAL_TEL),
            'natural_gas': get_natural_gas(point)}


def get_roads(point):
    buf = 'in_memory/roads_buffer'
    Buffer_analysis(point, buf, ROADS_BUFFER)
    lyr = get_intersect_layer(buf, ROADS, ROADS_WHERE)
    records = get_records(lyr, [fieldnames.FULLNAME], fieldnames.FULLNAME)
    # remove duplicates
    records = list(set([r[fieldnames.FULLNAME] for r in records]))
    records.sort()
    return records


def get_drive_time(fc, point):
    lyr = get_intersect_layer(point, fc)
    records = []
    reg = re.compile(r'(^.*) : .* (.*$)')
    names = []
    for rec in get_records(lyr, [fieldnames.Name, fieldnames.ToBreak], fieldnames.ToBreak):
        m = re.search(reg, rec[fieldnames.Name]).groups()

        # filter out duplicates with longer field names
        if m[0] not in names:
            records.append({'name': m[0],
                            'drive_time': DRIVE_TIME_TXT.format(rec[fieldnames.ToBreak])})
        names.append(m[0])
    return records


def get_airports(point):
    lyr = get_intersect_layer(point, AIRPORT_INT)
    drive_time = get_records(lyr, [fieldnames.ToBreak], fieldnames.ToBreak)[0][fieldnames.ToBreak]
    drive_time = DRIVE_TIME_TXT.format(drive_time).replace('.0', '')
    res = {'sl': {'drive_time': drive_time, 'name': 'Salt Lake International'},
           'regional_commercial': get_drive_time(AIRPORT_REG, point),
           'local': get_drive_time(AIRPORT_LOCAL, point)}

    return res


def get_enterprise_zone(point):
    lyr = get_intersect_layer(point, ENTERPRISE_ZONES)
    return len(get_records(lyr, ['OBJECTID'], 'OBJECTID')) > 0


if __name__ == '__main__':
    # x = 422991.7632080179
    # y = 4504669.423114922
    x = float(GetParameterAsText(0))
    y = float(GetParameterAsText(1))

    pnt = PointGeometry(Point(x, y), SpatialReference(26912))

    result = {'broadband': {'fiber': get_fiber(pnt),
                            'fixed': get_fixed(pnt)},
              'utilities': get_utilities(pnt),
              'transportation': {'roads': get_roads(pnt),
                                 'airports': get_airports(pnt)},
              'workforce': {'schools': get_drive_time(SCHOOLS, pnt),
                            'county_demographics': get_county_demographics(pnt),
                            'enterprise_zone': get_enterprise_zone(pnt)},
              'recreation': {'nat_parks': get_drive_time(NAT_PARKS, pnt),
                             'state_parks': get_drive_time(STATE_PARKS, pnt),
                             'ski': get_drive_time(SKI, pnt)}}

    SetParameterAsText(2, json.dumps(result))
