Use Windows.pkg
Use DFClient.pkg
Use TableQueryFunctions.pkg
Use TableQueryStructureFunctions.pkg
Use cTextEdit.pkg
Use Win\GridFunctions.pkg
Use dfLine.pkg
Use dfTreeVw.pkg

Class cColumnSourcesList is a List
    Procedure Construct_Object
        Forward Send Construct_Object
        Property Boolean pbReadOnly False
    End_Procedure
    
    Procedure FillList tTableQuery strQ
        Integer iItem iItemMax iTable iColumn iType
        String sLabel
        Send Delete_Data
        Move (SizeOfArray(strQ.aColumnSources)) to iItemMax
        For iItem from 0 to iItemMax
            Move strQ.aColumnSources[iItem].iTable to iTable
            Move strQ.aColumnSources[iItem].iColumn to iColumn
            Move strQ.aColumnSources[iItem].iType to iType
            If (iColumn=0) Begin
                Get TableName of oTQ strQ iTable to sLabel
                Move (sLabel+".*") to sLabel
            End
            Else Begin
                Get ColumnName strQ iTable iColumn True to sLabel
            End
            Send Add_Item MSG_NONE sLabel
        Loop
    End_Procedure
    
End_Class

Deferred_View Activate_oTableQueryTestView for ;
Object oTableQueryTestView is a dbView

    Set Label to "TableQueryFunctions test panel"
    Set Border_Style to Border_Thick
    Set Size to 296 528
    Set Location to 3 15
    
    Property tTableQueryStructure _psQS
    
    Function TreeNodeLabel tTableQueryStructure strQS String sQueryNodeID Returns String
        Integer iTable
        String sLabel
        tTableQueryStructure strTargetQS
        Get TableQueryStructureNode of oTQS strQS sQueryNodeID to strTargetQS
        Move strTargetQS.strQ.iTable to iTable
        If (iTable>0) Begin
            Get_Attribute DF_FILE_LOGICAL_NAME of iTable to sLabel
            Move (sLabel+" ("+strTargetQS.sQueryID+")") to sLabel
        End
        Else Begin
            Move "No table selected" to sLabel
        End
        Function_Return sLabel
    End_Function

    Object oTreeView is a TreeView
        Set Size to 252 158
        Set Location to 17 14
        
                Procedure AddBranch Handle hParent tTableQueryStructure[] aNodes
                    Integer iIndex iMax iType
                    Handle hChild
                    String sLabel
                    Move (SizeOfArray(aNodes)-1) to iMax
                    For iIndex from 0 to iMax
                        Get TreeNodeLabel aNodes[iIndex] aNodes[iIndex].sQueryID to sLabel
                        Get AddTreeItem sLabel hParent 0 0 0 to hChild
                        Send AddBranch hChild aNodes[iIndex].aSubQueries
                    Loop
                End_Procedure
                
        Procedure OnCreateTree
            tTableQueryStructure strQS
            Handle hRoot
            
            Send DoDeleteItem 0
            Get _psQS to strQS

            Get AddTreeItem (TreeNodeLabel(Self,strQS,strQS.sQueryID)) 0 0 0 0 to hRoot
            Send AddBranch hRoot strQS.aSubQueries

            Send DoExpandAll 0
            Set CurrentTreeItem to (RootItem(Self))

        End_Procedure
    
    End_Object

    Object oGroup1 is a Group
        Set Size to 252 311
        Set Location to 17 188
        Set Label to 'Current node data'

        Object oColumnSources is a List
            Set Size to 190 121
            Set Location to 35 9
        End_Object

        Object oOrdering is a List
            Set Size to 190 121
            Set Location to 35 138
        End_Object
    End_Object
    

Cd_End_Object

