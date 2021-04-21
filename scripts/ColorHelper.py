# ColorHelper.py
# Five Color Helper Class
# [Python 2.7 (ArcGIS Desktop) / 3.4 (ArcGIS Pro)]
# downloaded from: https://www.arcgis.com/home/item.html?id=5fa04ce288284c999f70464e1c3b2e82

import arcpy


class ColorHelper(object):
    __bStandalone = False
    __messages = None
    __NeighborTable = None
    __NodeList = None
    __iNodeCount = 0

    # Public methods
    def EliminateOverlaps(self, sInFeatures, sOutFeatures, dMaxSliverArea, messages=None):
        if messages:
            self.__bStandalone = False
            self.__messages = messages
        else:
            self.__bStandalone = True

        # Create output feature class
        self.__Message("Creating single part polygons...")
        arcpy.MultipartToSinglepart_management(sInFeatures, sOutFeatures)
        self.__Message("Repairing geometry...")
        arcpy.RepairGeometry_management(sOutFeatures)
        result = arcpy.MakeFeatureLayer_management(sOutFeatures, "QueryLayer")
        lyrQuery = result[0]

        # Analyze polygon neighbors
        self.__Message("Analyzing overlaps...")
        sNeighborTab = "in_memory/TmpNeighborTab"
        if arcpy.Exists(sNeighborTab):
            arcpy.Delete_management(sNeighborTab)
        desc = arcpy.Describe(sOutFeatures)
        sOIDField = desc.OIDFieldName
        arcpy.PolygonNeighbors_analysis(sOutFeatures, sNeighborTab, sOIDField, "AREA_OVERLAP", "NO_BOTH_SIDES")

        # Loop through overlaps
        self.__Message("Eliminating overlaps...")
        NeighborFields = ["src_" + sOIDField, "nbr_" + sOIDField]
        FeatureFields = ["OID@", "SHAPE@"]
        iOverlapCount = 0
        DeleteList = []
        with arcpy.da.SearchCursor(sNeighborTab, NeighborFields, "AREA > 0") as cursor:
            for row in cursor:
                iOverlapCount += 1
                if iOverlapCount % 100 == 0:
                    self.__Status("Eliminating overlaps..." + str(iOverlapCount))

                # Get geometries
                iSrcID = row[0]
                iNbrID = row[1]
                sWhere = sOIDField + " IN ( " + str(iSrcID) + ", " + str(iNbrID) + " )"
                iOID1 = 0
                geom1 = None
                iOID2 = 0
                geom2 = None
                bFirst = True
                with arcpy.da.SearchCursor(sOutFeatures, FeatureFields, sWhere) as cursor2:
                    for row2 in cursor2:
                        if bFirst:
                            iOID1 = row2[0]
                            geom1 = row2[1]
                            bFirst = False
                        else:
                            iOID2 = row2[0]
                            geom2 = row2[1]

                # Check for empty or duplicate polygons
                if not geom1:
                    DeleteList.append(iOID1)
                    continue
                area1 = geom1.area
                if area1 == 0:
                    DeleteList.append(iOID1)
                    continue
                if not geom2:
                    DeleteList.append(iOID2)
                    continue
                area2 = geom2.area
                if area2 == 0:
                    DeleteList.append(iOID2)
                    continue
                if geom1.equals(geom2):
                    DeleteList.append(iOID2)
                    continue

                # Update the geometry with the larger area
                iUpdateID = 0
                geomUpdate = None
                if area1 > area2:
                    iUpdateID = iOID1
                    geomUpdate = geom1.difference(geom2)
                else:
                    iUpdateID = iOID2
                    geomUpdate = geom2.difference(geom1)
                sWhere = sOIDField + " = " + str(iUpdateID)
                with arcpy.da.UpdateCursor(sOutFeatures, FeatureFields, sWhere) as cursor2:
                    for row2 in cursor2:
                        row2[1] = geomUpdate
                        cursor2.updateRow(row2)

        self.__Message("Overlaps removed: " + str(iOverlapCount))
        arcpy.Delete_management(sNeighborTab)

        # Remove any duplicate polygons

        iDeleteCount = len(DeleteList)
        if iDeleteCount > 0:
            self.__Message("Removing " + str(iDeleteCount) + " empty or duplicate polygons...")
            sWhere = sOIDField + " IN ( "
            bFirst = True
            for iOID in DeleteList:
                if bFirst:
                    bFirst = False
                else:
                    sWhere += ", "
                sWhere += str(iOID)
            sWhere += " )"
            arcpy.SelectLayerByAttribute_management(lyrQuery, "NEW_SELECTION", sWhere)
            arcpy.DeleteRows_management(lyrQuery);

        # Remove slivers if present
        iSliverCount = 0
        if dMaxSliverArea > 0:
            self.__Message("Checking for slivers...")
            desc = arcpy.Describe(sOutFeatures)
            if not hasattr(desc, "areaFieldName"):
                # This should never happen
                self.__Error("Could not get area field name for " + sOutFeatures)
                return
            sAreaField = desc.areaFieldName
            sWhere = sAreaField + " < " + str(dMaxSliverArea)
            arcpy.SelectLayerByAttribute_management(lyrQuery, "NEW_SELECTION", sWhere)
            result = arcpy.GetCount_management(lyrQuery)
            iSliverCount = int(result[0])
        if iSliverCount > 0:
            self.__Message("Removing " + str(iSliverCount) + " slivers...")
            arcpy.DeleteRows_management(lyrQuery);
        self.__Message("Done.")
        return

    def CalculateColors(self, sInFeatures, sColorField, messages=None):
        if messages:
            self.__bStandalone = False
            self.__messages = messages
        else:
            self.__bStandalone = True

        # Check color field
        bValid = False
        desc = arcpy.Describe(sInFeatures)
        Fields = desc.fields
        for field in Fields:
            if field.name.upper() != sColorField.upper():
                continue
            sType = field.type
            bValue = (sType == "Integer" or sType == "SmallInteger")
            break;
        if not bValue:
            self.__Error('Field type must be "Integer" or "SmallInteger"')
            return

        # Clear out existing values
        self.__Message("Clearing out existing values...")
        arcpy.CalculateField_management(sInFeatures, sColorField, "-1", "PYTHON_9.3")

        # Analyze polygon neighbors
        self.__Message("Performing polygon neighbor analysis...")
        sNeighborTab = "in_memory/TmpNeighborTab"
        if arcpy.Exists(sNeighborTab):
            arcpy.Delete_management(sNeighborTab)
        desc = arcpy.Describe(sInFeatures)
        sOIDField = desc.OIDFieldName
        arcpy.PolygonNeighbors_analysis(sInFeatures, sNeighborTab, sOIDField, "NO_AREA_OVERLAP", "BOTH_SIDES")

        # Load neighbor data
        self.__Message("Loading neighbor data...")
        self.__NeighborTable = {}
        NeighborFields = ["src_" + sOIDField, "nbr_" + sOIDField]
        iCount = 0
        with arcpy.da.SearchCursor(sNeighborTab, NeighborFields, "LENGTH > 0") as cursor:
            for row in cursor:
                iCount += 1
                if iCount % 10000 == 0:
                    self.__Status("Loading neighbor data..." + str(iCount))

                # Add entry to table
                sSrcID = str(row[0])
                sNbrID = str(row[1])
                setNeighbor = None
                if not sSrcID in self.__NeighborTable:
                    setNeighbor = set()
                    self.__NeighborTable[sSrcID] = setNeighbor
                else:
                    setNeighbor = self.__NeighborTable[sSrcID]
                setNeighbor.add(sNbrID)

        # Analyze topology
        self.__Message("Analyzing topology...")
        self.__NodeStack = []
        self.__iNodeCount = 0
        while True:
            iLen = len(self.__NeighborTable)
            if iLen == 0:
                break

            # Process Rule 1 until matches run out
            bResult = True
            while bResult:
                bResult = self.__ProcessRule1()
            iLen = len(self.__NeighborTable)
            if iLen == 0:
                break

            # Process any Rule 2 matches
            # (There should be at least one)
            bResult = self.__ProcessRule2()
            if not bResult:
                # This should not happen (unless perhaps a multipart polygon is involved)
                self.__Error("Could not apply Rule 2.")
                del self.__NeighborTable
                del self.__NodeStack
                return
            continue

        # Build color table
        self.__Message("Building color table...")
        ColorTable = dict()
        iLen = len(self.__NodeStack)
        iCount = 0
        while iLen > 0:
            iCount += 1
            if iCount % 10000 == 0:
                self.__Status("Building color table..." + str(iCount))

            NodeEntry = self.__NodeStack.pop()
            sOID = NodeEntry[0]
            OIDSet = NodeEntry[1]
            ColorList = [False, False, False, False, False]
            for sOID2 in OIDSet:
                sOID3 = sOID2.split("/")[0]
                if not sOID3 in ColorTable:
                    continue
                i = ColorTable[sOID3]
                ColorList[i] = True
            Available = []
            for i in range(len(ColorList)):
                if ColorList[i]:
                    continue
                Available.append(i)
            if len(Available) == 0:

                # This should not happen (unless perhaps a multipart polygon is involved)
                self.__Error("Could not assign color at OID: " + sOID)
                del NodeStack
                del ColorTable
                return
            iColor = Available[0]
            for sOID2 in sOID.split("/"):
                ColorTable[sOID2] = iColor
            iLen -= 1

        # Calculate color field
        self.__Message("Calculating color field...")
        Fields = ["OID@", sColorField]
        iCount = 0;
        with arcpy.da.UpdateCursor(sInFeatures, Fields) as cursor:
            for row in cursor:
                iCount += 1
                if iCount % 1000 == 0:
                    self.__Status("Calculating color field..." + str(iCount))
                sOID = str(row[0])
                iColor = 0
                if sOID in ColorTable:
                    iColor = ColorTable[sOID]
                row[1] = iColor
                cursor.updateRow(row)
        self.__Message("Done.")
        del ColorTable
        return

    # Private methods
    def __Status(self, sMsg):
        if self.__bStandalone:
            print(sMsg)
        else:
            arcpy.SetProgressorLabel(sMsg)
        return

    def __Message(self, sMsg):
        if self.__bStandalone:
            print(sMsg)
        else:
            self.__messages.addMessage(sMsg)
            self.__Status(sMsg)
        return

    def __Warning(self, sMsg):
        if self.__bStandalone:
            print("WARNING: " + sMsg)
        else:
            self.__messages.addWarningMessage(sMsg)
        return

    def __Error(self, sMsg):
        if self.__bStandalone:
            print("ERROR: " + sMsg)
        else:
            self.__messages.addErrorMessage(sMsg)
            raise arcpy.ExecuteError
        return

    def __ProcessRule1(self):

        # If X has fewer than 5 neighbors,
        # add X to the node stack and remove it from the neighbor table
        bFound = False
        KeyList = list(self.__NeighborTable.keys())
        for sOID in KeyList:
            OIDSet = self.__NeighborTable[sOID]
            iSetCount = len(OIDSet)
            if iSetCount > 4:
                continue
            bFound = True
            self.__NodeStack.append([sOID, OIDSet])
            for sOID2 in OIDSet:
                OIDSet2 = self.__NeighborTable[sOID2]
                OIDSet2.remove(sOID)
            del self.__NeighborTable[sOID]
            self.__iNodeCount += 1
            if self.__iNodeCount % 10000 == 0:
                self.__Status("Analyzing topology..." + str(self.__iNodeCount))
        return bFound

    def __ProcessRule2(self):

        # If X has five neighbors, two of which have at most
        # seven neighbors and are not neighbors of each other,
        # add X to the node stack, remove it from the topology,
        # and combine the two neighbors into a single node connected
        # to their neighbors plus X's remaining neighbors
        bAnyFound = False
        KeyList = list(self.__NeighborTable.keys())
        for sOID in KeyList:
            if not sOID in self.__NeighborTable:
                continue
            OIDSet = self.__NeighborTable[sOID]
            iSetCount = len(OIDSet)
            if iSetCount != 5:
                continue
            OIDList = list(OIDSet)
            bFound = False
            N1 = 0
            N2 = 0
            NewOIDSet = None
            for i in range(iSetCount - 1):
                sOID2 = OIDList[i]
                OIDSet2 = self.__NeighborTable[sOID2]
                if len(OIDSet2) > 7:
                    continue
                for j in range(i + 1, iSetCount):
                    sOID3 = OIDList[j]
                    if sOID3 in OIDSet2:
                        continue
                    OIDSet3 = self.__NeighborTable[sOID3]
                    if len(OIDSet3) > 7:
                        continue
                    sN1 = sOID2
                    sN2 = sOID3
                    NewOIDSet = OIDSet | OIDSet2 | OIDSet3
                    NewOIDSet.remove(sOID)
                    NewOIDSet.remove(sN1)
                    NewOIDSet.remove(sN2)
                    bFound = True
                    break
                if bFound:
                    break
            if not bFound:
                continue
            bAnyFound = True
            del self.__NeighborTable[sOID]
            del self.__NeighborTable[sN1]
            del self.__NeighborTable[sN2]
            sNewOID = sN1 + "/" + sN2
            for sOID2 in NewOIDSet:
                OIDSet2 = self.__NeighborTable[sOID2]
                if sOIDR2 in OIDSet2:
                    OIDSet2.remove(sOIDR2)
                if sN1 in OIDSet2:
                    OIDSet2.remove(sN1)
                if sN2 in OIDSet2:
                    OIDSet2.remove(sN2)
                OIDSet2.add(sNewOID)
            self.__NeighborTable[sNewOID] = NewOIDSet
            iLen = len(NeighborTable) # iLen -= 2
            self.__NodeStack.append([sOID, OIDSet])
            self.__iNodeCount += 1
            if self.__iNodeCount % 10000 == 0:
                self.__Status("Analyzing topology..." + str(self.__iNodeCount))
            continue
        return bAnyFound

if __name__ == "__main__":
    # Test
    print("Executing...")
    sInFeatures = "c:/apps/temp/ColorTest.gdb/Mohave_Raw"
    sOutFeatures = "c:/apps/temp/ColorTest.gdb/Mohave_Clean"
    sColorField = "COLOR"
    ch = ColorHelper()
    #if arcpy.Exists(sOutFeatures):
    #    arcpy.Delete_management(sOutFeatures)
    #ch.EliminateOverlaps(sInFeatures, sOutFeatures, 20)
    ch.CalculateColors(sOutFeatures, sColorField)
