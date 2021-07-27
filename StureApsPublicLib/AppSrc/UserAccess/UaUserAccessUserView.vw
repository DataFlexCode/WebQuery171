Use Windows.pkg
Use DFClient.pkg
Use cCJGrid.pkg
Use cDbCJGrid.pkg
Use dfTable.pkg
Use cLinkLabel.pkg
Use UserAccess\cUserAccessControl.pkg
Use Win\GridFunctions.pkg
Use Win\cfreeYellowText.pkg
Use dfLine.pkg
Use TableQueryFunctions.pkg
Use UserAccess\UaUserEditPanel.dg

Use UserAccess\UaRolesManagerView.vw
Use cTextEdit.pkg

Open uaUser
Open uaUserRo
Open uaRole

Register_Object oUaRolesManagerView

Deferred_View Activate_oUaUserAccessUserView for ;
Object oUaUserAccessUserView is a cUAdbView

    Set phGateObject to oUaUserSetupGate
    Set psActivatePrivilege to "edit"
    Set psEditPrivilege to "edit"

    Set Label to "Setup user rights"

    Property Number  _pnCurrentUserID -1
    Property Boolean _pbUserDirty False

    Set Border_Style to Border_Thick
    Set Size to 313 586
    Set Location to 3 3
    Set piMinSize to 313 586

    On_Key kCancel Send Close_Panel

    Object oUserDisplayHandler is a cDisplayHandler
        Property Number _pnGotoUserID
        Procedure OnUpdateDisplay
            Number nUserID
            Get _pnGotoUserID to nUserID
            Send FillList of oUsersGrid nUserID
            If (nUserID<>0) Begin
                Set _pnGotoUserID to False
            End
        End_Procedure
    End_Object

    Object oUsersTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 35
        Set Location to 9 6
        Set Label to "Users"
        Set FontSize to 18 0
        Set FontWeight to 900
    End_Object

    Object oRolesTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 92
        Set Location to 9 163
        Set Label to "Roles assigned to user"
        Set FontSize to 18 0
        Set FontWeight to 900
    End_Object

    Object oPrivilegesTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 112
        Set Location to 9 297
        Set Label to "Privileges granted to user"
        Set FontSize to 18 0
        Set FontWeight to 900
    End_Object

    Object oUsersGrid is a cfreeGrid
        Set Size to 203 153
        Set Location to 60 6
        Set peAnchors to anTopBottomLeft
        Send SetHighlightRowState of oGridFunctions Self
        
        Set pbSwitchOnNext to True
        Set pbNoSortState to True
        Set GridLine_Mode to Grid_Visible_None

        Set Line_Width to 1 0
        Set Header_Label 0 to "User login name"
        Set Form_Width 0 to 148

        Property Number[] _paUserIDs

        Function RowUserID Integer iRow Returns Number
            Integer iBase iAux
            Number[] aUserIDs
            Get _paUserIDs to aUserIDs
            Get RowBaseItem of oGridFunctions Self iRow to iBase
            Get Aux_Value iBase to iAux
            Function_Return aUserIDs[iAux]
        End_Function
        
        Procedure OnRowChange Integer iRowFrom Integer iRowTo
            Number nUserID
            If (Item_Count(Self)>0) Begin
                Get RowUserID iRowTo to nUserID
                Send FillSelected of oRolesGrid nUserID
                Send FillSelected of oPrivilegesGrid nUserID
            End
            Else Begin
                Send FillSelected of oRolesGrid -1
                Send FillSelected of oPrivilegesGrid -1
            End
        End_Procedure

        Procedure FillList Number nUserID
            Integer iBase iDisplayState iStartItem
            Number[] aUserIDs
            tTableQuery strQ
            
            Get DisplayState of oUserFilter to iDisplayState
            Move -1 to iStartItem

            Set Dynamic_Update_State to False
            Send Delete_Data
            Get NewQuery of oTQ uaUser.File_Number to strQ
            If (iDisplayState<>2) Begin
                Send AddFilter of oTQ (&strQ) File_Field uaUser.Disabled tqEQ (If(iDisplayState=0,0,1))
            End
            Send AddOrderBy of oTQ (&strQ) File_Field uaUser.LoginName False False
            While (FindRecord(oTQ,&strQ))
                Get Item_Count to iBase
                If (uaUser.Disabled<>0) Begin
                    Send Add_Item MSG_None (Trim(uaUser.LoginName)+" (disabled)")
                End
                Else Begin
                    Send Add_Item MSG_None (Trim(uaUser.LoginName))
                End
                Set Aux_Value iBase to (SizeOfArray(aUserIDs))
                Move uaUser.UserID to aUserIDs[SizeOfArray(aUserIDs)]
                If (nUserID=uaUser.UserID) Begin
                    Move iBase to iStartItem
                End
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set _paUserIDs to aUserIDs
            
            If (iStartItem<>-1) Begin
                Set Current_Item to iStartItem
            End
            Else Begin
                Send OnRowChange 0 0
            End
            Set Dynamic_Update_State to True
        End_Procedure
        
        Function CurrentUserID Returns Number
            Integer iAux
            Number[] aUserIDs
            Number nTemp
            If (Item_Count(Self)>0) Begin
                Get CurrentAuxValue of oGridFunctions Self 0 to iAux
                Get _paUserIDs to aUserIDs
                Function_Return aUserIDs[iAux]
            End
            Function_Return 0
        End_Function
        
        Procedure AddUser
            Boolean bOk
            Number nUserID
            tUserAccessUser strUser
            Get EditUser of oUaUserEditPanel (&strUser) to bOk
            If (bOk) Begin
                Get UserSave of oUser_TableUpdater strUser to nUserID
                If (nUserID<>0) Begin
                    Set _pnGotoUserID of oUserDisplayHandler to nUserID
                    Set pbDisplayDirty of oUserDisplayHandler to True
                End
            End
        End_Procedure
        
        Procedure EditUser
            Boolean bOk
            Number nUserID
            tUserAccessUser strUser
            Get CurrentUserID to nUserID
            If (nUserID>=0) Begin
                If (UserFindById(oUser_TableUpdater,nUserID)) Begin
                    Get UserActive of oUser_TableUpdater to strUser
                    Get EditUser of oUaUserEditPanel (&strUser) to bOk
                    If (bOk) Begin
                        Get UserSave of oUser_TableUpdater strUser to nUserID
                        If (nUserID<>0) Begin
                            Set _pnGotoUserID of oUserDisplayHandler to nUserID
                            Set pbDisplayDirty of oUserDisplayHandler to True
                        End
                    End
                End
            End
        End_Procedure
        
        Procedure OnMouseDoubleClick Integer iItem
            Send EditUser
        End_Procedure
        
        On_Key kEnter Send EditUser
        
        Function FindUserRow Number nUserID Returns Integer
            Integer iMax iItem iAux iRow 
            Number[] aUserIDs
            Get _paUserIDs to aUserIDs
            Move (SizeOfArray(aUserIDs)-1) to iMax
            For iItem from 0 to iMax
                If (aUserIDs[iItem]=nUserID) Begin
                    Get FindAuxValueRow of oGridFunctions Self iItem 0 0 to iRow
                    Function_Return iRow // -1 if no row is found
                End
            Loop
            Function_Return -1 // not found
        End_Function
        
        Procedure GotoUser Number nUserID
            Integer iRow
            Get FindUserRow nUserID to iRow
            If (iRow>=0) Begin
                Set CurrentRow of oGridFunctions Self to iRow
            End
        End_Procedure
    End_Object

    Object oAddUserBtn is a Button
        Set Size to 14 52
        Set Location to 267 6
        Set Label to 'Add new user'
        Set peAnchors to anBottomLeft
        Procedure OnClick
            Send AddUser of oUsersGrid
        End_Procedure
    End_Object
    
    Object oRolesGrid is a cfreeGrid

        Set Location to 60 163
        Set Size to 203 129
        Set peAnchors to anTopBottomLeft
        Set pbNoSortState to True
    
        Set Line_Width to 2 0 // size and Line_width MUST be set before any column properties
        Set Form_Width 0 to 27
        Set Header_Label  0 to ""
        Set Form_Width 1 to 95
        Set Header_Label  1 to "Role title"
        
        Set Select_Mode to Multi_Select
