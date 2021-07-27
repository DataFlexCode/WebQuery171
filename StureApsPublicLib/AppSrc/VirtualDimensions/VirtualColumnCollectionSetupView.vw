Use Windows.pkg
Use DFClient.pkg
Use cCJGrid.pkg
Use cCJGridColumnRowIndicator.pkg
Use cCJGridColumn.pkg

Use Win\CJGridFunctions.pkg

Use VirtualDimensions\VirtualColumnCollectionLinkSetupPanel.dg

Deferred_View Activate_oVirtualColumnCollectionSetupView for ;
Object oVirtualColumnCollectionSetupView is a dbView

    Set Label to "Collections of classifications"
    Set Border_Style to Border_Thick
    Set Size to 273 274
    Set Location to 2 2
    On_Key kCancel Send Close_Panel

    Property Integer piVirtialColumnObject
    Set pbAutoActivate to True
    Set Maximize_Icon to True

    Object oMainTableCombo is a ComboForm
        Set Size to 13 181
        Set Location to 13 79
        Set Label to "Main table:"
        Set Label_Justification_Mode to JMode_Right
        Set Label_Col_Offset to 0
        Set Entry_State to False
        Set piMaxSize to 13 225
        Set peAnchors to anTopLeftRight

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

    Object oCollectionGrid is a cfreeCJGrid
        Set Size to 187 254
        Set Location to 39 10
        Set peAnchors to anAll
        Set pbAllowRowSwapUpDown to True
        Set pbAutoAppend to True
        
        Procedure CallCollectionLinks
            Boolean bAccept bError
            Handle hVirtualColumnObject 
            tvdCollection strCollection
            Get piVirtialColumnObject to hVirtualColumnObject
            
            Get SaveSelectedRow to bError
            If (not(bError)) Begin
                Get SelectedCollection to strCollection
                Get PopupCollection of oVirtualColumnCollectionLinkSetupPanel strCollection.sID hVirtualColumnObject to bAccept
            End
        End_Procedure
        
        Procedure OnRowDoubleClick Integer iRow Integer iCol
            Send CallCollectionLinks
        End_Procedure

        Procedure AutoCloseEmptyRow
            Integer iRow
            Boolean bCancel
            String sID sLabel
            Get SelectedRowValue of oColumnCollectionName to sID
            Get SelectedRowValue of oColumnLabel to sLabel
            If (Trim(sID*sLabel)="") Begin
                Send RemoveSelectedRow of oCJGridFunctions Self
            End
        End_Procedure
        On_Key kUser Send AutoCloseEmptyRow
        
        Function OnRowChanging Integer iCurrentSelectedRow Integer iNewRow Returns Boolean
            Boolean bRval
            Send AutoCloseEmptyRow
            Forward Get OnRowChanging iCurrentSelectedRow iNewRow to bRval
            Function_Return bRval
        End_Function
        
        Object oColumnCollectionName is a cCJGridColumn
            Set piWidth to 129
            Set psCaption to "Collection name"

            Function OnValidating Returns Boolean
                String sValue
                Get SelectedRowValue to sValue
                If (sValue="") Begin
