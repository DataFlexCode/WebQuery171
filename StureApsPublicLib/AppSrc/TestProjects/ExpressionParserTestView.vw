Use Windows.pkg
Use DFClient.pkg
Use cTextEdit.pkg

Use cExpressionParser.pkg
Use Win\GridFunctions.pkg
Use TableAccessFunctions.pkg

Deferred_View Activate_oExpressionParserTestView for ;
Object oExpressionParserTestView is a dbView

    Set Border_Style to Border_Thick
    Set Location to 2 2
    Set Label to "Expression parser test"
    Set Size to      271 672
    Set piMinSize to 271 672
    Set piMaxSize to 871 672
    
    Object oTextEdit is a cTextEdit
        Set Size to 40 347
        Set Location to 14 17
        Set peAnchors to anTopLeftRight
//        Set Value to "sin(32)^2 + cos(32)^2 = 1"
        Set Label to "Expression"
        Set Label_Justification_Mode to JMode_Top
        Set Label_Col_Offset to 0
    End_Object

    Object oGrid is a GridSture
        Set Location to 70 18
    
        Set Size to 175 325
    
        Set Line_Width to 4 0 // size and Line_width MUST be set before any column properties
    
        Set Form_Width 0 to 150
        Set Header_Label  0 to "Token"
    
        Set Form_Width 1 to 69
        Set Header_Label 1 to "Type"
    
        Set Form_Width 2 to 49
        Set Header_Label  2 to "Pos"

        Set Form_Width 3 to 49
        Set Header_Label 3 to "Index"
        Set peAnchors to anAll
        
        Set GridLine_Mode to Grid_Visible_None
        Set pbNoSortState to True
        
        Procedure FillGrid tXPToken[] aSymbols
            Integer iMax iItem
            String sClass sValue
            Set Dynamic_Update_State to False
            Send Delete_Data
            Move (SizeOfArray(aSymbols)-1) to iMax
            For iItem from 0 to iMax
                Get XPSymbolClassId2Text of oExpressionParser aSymbols[iItem].iType to sClass
                Move aSymbols[iItem].sValue to sValue
                If (aSymbols[iItem].strValueHint.iTable>0) Begin
                    Move (sValue+" ("+String(aSymbols[iItem].strValueHint.iTable)+","+String(aSymbols[iItem].strValueHint.iColumn)+")") to sValue
                End
                Send Add_Item MSG_NONE sValue
                Send Add_Item MSG_NONE sClass
                Send Add_Item MSG_NONE aSymbols[iItem].iStartPos
                Send Add_Item MSG_NONE aSymbols[iItem].iOperatorIndex
            Loop
            Send SetEntryState of oGridFunctions Self False
            Send SetAlternatingRowColors of oGridFunctions Self clBlue
            Set Dynamic_Update_State to True
        End_Procedure
    End_Object
    
    Object oExpressionParser is a cExpressionParser
        Function OnGetTableColumnType Integer iTable Integer iColumn Returns Integer
            Boolean bOpen
            Integer iType
            Get OpenTable of oTableAccessFunctions iTable DF_SHARE 0 to bOpen
            If (bOpen) Begin
                Forward Get OnGetTableColumnType iTable iColumn to iType
            End
            Else Begin
                Move XP_Error to iType
            End
            Close iTable
            Function_Return iType
        End_Function
        Function OnColumnNameToNumber Integer iTable String sName Returns Integer
            Boolean bOpen
            Integer iType
            Get OpenTable of oTableAccessFunctions iTable DF_SHARE 0 to bOpen
            If (bOpen) Begin
                Forward Get OnColumnNameToNumber iTable sName to iType
            End
            Else Begin
                Move XP_Error to iType
            End
            Close iTable
            Function_Return iType
        End_Function
    End_Object

    Object oErrorMessage is a Form
        Set Size to 13 258
        Set Location to 253 89
        Set Label to "Error message:"
        Set Enabled_State to False
        Set peAnchors to anBottomLeftRight
        Procedure UpdateValue tXPError strError
            String sValue
            If (strError.iPos<>0) Begin
                Move (strError.sErrorText+" (in pos "+String(strError.iPos)+")") to sValue
            End
            Set Value to sValue
        End_Procedure
    End_Object

    Object oButton is a Button
        Set Location to 40 371
        Set Label to 'Parse'
