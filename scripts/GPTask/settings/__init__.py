from GPTask.settings.dev import *

FIBER_GDB = DATA_PATH + r'\FiberVerification.gdb'
HEXAGONS = FIBER_GDB + r'\Hexagons'
SERVICE_AREAS = FIBER_GDB + r'\ProviderServiceAreas'
BB_GDB = DATA_PATH + r'\Broadband.gdb'
PROVIDERS = BB_GDB + r'\BB_Providers_Table'
WIRELESS = BB_GDB + r'\BB_Service_Wireless'
CENSUS = BB_GDB + r'\BB_Service_CensusBlocks'
BUFFERED_ROAD = BB_GDB + r'\BB_Service_Buffered_RoadSegment'
BB_QUERY = 'Provider_Type = 1'
WIRELESS_QUERY = 'TRANSTECH = 70 OR TRANSTECH = 71'

SGID_GDB = DATA_PATH + r'\SGID10.gdb'
NATURAL_GAS = SGID_GDB + r'\NaturalGasService_Approx'
ELECTRICAL = SGID_GDB + r'\ElectricalService'
RURAL_TEL = SGID_GDB + r'\RuralTelcomBoundaries'
ROADS = SGID_GDB + r'\Roads'
ROADS_WHERE = "CARTOCODE in ( '1', '2', '3', '4', '5')"
ROADS_BUFFER = '1 Miles'
ENTERPRISE_ZONES = SGID_GDB + r'\EnterpriseZones'

BBECON_GDB = DATA_PATH + r'\BBEcon.gdb'
AIRPORT_INT = BBECON_GDB + r'\Airport_SLinternational_DriveTime'
AIRPORT_REG = BBECON_GDB + r'\Airport_RegionalCommercial_DriveTime'
AIRPORT_LOCAL = BBECON_GDB + r'\Airport_Local_DriveTime'
COUNTIES = BBECON_GDB + r'\CountyDemographics'

SCHOOLS = BBECON_GDB + r'\HigherEd_DriveTime'
NAT_PARKS = BBECON_GDB + r'\NatlParks_DriveTime'
STATE_PARKS = BBECON_GDB + r'\StParksAndMonuments_DriveTime'
SKI = BBECON_GDB + r'\SkiArea_DriveTime'
GOLF = BBECON_GDB + r'\GolfCourses_DriveTime'

FIBER_TERMS = {1: 'Short term (1-3 month avg)', 9: 'Custom order (3-9 month avg)'}