//                    Send Info_Box "Blank value not allowed" "Blank value not allowed" 
                End
                Function_Return (sValue="")
            End_Function
        End_Object

        Object oColumnLabel is a cCJGridColumn
            Set piWidth to 252
            Set psCaption to "Label"
        End_Object
        
        Function _RowData2Collection tDataSourceRow strRowData Integer iRowNo Returns tvdCollection
            tvdCollection strCollection
            Move strRowData.riID to strCollection.riRow
            Move iRowNo to strCollection._iSortOrder
            Move strRowData.sValue[0] to strCollection.sID
            Move strRowData.sValue[1] to strCollection.sLabel
            Function_Return strCollection
        End_Function
        
        Function _Collection2RowData tvdCollection strCollection Returns tDataSourceRow
            tDataSourceRow strRowData
            Move strCollection.riRow to strRowData.riID 
            Move strCollection.sID to strRowData.sValue[0]
            Move strCollection.sLabel to strRowData.sValue[1]
            Function_Return strRowData
        End_Function
        
        Function SelectedCollection Returns tvdCollection
            tvdCollection strCollection
            tDataSourceRow strRowData
            If (SelectedRowDataRow(oCJGridFunctions,Self,&strRowData)) Begin
                Get _RowData2Collection strRowData (SelectedRow(oCJGridFunctions,Self)) to strCollection
            End
            Function_Return strCollection
        End_Function
        
        Function AllCollections Returns tvdCollection[] 
            Integer iRow iMax
            Handle hoData
            tDataSourceRow[] aDataSource
            tvdCollection[] aCollections
            
            Get phoDataSource to hoData
            Get DataSource of hoData to aDataSource
            Move (SizeOfArray(aDataSource)-1) to iMax
            For iRow from 0 to iMax
                Get _RowData2Collection aDataSource[iRow] iRow to aCollections[iRow]
            Loop
            Function_Return aCollections
        End_Function
        
        Procedure OnRowsSwapped
            Handle hVirtualColumnObject 
            tvdCollection[] aCollections
            Get piVirtialColumnObject to hVirtualColumnObject
            Get AllCollections to aCollections
            Send CollectionsSaveDisplayOrder of hVirtualColumnObject aCollections
        End_Procedure
        
        Function SaveSelectedRow Returns Boolean
            Boolean bError bSaved 
            Integer iRow
            Handle hVirtualColumnObject hoData
            tvdCollection strCollection
            tDataSourceRow[] aDataSource
            Forward Get SaveSelectedRow to bError
            If (not(bError)) Begin
                Get SelectedCollection to strCollection 
                Get piVirtialColumnObject to hVirtualColumnObject
                Get CollectionSaveRecord of hVirtualColumnObject (&strCollection) to bSaved
                If (bSaved) Begin
                    Get phoDataSource to hoData
                    Get SelectedRow of hoData to iRow
                    Get DataSource of hoData to aDataSource
                    Move strCollection.riRow to aDataSource[iRow].riID
                    Set pDataSource of hoData to aDataSource
                    Get DataSource of hoData to aDataSource
//                    Send UpdateSelectedCollection strCollection
//                    Forward Get SaveSelectedRow to bError
                End
                Else Begin
                    Move True to bError
                End
            End
            Function_Return bError
        End_Function
        
        Function DeleteSelectedRow Returns Boolean
            Boolean bError
            Handle hVirtualColumnObject
            tvdCollection strCollection
            
            Get piVirtialColumnObject to hVirtualColumnObject
            
            Get SelectedCollection to strCollection
            If (CollectionDeleteRecord(hVirtualColumnObject,strCollection)) Begin
                Forward Get DeleteSelectedRow to bError
                If (not(bError)) Begin
                End
            End
            Else Begin
                Move True to bError
            End
            Function_Return bError
        End_Function
        
        Procedure UpdateSelectedCollection tvdCollection strCollection
            Integer hVirtialColumnObject iRow
            tDataSourceRow[] aDataSource
            If (iRow<>-1) Begin
                Get piVirtialColumnObject to hVirtialColumnObject
                Get DataSource of oCJGridFunctions Self to aDataSource
                Get SelectedRow of oCJGridFunctions Self to iRow
                Get _Collection2RowData strCollection to aDataSource[iRow]
                Send ReInitializeData aDataSource True
            End
        End_Procedure

        Function DataSource Returns tDataSourceRow[]
            Integer hVirtialColumnObject
            Integer iItem iMax
            tvdCollection[] aCollections
            tDataSourceRow[] aDataSource
            Get piVirtialColumnObject to hVirtialColumnObject
            Get Collections of hVirtialColumnObject to aCollections
            Move (SizeOfArray(aCollections)-1) to iMax
            For iItem from 0 to iMax
                Move aCollections[iItem].riRow to aDataSource[iItem].riID
                Move aCollections[iItem].sID to aDataSource[iItem].sValue[0]
                Move aCollections[iItem].sLabel to aDataSource[iItem].sValue[1]
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
    End_Object

    Object oBottomLabel is a TextBox
        Set Size to 8 50
        Set Location to 229 13
        Set Label to 'Use ctrl+up/dn to alter the sequence of the list items'
        Set peAnchors to anBottomLeft
    End_Object

    Object oAddButton is a Button
        Set Size to 14 78
        Set Location to 246 10
        Set Label to 'Add new collection'
        Set peAnchors to anBottomLeft
    
        Procedure OnClick
            Set pbAllowAppendRow of oCollectionGrid to True
            Send Request_AppendRow of oCollectionGrid
            Send Activate of oCollectionGrid 
            Set pbAllowAppendRow of oCollectionGrid to False
        End_Procedure
    
    End_Object
    
Cd_End_Object
