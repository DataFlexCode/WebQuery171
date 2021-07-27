Use Windows.pkg
Use DFClient.pkg

Use TableQueryFunctions.pkg
Use Win\GridFunctions.pkg

Activate_View Activate_oTableQueryTableSizeTestView for oTableQueryTableSizeTestView
Object oTableQueryTableSizeTestView is a dbView

    Set Border_Style to Border_Thick
    Set Size to 239 341
    Set Location to 2 2
    Set pbAutoActivate to True

    Object oTableNumberForm is a Form
        Set Size to 13 100
        Set Location to 17 66
        Set Label to "Table number:"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Procedure OnChange
            Send OnNewTable
        End_Procedure
    End_Object

    Object oTableName is a Form
        Set Size to 13 100
        Set Location to 18 192
        Set Enabled_State to False
    End_Object

    Object oNumberOfRecordsForm is a Form
        Set Size to 13 100
        Set Location to 34 65
        Set Label to "Records in table"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
        Set Enabled_State to False
    End_Object

    Object oStopNumber is a Form
        Set Size to 13 100
        Set Location to 52 65
        Set Form_Datatype to 0
        Set Label to "Stop at"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Right
    End_Object

    Object oResultGrid is a GridSture
        Set Location to 76 28
    
        Set Size to 146 277
    
        Set Line_Width to 4 0 // size and Line_width MUST be set before any column properties
    
        Set Form_Width 0 to 80
        Set Header_Label  0 to "Number of records"
    
        Set Form_Width 1 to 64
        Set Header_Label  1 to "SQL Execute"

        Set Form_Width 2 to 63
        Set Header_Label  2 to "SQL Fetch"
        
        Set Form_Width 3 to 58
        Set Header_Label  3 to "Time per row"
        Set peAnchors to anAll
        
        Procedure AddRow Integer iLimit Number nExecute Number nFetch Number nPerRecord
            Send Add_Item MSG_NONE iLimit
            Send Add_Item MSG_NONE nExecute  
            Send Add_Item MSG_NONE nFetch 
            Send Add_Item MSG_NONE nPerRecord 
        End_Procedure
    End_Object

    Procedure OnNewTable
        Boolean bUsed
        Integer iTable
        String sNumberOfRecords
        String sTableName
        Get Value of oTableNumberForm to iTable
        If (iTable<>0) Begin
            Get_Attribute DF_FILE_ROOT_NAME of iTable to sTableName
            If (sTableName<>"") Begin
                Open iTable
                Get_Attribute DF_FILE_RECORDS_USED of iTable to sNumberOfRecords
            End
        End
        Set Value of oTableName to sTableName
        Set Value of oNumberOfRecordsForm to sNumberOfRecords
        Set Value of oStopNumber to sNumberOfRecords
        Send Delete_Data of oResultGrid
    End_Procedure
    
    Object oButton1 is a Button
        Set Location to 51 222
        Set Label to 'Run'
    
        Procedure OnClick
            Integer iTable
            Integer iLimit iMaxLimit
            tTableQuery strQ
            tSystemTimeMS strStart strTemp
            Number nExecute nFetch nPerRecord
            
            Send Delete_Data of oResultGrid

            Get Value of oTableNumberForm to iTable
            If (iTable<>0) Begin
                Get Value of oStopNumber to iMaxLimit
                Move 1 to iLimit
                
                Get SystemTimeMilliSeconds of oDateFunctions to strStart
                While (iLimit<=iMaxLimit)
                    Get NewQuery of oTQ iTable to strQ
                    Send SetLimit of oTQ (&strQ) iLimit
                    
                    While (FindRecord(oTQ,&strQ))
                        If (IsFirstRecord(oTQ,strQ)) Begin
                            Get SystemTimeMilliSeconds of oDateFunctions to strTemp
                            Get SystemTimeMilliSecondsElapsed of oDateFunctions strStart strTemp to nExecute
                            Move strTemp to strStart
                        End
                    Loop
                    Get SystemTimeMilliSeconds of oDateFunctions to strTemp
                    Get SystemTimeMilliSecondsElapsed of oDateFunctions strStart strTemp to nFetch
                    Move (nFetch/iLimit) to nPerRecord
                    Send AddRow of oResultGrid iLimit nExecute nFetch nPerRecord
                    Move (iLimit*2) to iLimit
                Loop
                
                Send SetEntryState of oGridFunctions oResultGrid False 
            End
        End_Procedure
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 10 36
        Set Location to 228 76
        Set Label to 'Press ctrl+W to export to NotePad (while in the grid)'
        Set peAnchors to anBottomLeft
    End_Object

    

End_Object
