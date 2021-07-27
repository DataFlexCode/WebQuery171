Use Windows.pkg
Use DFClient.pkg
Use UserAccess\cUserAccessControl.pkg
Use UserAccess\UaGroupSelectionList.dg
Use UserAccess\cUaPropertyGrid.pkg
Use Win\GridFunctions.pkg
Use dfTable.pkg
Use WindowsInfo.pkg
Use dfallent.pkg
Use DFEntry.pkg
Use DFPostMessage.pkg

Deferred_View Activate_oUaUsersView for ;
Object oUaUsersView is a dbView
    Object oUauser_DD is a cUauserDataDictionary
        Procedure New_Current_Record Integer iOldRecord Integer iNewRecord
            Forward Send New_Current_Record iOldRecord iNewRecord
            Send BufferToGrid
        End_Procedure
        Procedure Save_Main_File
            Send GridToBuffer
            Forward Send Save_Main_File
        End_Procedure
        Function Should_Save Returns Boolean
            Boolean bRval
            Forward Get Should_Save to bRval
            If (not(bRval)) Begin
                Get Changed_State of oPropertyGrid to bRval
            End
            Function_Return bRval
        End_Function
        Function Changed_State Returns Boolean
            Boolean bRval
            Forward Get Changed_State to bRval
            If (not(bRval)) Begin
                Get Changed_State of oPropertyGrid to bRval
            End
            Function_Return bRval
        End_Function
        Register_Object oPropertyGrid
        Register_Procedure InsertDefaults
        Procedure Field_Defaults
            Forward Send Field_Defaults
            Send DFPostMessage MSG_InsertDefaults oPropertyGrid 
        End_Procedure
    End_Object

    Set Main_DD to oUauser_DD
    Set Server to oUauser_DD

    Set Label to "User Access - Users"

    Set Border_Style to Border_Thick
    Set Size to 320 481
    Set Location to 2 1
    Set piMinSize to 320 481

    Object oGrid is a dbGrid
        Set Size to 122 461
        Set Location to 10 10
        Send SetHighlightRowState of oGridFunctions Self
        Set Server to oUauser_DD
