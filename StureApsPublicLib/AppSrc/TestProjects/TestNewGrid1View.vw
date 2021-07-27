Use Windows.pkg
Use DFClient.pkg
Use cCJGrid.pkg
Use cCJGridColumn.pkg

Use DateFunctions.pkg

Activate_View Activate_oTestNewGrid1View for oTestNewGrid1View
Object oTestNewGrid1View is a View

    Set Border_Style to Border_Thick
    Set Size to 200 477
    Set Location to 2 2
    Set pbAutoActivate to True

    Object oGrid is a cCJGrid
        Set Size to 148 394
        Set Location to 21 39
        Set peAnchors to anAll
        Set pbUseAlternateRowBackgroundColor to True
        Set pbAutoColumnSizing to False
        Set piFreezeColumnsCount to 1
        Set pbReadOnly to True
        
        Object oColumn1 is a cCJGridColumn
            Set piWidth to 147
            Set psCaption to "Date"
            Set peDataType to Mask_Date_Window
            Set pbMultiLine to True
        End_Object

        Object oColumn2 is a cCJGridColumn
            Set piWidth to 148
            Set psCaption to "Weekday"
        End_Object

        Object oColumn3 is a cCJGridColumn
            Set piWidth to 148
            Set psCaption to "Month"
        End_Object

        Object oColumn4 is a cCJGridColumn
            Set piWidth to 148
            Set psCaption to "Julian"
            Set peDataType to Mask_Numeric_Window
        End_Object
        
        Procedure LoadData
            Integer iDay iStart iRow
            Integer iDateColumn iWeekDayColumn iMonthColumn iJulianColumn
            tDataSourceRow[] aRows

            Get piColumnId of oColumn1 to iDateColumn 
            Get piColumnId of oColumn2 to iWeekDayColumn 
            Get piColumnId of oColumn3 to iMonthColumn 
            Get piColumnId of oColumn4 to iJulianColumn

            Move 0 to iRow
            Move (Integer(SystemDate(oDateFunctions))) to iStart
            For iDay from iStart to (iStart+100)
                Move (Date(iDay)) to aRows[iRow].sValue[iDateColumn]
                Get DateDayName of oDateFunctions (Date(iDay)) to aRows[iRow].sValue[iWeekDayColumn]
                Get DateMonthName of oDateFunctions (Date(iDay)) to aRows[iRow].sValue[iMonthColumn]
                Move iDay to aRows[iRow].sValue[iJulianColumn] 
                Increment iRow
            Loop
            Send InitializeData aRows
        End_Procedure
    
        Procedure Activating
            Forward Send Activating
            Send LoadData
        End_Procedure
    
    End_Object

End_Object
