Use Windows.pkg
Use DFClient.pkg

Use TimesheetFunctions.pkg

Object oTimeSheetPresentationPrepareView is a dbView
    
    Property tTSDataSet pstrDataSet

    Set Border_Style to Border_Thick
    Set Size to 200 323
    Set Location to 2 2

    Object oTitle is a Form
        Set Size to 13 263
        Set Location to 12 17
        Set Enabled_State to False
    End_Object

    Object oDimensionsGrid is a Grid
        Set Location to 39 17
        Set Size to 65 123
        Set Line_Width to 2 0
        Set Form_Width 0 to 67
        Set Header_Label  0 to "Label"
        Set Form_Width    1 to 47
        Set Header_Label  1 to "#values"
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 10 50
        Set Location to 29 18
        Set Label to 'Dimensions'
    End_Object

    Object oFactsGrid is a Grid
        Set Location to 39 143
    
        Set Size to 65 150
    
        Set Line_Width to 3 0 // size and Line_width MUST be set before any column properties
    
        Set Form_Width 0 to 59
        Set Header_Label  0 to "Label"
    
        Set Form_Width 1 to 33
        Set Header_Label  1 to "Unit"
    
        Set Form_Width    2 to 47
        Set Header_Label  2 to "Decimals"
    
        //Sample method of how to fill a grid
    
        //Procedure DoFillGrid
        //    Integer iRow iMaxRows
        //
        //    Move 20 to iMaxRows
        //    For iRow From 1 to iMaxRows
        //        Send Add_Item Msg_None ("Col 1, row " + String (iRow))
        //        Send Add_Item Msg_None ("Col 2, row " + String (iRow))
        //        Send Add_Item Msg_None ("Col 3, row " + String (iRow))
        //    Loop
        //End_Procedure
    
        //Procedure OnChange Integer iNewItem
        //    String sValue
        //
        //    Get Value iNewItem to sValue // value of changed cell
        //End_Procedure
    
    End_Object

    Object oTextBox2 is a TextBox
        Set Size to 10 50
        Set Location to 29 143
        Set Label to 'Facts'
    End_Object
    
    
    
    Procedure InitializePanel
        tTSDataSet strDataSet
        Set pstrDataSet to strDataSet    
        Set Value of oTitle to (If(strDataSet.sTitle="","Un-titled",strDataSet.sTitle))
    End_Procedure


End_Object

Procedure Activate_oTimeSheetPresentationPrepareView tTSDataSet strDataSet
    Set pstrDataSet of oTimeSheetPresentationPrepareView to strDataSet    
    Send Popup of oTimeSheetPresentationPrepareView
End_Procedure