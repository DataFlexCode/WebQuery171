Use Windows.pkg
Use DFClient.pkg
Use DataDictionaryFunctions.pkg
Use Win\ObjectInfo.pkg
Use Win\GridFunctions.pkg
Use win\DataDictionaryFunctionsDebugPanel.dg

Activate_View Activate_oDataDictionaryViewDebugger for oDataDictionaryViewDebugger
Object oDataDictionaryViewDebugger is a View
    
    Move Self to _goDdoDebugView 
    On_Key kCancel Send Close_Panel
    
    Object oIdleHandler is a cIdleHandler
        Procedure OnIdle
            Send UpdateDdoGraphInfo
        End_Procedure
    End_Object
    
        // enable the idle handler timer when the button is activated
    Procedure Activating Returns Integer
       Forward Send Activating
       Set pbEnabled of oIdleHandler to True
    End_Procedure

    // disable the idle handler when the button is deactivated
    Procedure Deactivating Returns Integer
       Set pbEnabled of oIdleHandler to False
       Forward Send DeActivating 
    End_Procedure


    Set Border_Style to Border_Thick
    Set Size to 234 485
    Set Location to 6 5
    Set Maximize_Icon to True

    Object oGrid is a Grid
        Set Location to 8 9
        Set Size to 191 460

        Send AddColumn of oGridFunctions "Srv"      (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,3,0))   24
        Send AddColumn of oGridFunctions "Ds"       (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,3,0))   24
        Send AddColumn of oGridFunctions "DDO tree" (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,50,0)) 320
        Send AddColumn of oGridFunctions "Has rec." (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,8,0))   40
        Send AddColumn of oGridFunctions "Changed"  (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,8,0))   40

        Send ApplyToGrid of oGridFunctions Self False
    
        Set peAnchors to anAll
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 2
        
        Set Form_Typeface 0 to "Courier New"
        Set Form_FontHeight 0 to 16
        Set Form_Typeface 1 to "Courier New"
        Set Form_FontHeight 1 to 16
        Set Form_Typeface 2 to "Courier New"
        Set Form_FontHeight 2 to 16
        Set GridLine_Mode to Grid_Visible_Vert
    
        Property tRelationsDrawingMapItem[] _paMap
        Property tOIDeoInfo _pstFocInfo

            Function _GraphicLead tRelationsDrawingMapItem stItem Returns String
                Integer iMax iIndex
                String sLead
                Move (SizeOfArray(stItem.aVerticalLines)-1) to iMax
                For iIndex from 0 to iMax
                    If (iIndex=iMax) Begin
                        If (stItem.bParent) Begin
                            If (stItem.bFirst) Begin
                                Move (sLead+"/-") to sLead
                            End
                            Else Begin
                                Move (sLead+"|-") to sLead
                            End
                        End
                        Else If (stItem.bChild) Begin
                            If (stItem.bLast) Begin
                                Move (sLead+"\-") to sLead
                            End
                            Else Begin
                                Move (sLead+"|-") to sLead
                            End                                    
                        End
                    End
                    Else Begin
                        If (stItem.aVerticalLines[iIndex]) Begin
                            Move (sLead+"| ") to sLead
                        End
                        Else Begin
                            Move (sLead+"  ") to sLead
                        End
                    End
                Loop
                Function_Return sLead
            End_Function
        
        Function BaseItemLabel Integer iBase Returns String
            Integer iIndex hDD
            Boolean bConstrainFile
            String sLabel
            tRelationsDrawingMapItem[] aMap
            
            Get Aux_Value iBase to iIndex
            Get _paMap to aMap
            
            Move aMap[iIndex].iItemId to hDD
            Get DdoLabel hDD to sLabel
            
            If (Aux_Value(Self,iBase+2)<>0) Begin
                Move (sLabel+" (Main_DD)") to sLabel
            End
            
            Move (_GraphicLead(Self,aMap[iIndex])+sLabel) to sLabel
            If (aMap[iIndex].iAlreadyMappedAtRow<>-1) Begin
                Move (sLabel+" (*") to sLabel
            End                          
            Function_Return sLabel
        End_Function
        
        Procedure _DoLabel Integer iBase
            Set Value (iBase+2) to (BaseItemLabel(Self,iBase))
        End_Procedure
        
        Procedure FillGrid 
            Integer iMax iIndex hDD iBase iStartItem
            String sLabel
            tRelationsDrawingMapItem[] aMap
            tOIDeoInfo stFocus
            
            Get _paMap to aMap
            Get _pstFocInfo to stFocus 
            
            Set Dynamic_Update_State to False
            Send Delete_Data
            Move (SizeOfArray(aMap)-1) to iMax
            For iIndex from 0 to iMax
                Get Item_Count to iBase
                Send Add_Item MSG_NONE "" // Server pointer
                Send Add_Item MSG_NONE "" // Direct server pointer
                Send Add_Item MSG_NONE "" // sLabel
                Send Add_Item MSG_NONE "" // Active
                Send Add_Item MSG_NONE "" // Changed
                Set Aux_Value iBase to iIndex
                Set Aux_Value (iBase+1) to aMap[iIndex].iItemId
                Set Aux_Value (iBase+2) to (aMap[iIndex].iItemId=stFocus.hPanelMainDD)
                Send _DoLabel iBase
            Loop
            Send SetEntryState of oGridFunctions Self False
            Send SetAlternatingRowColors of oGridFunctions Self clBlue
            Set Dynamic_Update_State to True
            Set Current_Item to iStartItem
        End_Procedure
        
        Procedure NewTableLabels
            Integer hDD iMax iRow iBase
            Get RowCount of oGridFunctions Self to iMax
            Set Dynamic_Update_State to False
            Decrement iMax
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase
                Send _DoLabel iBase
            Loop
            Set Gridline_Mode to Grid_Visible_Vert // Remove "_" characters from previous value (error due do GridLine_Mode preventing re-draw of grid-lines between cells)
            Set Dynamic_Update_State to True
        End_Procedure
    
        Procedure UpdateInfoColumns tOIDeoInfo stInfo
            Integer hDD iMax iRow iBase
            Boolean bChanged bHasRecord bShouldSave
            String sValue
            Set Dynamic_Update_State to False
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase
                Get Aux_Value (iBase+1) to hDD
                
                Set Value (iBase+0) to (If(hDD=stInfo.hServer,"->",""))
                Set Value (iBase+1) to (If(hDD=stInfo.hDirectServer,"->",""))

                Get HasRecord of hDD to bHasRecord
                Set Value (iBase+3) to (If(bHasRecord,"Y","-"))
                Get Changed_State of hDD to bChanged
                Get Should_Save of hDD to bShouldSave
                If (bChanged or bShouldSave) Begin
                    If (bChanged and bShouldSave) Begin
                        Move "Y (cs+ss)" to sValue
                    End
                    Else If (bChanged) Begin
                        Move "Y (cs)" to sValue
                    End
                    Else Begin
                        Move "Y (ss)" to sValue
                    End
                End
                Else Begin
                    Move "-" to sValue
                End

                Set Value (iBase+4) to sValue
            Loop
            Set Dynamic_Update_State to True
        End_Procedure
    End_Object

    Object oTreeLabel is a RadioGroup
        Set Location to 201 233
        Set Size to 27 242
        Set Label to "Label composition"
        Set peAnchors to anBottomRight
    
        Object oRadio is a Radio
            Set Label to "Table"
            Set Size to 10 31
            Set Location to 11 22
        End_Object
    
        Object oRadio is a Radio
            Set Label to "DDO"
            Set Size to 10 28
            Set Location to 11 56
        End_Object
        
        Object oRadio is a Radio
            Set Label to "User defined"
            Set Size to 10 51
            Set Location to 11 87
        End_Object
        Set Current_Radio to 0

        Object oTableNumbers is a CheckBox
            Set Size to 10 59
            Set Location to 11 155
            Set Label to "Add table numbers"
        
            Procedure OnChange
                Send RefreshTableLabels
            End_Procedure
        
        End_Object

        Procedure Notify_Select_State Integer iToItem Integer iFromItem
            Forward Send Notify_Select_State iToItem iFromItem
            Send RefreshTableLabels
        End_Procedure
    
    End_Object

    Procedure RefreshTableLabels
        Send NewTableLabels of oGrid
    End_Procedure
    
    Function DdoLabel Integer hDD Returns String
        Boolean bTableNumber
        Boolean bConditionalRelations bValue bCfree
        Integer iTable iCurRad
        String sLabel
        Get main_file of hDD to iTable
        Get Current_Radio of oTreeLabel to iCurRad
        Get Checked_State of oTableNumbers to bTableNumber
