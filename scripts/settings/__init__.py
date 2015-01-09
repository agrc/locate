from settings.dev import *

FIBER_GDB = DATA_PATH + r'\FiberVerification.gdb'
HEXAGONS = FIBER_GDB + r'\Hexagons'
SERVICE_AREAS = FIBER_GDB + r'\ProviderServiceAreas'
PROVIDERS = FIBER_GDB + r'\Providers'
BB_GDB = DATA_PATH + r'\Broadband.gdb'
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
ROADS_BUFFER = '5 Miles'

BBECON_GDB = DATA_PATH + r'\BBEcon.gdb'
AIRPORT_INT = BBECON_GDB + r'\Airport_SLinternational_DriveTime'
AIRPORT_REG = BBECON_GDB + r'\Airport_RegionalCommercial_DriveTime'
AIRPORT_LOCAL = BBECON_GDB + r'\Airport_Local_DriveTime'

DRIVE_TIME_TXT = '< {} min'

SCHOOLS = BBECON_GDB + r'\HigherEd_DriveTime'
NAT_PARKS = BBECON_GDB + r'\NatlParks_DriveTime'
STATE_PARKS = BBECON_GDB + r'\StParksAndMonuments_DriveTime'
SKI = BBECON_GDB + r'\SkiArea_DriveTime'
GOLF = BBECON_GDB + r'\GolfCourses_DriveTime'

FIBER_TERMS = {1: 'Short term', 9: 'Custom order'}