//        Set peAnchors to anBottomRight
    
        // fires when the button is clicked
        Procedure OnClick
            Send Execute
        End_Procedure
    
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 10 50
        Set Location to 59 19
        Set Label to 'Tokenization'
    End_Object
    
    Object oGrid2 is a GridSture
        Set pbNoSortState to True
        Set Location to 70 350
    
        Set Size to 175 300
    
        Set Line_Width to 4 0 // size and Line_width MUST be set before any column properties
    
        Set Form_Width 0 to 128
        Set Header_Label  0 to "Token"
    
        Set Form_Width 1 to 69
        Set Header_Label 1 to "Type"
    
        Set Form_Width 2 to 49
        Set Header_Label  2 to "Pos"

        Set Form_Width 3 to 49
        Set Header_Label 3 to "Index"
        Set peAnchors to anTopBottomLeft
        
        Set GridLine_Mode to Grid_Visible_None
        
        Procedure FillGrid tXPToken[] aSymbols
            Integer iMax iItem
            String sValue
            String sClass
            Set Dynamic_Update_State to False
            Send Delete_Data
            Move (SizeOfArray(aSymbols)-1) to iMax
            For iItem from 0 to iMax
                Get XPSymbolClassId2Text of oExpressionParser aSymbols[iItem].iType to sClass
                Move aSymbols[iItem].sValue to sValue
                If (aSymbols[iItem].strValueHint.iTable>0) Begin
                    Move (sValue+" ("+String(aSymbols[iItem].strValueHint.iTable)+","+String(aSymbols[iItem].strValueHint.iColumn)+")") to sValue
                End
                Send Add_Item MSG_NONE sValue
                Send Add_Item MSG_NONE sClass
                Send Add_Item MSG_NONE aSymbols[iItem].iStartPos
                Send Add_Item MSG_NONE aSymbols[iItem].iOperatorIndex
            Loop
            Send SetEntryState of oGridFunctions Self False
            Send SetAlternatingRowColors of oGridFunctions Self clBlue
            Set Dynamic_Update_State to True
        End_Procedure
    End_Object

    Object oButton1 is a Button
        Set Size to 14 99
        Set Location to 11 373
        Set Label to "sin(32)^2 + cos(32)^2"
        Procedure OnClick
            Set Value of oTextEdit to (Label(Self))
            Send Execute
        End_Procedure
    End_Object

    Object oButton2 is a Button
        Set Location to 11 479
        Set Label to '(a+b)^2'
        Procedure OnClick
            Set Value of oTextEdit to (Label(Self))
            Send Execute
        End_Procedure
    End_Object

    Object oButton3 is a Button
        Set Size to 14 98
        Set Location to 11 538
        Set Label to '3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3'
        Procedure OnClick
            Set Value of oTextEdit to (Label(Self))
            Send Execute
        End_Procedure
    End_Object

    Object oButton3_2 is a Button
        Set Size to 14 98
        Set Location to 27 538
        Set Label to 'uppercase(left("abcde",3))'
        Procedure OnClick
            Set Value of oTextEdit to (Label(Self))
            Send Execute
        End_Procedure
    End_Object

    Object oTextBox2 is a TextBox
        Set Size to 10 50
        Set Location to 59 353
        Set Label to "Shunting Yard output (Dijkstra) (and it is in 'reverse polish notation')"
    End_Object

    Object oButton4 is a Button
        Set Size to 14 66
        Set Location to 252 354
        Set Label to 'Evaluate output'
        Set peAnchors to anBottomRight
    
        // fires when the button is clicked
        Procedure OnClick
            String sExpression
            tXPGrammar strGrammar
            tXPToken[] aSymbols
            tXPError strError
            tXPValue strValue

            Get NewGrammar of oExpressionParser to strGrammar
            Get Value of oTextEdit to sExpression
            Get TokenizeString of oExpressionParser strGrammar sExpression (&strError) to aSymbols
            Get ReversePolishNotation of oExpressionParser strGrammar aSymbols (&strError) to aSymbols
            Get Evaluate of oExpressionParser strGrammar aSymbols (&strError) to strValue
    
            Send UpdateValue of oErrorMessage strError
            Send DisplayValue of oResult strValue
        End_Procedure
    
    End_Object

    Object oResult is a Form
        Set Size to 13 189
        Set Location to 252 462
        Set peAnchors to anBottomRight
        Set Entry_State to False
        Procedure DisplayValue tXPValue strValue
            String sType
            Get XPValueTypeToString of oExpressionParser strValue.iValueType to sType
            Set Value to (strValue.sValue+" ("+sType+")")
        End_Procedure
    End_Object

    Procedure Execute
        String sExpression
        tXPGrammar strGrammar
        tXPToken[] aSymbols
        tXPError strError
        Get NewGrammar of oExpressionParser to strGrammar
        Get Value of oTextEdit to sExpression
        Get TokenizeString of oExpressionParser strGrammar sExpression (&strError) to aSymbols
        Send FillGrid of oGrid aSymbols
        Send UpdateValue of oErrorMessage strError
        Get ReversePolishNotation of oExpressionParser strGrammar aSymbols (&strError) to aSymbols
        Send FillGrid of oGrid2 aSymbols
    End_Procedure
Cd_End_Object

