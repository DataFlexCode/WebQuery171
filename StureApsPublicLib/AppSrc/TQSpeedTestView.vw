Use Windows.pkg
Use DFClient.pkg
Use dfLine.pkg

Use Win\GridFunctions.pkg // Define oGridFunctions object
Use TableQueryFunctions.pkg // Define oTableQueryFunctions object
//Use Conn

Activate_View Activate_oTQSpeedTestView for oTQSpeedTestView
Object oTQSpeedTestView is a dbView

    Set Border_Style to Border_Thick
    Set Size to 370 465
    Set Location to 2 2
    
    Property Integer piTable 6
    Property Integer piRecCount 669

    Set pbAutoActivate to True
    Set Maximize_Icon to True

    Object oTestTable is a Form
        Set Size to 13 173
        Set Location to 18 92
        Set label to "Test table:"
        Set Label_Justification_Mode to JMode_Right
        Set Label_Col_Offset to 0
        Set Enabled_State to False
    End_Object

    Object oSelectTableBtn is a Button
        Set Location to 18 276
        Set Label to 'Select'
    
        Procedure OnClick
            
        End_Procedure
    
    End_Object

//    Object oNumberOfRecords is a Form
//        Set Size to 13 88
//        Set Location to 30 177
//        Set label to "Fetch number of records:"
//        Set Label_Justification_Mode to JMode_Right
//        Set Label_Col_Offset to 0
//        Set Form_Datatype to 0
//        Set Value to 1000
//    End_Object

    Object oLineControl is a LineControl
        Set Size to 2 366
        Set Location to 53 20
    End_Object

    Object oResultGrid is a cfreeGrid
        Set Location to 75 62
    
        Set Size to 252 328
    
        Set Line_Width to 3 0 // size and Line_width MUST be set before any column properties
    
        Set Form_Width 0 to 168
        Set Header_Label  0 to "How"
    
        Set Form_Width    1 to 47
        Set Header_Label  1 to "Exec time"
    
        Set Form_Width    2 to 47
        Set Header_Label  2 to "Recs/sec"
        
        Set Form_Datatype 1 to 0
        Set Form_Datatype 2 to 2
        Set peAnchors to anAll
        
        Procedure AddRow String sLabel Number nExecMS Number nRecsPrSec
            Send Add_Item MSG_NONE sLabel 
            Send Add_Item MSG_NONE nExecMS
            Send Add_Item MSG_NONE nRecsPrSec
        End_Procedure
    End_Object
    
    Procedure RunTest String sLabel Integer iPrefetchRecords Integer iMaxRecords Boolean bESQL Integer iCacheTimeOutMS
        tTableQuery strQ
        tSystemTimeMS strStart strStop
        Integer iTable iDriver
        Number nExecTime 
    
        Get DriverIndex of oTableDriverFunctions "MSSQLDRV" to iDriver
        Set_Attribute DF_DRIVER_FIND_CACHE_TIMEOUT of iDriver to iCacheTimeOutMS

        Get piTable to iTable
        Open iTable
        Set_Attribute DF_FILE_BLOCK_SIZE of iTable to iPrefetchRecords
        
    
        Get NewQuery of oTQ iTable to strQ
        If (not(bESQL)) Begin
            Send ForceNoESQL of oTQ (&strQ)
        End
        
        Get SystemTimeMilliSeconds of oDateFunctions to strStart
        While (FindRecord(oTQ,&strQ))
        Loop 
        Get SystemTimeMilliSeconds of oDateFunctions to strStop

        Get SystemTimeMilliSecondsElapsed of oDateFunctions strStart strStop to nExecTime // in milliseconds

        Send AddRow of oResultGrid sLabel nExecTime (1000.0*iMaxRecords/nExecTime)
        Close iTable
    End_Procedure

    Object oRun is a Button
        Set Location to 345 182
        Set Label to 'Run'
        Set peAnchors to anBottomLeft
        Procedure OnClick
            Integer iPrefetch iMaxRec
            Move 1 to iPrefetch
            Get piRecCount to iMaxRec
            
            Load_Driver "MSSQLDRV"
            Open 17
            
            While (iPrefetch<=iMaxRec)
                Send RunTest ("Prefetch="+String(iPrefetch)) iPrefetch iMaxRec False 1
                Move (iPrefetch*2) to iPrefetch
            Loop
            
            Send RunTest ("ESQL") 10 iMaxRec True 10000
        End_Procedure
    End_Object

    Object oZeroSelectBtn is a Button
        Set Size to 14 99
        Set Location to 345 237
        Set Label to 'Zero select time'
        Set peAnchors to anBottomLeft
    
        Procedure OnClick
            Number nTime
            Integer iTable
            Get piTable to iTable
            Open iTable
            Get ZeroSelectTime of oTQ iTable to nTime
            Close iTable
            Send Info_Box nTime
        End_Procedure
    
    End_Object

    Object oButton1 is a Button
        Set Location to 345 370
        Set Label to 'Cache test'
        Set peAnchors to anBottomRight
    
        // fires when the button is clicked
        Procedure OnClick
            Send Activate_oTQCacheSpeedView
        End_Procedure
    
    End_Object
End_Object
