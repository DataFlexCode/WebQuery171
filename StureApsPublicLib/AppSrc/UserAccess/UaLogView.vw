Use Windows.pkg
Use DFClient.pkg
Use dfTable.pkg
Use UserAccess\cUserAccessControl.pkg
Use UserAccess\UaLogSettingsPanel.dg
Use DateFunctions.pkg
Use StringFunctions.pkg
Use Win\GridFunctions.pkg
Use Winprint2Functions.pkg
Use RgbFunctions.pkg
Use DataDictionaryFunctions.pkg
Use cfreeWinReport.pkg
Use Win\ObjectInfo.pkg

Class UaLogForm is a Form
    Procedure Construct_Object
        Forward Send Construct_Object
//        Property Boolean pbChanged
        Set Label_Col_Offset to 2
        Set Label_Justification_Mode to JMode_Right
    End_Procedure
    Procedure OnChange
//        Set pbChanged to True
        Set Color to (Brighten(oRgbFunctions,clBlue,92))
        Set pbUpdateGrid to True
    End_Procedure
    Function BlueValue Returns String
        String sValue
        Get Value to sValue
        Set Color to clWhite
        Function_Return sValue
    End_Function
    Procedure Set BlueValue String sValue
        Set Value to sValue
    End_Procedure
End_Class

Class UaLogComboForm is a ComboForm
    Procedure Construct_Object
        Forward Send Construct_Object
//        Property Boolean pbChanged
        Set Label_Col_Offset to 2
        Set Label_Justification_Mode to JMode_Right
    End_Procedure
    Procedure OnChange
//        Set pbChanged to True
        Set Color to (Brighten(oRgbFunctions,clBlue,92))
        Set pbUpdateGrid to True
    End_Procedure
    Function BlueValue Returns String
        String sValue
        Get Value to sValue
        Set Color to clWhite
        Function_Return sValue
    End_Function
    Procedure Set BlueValue String sValue
        Set Value to sValue
    End_Procedure
End_Class

