Use Windows.pkg
Use DFClient.pkg
Use cProgressBar.pkg
Use TrckBr.pkg

Activate_View Activate_oTestWinStatusPanelAlternative for oTestWinStatusPanelAlternative
Object oTestWinStatusPanelAlternative is a dbView

    Set Border_Style to Border_Thick
    Set Size to 128 206
    Set Location to 2 2
    Set Label to "Demonstrate smoothness error"

    Object oProgressBar is a cProgressBar
        Set Size to 14 100
        Set Location to 37 53
        Set piMinimum to 0
        Set piMaximum to 100
    End_Object

    Object oTrackBar is a TrackBar
        Set Size to 16 100
        Set Location to 66 51
    
        Procedure OnSetPosition
            Integer iCurPos
            Get Current_Position to iCurPos
            Set piPosition of oProgressBar to iCurPos
        End_Procedure
    
    End_Object

    Object oButton1 is a Button
        Set Location to 94 45
        Set Label to 'Smooth on'
    
        Procedure OnClick
            Set pbSmooth of oProgressBar to True
        End_Procedure
    
    End_Object

    Object oButton2 is a Button
        Set Location to 94 114
        Set Label to 'Smooth off'
    
        Procedure OnClick
            Set pbSmooth of oProgressBar to False
        End_Procedure
    
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 10 155
        Set Location to 6 30
        Set Label to 'The progress bar is indifferent to pbSmooth setting'
    End_Object

    Object oTextBox2 is a TextBox
        Set Size to 10 50
        Set Location to 16 36
        Set Label to 'It is smooth one way and un-smooth the other'
    End_Object
    
End_Object