//        Send SetHighlightRowState of oGridFunctions Self
        Set pbFirstColumnSelect to True
        Set pbSwitchOnNext to True

        Property Number[] _paRoleIDs
        Property Boolean _pbShouldSave False
        
        Set GridLine_Mode to Grid_Visible_None

//        Procedure OnChangeSelectState Integer iItem
//            Set _pbShouldSave to True
//            Send FillSelected of oPrivilegesGrid -1
//        End_Procedure
//        
        Procedure OnChangeSelectCount
            Set _pbShouldSave to True
            Send FillSelected of oPrivilegesGrid -1
        End_Procedure

        Procedure OnMouseDoubleClick Integer iItem
            Number nRoleID
            If (ItemColumn(oGridFunctions,Self,iItem)=1) Begin
                Get CurrentRoleID to nRoleID
                Send Activate_oUaRolesManagerView
                Send GotoRole of oUaRolesManagerView nRoleID
            End
        End_Procedure

        Function FindRoleRow Number nRoleID Returns Integer
            Integer iMax iItem iAux iRow 
            Number[] aRoleIDs
            Get _paRoleIDs to aRoleIDs
            Move (SizeOfArray(aRoleIDs)-1) to iMax
            For iItem from 0 to iMax
                If (aRoleIDs[iItem]=nRoleID) Begin
                    Get FindAuxValueRow of oGridFunctions Self iItem 0 0 to iRow
                    Function_Return iRow // -1 if no row is found
                End
            Loop
            Function_Return -1 // not found
        End_Function

        Procedure FillList Number nRoleID
            Integer iBase iDisplayState
            Number[] aRoleIDs
            tTableQuery strQ
            
            Get DisplayState of oRoleFilter to iDisplayState

            Set Dynamic_Update_State to False
            Send Delete_Data
            Get NewQuery of oTQ uaRole.File_Number to strQ
            If (iDisplayState<>2) Begin
                Send AddFilter of oTQ (&strQ) File_Field uaRole.Disabled tqEQ (If(iDisplayState=0,0,1))
            End
            Send AddOrderBy of oTQ (&strQ) File_Field uaRole.UserDisplaySeq False False
            While (FindRecord(oTQ,&strQ))
                Get Item_Count to iBase
                Send AddCheckBoxItem of oGridFunctions Self False
                If (uaRole.Disabled<>0) Begin
                    Send Add_Item MSG_None (Trim(uaRole.RoleName)+" (disabled)")
                End
                Else Begin
                    Send Add_Item MSG_None (Trim(uaRole.RoleName))
                End
                Set Aux_Value iBase to (SizeOfArray(aRoleIDs))
                Move uaRole.RoleID to aRoleIDs[SizeOfArray(aRoleIDs)]
                If (nRoleID=uaRole.RoleID) Begin
                    Set Current_Item to iBase
                End
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set Dynamic_Update_State to True
            Set _paRoleIDs to aRoleIDs
        End_Procedure
        
        Function UserRoleTQ Number nUserID Returns tTableQuery
            tTableQuery strQ
            Get NewQuery of oTQ uaUserRo.File_Number to strQ
            Send AddFilter of oTQ (&strQ) File_Field uaUserRo.UserID tqEQ nUserID
            Function_Return strQ
        End_Function
        
        Procedure FillSelected Number nUserID
            Integer iRow
            tTableQuery strQ
            
            Send RowDeselectAll of oGridFunctions Self
            Get UserRoleTQ nUserID to strQ
            
            While (FindRecord(oTQ,&strQ))
                Get FindRoleRow uaUserRo.RoleID to iRow
                If (iRow>-1) Begin
                    Set RowSelectState of oGridFunctions Self iRow to True        
                End
            Loop
            Set _pbShouldSave to False
        End_Procedure
        
        Procedure SaveList
            Integer iRow iMax iBase iAux
            Boolean bSelected
            Number[] aRoleIDs
            Number nUserID nRoleID
            Get CurrentUserID of oUsersGrid to nUserID
            Get RowCount of oGridFunctions Self to iMax
            Get _paRoleIDs to aRoleIDs
            Decrement iMax
            Lock
                For iRow from 0 to iMax
                    Get RowSelectState of oGridFunctions Self iRow to bSelected
                    Get RowBaseItem of oGridFunctions Self iRow to iBase
                    
                    Get Aux_Value iBase to iAux
                    Move aRoleIDs[iAux] to nRoleID
                    
                    If (FindByID(oUserRole_TableUpdater,nRoleID,nUserID)) Begin
                        If (not(bSelected)) Begin
                            Delete uaUserRo
                        End
                    End
                    Else Begin
                        If (bSelected) Begin
                            SaveRecord uaUserRo
                        End
                        
                    End
                Loop
            Unlock
            Set _pbShouldSave to False
        End_Procedure
    
        Function CurrentRoleID Returns Number
            Integer iAux
            Number[] aRoleIDs
            If (Item_Count(Self)>0) Begin
                Get CurrentAuxValue of oGridFunctions Self 0 to iAux
                Get _paRoleIDs to aRoleIDs
                Function_Return aRoleIDs[iAux]
            End
            Function_Return 0
        End_Function
        
        Function SelectedRoles Returns Number[]
            Integer iMax iIndex
            Integer[] aAuxs
            Number[] aRoleIDs aReturnIDs
            Get SelectedRowsAuxValues of oGridFunctions Self to aAuxs
            Get _paRoleIDs to aRoleIDs
            Move (SizeOfArray(aAuxs)-1) to iMax
            For iIndex from 0 to iMax
                Move aRoleIDs[aAuxs[iIndex]] to aReturnIDs[SizeOfArray(aReturnIDs)]
            Loop
            Function_Return aReturnIDs
        End_Function
    
    End_Object

    Object oRoleFilter is a ComboForm
        Set Size to 13 75
        Set Location to 267 217
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Set Label to "Show"
        Set peAnchors to anBottomLeft
        Set Entry_State to False
        Set Allow_Blank_State to False
        Set Combo_Sort_State to False
        Procedure Combo_Fill_List
            Send Combo_Add_Item "Active roles"
            Send Combo_Add_Item "Deactivated roles"
            Send Combo_Add_Item "Show both"
        End_Procedure
        Function DisplayState Returns Integer
            String sValue
            Get Value to sValue
            If (sValue="Active roles"     ) Function_Return 0
            If (sValue="Deactivated roles") Function_Return 1
            If (sValue="Show both"        ) Function_Return 2
            Function_Return -1
        End_Function
        Procedure OnChange
            Number nRoleID
            Get CurrentRoleID of oRolesGrid to nRoleID
            Send FillList of oRolesGrid nRoleID
        End_Procedure
    End_Object

    Object oPrivilegesGrid is a cfreeGrid

        Set Location to 60 297
        Set Size to 203 283

        Set peAnchors to anAll
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 0
    
        Set Line_Width to 4 0 // size and Line_width MUST be set before any column properties
        Set Form_Width 0 to 148
        Set Header_Label  0 to "Privilege"
        Set Form_Width 1 to 41
        Set Header_Label  1 to "By role(s)"
        Set Form_Width 2 to 41
        Set Header_Label  2 to "By user"
        Set Form_Width 3 to 41
        Set Header_Label  3 to "Effect"
        
        Set GridLine_Mode to Grid_Visible_None

        Set pbSwitchOnNext to True
        Set pbNoSortState to True
        
        Property Boolean _pbShouldSave False
        Property String[][] _paaPrivileges

        Function IsPrivilegeRow Integer iRow Returns Boolean
            Integer iBase iAux
            String[][] aaPrivileges
            Get _paaPrivileges to aaPrivileges
            Get RowBaseItem of oGridFunctions Self iRow to iBase
            Get Aux_Value iBase to iAux
            If (iAux>=0 and aaPrivileges[iAux][1]<>"") Begin
                Function_Return True
            End
            Function_Return False
        End_Function
        
        Function GateAndPrivilegeIDs Integer iRow Returns String[]
            Integer iBase iAux
            String[] aValues
            String[][] aaPrivileges
            Move (ResizeArray(aValues,2)) to aValues
            Get _paaPrivileges to aaPrivileges
            Get RowBaseItem of oGridFunctions Self iRow to iBase
            Get Aux_Value iBase to iAux
            If (iAux>=0) Begin
                Move aaPrivileges[iAux][0] to aValues[0]
                Move aaPrivileges[iAux][1] to aValues[1]
            End
            
            Function_Return aValues
        End_Function
        
        Procedure CalculateEffect Integer iRow
            Integer iBase
            String sByRoles sByUser sValue
            Get RowBaseItem of oGridFunctions Self iRow to iBase
            Get Value (iBase+1) to sByRoles
            Get Value (iBase+2) to sByUser
            If (sByUser<>"") Begin
                If (sByUser="Grant") Begin
                    Move "Granted" to sValue
                End
            End
            Else Begin
                If (sByRoles="Granted") Begin
                    Move "Granted" to sValue
                End
            End

            Set Value (iBase+3) to sValue
        End_Procedure
        
        Procedure ToggleUserColumn Integer iItem
            Integer iColumn iRow
            String sValue
            Get ItemColumn of oGridFunctions Self iItem to iColumn
            If (iColumn=2) Begin
                Get ItemRow of oGridFunctions Self iItem to iRow
                If (IsPrivilegeRow(Self,iRow)) Begin
                    Get Value iItem to sValue
                    If (sValue="") Begin
                        Move "Grant" to sValue     
                    End
                    Else If (sValue="Grant") Begin
                        Move "Revoke" to sValue
                    End
                    Else Begin
                        Move "" to sValue
                    End
                    Set Value iItem to sValue
                    Send CalculateEffect iRow
                    Set _pbShouldSave to True
                End
            End
        End_Procedure

        Procedure OnMouseDoubleClick Integer iItem
            Send ToggleUserColumn iItem
        End_Procedure

        Function AllowToggle Integer iColumn Integer iItem Returns Boolean
            Function_Return False
        End_Function

        Procedure OnChangeSelectState Integer iItem
            Set _pbShouldSave to True
        End_Procedure
        
        Function FindPrivilegeRow String sGateID String sPrivilegeID Returns Integer
            Integer iMax iItem iAux iRow 
            String[][] aaPrivileges
            Get _paaPrivileges to aaPrivileges
            Move (SizeOfArray(aaPrivileges)-1) to iMax
            
            For iItem from 0 to iMax
                If (Lowercase(aaPrivileges[iItem][0])=Lowercase(sGateID) and Lowercase(aaPrivileges[iItem][1])=Lowercase(sPrivilegeID)) Begin
                    Get FindAuxValueRow of oGridFunctions Self iItem 0 0 to iRow
                    Function_Return iRow // -1 if no row is found
                End
            Loop
            Function_Return -1 // not found
        End_Function
        
            Function _AddPrivToAux String[][] ByRef aaPrivileges String sGateID String sPrivilegeID Returns Integer
                Integer iIndex
                Move (SizeOfArray(aaPrivileges)) to iIndex
                Move sGateID to aaPrivileges[iIndex][0]
                Move sPrivilegeID to aaPrivileges[iIndex][1]
                Function_Return iIndex
            End_Function

        Procedure FillList String sPrivilegeID
            Integer iGateMax iGateIndex iBase
            Integer iPrivMax iPrivIndex iAux
            String sGateID
            String[][] aaPrivileges
            tUserAccessGate[] aGates
            
            Set Dynamic_Update_State to False
            Send Delete_Data
            Get Gate_GatesArray of ghoUserAccessObject to aGates
            Move (SizeOfArray(aGates)-1) to iGateMax
            For iGateIndex from 0 to iGateMax
                
                Get Item_Count to iBase
                Send Add_Item MSG_None aGates[iGateIndex].sGateLabel
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None "" 
                Send SetRowColorLastRow of oGridFunctions Self clBtnFace
                Set Form_FontWeight (iBase) to 900
                
                Move aGates[iGateIndex].sGateID to sGateID
                Get _AddPrivToAux (&aaPrivileges) sGateID "" to iAux
                Set Aux_Value iBase to iAux
                
                Move (SizeOfArray(aGates[iGateIndex].aPrivileges)-1) to iPrivMax
                For iPrivIndex from 0 to iPrivMax
                    Get Item_Count to iBase
                    Send Add_Item MSG_None aGates[iGateIndex].aPrivileges[iPrivIndex].sPrivilegeLabel
                    Send Add_Item MSG_None ""
                    Send Add_Item MSG_None ""
                    Send Add_Item MSG_None ""
                    Get _AddPrivToAux (&aaPrivileges) sGateID aGates[iGateIndex].aPrivileges[iPrivIndex].sPrivilegeID to iAux
                    Set Aux_Value iBase to iAux // iPrivIndex
                    Set ItemColor (iBase+2) to (Brighten(oRgbFunctions,clYellow,75))
                Loop
                
                Get Item_Count to iBase
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None ""
                Set Aux_Value iBase to -1
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set Dynamic_Update_State to True
            Send OnRowChange 0 0
            Set _paaPrivileges to aaPrivileges
        End_Procedure
        
        Procedure _ClearAll
            Integer iRow iMax iBase
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase
                Set Value (iBase+1) to ""    
                Set Value (iBase+2) to ""    
                Set Value (iBase+3) to ""    
            Loop
        End_Procedure
        
        Procedure FillSelected Number nUserID
            Integer iRow iMax iIndex iBase iAux
            String sGateID sPrivilegeID sByRoles sCustom
            Number[] aRoleIDs
            tTableQuery strQ
            
            Set Dynamic_Update_State to False
            Send _ClearAll
            
            // Fill "By role(s)" column
            Get SelectedRoles of oRolesGrid to aRoleIDs
            Move (SizeOfArray(aRoleIDs)-1) to iMax
            For iIndex from 0 to iMax // For every assigned role

                Get NewQuery of oTQ uaRoleAc.File_Number to strQ
                Send AddFilter of oTQ (&strQ) File_Field uaRoleAc.RoleID tqEQ aRoleIDs[iIndex]
                
                While (FindRecord(oTQ,&strQ))
                    Get FindPrivilegeRow uaRoleAc.GateID uaRoleAc.PrivilegeID to iRow
                    If (iRow>=0) Begin
                        Get RowBaseItem of oGridFunctions Self iRow to iBase
                        Set Value (iBase+1) to "Granted"
                    End
                Loop
                    
            Loop
            
            // Fill "Custom" column 
            Get NewQuery of oTQ uaUserAc.File_Number to strQ
            Send AddFilter of oTQ (&strQ) File_Field uaUserAc.UserID tqEQ nUserID
            While (FindRecord(oTQ,&strQ))
                Get FindPrivilegeRow uaUserAc.GateID uaUserAc.PrivilegeID to iRow
                If (iRow>=0) Begin
                    Get RowBaseItem of oGridFunctions Self iRow to iBase
                    Set Value (iBase+2) to (If(uaUserAc.Revoke=0,"Grant","Revoke"))
                End
            Loop
            
            // Calculate effect column
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            For iRow from 0 to iMax
                If (IsPrivilegeRow(Self,iRow)) Begin
                    Send CalculateEffect iRow
                End
            Loop
            Set Dynamic_Update_State to True
           
            Set _pbShouldSave to False
        End_Procedure
        
        Procedure SaveList
            Integer iMax iBase iRow
            Number nUserID
            String sValue
            String[] sGateAndPrivilegeIDs
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            Get CurrentUserID of oUsersGrid to nUserID
            Begin_Transaction
                For iRow from 0 to iMax
                    If (IsPrivilegeRow(Self,iRow)) Begin
                        Get RowBaseItem of oGridFunctions Self iRow to iBase
                        Get GateAndPrivilegeIDs iRow to sGateAndPrivilegeIDs 
                        Get Value (iBase+2) to sValue
                        If (FindByID(oUserAccess_TableUpdater,nUserID,sGateAndPrivilegeIDs[0],sGateAndPrivilegeIDs[1])) Begin
                            If (sValue="") Begin
                                Delete uaUserAc
                            End
                            Else Begin
                                If (uaUserAc.Revoke<>0) Begin
                                    If (sValue="Grant") Begin
                                        Move 0 to uaUserAc.Revoke
                                        SaveRecord uaUserAc
                                    End
                                End
                                Else Begin
                                    If (sValue="Revoke") Begin
                                        Move 1 to uaUserAc.Revoke
                                        SaveRecord uaUserAc
                                    End
                                End
                            End
                        End
                        Else Begin
                            If (sValue<>"") Begin
                                If (sValue="Grant") Begin
                                    Move 0 to uaUserAc.Revoke
                                    SaveRecord uaUserAc
                                End
                                Else Begin
                                    Move 1 to uaUserAc.Revoke
                                    SaveRecord uaUserAc
                                End
                            End
                        End
                    End
                Loop
            End_Transaction
            
            Set _pbShouldSave to False
        End_Procedure

    End_Object

    Object oUserFilter is a ComboForm
        Set Size to 13 75
        Set Location to 267 84
        Set Label to "Show"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Set peAnchors to anBottomLeft
        Set Entry_State to False
        Set Allow_Blank_State to False
        Set Combo_Sort_State to False
        Procedure OnChange
            Number nUserID
            Get CurrentUserID of oUsersGrid to nUserID
            Send FillList of oUsersGrid nUserID
        End_Procedure
        Procedure Combo_Fill_List
            Send Combo_Add_Item "Active users"
            Send Combo_Add_Item "Deactivated users"
            Send Combo_Add_Item "Show both"
        End_Procedure
        Function DisplayState Returns Integer
            String sValue
            Get Value to sValue
            If (sValue="Active users"     ) Function_Return 0
            If (sValue="Deactivated users") Function_Return 1
            If (sValue="Show both"        ) Function_Return 2
            Function_Return -1
        End_Function
    End_Object

    Object oLineControl1 is a LineControl
        Set Size to 2 573
        Set Location to 285 7
        Set peAnchors to anBottomLeftRight
    End_Object

    Object oSaveBtn is a Button
        Set Size to 14 72
        Set Location to 292 429
        Set Label to 'Save changes'
        Set peAnchors to anBottomRight
        Procedure OnClick
            Send SaveList of oRolesGrid
            Send SaveList of oPrivilegesGrid
        End_Procedure
    End_Object

    Object oAbandonBtn is a Button
        Set Size to 14 72
        Set Location to 292 507
        Set Label to 'Abandon changes'
        Set peAnchors to anBottomRight
    
        Procedure OnClick
            Send FillSelected of oRolesGrid (CurrentUserID(oUsersGrid))
            Send FillSelected of oPrivilegesGrid (CurrentUserID(oUsersGrid))
        End_Procedure
    
    End_Object

    Procedure Popup
        Boolean bActive
        Get Active_State to bActive
        Forward Send Popup
        If (not(bActive)) Begin
            Send FillList of oPrivilegesGrid 0
            Send FillList of oRolesGrid 0
        End
    End_Procedure
    
    Function ShouldSave Returns Boolean
        If (_pbShouldSave(oRolesGrid)) Begin
            Function_Return True
        End
        If (_pbShouldSave(oPrivilegesGrid)) Begin
            Function_Return True
        End
        Function_Return False
    End_Function

    Object oShadowStatesHandler is a cIdleHandler
        Procedure OnIdle
            Set Enabled_State of oSaveBtn to (ShouldSave(Self))
            Set Enabled_State of oAbandonBtn to (ShouldSave(Self))
        End_Procedure
    End_Object
    
