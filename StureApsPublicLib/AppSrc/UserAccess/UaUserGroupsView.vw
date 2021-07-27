Use Windows.pkg
Use DFClient.pkg
Use dfTable.pkg
Use UserAccess\cUaPropertyGrid.pkg

Deferred_View Activate_oUaUserGroupsView for ;
Object oUaUserGroupsView is a dbView
    
    Set Label to "User Access - User groups"
    Set Border_Style to Border_Thick
    Set Size to 256 263
    Set Location to 2 2
    
    Object oUagroup_DD is a cUagroupDataDictionary
        Procedure New_Current_Record Integer iOldRecord Integer iNewRecord
            Forward Send New_Current_Record iOldRecord iNewRecord
            Send BufferToGrid
        End_Procedure
        Procedure Save_Main_File
            Send GridToBuffer
            Forward Send Save_Main_File
        End_Procedure
        Function Should_Save returns Boolean
            Boolean bRval
            Forward Get Should_Save to bRval
            If (not(bRval)) begin
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
        
        Function Validate_Delete Returns Integer
            Boolean bFound
            Integer iRval
            Forward Get Validate_Delete to iRval
            If (iRval=0) Begin
                Clear uaUser
                Move uaGroup.GroupID to uaUser.GroupID
                Find ge uaUser by Index.4
                Move (Found) to bFound
                If (bFound) Begin
                    Move (uaUser.GroupID=uaGroup.GroupID) to bFound
                End
                If (bFound) Begin
                    Send UserError "Group has users in it. Therefore it can not be deleted." "Can't delete user group"
                End
            End
            Function_Return iRval
        End_Function
    End_Object

    Set Main_DD to oUagroup_DD
    Set Server to oUagroup_DD

    Object oGrid is a dbGrid
        Set Size to 100 236
        Set Location to 14 12
        Send SetHighlightRowState of oGridFunctions Self
        
        Procedure CallingUserAccessCousins // Only defined here to make sure the compiler knows the symbol (for broadcast command just below)
        End_Procedure
        
        Function Row_Save Returns Integer
            Integer iRval
            Forward Get Row_save to iRval
            Broadcast Recursive Send CallingUserAccessCousins of Desktop
            Function_Return iRval
        End_Function

        Begin_Row
            Entry_Item uaGroup.GroupID
            Entry_Item uaGroup.Name
        End_Row

        Set Main_File to uaGroup.File_number

        Set Form_Width 0 to 72
        Set Header_Label 0 to "Group id"
        Set Form_Width 1 to 155
        Set Header_Label 1 to "Group name"
        Set peAnchors to anTopLeftRight

//        Procedure Entering
//        End_Procedure
        Procedure Exiting Handle hoDestination Returns Integer
            Integer iRetVal

            Forward Get msg_Exiting hoDestination to iRetVal
            If (iRetVal=0) Begin
              Send Request_Save
            End
            Procedure_Return iRetVal
        End_Procedure
    End_Object

    Object oPropertyGrid is a cUaPropertyGrid_GroupSide
        Set Location to 134 12
        Set Size to 105 238
        Set peAnchors to anAll
        On_Key kSave_Record Send Request_Save of oGrid

        Send DefineColumns

        On_Key kSave_Record Send Request_Save of oGrid
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 50 10
        Set Location to 121 13
        Set Label to "Parameter values on group:"
    End_Object
    
    Procedure GridToBuffer
        Send UpdateRecordBuffer of oPropertyGrid
    End_Procedure
    
    Procedure BufferToGrid
        Send FillGrid of oPropertyGrid
    End_Procedure

Cd_End_Object
