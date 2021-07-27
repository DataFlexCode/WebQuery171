Use Windows.pkg
Use DFClient.pkg
Use Win\GridFunctions.pkg

Use TableQueryBenchmark.pkg

Deferred_View Activate_oTableQueryTestCollectionView for ;
Object oTableQueryTestCollectionView is a dbView

    Set Label to "TableQuery test collection"
    Set Border_Style to Border_Thick
    Set Size to 200 300
    Set Location to 2 2

    Object oGrid is a GridSture
        Set Location to 15 16
    
        Set Size to 140 270
    
        Set Line_Width to 3 0
    
        Set Form_Width    0 to 20
        Set Header_Label  0 to ""
    
        Set Form_Width 1 to 198
        Set Header_Label  1 to "Test name"
    
        Set Form_Width    2 to 47
        Set Header_Label  2 to "Column 3"
    
    End_Object

    Object oButton1 is a Button
        Set Location to 165 101
        Set Label to 'Run selected'
    
        // fires when the button is clicked
        Procedure OnClick
            
        End_Procedure
    
    End_Object

    Object oButton2 is a Button
        Set Location to 165 157
        Set Label to 'oButton2'
    
        // fires when the button is clicked
        Procedure OnClick
            
        End_Procedure
    
    End_Object

Cd_End_Object
