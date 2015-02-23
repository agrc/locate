"""
Dissolved fiber data into one month and nine month features for
better drawing performance
"""

import arcpy
from settings import *
from os import getcwd
from agrc import logging
from agrc import messaging


class Runner():

    def __init__(self):
        self.logger = logging.Logger()
        self.emailer = messaging.Emailer(['stdavis@utah.gov'], not SEND_EMAILS)
        
    def run_with_try_catch(self):
        try:
            self.run()
            self.logger.logMsg('\nScript was successful!')
        except arcpy.ExecuteError:
            self.logger.logMsg('arcpy.ExecuteError')
            self.logger.logError()
            self.logger.logGPMsg()
            self.emailer.sendEmail(
                self.logger.scriptName + ' - arcpy.ExecuteError',
                self.logger.log)
        except Exception:
            self.logger.logError()
            self.emailer.sendEmail(
                self.logger.scriptName + ' - Python Error',
                self.logger.log)
        finally:
            self.logger.writeLogToFile()
            
    def run(self):
        for n in [1, 9]:
            self.dissolve_fiber(n)

        railroads = '{}\Railroads'.format(FGDB)
        arcpy.env.workspace = '{}\database_connections\{}'.format(getcwd(), SGID)
        self.dissolve(railroads, "TYPE = 'Heavy'", 'SGID10.TRANSPORTATION.Railroads')

        self.logger.logMsg('chop up railroads by county')
        railroads_dissolved = '{}_dissolved'.format(railroads)
        if arcpy.Exists(railroads_dissolved):
            arcpy.Delete_management(railroads_dissolved)
        arcpy.Identity_analysis(railroads, 'SGID10.BOUNDARIES.Counties', railroads_dissolved)
        arcpy.Delete_management(railroads)
    
        self.logger.logMsg('done')

    def dissolve(self, fc, query, name):
        if arcpy.Exists(fc):
            self.logger.logMsg('deleting previous feature class')
            arcpy.Delete_management(fc)

        self.logger.logMsg('making feature layer')
        lyr = arcpy.MakeFeatureLayer_management(name, 'DissolveLayer', query)

        self.logger.logMsg('dissolving')
        arcpy.Dissolve_management(lyr, fc)

        self.logger.logMsg('simplifing')
        arcpy.Generalize_edit(fc, 100)

        self.logger.logMsg('deleting layer')
        arcpy.Delete_management(lyr)

    def dissolve_fiber(self, num):
        self.logger.logMsg('{} month...'.format(num))

        arcpy.env.workspace = '{}\database_connections\{}'.format(getcwd(), SDE)

        query = 'HexID IN (SELECT HexID FROM ProviderServiceAreas WHERE ServiceClass = {})'.format(num)
        fc = '{}\Fiber_Dissolved_{}Month'.format(FGDB, num)

        self.dissolve(fc, query, 'Hexagons')

if __name__ == "__main__":
    Runner().run_with_try_catch()