Deferred_View Activate_oUaLogView for ;
Object oUaLogView is a cUAdbView 4

    Set Label to "Application event log"
    Set piMinSize to 161 439
    Set Maximize_Icon to True
    On_Key kCancel send Close_Panel

    Set phGateObject to oUaUserSetupGate
    Set psActivatePrivilege to "viewlog"

    Property Boolean pbUpdateGrid False

    Function LoginNameToUserID String sLoginName Returns Number
        Clear uaUser
        Move sLoginName to uaUser.LoginName
        Find eq uaUser by Index.2
        If (Found) Begin
            Function_Return uaUser.UserID
        End
        Function_Return -1 // Not found
    End_Function
    
    Object oUalog_DD is a cUalogDataDictionary
        Set Read_Only_State to True
            
            Property String _psRowID
        
            Function _ConstrainRowID Returns Boolean
                String sRowID sIndexValue sCrudLetter sOrigin
                If (ExtractTACinfoFromLog(ghoUserAccessObject,Rtrim(uaLog.EventText),&sRowID,&sIndexValue,&sCrudLetter,&sOrigin)) Begin
                    Function_Return (sRowID=_psRowID(Self))
                End
                Function_Return False
            End_Function
        
        Procedure OnConstrain
            Boolean bFilterUser bFilterType bFilterSession bFilterDate bFilterTableRow
            Integer iTable
            Number nUserID
            String sUser sSession sType sRowID sConstrainType sEventText sDescriptionText
            Date dFrom dTo

            Get BlueValue of oDateFrom to dFrom
            Get BlueValue of oDateTo to dTo
            Move (Integer(dFrom)+Integer(dTo)) to bFilterDate
            Get BlueValue of oUser to sUser
            Move (sUser<>"") to bFilterUser
            Get BlueValue of oEventType to sType
            Move (sType<>"") to bFilterType
            Get BlueValue of oSession to sSession
            Move (sSession<>"") to bFilterSession
            Get BlueValue of oEventType to sType
            Get BlueValue of oDescriptionText to sDescriptionText
            Move (sDescriptionText<>"") to bFilterTableRow
            
            If (bFilterUser) Begin
                Get LoginNameToUserID sUser to nUserID
                Constrain uaLog.UserID eq nUserID
            End
            If (bFilterType) Begin
                Constrain uaLog.EventSource eq sType
            End
            If (bFilterSession) Begin
                Constrain uaLog.SessionId eq sSession
            End
            If (bFilterDate) Begin
                If (Integer(dTo)=0) Move LargestPossibleDate to dTo
                Constrain uaLog.EventDate Between dFrom and dTo
            End
            If (bFilterTableRow) Begin
                Get psContrainType of oDescriptionText to sConstrainType
                Get psText of oDescriptionText to sEventText
                If (sConstrainType="TAC") Begin
                    Get piTable of oDescriptionText to iTable
                    Get psRowId of oDescriptionText to sRowID
                    Set _psRowID to sRowID
                    Constrain uaLog.EventSource eq "TAC"
                    Constrain uaLog.TAC_Table eq iTable
                    Constrain uaLog as (_ConstrainRowID(Self))
                End
                Else If (sConstrainType="VAC") Begin 
                    Constrain uaLog.EventText eq sEventText
                End
                Else If (sConstrainType="ERR") Begin 
                    Constrain uaLog.EventText eq sEventText
                End
                Else If (sConstrainType="SES") Begin 
                    Constrain uaLog.EventText eq sEventText
                End
            End
        End_Procedure
    End_Object

    Set Main_DD to oUalog_DD
    Set Server to oUalog_DD

    Set Border_Style to Border_Thick
    Set Size to 315 639
    Set Location to 4 5

    Procedure Request_Clear_All
    End_Procedure

    Object oFilterGroup is a Group
        Set Size to 49 529
        Set Location to 259 11
        Set Label to "Filters"
        Set peAnchors to anBottomLeftRight

        Object oDateFrom is a UaLogForm
            Set Label to "Log time:"
            Set Size to 13 64
            Set Location to 13 53
            Set Entry_State to False
            Set Prompt_Button_Mode to PB_PromptOn
            Set Form_Datatype to Date_Window
            Procedure Prompt
                Send RequestPopup of oDateCalendarPanel
            End_Procedure
        End_Object
        
        Object oDateTo is a UaLogForm
            Set Size to 13 64
            Set Location to 13 127
            Set Entry_State to False
            Set Prompt_Button_Mode to PB_PromptOn
            Set Label to "-"
            Set Form_Datatype to Date_Window
            Procedure Prompt
                Send RequestPopup of oDateCalendarPanel
            End_Procedure
        End_Object
        
        Object oUser is a UaLogForm
            Set Label to "User login:"
            Set Size to 13 64
            Set Location to 30 53
        End_Object

        Object oSession is a UaLogForm
            Set Label to "Session ID:"
            Set Size to 13 100
            Set Location to 13 243
        End_Object
        
        Object oEventType is a UaLogComboForm
            Set Label to "Event type:"
            Set Size to 13 100
            Set Location to 30 243
            Set Entry_State to False
            Set combo_sort_state to False

            Procedure Combo_Fill_List
                Send Combo_Add_Item "All events"
                Send Combo_Add_Item "ERR - Error"
                Send Combo_Add_Item "SES - Session"
                Send Combo_Add_Item "VAC - View Access"
                Send Combo_Add_Item "TAC - Table Access"
            End_Procedure
            
            Function BlueValue Returns String
                String sValue
                Forward Get BlueValue to sValue
                Move (Left(sValue,3)) to sValue
                If (sValue="All") Begin
                    Move "" to sValue
                End
                Function_Return sValue
            End_Function
            
            Function _ComboItemMatching String sValue Returns Integer
                Integer iItem iMax
                String sComboValue
                Get Combo_Item_Count to iMax
                Decrement iMax
                For iItem from 0 to iMax
                    Get Combo_Value iItem to sComboValue
                    If (BeginsWith(oStringFunctions,sComboValue,sValue)) Begin
                        Function_Return iItem
                    End
                Loop
                Function_Return -1 // item not found
            End_Function
            
            Procedure Set BlueValue String sValue
                Integer iIndex
                If (sValue="") Begin
                    Move "All" to sValue
                End
                Get _ComboItemMatching sValue to iIndex
                If (iIndex>-1) Begin
                    Get Combo_Value iIndex to sValue
                End
                Else Begin
                    Move WindowIndex to WindowIndex
                End
                Forward Set BlueValue to sValue
            End_Procedure
        End_Object

        Object oDescriptionText is a UaLogForm
            Set Size to 13 118
            Set Location to 13 400
            Set Label to "Description:"
            Set Entry_State to False
            Property String psContrainType
            Property Integer piTable
            Property String psRowId
            Property String psText
        End_Object

        Object oClearFiltersBtn is a Button
            Set Location to 31 468
            Set Label to 'Clear filters'
        
            Procedure OnClick
                Set BlueValue of oDateFrom to ""
                Set BlueValue of oDateTo to ""
                Set BlueValue of oUser to ""
                Set BlueValue of oSession to ""
                Set BlueValue of oEventType to ""
                Set BlueValue of oDescriptionText to ""
            End_Procedure
        End_Object
        
        Procedure SetContraintValue Integer iColumn String sValue
            Date dFrom dTo
            String sTmp
            String sRowID sIndexValue sCrudLetter sOrigin
            If (sValue<>"") Begin
                If (iColumn=0) Begin // Event time
                    Get Value of oDateFrom to dFrom
                    Get Value of oDateTo to dTo
                    If ((Integer(dFrom)+Integer(dTo))=0) Begin
                        Set BlueValue of oDateFrom to uaLog.EventDate
                        Set BlueValue of oDateTo to uaLog.EventDate
                    End
                    Else Begin
                        Set BlueValue of oDateFrom to ""
                        Set BlueValue of oDateTo to ""
                    End

                End
                If (iColumn=1) Begin // User Id
                    Get Value of oUser to sTmp
                    If (sTmp="") Begin
                        Set BlueValue of oUser to sValue
                    End
                    Else Begin
                        Set BlueValue of oUser to ""
                    End
                End
                If (iColumn=2) Begin // Session Id
                    Get Value of oSession to sTmp
                    If (sTmp="") Begin
                        Set BlueValue of oSession to sValue
                    End
                    Else Begin
                        Set BlueValue of oSession to ""
                    End
                End
                If (iColumn=3) Begin // Source
                    Get BlueValue of oEventType to sTmp
                    If (sTmp="") Begin
                        Set BlueValue of oEventType to sValue
                    End
                    Else Begin
                        Set BlueValue of oEventType to ""
                    End
                End
                If (iColumn=4) Begin // Descriptopn text
                    Get Value of oDescriptionText to sTmp
                    If (sTmp="") Begin
                        Set psContrainType of oDescriptionText to uaLog.EventSource
                        Set BlueValue of oDescriptionText to sValue
                        If (uaLog.EventSource="TAC") Begin
                            If (ExtractTACinfoFromLog(ghoUserAccessObject,Rtrim(uaLog.EventText),&sRowID,&sIndexValue,&sCrudLetter,&sOrigin)) Begin
                                Set piTable of oDescriptionText to uaLog.TAC_Table
                                Set psRowId of oDescriptionText to sRowID
                            End
                            Else Begin
                                Send Info_Box "Cannot decode the 'TAC' log-format" "Cannot use as filter"
                                Set BlueValue of oDescriptionText to ""
                            End
                        End
                        Else If (uaLog.EventSource="VAC") Begin
                            Set psText of oDescriptionText to (Rtrim(uaLog.EventText))
                        End
                        Else If (uaLog.EventSource="SES") Begin
                            Set psText of oDescriptionText to (Rtrim(uaLog.EventText))
                        End
                        Else If (uaLog.EventSource="ERR") Begin
                            Set psText of oDescriptionText to (Rtrim(uaLog.EventText))
                        End
                    End
                    Else Begin
                        Set BlueValue of oDescriptionText to ""
                    End
                End
            End
        End_Procedure

        Procedure SetConstrainTableCurrentRecord Integer iTable
            Send KeyAction of oClearFiltersBtn // Clear all constraints
            Set piTable of oDescriptionText to iTable
            Set psRowId of oDescriptionText to (SerializeRowID(GetRowID(iTable)))
            Set psContrainType of oDescriptionText to "TAC"
            Set BlueValue of oDescriptionText to ("Track current record of table: "+String(iTable))
        End_Procedure

    End_Object
    
    Object oGrid is a dbGrid
        Set Size to 244 619
        Set Location to 9 10
        Set Read_Only_State to True
        Set No_Delete_State to True
        Set No_Create_State to True
        Send SetHighlightRowState of oGridFunctions Self
        Set peAnchors to anAll
        Set Ordering to 1

        Procedure Request_Clear_All
        End_Procedure
        
            Function DateTimeCompress Date dDate String sTime Returns String
                Function_Return (DateToString(oDateFunctions,dDate,piDateFormat(oDateFunctions),False,"-")+" "+sTime)
            End_Function

        Function EventDateTime Returns String
            Function_Return (DateTimeCompress(Self,uaLog.EventDate,uaLog.EventTime))
        End_Function
        
        Function UserName Returns String
            Clear uaUser
            Move uaLog.UserId to uaUser.UserID
            Find eq uaUser by Index.1
            Function_Return (Trim(uaUser.LoginName))
        End_Function
        
            Function _EventTextTAC Returns String
                Integer iPrimKey iTable 
                String sText sRowID sCrudLetter sOrigin sIndexValue
                String sLogicalName
                
                If (ExtractTACinfoFromLog(ghoUserAccessObject,uaLog.EventText,&sRowID,&sIndexValue,&sCrudLetter,&sOrigin)) Begin
                    Move uaLog.TAC_Table to iTable
                    
                    Get_Attribute DF_FILE_LOGICAL_NAME of iTable to sLogicalName
                    
                    If (sCrudLetter="U") Begin
                        Move "Update " to sText
                    End
                    Else If (sCrudLetter="C") Begin
                        Move "Create " to sText
                    End
                    Else If (sCrudLetter="D") Begin
                        Move "Delete " to sText
                    End
                    Move (sText+sLogicalName+": ") to sText
                    Move (sText+sIndexValue) to sText
                    
                    If (sOrigin<>"") Begin
                        Move (sText+" ("+sOrigin+")") to sText
                    End
                End
                Else Begin
                    Move (Rtrim(uaLog.EventText)) to sText
                End
                Function_Return sText
            End_Function
        
        Function EventText Returns String
            If (uaLog.EventSource="ERR") Begin
                Function_Return ("Error "+String(uaLog.ErrorNumber)+": "+Trim(uaLog.EventText)+", on line "+String(uaLog.ErrorLine))
            End
            If (uaLog.EventSource="TAC") Begin
                Function_Return (_EventTextTAC(Self))
            End
            Function_Return (rTrim(uaLog.EventText))
        End_Function
        
        Procedure Entry_Display Integer iFile Boolean bDoAll
            Integer iBase iMax iItem
            Forward Send Entry_Display iFile bDoAll
            Get Base_Item to iBase
            Get Columns of oGridFunctions Self to iMax
            Decrement iMax
            For iItem from iBase to (iBase+iMax)
                Set Entry_State iItem to False
                Set Item_Shadow_State iItem to False
            Loop
        End_Procedure

        Begin_Row
            Entry_Item (EventDateTime(Self))
            Entry_Item (UserName(Self))
            Entry_Item uaLog.SessionId
            Entry_Item uaLog.EventSource
            Entry_Item (EventText(Self))
        End_Row

        Set Main_File to uaLog.File_number

        Set Form_Width 0 to 82
        Set Header_Label 0 to "Log time"
        Set Form_Width 1 to 69
        Set Header_Label 1 to "User login name"
        Set Form_Width 2 to 75
        Set Header_Label 2 to "Session ID"
        Set Form_Width 3 to 31
        Set Header_Label 3 to "Type"
        Set Form_Width 4 to 352
        Set Header_Label 4 to "Description"
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 4

        Procedure Mouse_Click Integer iWindowNumber Integer iPosition
            Integer iColumn iItem
            String sValue
            Forward Send Mouse_Click iWindowNumber iPosition
            If (Item_Count(Self)>0 and iWindowNumber<=Item_Count(Self)) Begin
                Move (iWindowNumber-1) to iItem
                Get ItemColumn of oGridFunctions Self iItem to iColumn
                Get Value iItem to sValue
                Send SetContraintValue of oFilterGroup iColumn sValue
            End
        End_Procedure
    
            Procedure _OutputLogEntry
                DFWritePos   (EventDateTime(Self)) 0
                DFWritePos   (UserName(Self))      3
                DFWritePos   uaLog.SessionId       5.5
                DFWritePos   uaLog.EventSource     7.5 
                DFWriteLnPos (EventText(Self))     8.1
            End_Procedure
        
        Procedure WriteReport
            Integer hDD
            Move oUalog_DD to hDD
            
            DFFontSize 6
            If (ReadFirstRow(oDataDictionaryFunctions,hDD,uaLog.File_Number,1)) Begin
                Repeat
                    Send _OutputLogEntry
                Until (not(ReadNextRow(oDataDictionaryFunctions,hDD,uaLog.File_Number,1)))
            End 
            Else Begin
                DFWriteLnPos "No entries" 0
            End
        End_Procedure
    
    End_Object

    Procedure UpdateConstraints 
        Send Rebuild_Constraints of oUalog_DD
        Send End_of_Data of oGrid
    End_Procedure
    
    Procedure SetSessionConstrain Number nSessionID
        Set Value of oDateFrom to ""
        Set Value of oDateTo to ""
        Set Value of oUser to ""
        Set Value of oSession to nSessionID
    End_Procedure
    
    Procedure Popup
        Boolean bAlreadyActive
        Get Active_State to bAlreadyActive
        Forward Send Popup
        If (not(bAlreadyActive)) Begin
            Send End_of_Data of oGrid
        End
    End_Procedure
    
    Object oIdleHandler is a cIdleHandler
        Procedure OnIdle
            RowID riRowID
            If (pbUpdateGrid(Self)) Begin
                Get CurrentRowId of oUalog_DD to riRowID
                Send UpdateConstraints
                If (not(IsNullRowID(riRowID))) Begin
                    Send FindByRowId of oUalog_DD uaLog.File_Number riRowID
                End
                Set pbUpdateGrid to False
            End
        End_Procedure
    End_Object

    Object oLogSettingsBtn is a Button
        Set Size to 14 62
        Set Location to 267 559
        Set Label to 'Log settings'
        Set peAnchors to anBottomRight
        Procedure OnClick
           Send Popup of oUaLogSettingsPanel
        End_Procedure
    End_Object
    
    Object oPrintBtn is a Button
        Set Size to 14 62
        Set Location to 287 559
        Set Label to 'Print'
        Set peAnchors to anBottomRight
    
        Object oReport is a cfreeWinReport
            Set psTopLeft to "Application event log"
            Procedure OnWriteReport
                Send WriteReport of oGrid
            End_Procedure
            Procedure OnNewFilelistSelected String sSwsFile
                Set psBottomLeft to ("Workspace: "+sSwsFile)
            End_Procedure
        End_Object
        
        Procedure OnClick
            Send DFClosePreview of oReport
            Send DFClearDoc of oReport
            Send Run_Report of oReport
        End_Procedure
            
    End_Object
    
    Procedure Activating // enable the idle handler timer when the button is activated
       Forward Send Activating
       Set pbEnabled of oIdleHandler to True
    End_Procedure

    Procedure Deactivating // disable the idle handler when the button is deactivated
       Set pbEnabled of oIdleHandler to False
       Forward Send DeActivating 
    End_Procedure

