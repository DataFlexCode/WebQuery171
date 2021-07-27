Use DfAllEnt.pkg
Use dfTable.pkg

Use UserAccess\cUserAccessControl.pkg
Use Win\GridFunctions.pkg
Use Win\cfreeYellowText.pkg
Use Win\PanelFunctions.pkg
Use TableQueryFunctions.pkg
Use UserAccess\UaRoleEditPanel.dg

Register_Object oUaUserAccessUserView

Deferred_View Activate_oUaRolesManagerView for ;
Object oUaRolesManagerView is a cUAdbView

    Set phGateObject to oUaUserSetupGate
    Set psActivatePrivilege to "edit"
    Set psEditPrivilege to "edit"

    Set Label to "Setup roles"
    Set Border_Style to Border_Thick
    Set Size to 326 575
    Set Location to 2 3
    Set piMinSize to 326 575
    On_Key kCancel send Close_Panel
    
    Object oRoleDisplayHandler is a cDisplayHandler
        Property Number _pnGotoRoleID
        Procedure OnUpdateDisplay
            Number nRoleID
            Get _pnGotoRoleID to nRoleID
            Send FillList of oRolesGrid nRoleID
            If (nRoleID<>0) Begin
                Set _pnGotoRoleID to False
            End
        End_Procedure
    End_Object

    Object oRolesTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 35
        Set Location to 9 14
        Set Label to "Roles"
        Set FontSize to 18 0
        Set FontWeight to 900
    End_Object

    Object oPrivilegesTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 111
        Set Location to 9 188
        Set Label to "Privileges assigned by role"
        Set FontSize to 18 0
        Set FontWeight to 900
    End_Object
    
    Object oUserTextBox is a TextBox
        Set Auto_Size_State to False
        Set Size to 9 103
        Set Location to 9 415
        Set Label to "Users assigned to role" // Useres assigned to role
        Set FontSize to 18 0
        Set FontWeight to 900
        Set peAnchors to anTopRight
    End_Object
    
    Object oRolesGrid is a cfreeGrid
        Set Size to 227 167
        Set Line_Width to 1 0
        Set Header_Label 0 to "Role title"
        Set Form_Width 0 to 156
        Set Location to 54 14
        Set peAnchors to anTopBottomLeft
        Set pbSwitchOnNext to True
        Set pbNoSortState to True
        
        Set pbAllowRowSwap to True
        Send SetHighlightRowState of oGridFunctions Self
        
