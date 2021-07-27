Use DfAllEnt.pkg
Use Win\GridFunctions.pkg
Use Windows.pkg
Use cTextEdit.pkg

Deferred_View Activate_oStringFunctionsTestView for ;
Object ooStringFunctionsTestView is a View
    Set Size to 301 566
    Set Location to 12 6
    Set Label to "Test oStringFunctions object in StringFunctions.pkg"
    Set Border_Style to Border_Thick
    Set piMinSize to 301 566
    On_Key kCancel Send close_panel    

    Object oTabDialog is a TabDialog
        Set Size to 253 526
        Set Location to 10 11
        Set peAnchors to anAll

        Object oTabPage1 is a TabPage
            Set Label to "Special"

            Object oGroup1 is a Group
                Set Size to 57 478
                Set Location to 18 20
                Set Label to "SpellingDistance function"
                Set peAnchors to anTopLeftRight
    
                Object oWord1 is a Form
                    Set Size to 14 100
                    Set Location to 14 71
                    Set Label to "Word 1"
                    Set value to "Levenstein"
                    Procedure OnChange
                        Send CalcDistance
                    End_Procedure
                End_Object
    
                Object oWord2 is a Form
                    Set Size to 14 100
                    Set Location to 33 71
                    Set Label to "Word 2"
                    Set value to "Levenshtein"
                    Procedure OnChange
                        Send CalcDistance
                    End_Procedure
                End_Object
    
                Object oDist is a Form
                    Set Size to 14 100
                    Set Location to 33 264
                    Set Label to "Spelling distance"
                    Set Enabled_State to False
                End_Object
                
                Procedure CalcDistance
                    Integer iRval
                    String sWord1 sWord2
                    Get value of oWord1 to sWord1
                    Get value of oWord2 to sWord2
                    Get SpellingDistance of oStringFunctions sWord1 sWord2 to iRval
                    Set value of oDist to iRval
                End_Procedure
                Send CalcDistance
            End_Object
        End_Object

        Object oTabPage2 is a TabPage
            Set Label to "Number formatting"
        End_Object

    End_Object
    
Cd_End_Object