//    Procedure Popup
//        String sLabel
//        If (pbLogViewAccess(ghoUserAccessObject)) Begin
//            Get Label to sLabel
//            Send Log of ghoUserAccessObject "VAC" ("View open: '"+sLabel+"'")
//        End
//        Forward Send Popup
//    End_Procedure
//        
//    Procedure Close_Panel
//        String sLabel
//        If (pbLogViewAccess(ghoUserAccessObject)) Begin
//            Get Label to sLabel
//            Send Log of ghoUserAccessObject "VAC" ("View close: '"+sLabel+"'")
//        End
//        Forward Send Close_Panel
//    End_Procedure

Cd_End_Object

Procedure Activate_oUaLogView_Session Number nSessionID
    Send Activate_oUaLogView
    Send SetSessionConstrain of oUaLogView nSessionID
End_Procedure

Procedure Activate_oUaLogView_TableCurrentRow Integer iTable
    tOIDeoInfo strFocus
    If (num_arguments=0) Begin
        Get FocusInfo of oObjectInfo to strFocus
        If (strFocus.iTable<>0) Begin
            Send Activate_oUaLogView_TableCurrentRow strFocus.iTable
        End
        Else Begin
            Send Activate_oUaLogView
            Send Info_Box "Could not determine which table row to track"
        End
    End
    Else Begin
        Send Activate_oUaLogView
        Send SetConstrainTableCurrentRecord of (oFilterGroup(oUaLogView)) iTable
    End
End_Procedure