//        Get Checked_State of oConditionalRelations to bConditionalRelations
        Move False to bConditionalRelations
//        Get Checked_State of oCfree to bCfree
        Move False to bCfree
        If (iCurRad=0) Begin // Table name
            Get_Attribute DF_FILE_LOGICAL_NAME of iTable to sLabel
        End
        If (iCurRad=1) Begin // Table display name
            Move (Replace(Name(Parent(hDD))+".",Name(hDD),"")) to sLabel
            Move (Lowercase(sLabel)) to sLabel
        End
        If (iCurRad=2) Begin // DDO name
            Get_Attribute DF_FILE_DISPLAY_NAME of iTable to sLabel
        End
        If (bConditionalRelations) Begin
            Get _PaddedValue of oDataDictionaryFunctions hDD GET_pbConditionalParent to bValue
            If (bValue) Begin
                Move ("(cp) "+sLabel) to sLabel
            End
        End
        If (bCfree) Begin
            Get _PaddedValue of oDataDictionaryFunctions hDD GET_Is_cfreeDataDictionary to bValue
            If (bValue) Begin
                Move ("(cf) "+sLabel) to sLabel
            End
        End
        If (bTableNumber) Begin
            Move (sLabel+" ("+String(iTable)+")") to sLabel
        End
        Function_Return sLabel
    End_Function

    Procedure UpdateDdoGraphInfo
        tOIDeoInfo stInfo stPreviousInfo
        
        Get FocusInfo of oObjectInfo to stInfo
        Get _pstFocInfo of oGrid to stPreviousInfo
        If (stInfo.hScopedParent=stPreviousInfo.hScopedParent) Begin
            Send UpdateInfoColumns of oGrid stInfo
        End
    End_Procedure
        
    Procedure InitializeDDOgraph tOIDeoInfo stObject
        String sCaption
        tRelationsDrawingMapItem[] aMap
        
        Get DDO_RelationsDrawingMap of oDataDictionaryFunctions stObject.hServer to aMap
        Set _paMap of oGrid to aMap
        Set _pstFocInfo of oGrid to stObject
        
        Send FillGrid of oGrid
        Get Label of stObject.hScopedParent to sCaption
        Set Label to (sCaption+" (DDO structure)")
        Send UpdateDdoGraphInfo
    End_Procedure

End_Object

Procedure _Activate_oDataDictionaryViewDebugger tOIDeoInfo stObject
    Send InitializeDDOgraph of oDataDictionaryViewDebugger stObject
    Send Activate_oDataDictionaryViewDebugger
End_Procedure

