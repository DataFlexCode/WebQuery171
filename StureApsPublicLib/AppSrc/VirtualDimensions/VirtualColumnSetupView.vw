Use Windows.pkg
Use DFClient.pkg

Use Win\cfreeYellowText.pkg

Use VirtualDimensions\cVirtualColumns.pkg
Use VirtualDimensions\VirtualColumnEditPanel.dg

Use cCJGridColumn.pkg


Activate_View Activate_oVirtualColumnSetupView for oVirtualColumnSetupView
Object oVirtualColumnSetupView is a dbView

    Property Integer piVirtialColumnObject
    Set Label to "Classification columns"
    
    Set Border_Style to Border_Thick
    Set Size to 253 428
    Set Location to 2 2
    Set Maximize_Icon to True
    Set Deferred_State to True
    On_Key kCancel Send Close_Panel

    Object oMainTableCombo is a ComboForm
        Set Size to 13 181
        Set Location to 19 140
        Set Label to "Main table:"
        Set Label_Justification_Mode to JMode_Right
        Set Label_Col_Offset to 0
        Set Entry_State to False

        Procedure OnEnterArea Handle hoFrom
            Forward Send OnEnterArea hoFrom
            Send OnChange
        End_Procedure

        Procedure Combo_Fill_List
            Integer iItem iMax iTable
            String sValue
            Handle hVirtualColumnObject
            Move (SizeOfArray(_gaVCObjects)-1) to iMax
            For iItem from 0 to iMax
                Move _gaVCObjects[iItem] to hVirtualColumnObject
                Get piMainTable of hVirtualColumnObject to iTable
                Get_Attribute DF_FILE_DISPLAY_NAME of iTable to sValue
                Send Combo_Add_Item sValue
                If (iItem=0) Begin
                    Set Value to sValue
                End
            Loop
            Send OnChange
            Set Enabled_State to (iMax<>0)
        End_Procedure

        Function Current_VCObject Returns Integer
            Integer iItem iMax iTable
            String sValue sTestValue
            Handle hVirtualColumnObject
            
            Get Value to sValue
            Move (SizeOfArray(_gaVCObjects)-1) to iMax
            For iItem from 0 to iMax
                Move _gaVCObjects[iItem] to hVirtualColumnObject
                Get piMainTable of hVirtualColumnObject to iTable
                Get_Attribute DF_FILE_DISPLAY_NAME of iTable to sTestValue
                If (sTestValue=sValue) Begin
                    Function_Return hVirtualColumnObject
                End
            Loop
            Function_Return -1
        End_Function
        
        Procedure OnChange
            Set piVirtialColumnObject to (Current_VCObject(Self))
        End_Procedure
    End_Object


    Object oColumnsGrid is a cCJGrid
        Set Size to 169 402
        Set Location to 50 11
        Set pbAutoAppend to False
        Set pbFocusSubItems to False
        Set pbSelectionEnable to True
        Set peAnchors to anAll
        Set piMaxSize to 969 402
        
        Set pbAllowEdit to False
        Set pbAllowDeleteRow to False
        Set pbAllowAppendRow to False
        Set pbAllowColumnRemove to False
        Set pbAllowColumnReorder to False
        Set pbAllowInsertRow to False
        
        Function DataSource Returns tDataSourceRow[]
            Integer hVirtialColumnObject
            Integer iItem iMax
            tvdMaster[] aMasters
            tDataSourceRow[] aDataSource
            Get piVirtialColumnObject to hVirtialColumnObject
            Get Masters of hVirtialColumnObject "" 2 to aMasters
            Move (SizeOfArray(aMasters)-1) to iMax
            For iItem from 0 to iMax
                Move aMasters[iItem].sID to aDataSource[iItem].sValue[0]
                Move aMasters[iItem].sLabel to aDataSource[iItem].sValue[1]
                Move aMasters[iItem].bMandatory to aDataSource[iItem].sValue[2]
                Move (SizeOfArray(aMasters[iItem].aSelectOptions)) to aDataSource[iItem].sValue[3]
            Loop
            Function_Return aDataSource
        End_Function
        
        Procedure InitializeGrid
            tDataSourceRow[] aDataSource
            Get DataSource to aDataSource
            Send InitializeData aDataSource
        End_Procedure

        Procedure Activating
            Forward Send Activating
            Send InitializeGrid
        End_Procedure

        Object oColumnName is a cCJGridColumn
            Set piWidth to 153
            Set psCaption to "Column name"
        End_Object
        Object oColumnLabel is a cCJGridColumn
            Set piWidth to 243
            Set psCaption to "Label"
        End_Object
        Object oColumnMandatory is a cCJGridColumn
            Set piWidth to 59
            Set psCaption to "Mandatory"
            Set peTextAlignment to xtpAlignmentCenter
            Set pbCheckbox to True
        End_Object
        Object oColumnSelectOptions is a cCJGridColumn
            Set piWidth to 53
            Set psCaption to "#options"
            Set peTextAlignment to xtpAlignmentRight
        End_Object
        
        Function SelectedRowMaster Returns tvdMaster
            String sColumnID
            Integer hVirtialColumnObject
            tvdMaster strMaster
            Get piVirtialColumnObject to hVirtialColumnObject
            Get SelectedRowValue of oColumnName to sColumnID
            Get MasterFindByID of hVirtialColumnObject sColumnID 2 to strMaster
            Function_Return strMaster
        End_Function
        
        Procedure UpdateCurrentRow tvdMaster strMaster
            Integer hObj
            Get piVirtialColumnObject to hObj

            Send UpdateCurrentValue of oColumnName          strMaster.sID
            Send UpdateCurrentValue of oColumnLabel         strMaster.sLabel
            Send UpdateCurrentValue of oColumnMandatory     strMaster.bMandatory
            Send UpdateCurrentValue of oColumnSelectOptions (SizeOfArray(strMaster.aSelectOptions))
        End_Procedure
        
        Function EditRowPopup Returns Boolean
            Boolean bOK
            Integer hObj
            tvdMaster strMaster

            Get piVirtialColumnObject to hObj
            Get SelectedRowMaster to strMaster
            
            Get PopupMaster of oVirtualColumnEditPanel (&strMaster) hObj to bOK
            If (bOK) Begin
                Send MasterSaveRecord of hObj strMaster
                Send UpdateCurrentRow strMaster
            End
            Function_Return bOK
        End_Function
        
        Procedure RowEdit
            Boolean bOk
            Get EditRowPopup to bOk
        End_Procedure
        
        On_Key kEnter Send RowEdit
        
        Procedure EditNewRow
            Boolean bOk
            Get EditRowPopup to bOk
            If (not(bOk)) Begin
                Send Request_Delete
            End
        End_Procedure

        Procedure OnRowDoubleClick Integer iRow Integer iColumn
            Boolean bOk 
            Forward Send OnRowDoubleClick iRow iColumn
            Get EditRowPopup to bOk
        End_Procedure

    End_Object

    Object oAddButton is a Button
        Set Size to 14 85
        Set Location to 229 9
        Set Label to 'Add new classification'
        Set peAnchors to anBottomLeft
        Procedure OnClick
            Send Activate of oColumnsGrid
            Set pbAllowAppendRow of oColumnsGrid to True
            Send Request_AppendRow of oColumnsGrid
            Send EditNewRow of oColumnsGrid
            Set pbAllowAppendRow of oColumnsGrid to False
        End_Procedure
    End_Object
    
End_Object

