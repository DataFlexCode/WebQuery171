Use Windows.pkg
Use DFClient.pkg
Use cFreeTextIndex.pkg
Use StringFunctions.pkg // Define oStringFunctions object
Use FileFunctions.pkg // Define oFileFunctions object
Use Win\GridFunctions.pkg // Define oGridFunctions object
Use FreeTextIndexerControlCenterSearch.vw

Activate_View Activate_oFreeTextIndexerControlCenter for oFreeTextIndexerControlCenter
Object oFreeTextIndexerControlCenter is a dbView

    Set Border_Style to Border_Thick
    Set Size to 156 351
    Set Location to 8 11
    Set Label to "Free Text Indexer Control Center"
    Set piMinSize to 163 351
    On_Key kCancel Send close_panel
    
        Function FtiNameToObjectId String sName Returns Integer
            Integer iIndex iMax
            Move (SizeOfArray(aFTIObjects)-1) to iMax
            For iIndex from 0 to iMax
                If (sName=psName(aFTIObjects[iIndex])) Function_Return aFTIObjects[iIndex]
            Loop
            Function_Return 0
        End_Function
        
        Function CurrentFtiObject Returns Integer
            Integer hFti
            String sFtiName
            Get value of oFtiObject to sFtiName
            Get FtiNameToObjectId sFtiName to hFti
            Function_Return hFti
        End_Function

    Object oFtiObject is a ComboForm
        Set Size to 14 189
        Set Location to 13 95
        Set Label to "Select FTI object:"
        Set Entry_State to False
        Set Allow_Blank_State to False
        Set Select_Mode to No_Select
    
        //Combo_Fill_List is called when the list needs filling
    
        Procedure Combo_Fill_List
            Integer iIndex iMax
            Send Combo_Delete_Data
            Move (SizeOfArray(aFTIObjects)-1) to iMax
            For iIndex from 0 to iMax
                Send Combo_Add_Item (psName(aFTIObjects[iIndex]))
            Loop
        End_Procedure
    
        //OnChange is called on every changed character
    
        Procedure OnChange
            Send NewFtiObject
        End_Procedure
    End_Object

    Object oTableGrid is a Grid
        Set Location to 42 11
    
        Set Size to 65 327
    
        Set Line_Width to 4 0
    
        Set Form_Width   0 to 47
        Set Header_Label 0 to "Table"
    
        Set Form_Width 1 to 97
        Set Header_Label 1 to "Recs/Max (%)"
        Set Header_Label 2 to "Index status"
        Set Form_Width 2 to 50
        Set Header_Label 3 to "Data file location"
        Set Form_Width 3 to 122
        Set peAnchors to anAll
        Set Select_Mode to No_Select
    
        Procedure DoFillGrid
            Boolean bOnline
            Integer hFti iMax iIndex iRecsUsed iRecsMax iItem
            Integer[] aTables 
            DateTime dtUpdated
            String sTableName sFolder
            
            Get CurrentFtiObject to hFti
            Send Delete_Data
            If (hFti<>0) Begin
                Get AssignedTablesArray of hFti to aTables
                Move (SizeOfArray(aTables)-1) to iMax
                For iIndex from 0 to iMax
                    Get_Attribute DF_FILE_LOGICAL_NAME of aTables[iIndex] to sTableName
                    Get_Attribute DF_FILE_RECORDS_USED of aTables[iIndex] to iRecsUsed
                    Get_Attribute DF_FILE_MAX_RECORDS of aTables[iIndex] to iRecsMax
                    
                    Send Add_Item MSG_NONE sTableName
                    Send Add_Item MSG_NONE (String(iRecsUsed)+"/"+String(iRecsMax)+" ("+NumberToString(oStringFunctions,Number(iRecsUsed)/iRecsMax*100,1)+"%)")

                    Get item_count to iItem
                    Send Add_Item MSG_NONE ""
                    
                    If (iIndex=2) Begin // Article words
                        Get IndexOnlineArtWord of hFti to bOnline
                        If (bOnline) Set Value iItem to "on-line"
                        Else Begin
                            Set Value item  iItem to "off-line"
                            Set ItemColor iItem to (RGB(255,192,192))
                        End
                    End
                    Else If (iIndex=3) Begin // Article phrase
                        Get IndexOnlineArtPhrase of hFti to bOnline
                        If (bOnline) Set Value iItem to "on-line"
                        Else Begin
                            Set Value iItem to "off-line"
                            Set ItemColor iItem to (RGB(255,192,192))
                        End
                    End 
                    Else Set ItemColor iItem to clBtnFace
                    
                    Send Add_Item MSG_NONE "Not implemented"
                Loop
            End
            Send SetEntryState of oGridFunctions Self False
        End_Procedure
    
    End_Object

    Object oSearchBtn is a Button
        Set Size to 14 36
        Set Location to 118 56
        Set Label to "Search"
        Set peAnchors to anBottomRight
        Procedure OnClick
            Integer hObj
            Boolean bAllow
            Get CurrentFtiObject to hObj
            Send PopupSearch of oFreeTextIndexerControlCenterSearch hObj
        End_Procedure
    End_Object

    Object oDeleteAllDataBtn is a Button
        Set Size to 14 59
        Set Location to 118 94
        Set Label to "Delete all data"
        Set peAnchors to anBottomRight
        Procedure OnClick
            Integer hObj
            Boolean bAllow
            Get CurrentFtiObject to hObj
            If hObj Get pbCanRebuild of hObj to bAllow
            Else Move False to bAllow
            
            If bAllow Begin
                If (YesNo_Box("Delete all data in the FTI object?","Question",MB_DEFBUTTON1)=MBR_Yes) Begin
                    If (ExclusiveAccess(hObj)) Begin
                        Send DeleteAllData of hObj
                        Send SharedAccess of hObj
                    End
                    Else Send Info_Box "Exlusive access could not be obtained"
                End
            End
            Send DoFillGrid of oTableGrid
        End_Procedure
    End_Object

    Object oRebuildIndexBtn is a Button
        Set Size to 14 70
        Set Location to 118 155
        Set Label to "Rebuild FTI index"
        Set peAnchors to anBottomRight
        Procedure OnClick
            Integer hObj
            Boolean bAllow
            Get CurrentFtiObject to hObj
            If hObj Get pbCanRebuild of hObj to bAllow
            Else Move False to bAllow
            
            If bAllow Begin
                If (YesNo_Box("Rebuild all data in the FTI object?","Question",MB_DEFBUTTON1)=MBR_Yes) Begin
                    Send RebuildFtiIndex of hObj
                End
            End
            Send DoFillGrid of oTableGrid
        End_Procedure
    End_Object

    Object oLaunchExplorerBtn is a Button
        Set Size to 14 53
        Set Location to 118 227
        Set Label to "Launch Expl."
        Set peAnchors to anBottomRight
        Procedure OnClick
            String sPath
            Get VdfFolderPath of oFileFunctions VDF_FILELIST to sPath
            Send ShellExecuteDocument of oFileFunctions sPath
        End_Procedure
    End_Object

    Object oResetIndexStateBtn is a Button
        Set Size to 14 57
        Set Location to 118 281
        Set Label to "Reset idx state"
        Set peAnchors to anBottomRight
        Procedure OnClick
            Integer hObj

            Get CurrentFtiObject to hObj
            
            If (YesNo_Box("Switch index state to 'on-line' on words and phrases?","Question",MB_DEFBUTTON1)=MBR_Yes) Begin
                If (ExclusiveAccess(hObj)) Begin
                    Send SetIndexState of hObj DF_INDEX_TYPE_ONLINE
                    Send SharedAccess of hObj
                End
                Else Send Info_Box "Exclusive access could not be obtained"
            End
            Send DoFillGrid of oTableGrid
            
        End_Procedure
    End_Object
    
    Procedure NewFtiObject
        Integer hObj
        Boolean bAllow
        Send DoFillGrid of oTableGrid
        Get CurrentFtiObject to hObj
        If hObj Get pbCanRebuild of hObj to bAllow
        Else Move False to bAllow
        Set Enabled_State of oDeleteAllDataBtn to bAllow
        Set Enabled_State of oRebuildIndexBtn to bAllow
    End_Procedure
    
    Procedure popup
        Send Combo_Fill_List of oFtiObject
        Forward Send popup
        Send DoFillGrid of oTableGrid
    End_Procedure
End_Object
