Use Windows.pkg
Use DFClient.pkg
Use Win\GridFunctions

Use UniversallyUniqueIdentifierFunctions.pkg

Deferred_View Activate_oTestUuidView for ;
Object oTestUuidView is a dbView
    Set Size to 209 397

    Set Border_Style to Border_Thick
    Set Location to 2 2
    Set Label to "UniversallyUniqueIdentifierFunctions.pkg tester"
    Set piMaxSize to 999 397
    Set piMinSize to 100 397
    
    On_Key kCancel Send Close_Panel
    
    Object oTextBox1 is a TextBox
        Set Size to 10 50
        Set Location to 4 10
        Set Label to 'NewUUID function'
    End_Object

    Object oTextBox2 is a TextBox
        Set Size to 10 50
        Set Location to 4 207
        Set Label to 'NewSequentialUUID function'
    End_Object
    
    Object oList1 is a ListSture
        Set Size to 170 180
        Set Location to 14 9
        Set peAnchors to anTopBottomLeft
    End_Object

    Object oList2 is a ListSture
        Set Size to 170 180
        Set Location to 14 206
        Set peAnchors to anTopBottomLeft
    End_Object

    Object oButton is a Button
        Set Size to 14 103
        Set Location to 188 152
        Set Label to 'Call each function 100 times'
        Set peAnchors to anBottomLeft
    
        Procedure OnClick
            Integer iIndex
            String sValue
            
            Send Delete_Data of oList1
            Send Delete_Data of oList2
            Set Dynamic_Update_State of oList1 to False
            Set Dynamic_Update_State of oList2 to False
            For iIndex from 1 to 100
                Get NewUUID of oUuidFunctions to sValue
                Send Add_Item of oList1 MSG_NONE sValue
                Get NewSequentialUUID of oUuidFunctions to sValue
                Send Add_Item of oList2 MSG_NONE sValue
            Loop
            Set Dynamic_Update_State of oList1 to True
            Set Dynamic_Update_State of oList2 to True
        End_Procedure
    
    End_Object
   
Cd_End_Object