/usUserAccessUserView.vw.UserHeader
Select user in list below. Roles and privileges may then be granted or denied. Click "Save changes" to make changes permanent.
/*

    Object oUserHeader is a cfreeYellowText
        Set Size to 29 149
        Set Location to 25 6
        Set piTextImage to usUserAccessUserView.vw.UserHeader.N
    End_Object

/usUserAccessUserView.vw.RoleHeader
Assign roles to selected user. Double click a role title to go to roles-centric panel.
/*

    Object oRoleHeader is a cfreeYellowText
        Set Size to 29 125
        Set Location to 25 163
        Set piTextImage to usUserAccessUserView.vw.RoleHeader.N
    End_Object

/usUserAccessUserView.vw.PrivilegeHeader
Double click the yellow column to assign or revoke privileges on user level.

Press "Save changes" to make the changes permanent.
/*

    Object oPrivilegeHeader is a cfreeYellowText
        Set Size to 29 277
        Set Location to 25 297
        Set piTextImage to usUserAccessUserView.vw.PrivilegeHeader.N
    End_Object

    // enable the idle handler timer when the button is activated
    Procedure Activating
       Forward Send Activating
       Set pbEnabled of oUserDisplayHandler to True
       Set pbEnabled of oShadowStatesHandler to True
    End_Procedure

    // disable the idle handler when the button is deactivated
    Procedure Deactivating
       Set pbEnabled of oUserDisplayHandler to True
       Set pbEnabled of oShadowStatesHandler to True
       Forward Send DeActivating 
    End_Procedure

    Procedure GotoUser Number nUserID
        Send GotoUser of oUsersGrid nUserID
    End_Procedure
Cd_End_Object
