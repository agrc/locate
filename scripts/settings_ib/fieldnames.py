# PolygonData
DATA = 'DATA'
SOURCE = 'SOURCE'

# Hexagons
HexID = 'HexID'

# ProviderServiceAreas
ServiceClass = 'ServiceClass'
ProvName = 'ProvName'

# Providers
Colloquial = 'Colloquial'
Code = 'Code'
URL = 'URL'
ContactName = 'ContactName'
ContactPhone = 'ContactPhone'
ContactEmail = 'ContactEmail'

# Utilities
PROVIDER = 'PROVIDER'
WEBLINK = 'WEBLINK'

# Roads
CARTOCODE = 'CARTOCODE'
FULLNAME = 'HWYNAME'

# Drive Times
ToBreak = 'ToBreak'
Name = 'Name'

# BB
UTProvCode = 'UTProvCode'

# COUNTIES
Avg_MonthlyIncome = 'Avg_MonthlyIncome'
Avg_HouseIncome = 'Avg_HouseIncome'
Median_Age = 'Median_Age'
educationHighSchoolGraduate = 'educationHighSchoolGraduate'
educationBachelorOrGreater = 'educationBachelorOrGreater'

# ENTERPRISE ZONES
ZONENAME = 'ZONENAME'
EXPYR = 'EXPYR'
POC_NAME = 'POC_NAME'
POC_PHONE = 'POC_PHONE'
POC_EMAIL = 'POC_EMAIL'
ENTERPRISE_FIELDS = ['OBJECTID', ZONENAME, EXPYR, POC_NAME, POC_PHONE, POC_EMAIL]

FIELDS_LU = {
    r'fiberverification.gdb\Hexagons': ['HexID'],
    r'broadband.gdb\BB_Service': ['UTProvCode'],
    r'utilities.gdb\ElectricalService': ['PROVIDER', 'WEBLINK'],
    r'utilities.gdb\RuralTelcomBoundaries': ['PROVIDER', 'WEBLINK'],
    r'utilities.gdb\NaturalGasService_Approx': ['PROVIDER', 'WEBLINK'],
    r'bbecon.gdb\Airport_SLinternational_DriveTime': ['ToBreak'],
    r'bbecon.gdb\Airport_RegionalCommercial_DriveTime': ['ToBreak'],
    r'bbecon.gdb\Airport_Local_DriveTime': ['ToBreak'],
    r'bbecon.gdb\HigherEd_DriveTime': ['ToBreak'],
    r'bbecon.gdb\CountyDemographics': ['Avg_MonthlyIncome', 'Avg_HouseIncome', 'Median_Age', 'educationHighSchoolGraduate', 'educationBachelorOrGreater'],
    r'economy.gdb\EnterpriseZones': ['ZONENAME', 'EXPYR', 'POC_NAME', 'POC_PHONE', 'POC_EMAIL'],
    r'bbecon.gdb\NatlParks_DriveTime': ['ToBreak'],
    r'bbecon.gdb\StParksAndMonuments_DriveTime': ['ToBreak'],
    r'bbecon.gdb\SkiArea_DriveTime': ['ToBreak']
}
