Use Windows.pkg
Use DFClient.pkg
//Use cUasessDataDictionary.dd
Use dfSelLst.pkg
Use UserAccess\cUserAccessControl.pkg
Use UserAccess\UaLogView.vw

Deferred_View Activate_oUaSessionListView for ;
Object oUaSessionListView is a dbView
    Set Border_Style to Border_Thick
    Set Size to 318 503
    Set Location to 2 2
    Set Label to "Session list"
    Set piMinSize to 200 503
    
    Object oUasess_DD is a cUasessDataDictionary
        Set Ordering to 2
    End_Object

    Set Main_DD to oUasess_DD
    Set Server to oUasess_DD

    Object oList is a dbList
        Set Size to 265 493
        Set Location to 19 5
        Set Ordering to 2
        Set Auto_Index_State to False
        
            Function DateTimeCompress Date dDate String sTime Returns String
                Function_Return (DateToString(oDateFunctions,dDate,piDateFormat(oDateFunctions),False,"-")+" "+sTime)
            End_Function

        Function SessionDateTime Returns String
            Function_Return (DateTimeCompress(Self,uaSess.StartDate,uaSess.StartTime))
        End_Function
        
        Function ApplicationCompileTime Returns String
            Function_Return (DateTimeCompress(Self,uaSess.ApplicationDate,uaSess.ApplicationTime))
        End_Function
        
        Function MultiUserYesNo Returns String
            If (uaSess.MultiUserSess<>0) Begin
                Function_Return "Yes"
            End
            Function_Return "No"
        End_Function
        
        Procedure Mouse_Up 
            Forward Send Mouse_Up 
            Send Refind_Records of oUasess_DD
            Send Activate_oUaLogView_Session uaSess.SessionId
        End_Procedure

        Begin_Row
            Entry_Item (SessionDateTime(Self))
            Entry_Item uaSess.SessionId
            Entry_Item (Session_FirstUserName(ghoUserAccessObject))
            Entry_Item (MultiUserYesNo(Self))
            Entry_Item uaSess.WinUserName
            Entry_Item uaSess.ApplicationName
            Entry_Item (ApplicationCompileTime(Self))
        End_Row

        Set Main_File to uaSess.File_number

        Set Form_Width 0 to 90
        Set Header_Label 0 to "Session start"
        Set Form_Width 1 to 64
        Set Header_Label 1 to "Session ID"
        Set Form_Width 2 to 74
        Set Header_Label 2 to "First user on session"
        Set Form_Width 3 to 33
        Set Header_Label 3 to "MU *)"
        Set Form_Justification_Mode 3 to Form_DisplayCenter
        Set Form_Width 4 to 72
        Set Header_Label 4 to "Windows user"
        Set Form_Width 5 to 65
        Set Header_Label 5 to "Application"
        Set Form_Width 6 to 86
        Set Header_Label 6 to "Compiled"
        Set Move_Value_Out_State to False
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 2
        Set peAnchors to anAll
    End_Object

    Object oFootNote is a TextBox
        Set Size to 50 10
        Set Location to 289 8
        Set Label to "*) Has more than one user used this session?"
        Set peAnchors to anBottomLeft
    End_Object

    Procedure Popup
        Boolean bAlreadyActive
        Get Active_State to bAlreadyActive
        Forward Send Popup
        If (not(bAlreadyActive)) Begin
            Send End_of_Data of oList
        End
    End_Procedure
    
Cd_End_Object
