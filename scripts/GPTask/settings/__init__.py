DATA_PATH = r'C:\MapData'

FIBER_GDB = DATA_PATH + r'\fiberverification.gdb'
HEXAGONS = FIBER_GDB + r'\Hexagons'
SERVICE_AREAS = FIBER_GDB + r'\ProviderServiceAreas'
BB_GDB = DATA_PATH + r'\broadband.gdb'
PROVIDERS = BB_GDB + r'\BB_Providers_Table'
FIXED = BB_GDB + r'\BB_Service'
FIXED_QUERY = 'TRANSTECH NOT IN (60, 80)'

UTILITIES_GDB = DATA_PATH + r'\utilities.gdb'
NATURAL_GAS = UTILITIES_GDB + r'\NaturalGasService_Approx'
ELECTRICAL = UTILITIES_GDB + r'\ElectricalService'
RURAL_TEL = UTILITIES_GDB + r'\RuralTelcomBoundaries'
ROADS = DATA_PATH + r'\transportation.gdb\Roads'
ROADS_WHERE = "CARTOCODE in ( '1', '2', '3', '4', '5')"
ROADS_BUFFER = '1 Miles'
ENTERPRISE_ZONES = DATA_PATH + r'\economy.gdb\EnterpriseZones'

BBECON_GDB = DATA_PATH + r'\bbecon.gdb'
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
