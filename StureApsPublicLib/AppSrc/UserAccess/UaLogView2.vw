Use Windows.pkg
Use DFClient.pkg
Use dfallent.pkg
Use UserAccess\cUserAccessControl.pkg
//Use cUasessDataDictionary.dd
Use DFEntry.pkg

Deferred_View Activate_oUaLogView2 for ;
Object oUaLogView2 is a dbView
    Object oUasess_DD is a cUasessDataDictionary
    End_Object

    Set Main_DD to oUasess_DD
    Set Server to oUasess_DD

    Set Border_Style to Border_Thick
    Set Size to 156 247
    Set Location to 25 5
    Set Label to "Application Log"
    
    Object oSessionGroup is a dbGroup
        Set Server to oSessDD
        Set Size to 128 221
        Set Location to 14 9
        Set Label to "Session Data"

        Object ouaSess_SessionId is a dbForm
            Entry_Item uaSess.SessionId

            Set Server to oUasess_DD
            Set Location to 14 69
            Set Size to 13 90
            Set Label to "Session Id:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_SessionDate is a dbForm
            Entry_Item uaSess.SessionDate

            Set Server to oUasess_DD
            Set Location to 30 69
            Set Size to 13 66
            Set Label to "Start time:"
            Set Entry_State to False
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_SessionTime is a dbForm
            Entry_Item uaSess.SessionTime

            Set Server to oUasess_DD
            Set Location to 30 138
            Set Size to 13 78
            Set Label to ""
        End_Object

        Object ouaSess_FirstUserId is a dbForm
            Entry_Item uaSess.FirstUserId

            Set Server to oUasess_DD
            Set Location to 53 68
            Set Size to 13 42
            Set Label to "First session user:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_WinUserName is a dbForm
            Entry_Item uaSess.WinUserName

            Set Server to oUasess_DD
            Set Location to 53 151
            Set Size to 13 65
            Set Label to "Win user:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_MultiUserSess is a dbCheckbox
            Entry_Item uaSess.MultiUserSess

            Set Server to oUasess_DD
            Set Location to 70 69
            Set Size to 13 18
            Set Label to "More than one user during session"
        End_Object

        Object ouaSess_ApplicationName is a dbForm
            Entry_Item uaSess.ApplicationName

            Set Server to oUasess_DD
            Set Location to 91 68
            Set Size to 13 126
            Set Label to "Application:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_ApplicationDate is a dbForm
            Entry_Item uaSess.ApplicationDate

            Set Server to oUasess_DD
            Set Location to 107 68
            Set Size to 13 66
            Set Label to "exe file time stamp:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaSess_ApplicationTime is a dbForm
            Entry_Item uaSess.ApplicationTime

            Set Server to oUasess_DD
            Set Location to 107 140
            Set Size to 13 54
        End_Object
    End_Object
    

Cd_End_Object