//        Set CurrentCellColor to clBackground
        
        Procedure Prompt
            Integer iColumn
            Get CurrentColumn of oGridFunctions Self to iColumn
            If (iColumn=3) Begin
                Send Popup of oUaGroupSelectionList
            End
        End_Procedure
        
        Procedure InsertCurrentWindowsUser
            String sWinUser sCurrentValue
            
            Get NetworkUserName of oWindowsInfo to sWinUser
            If (_FindUserCurrentWindowsUserName(ghoUserAccessObject)) Begin
                Send Info_Box ('"'+sWinUser+'" already exists in the user table')
                Send FindByRowId of (Server(Self)) uaUser.File_Number (GetRowID(uaUser.File_Number))
            End
            Else Begin
                Set File_Field_Changed_Value of (server(Self)) File_Field uaUser.WindowsUserName to sWinUser
            End
        End_Procedure

        Begin_Row
            Entry_Item uaUser.LoginName
            Entry_Item uaUser.UserID
            Entry_Item uaUser.Name
            Entry_Item uaUser.GroupID
            Entry_Item uaUser.WindowsUserName
        End_Row

        Set Main_File to uaUser.File_number

        Set Form_Width 0 to 127
        Set Header_Label 0 to "Login name"
        Set Form_Width 1 to 72
        Set Header_Label 1 to "User id"
        Set Form_Width 2 to 99
        Set Header_Label 2 to "Name"
        Set Form_Width 4 to 81
        Set Header_Label 4 to "Windows user name"
        Set Form_Width 3 to 72
        Set Header_Label 3 to "User group"
        Set peAnchors to anTopLeftRight
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 2
    End_Object

    Object oSelectGroupBtn is a Button
        Set Size to 14 56
        Set Location to 192 311
        Set Label to "Attach group"
        Set peAnchors to anTopRight
    
        // fires when the button is clicked
        Procedure OnClick
            Send Activate of oGrid
            Send SetCurrentColumn of oGridFunctions (oGrid) 3
            Send Prompt of oGrid
        End_Procedure
    
    End_Object

    Object oInsertWinUsrBtn is a Button
        Set Size to 14 103
        Set Location to 192 371
        Set Label to "Insert current Windows user"
        Set peAnchors to anTopRight
    
        // fires when the button is clicked
        Procedure OnClick
            Send InsertCurrentWindowsUser of oGrid
        End_Procedure
    
    End_Object

    Object oGroup is a dbGroup
        Set Size to 53 461
        Set Location to 135 11
        Set Label to "User data"
        Set Server to oUauser_DD
        Set Auto_Clear_DEO_State to False
        Set peAnchors to anTopLeftRight

        Object ouaUser_Password is a dbForm
            Entry_Item uaUser.Password
            Set Location to 14 42
            Set Size to 13 72
            Set Label to "Password:"
            Set Label_Col_Offset to 0
            Set Label_Justification_Mode to JMode_Right
            Set Password_State to True
        End_Object

        Object ouaUser_Disabled is a dbCheckbox
            Entry_Item uaUser.Disabled
            Set Location to 34 42
            Set Label to "Login disabled"
            Procedure OnChange
                Integer bState
                Get Select_State to bState
                Set Enabled_State of ouaUser_DisabledReason to bState
                If (not(bState)) Begin
                    If (HasRecord(Server(Self))) Begin // Not on creating a new user
                        Set Field_Changed_Value of (Server(Self)) Field uaUser.DisabledReason to ""
                    End
                End
            End_Procedure
        End_Object
        
        Object ouaUser_DisabledReason is a dbForm
            Entry_Item uaUser.DisabledReason
            Set Location to 32 134
            Set Size to 13 75
            Set Label to "Reason:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

        Object ouaUser_AutoCreated is a dbCheckbox
            Entry_Item uaUser.AutoCreated
            Set Location to 34 246
            Set Size to 13 18
            Set Label to "Created automatically"
        End_Object

        Object ouaUser_LoginCount is a dbForm
            Entry_Item uaUser.LoginCount
            Set Location to 14 381
            Set Size to 13 54
            Set Label to "Login count:"
            Set Label_Col_Offset to 0
            Set Label_Justification_Mode to JMode_Right
        End_Object

        Object ouaUser_LastLogin is a dbForm
            Entry_Item uaUser.LastLogin
            Set Location to 32 381
            Set Size to 13 54
            Set Label to "Last login:"
            Set Label_Col_Offset to 0
            Set Label_Justification_Mode to JMode_Right
        End_Object

        Object ouaUser_CreatedDate is a dbForm
            Entry_Item uaUser.CreatedDate
            Set Location to 14 246
            Set Size to 13 54
            Set Label to "Created:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
        End_Object

    End_Object

    Object oPropertyGrid is a cUaPropertyGrid_UserSide
        Set Location to 210 117
        On_Key kSave_Record Send Request_Save of oGrid
   
        Set Size to 102 252
        Set peAnchors to anAll
        Send DefineColumns
        
        Procedure InsertDefaults
            Integer iMax iRow iBase
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase
                If (Checkbox_Item_State(Self,iBase+2)) Begin
                    Set Select_State (iBase+2) to True
                End
            Loop
            Set _psStateValue to (StateValue(oGridFunctions,Self))
        End_Procedure
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 50 10
        Set Location to 198 118
        Set Label to "User parameter values:"
    End_Object

    Procedure GridToBuffer
        Send UpdateRecordBuffer of oPropertyGrid
    End_Procedure
    
    Procedure BufferToGrid
        Send FillGrid of oPropertyGrid
    End_Procedure
    
    Procedure CallingUserAccessCousins
        Send Refind_Records of oUauser_DD
        Send BufferToGrid
    End_Procedure
    
Cd_End_Object
