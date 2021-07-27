Use Windows.pkg
Use DFClient.pkg
Use RgbFunctions.pkg
Use cFreeTextIndex.pkg
Use Win\GridFunctions.pkg // Define oGridFunctions object

Object oFreeTextIndexerControlCenterSearch is a dbView

    Set Border_Style to Border_Thick
    Set Size to 351 456
    Set Location to 4 3
    Set Label to "Free Test Search"
    Set piMinSize to 300 456
    On_Key kCancel Send close_panel
    
    Property tFtiArticle[] paArticles
    Property Integer phFti

    Object oHeader is a Form
        Set Size to 14 437
        Set Location to 8 8
        Set Enabled_State to False
        Set peAnchors to anLeftRight
        Set Form_Justification_Mode 0 to Form_DisplayCenter
        Set Color to (Brighten(oRgbFunctions,clYellow,75))
        Set Border_Style to Border_None
    End_Object

    Object oSearchForm is a Form
        Set Size to 14 151
        Set Location to 32 36
        Set peAnchors to anLeftRight
        Set Label to "Search:"
        Set Label_Col_Offset to 25
    End_Object

    Object oDateMin is a Form
        Set Size to 14 47
        Set Location to 32 212
        Set Label to "Date:"
        Set Label_Col_Offset to 18
        Set peAnchors to anTopRight
    End_Object
    
    Object oDateMax is a Form
        Set Size to 14 47
        Set Location to 32 264
        Set Label to "-"
        Set Label_Col_Offset to 4
        Set peAnchors to anTopRight
    End_Object

    Object oSubmitBtn is a Button
        Set Size to 14 28
        Set Location to 32 314
        Set Label to "Submit"
        Set peAnchors to anRight
        Procedure OnClick
            Send DoSearch FTISM_NEW
        End_Procedure
    End_Object

    Object oRefineBtn is a Button
        Set Size to 14 28
        Set Location to 32 346
        Set Label to "Refine"
        Set peAnchors to anRight
        Procedure OnClick
            Send DoSearch FTISM_REFINE
        End_Procedure
    End_Object

    Object oAddBtn is a Button
        Set Size to 14 24
        Set Location to 32 375
        Set Label to "Add"
        Set peAnchors to anRight
        Procedure OnClick
            Send DoSearch FTISM_ADD
        End_Procedure
    End_Object

    Object oExcludeBtn is a Button
        Set Size to 14 33
        Set Location to 32 400
        Set Label to "Exclude"
        Set peAnchors to anRight
        Procedure OnClick
            Send DoSearch FTISM_EXCLUDE
        End_Procedure
    End_Object

    Object oOrdering is a ComboForm
        Set Size to 14 99
        Set Location to 49 212
        Set Label to "Order by:"
        Set Label_Col_Offset to 30
        Set Allow_Blank_State to False
        Set Combo_Sort_State to False
        Set Entry_State to False

        Procedure Combo_Fill_List
            Send Combo_Add_Item "Article Id"
            Send Combo_Add_Item "Date"
            Send Combo_Add_Item "Popularity"
        End_Procedure
    End_Object

    Object oResultForm is a Form
        Set Size to 14 422
        Set Location to 67 14
        Set peAnchors to anLeftRight
        Set Enabled_State to False
        Set Form_Justification_Mode 0 to Form_DisplayCenter
        
        Procedure Display tFtiStatus stStatus
            String sValue
            If (stStatus.sErrorText<>"") Begin
                Set Value to stStatus.sErrorText
                Set Color to (Brighten(oRgbFunctions,clRed,75))
            End
            Else Begin
                Move "# articles found in # seconds." to sValue
                Move (Replace("#",sValue,stStatus.iResultCount)) to sValue
                Move (Replace("#",sValue,stStatus.iExecTimeMs/1000.0)) to sValue
                Set Value to sValue
                set color to clBtnFace
            End
        End_Procedure
    End_Object

    Object oListCrit is a List
        Set Size to 50 422
        Set Location to 92 14
        Set peAnchors to anLeftRight
        Set Label to "Criteria:"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Top
    End_Object

    Object oListArticles is a Grid
        Set Size to 182 422
        Set Line_Width to 4 0
        Set Header_Label 0 to "Art Id"
        Set Form_Width 0 to 50
        Set Header_Label 1 to "Date"
        Set Form_Width 1 to 70
        Set Header_Label 2 to "Popularity"
        Set Form_Width 2 to 50
        Set Header_Label 3 to "Title"
        Set Form_Width 3 to 241
        Set Location to 139 14
        Set peAnchors to anAll
        Set Select_Mode to No_Select
        Send SetHighlightRowState of oGridFunctions Self
        On_Key kEnter Send LaunchBrowser
        
        Procedure LaunchBrowser
            Integer iBase iArticleId hFti
            Get phFti to hFti
            If (item_count(Self)) Begin
                Get BaseItem of oGridFunctions Self to iBase
                Get Value iBase to iArticleId
                Send ArticleDisplay of hFti iArticleId
            End
        End_Procedure
        
        Procedure Mouse_Click Integer iWindowNumber Integer iPosition
            Send LaunchBrowser
        End_Procedure
        
        Procedure fill_list tFtiArticle[] aArticles
            Integer iMax iItem hFti
            Get phFti to hFti
            
            Send Delete_Data
            Set Dynamic_Update_State to False
            Send Cursor_Wait of Cursor_Control
            Move (SizeOfArray(aArticles)-1) to iMax
            If (iMax>500) Begin
                Send Info_Box "Result set has been truncated to 500." "Info"
                Move 500 to iMax
            End
            For iItem from 0 to iMax
                Send Add_Item MSG_NONE aArticles[iItem].iId
                Send Add_Item MSG_NONE aArticles[iItem].dtUpdated
                Send Add_Item MSG_NONE aArticles[iItem].iPopularity
                Send Add_Item MSG_NONE (ArticleTitle(hFti,aArticles[iItem].iId))
            Loop
            Send Cursor_Ready of Cursor_Control
            Send SetEntryState of oGridFunctions Self False
            Set Dynamic_Update_State to True
        End_Procedure
    End_Object
    
    Procedure PopupSearch Integer hFti
        tFtiArticle[] aArticles
        Set value of oResultForm to ""
        Send delete_data of oListCrit
        Send delete_data of oListArticles
        Set value of oHeader to (psName(hFti)+" ("+String(ArticleRecordsCount(hFti))+" articles)")
        Set paArticles to aArticles
        Set phFti to hFti
        Send popup
    End_Procedure

    Procedure DoSearch Integer iOperation
        tFtiInput stInput
        tFtiStatus stStatus
        tFtiArticle[] aArticles
        Integer hFti
        String sValue
        
        If (iOperation=FTISM_NEW) Move (ResizeArray(aArticles,0)) to aArticles
        Else Get paArticles to aArticles
        
        Move iOperation to stInput.iOperation
        Move 0 to stInput.iMaxSeconds
        Get Value of oSearchForm to stInput.sSearchString
        Get Value of oDateMin to stInput.dDateMin
        Get Value of oDateMax to stInput.dDateMax
        Get Value of oOrdering to sValue
        Get Combo_Item_Matching of oOrdering sValue to stInput.iSortOrder
        Move True to stInput.bForceDateAndPop
                                                            
        Get phFti to hFti
        Get Search of hFti stInput (&aArticles) to stStatus
        
        Set paArticles to aArticles
        
        Send Display of oResultForm stStatus
        Send Fill_List of oListArticles aArticles
        
    End_Procedure
    
End_Object