//        Property Boolean pbDisplaySequenceChanged False
        Property Number[] _paRoleIDs

        Set GridLine_Mode to Grid_Visible_None
        
        Procedure OnSwap
            Integer iRow iRowMax
            Boolean bFound
            Number nRoleID
            Get RowCount of oGridFunctions Self to iRowMax
            Decrement iRowMax
            Lock
                For iRow from 0 to iRowMax
                    Get RowRoleID iRow to nRoleID
                    Get RoleFindById of oRole_TableUpdater nRoleID to bFound
                    If (bFound) Begin
                        Move (iRow+1) to uaRole.UserDisplaySeq
                        SaveRecord uaRole
                    End
                Loop
            Unlock
        End_Procedure

        Function RowRoleID Integer iRow Returns Number
            Integer iBase iAux
            Number[] aRoleIDs
            Get _paRoleIDs to aRoleIDs
            Get RowBaseItem of oGridFunctions Self iRow to iBase
            Get Aux_Value iBase to iAux
            Function_Return aRoleIDs[iAux]
        End_Function
        
        Procedure OnRowChange Integer iRowFrom Integer iRowTo
            If (Item_Count(Self)>0) Begin
                Send FillSelected of oUserGrid (RowRoleID(Self,iRowTo))
                Send FillSelected of oPrivilegesGrid (RowRoleID(Self,iRowTo))
            End
            Else Begin
                Send FillSelected of oUserGrid -1
                Send FillSelected of oPrivilegesGrid -1
            End
        End_Procedure

        Procedure FillList Number nRoleID
            Integer iBase iDisplayState iStartItem
            Number[] aRoleIDs
            tTableQuery strQ
            
            Get DisplayState of oRoleFilter to iDisplayState
            Move -1 to iStartItem

            Set Dynamic_Update_State to False
            Send Delete_Data
            Get NewQuery of oTQ uaRole.File_Number to strQ
            If (iDisplayState<>2) Begin
                Send AddFilter of oTQ (&strQ) File_Field uaRole.Disabled tqEQ (If(iDisplayState=0,0,1))
            End
            Send AddOrderBy of oTQ (&strQ) File_Field uaRole.UserDisplaySeq False False
            While (FindRecord(oTQ,&strQ))
                Get Item_Count to iBase
                If (uaRole.Disabled<>0) Begin
                    Send Add_Item MSG_None (Trim(uaRole.RoleName)+" (disabled)")
                End
                Else Begin
                    Send Add_Item MSG_None (Trim(uaRole.RoleName))
                End
                Set Aux_Value iBase to (SizeOfArray(aRoleIDs))
                Move uaRole.RoleID to aRoleIDs[SizeOfArray(aRoleIDs)]
                If (nRoleID=uaRole.RoleID) Begin
                    Move iBase to iStartItem
                End
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set _paRoleIDs to aRoleIDs
            
            If (iStartItem<>-1) Begin
                Set Current_Item to iStartItem
            End
            Else Begin
                Send OnRowChange 0 0
            End
            Set Dynamic_Update_State to True
        End_Procedure
        
        Function CurrentRoleID Returns Number
            Integer iAux
            Number[] aRoleIDs
            Number nTemp
            If (Item_Count(Self)>0) Begin
                Get CurrentAuxValue of oGridFunctions Self 0 to iAux
                Get _paRoleIDs to aRoleIDs
                Function_Return aRoleIDs[iAux]
            End
            Function_Return 0
        End_Function
        
        Procedure AddRole
            Boolean bOk
            Number nRoleID
            tUserAccessRole strRole
            Get EditRole of oUaRoleEditPanel (&strRole) to bOk
            If (bOk) Begin
                Get RoleSave of oRole_TableUpdater strRole to nRoleID
                If (nRoleID<>0) Begin
                    Set _pnGotoRoleID of oRoleDisplayHandler to nRoleID
                    Set pbDisplayDirty of oRoleDisplayHandler to True
                End
            End
        End_Procedure
        
        Procedure EditRole
            Boolean bOk
            Number nRoleID
            tUserAccessRole strRole
            Get CurrentRoleID to nRoleID
            If (nRoleID>=0) Begin
                If (RoleFindById(oRole_TableUpdater,nRoleID)) Begin
                    Get RoleActive of oRole_TableUpdater to strRole
                    Get EditRole of oUaRoleEditPanel (&strRole) to bOk
                    If (bOk) Begin
                        Get RoleSave of oRole_TableUpdater strRole to nRoleID
                        If (nRoleID<>0) Begin
                            Set _pnGotoRoleID of oRoleDisplayHandler to nRoleID
                            Set pbDisplayDirty of oRoleDisplayHandler to True
                        End
                    End
                End
            End
        End_Procedure
        
        Procedure OnMouseDoubleClick Integer iItem
            Send EditRole
        End_Procedure
        
        On_Key kEnter Send EditRole
        
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
        
        Procedure GotoRole Number nRoleID
            Integer iRow
            Get FindRoleRow nRoleID to iRow
            If (iRow>=0) Begin
                Set CurrentRow of oGridFunctions Self to iRow
            End
        End_Procedure
    End_Object

    Object oAddRoleBtn is a Button
        Set Size to 14 56
        Set Location to 284 15
        Set Label to 'Add new role'
        Set peAnchors to anBottomLeft
        Procedure OnClick
            Send AddRole of oRolesGrid
        End_Procedure
    End_Object

    Object oRoleFilter is a ComboForm
        Set Size to 13 75
        Set Location to 284 105
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Set Label to "Show"
        Set peAnchors to anBottomLeft
        Set Entry_State to False
        Set Allow_Blank_State to False
        Set Combo_Sort_State to False
        Procedure OnChange
            Number nRoleID
            Get CurrentRoleID of oRolesGrid to nRoleID
            Send FillList of oRolesGrid nRoleID
        End_Procedure
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
    End_Object

    Object oPrivilegesGrid is a cfreeGrid
    
        Set Location to 54 189
        Set Size to 227 217
    
        Set peAnchors to anAll
        Set peResizeColumn to rcSelectedColumn
        Set piResizeColumn to 1

        Set Line_Width to 2 0
        Set Form_Width    0 to 27
        Set Header_Label  0 to ""
        Set Form_Width    1 to 179
        Set Header_Label  1 to "Privilege"
    
        Set Select_Mode to Multi_Select
        Set pbFirstColumnSelect to True
        Set pbSwitchOnNext to True
        Set pbNoSortState to True
        
        Property Boolean _pbShouldSave False
        Property String[][] _paaPrivileges

        Set GridLine_Mode to Grid_Visible_None
        
        Procedure OnChangeSelectState Integer iItem
            Set _pbShouldSave to True
        End_Procedure
        
        Procedure OnChangeSelectCount
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
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None aGates[iGateIndex].sGateLabel
                Send SetRowColorLastRow of oGridFunctions Self clBtnFace
                
                Move aGates[iGateIndex].sGateID to sGateID
                Get _AddPrivToAux (&aaPrivileges) sGateID "" to iAux
                Set Aux_Value iBase to iAux
                
                Move (SizeOfArray(aGates[iGateIndex].aPrivileges)-1) to iPrivMax
                For iPrivIndex from 0 to iPrivMax
                    Get Item_Count to iBase
                    Send AddCheckBoxItem of oGridFunctions Self False
                    Send Add_Item MSG_None aGates[iGateIndex].aPrivileges[iPrivIndex].sPrivilegeLabel
                    Get _AddPrivToAux (&aaPrivileges) sGateID aGates[iGateIndex].aPrivileges[iPrivIndex].sPrivilegeID to iAux
                    Set Aux_Value iBase to iAux // iPrivIndex
                Loop
                
                Get Item_Count to iBase
                Send Add_Item MSG_None "" 
                Send Add_Item MSG_None ""
                Set Aux_Value iBase to -1
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set Dynamic_Update_State to True
            Set _paaPrivileges to aaPrivileges
        End_Procedure
        
        Procedure FillSelected Number nRoleID
            Integer iRow
            tTableQuery strQ
            
            Send RowDeselectAll of oGridFunctions Self
            
            Get NewQuery of oTQ uaRoleAc.File_Number to strQ
            Send AddFilter of oTQ (&strQ) File_Field uaRoleAc.RoleID tqEQ nRoleID
            
            While (FindRecord(oTQ,&strQ))
                Get FindPrivilegeRow uaRoleAc.GateID uaRoleAc.PrivilegeID to iRow
                If (iRow>-1) Begin
                    Set RowSelectState of oGridFunctions Self iRow to True        
                End
            Loop
            Set _pbShouldSave to False
        End_Procedure
        
        Procedure SaveList
            Integer iRow iMax iBase iAux
            Boolean bSelected
            String sGateID sPrivilegeID
            String[][] aaPrivileges
            Number nRoleID
            Get CurrentRoleID of oRolesGrid to nRoleID
            Get RowCount of oGridFunctions Self to iMax
            Get _paaPrivileges to aaPrivileges
            Decrement iMax
            Lock
                For iRow from 0 to iMax
                    
                    Get RowBaseItem of oGridFunctions Self iRow to iBase
                    Get Aux_Value iBase to iAux
                    If (iAux>=0) Begin

                        Move aaPrivileges[iAux][0] to sGateID
                        Move aaPrivileges[iAux][1] to sPrivilegeID
    
                        If (sPrivilegeID<>"") Begin
                            Get RowSelectState of oGridFunctions Self iRow to bSelected
                            
                            If (FindByID(oUserRoleAc_TableUpdater,nRoleID,sGateID,sPrivilegeID)) Begin
                                If (not(bSelected)) Begin
                                    Delete uaRoleAc
                                End
                            End
                            Else Begin
                                If (bSelected) Begin
                                    SaveRecord uaRoleAc
                                End
                                
                            End
                        End
                    End
                    
                Loop
            Unlock
            Set _pbShouldSave to False
        End_Procedure
    End_Object

    Object oUserGrid is a cfreeGrid
    
        Set Location to 54 415
        Set Size to 227 150
        Set peAnchors to anTopBottomRight
    
        Set Line_Width to 2 0
        Set Form_Width    0 to 27
        Set Header_Label  0 to ""
        Set Form_Width 1 to 114
        Set Header_Label  1 to "Login name"
        
        Set Select_Mode to Multi_Select
        Send SetHighlightRowState of oGridFunctions Self
        Set pbFirstColumnSelect to True
        Set pbSwitchOnNext to True
        Set pbNoSortState to True

        Property Number[] _paUserIDs
        Property Boolean _pbShouldSave False

        Set GridLine_Mode to Grid_Visible_None

        Procedure OnMouseDoubleClick Integer iItem
            Number nUserID
            If (ItemColumn(oGridFunctions,Self,iItem)=1) Begin
                Get CurrentUserID to nUserID
                Send Activate_oUaUserAccessUserView
                Send GotoUser of oUaUserAccessUserView nUserID
            End
        End_Procedure

        Procedure OnChangeSelectState Integer iItem
            Set _pbShouldSave to True
        End_Procedure
        
        Procedure OnChangeSelectCount
            Set _pbShouldSave to True
        End_Procedure

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

        Procedure FillList Number nUserID
            Integer iBase iDisplayState
            Number[] aUserIDs
            tTableQuery strQ
            
            Get DisplayState of oUserFilter to iDisplayState

            Set Dynamic_Update_State to False
            Send Delete_Data
            Get NewQuery of oTQ uaUser.File_Number to strQ
            If (iDisplayState<>2) Begin
                Send AddFilter of oTQ (&strQ) File_Field uaUser.Disabled tqEQ (If(iDisplayState=0,0,1))
            End
            Send AddOrderBy of oTQ (&strQ) File_Field uaUser.LoginName False False
            While (FindRecord(oTQ,&strQ))
                Get Item_Count to iBase
                Send AddCheckBoxItem of oGridFunctions Self False
                If (uaUser.Disabled<>0) Begin
                    Send Add_Item MSG_None (Trim(uaUser.LoginName)+" (disabled)")
                End
                Else Begin
                    Send Add_Item MSG_None (Trim(uaUser.LoginName))
                End
                Set Aux_Value iBase to (SizeOfArray(aUserIDs))
                Move uaUser.UserID to aUserIDs[SizeOfArray(aUserIDs)]
                If (nUserID=uaUser.UserID) Begin
                    Set Current_Item to iBase
                End
            Loop
            Send SetEntryState of oGridFunctions Self False
            Set Dynamic_Update_State to True
            Set _paUserIDs to aUserIDs
        End_Procedure
        
        Function UserRoleTQ Number nRoleID Returns tTableQuery
            tTableQuery strQ
            Get NewQuery of oTQ uaUserRo.File_Number to strQ
            Send AddFilter of oTQ (&strQ) File_Field uaUserRo.RoleID tqEQ nRoleID
            Function_Return strQ
        End_Function
        
        Procedure FillSelected Number nRoleID
            Integer iRow
            tTableQuery strQ
            
            Send RowDeselectAll of oGridFunctions Self
            Get UserRoleTQ nRoleID to strQ
            
            While (FindRecord(oTQ,&strQ))
                Get FindUserRow uaUserRo.UserID to iRow
                If (iRow>-1) Begin
                    Set RowSelectState of oGridFunctions Self iRow to True        
                End
            Loop
            Set _pbShouldSave to False
        End_Procedure
        
        Procedure SaveList
            Integer iRow iMax iBase iAux
            Boolean bSelected
            Number[] aUserIDs
            Number nUserID nRoleID
            Get CurrentRoleID of oRolesGrid to nRoleID
            Get RowCount of oGridFunctions Self to iMax
            Get _paUserIDs to aUserIDs
            Decrement iMax
            Lock
                For iRow from 0 to iMax
                    Get RowSelectState of oGridFunctions Self iRow to bSelected
                    Get RowBaseItem of oGridFunctions Self iRow to iBase
                    
                    Get Aux_Value iBase to iAux
                    Move aUserIDs[iAux] to nUserID
                    
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
    
        Function CurrentUserID Returns Number
            Integer iAux
            Number[] aUserIDs
            If (Item_Count(Self)>0) Begin
                Get CurrentAuxValue of oGridFunctions Self 0 to iAux
                Get _paUserIDs to aUserIDs
                Function_Return aUserIDs[iAux]
            End
            Function_Return 0
        End_Function
    End_Object

    Object oUserFilter is a ComboForm
        Set Size to 13 75
        Set Location to 284 490
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Set Label to "Show"
        Set peAnchors to anBottomRight
        Set Entry_State to False
        Set Allow_Blank_State to False
        Set Combo_Sort_State to False
        Procedure OnChange
            Number nUserID
            Get CurrentUserID of oUserGrid to nUserID
            Send FillList of oUserGrid nUserID
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

    Object oLineControl is a LineControl
        Set Size to 2 555
        Set Location to 301 10
        Set peAnchors to anBottomLeftRight
    End_Object
    
    Object oSaveBtn is a Button
        Set Size to 14 72
        Set Location to 308 416
        Set Label to 'Save changes'
        Set peAnchors to anBottomRight
        Procedure OnClick
            Send SaveList of oPrivilegesGrid
            Send SaveList of oUserGrid
        End_Procedure
    End_Object

    Object oAbandonBtn is a Button
        Set Size to 14 72
        Set Location to 308 494
        Set Label to 'Abandon changes'
        Set peAnchors to anBottomRight
    
        // fires when the button is clicked
        Procedure OnClick
            Send FillSelected of oPrivilegesGrid (CurrentRoleID(oRolesGrid))
            Send FillSelected of oUserGrid (CurrentRoleID(oRolesGrid))
        End_Procedure
    
    End_Object
    
    Procedure Popup
        Boolean bActive
        Get Active_State to bActive
        Forward Send Popup
        If (not(bActive)) Begin
            Send FillList of oPrivilegesGrid 0
            Send FillList of oUserGrid 0
        End
    End_Procedure
    
    Function ShouldSave Returns Boolean
        If (_pbShouldSave(oUserGrid)) Begin
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

    // enable the idle handler timer when the button is activated
    Procedure Activating
       Forward Send Activating
       Set pbEnabled of oRoleDisplayHandler to True
       Set pbEnabled of oShadowStatesHandler to True
    End_Procedure

    // disable the idle handler when the button is deactivated
    Procedure Deactivating
       Set pbEnabled of oRoleDisplayHandler to True
       Set pbEnabled of oShadowStatesHandler to True
       Forward Send DeActivating 
    End_Procedure
    
    Procedure GotoRole Number nRoleID
        Send GotoRole of oRolesGrid nRoleID
    End_Procedure
    
/usRolesManagerView.vw.RoleHeader
Select roles to assign and watch effective privileges change dynamically. Use ctrl+up/down to change the display order of the roles.
/*

    Object oRoleHeader is a cfreeYellowText
        Set Size to 29 158
        Set Location to 22 15
        Set piTextImage to usRolesManagerView.vw.RoleHeader.N
    End_Object

/usRolesManagerView.vw.PrivilegeHeader
Select the privileges that should be assigned to the role selected.

Press "Save changes" to make the changes permanent.
/*

    Object oPrivilegeHeader is a cfreeYellowText
        Set Size to 29 213
        Set Location to 22 189
        Set piTextImage to usRolesManagerView.vw.PrivilegeHeader.N
    End_Object

/usRolesManagerView.vw.UserHeader
Select users that should have the selected role assigned to them. Press "Save changes" to make the changes permanent.
/*

    Object oUserHeader is a cfreeYellowText
        Set Size to 29 143
        Set Location to 22 416
        Set piTextImage to usRolesManagerView.vw.UserHeader.N
        Set peAnchors to anTopRight
    End_Object

Cd_End_Object

