Use Windows.pkg
Use DFClient.pkg
//Use Demo\HtmlParserObj.vw
//Use Demo\ParsedHtmlDocuments.vw
Use UrlFunctions.pkg
Use Win\GridFunctions.pkg

Activate_View Activate_oUrlObjTest for oUrlObjTest
Object oUrlObjTest is a View

    Set Border_Style to Border_Normal
    Set Size to 265 371
    Set piMinSize to 265 371
    Set Location to 5 5
    Set label to "URL compose/decompose (UrlFunctions.pkg)"
    On_Key kCancel Send close_panel

    Object oUrl is a ComboForm
        Set Size to 14 257
        Set Location to 20 25
        Set Label to "URL:"
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Top
        On_Key KEnter Send DoParse
        Set value to "http://sture:horse@www.sture.dk:8080/lk;html"
        Procedure Combo_Fill_List
            Send Combo_Add_Item "http://sture:horse@www.sture.dk:8080/lk;html"
            Send Combo_Add_Item "www.dataaccess.com/kbasepublic/KBPrint.asp?ArticleID=2222"
            Send Combo_Add_Item "http://sparhell.no/vdfblog/?p=39"
            Send Combo_Add_Item "www.front-it.com"
            Send Combo_Add_Item "www.google.com"
        End_Procedure
        Send Combo_Fill_List
        
   End_Object

    Object oButton is a Button
        Set Location to 20 293
        Set Label to "Parse URL"
        Procedure OnClick
            Send DoParse
        End_Procedure
    End_Object
    
    Object oTextBox is a TextBox
        Set Size to 50 14
        Set Location to 48 24
        Set Label to "Decomposed URL:"
    End_Object

    Object oGrid is a GridSture
        Set Location to 61 24
    
        Set Size to 84 319
    
        Set Line_Width to 2 0
    
        Set Form_Width 0 to 52
        Set Header_Label 0 to "Component"
    
        Set Form_Width 1 to 253
        Set Header_Label 1 to "Value"

        Procedure FillGrid tUrl sUrl
            Send delete_data
            Send add_item MSG_NONE "Protocol"
            Send add_item MSG_NONE sUrl.sProtocol
            Send add_item MSG_NONE "User"
            Send add_item MSG_NONE sUrl.sUser
            Send add_item MSG_NONE "Password"
            Send add_item MSG_NONE sUrl.sPassword
            Send add_item MSG_NONE "Host"
            Send add_item MSG_NONE sUrl.sHost
            Send add_item MSG_NONE "Port"
            Send add_item MSG_NONE sUrl.sPort
            Send add_item MSG_NONE "Path"
            Send add_item MSG_NONE sUrl.sPath
            Send add_item MSG_NONE "Type"
            Send add_item MSG_NONE sUrl.sType
        End_Procedure
    
    End_Object

    Object oRecomposedUrl is a Form
        Set Size to 14 318
        Set Location to 162 25
        Set Label to "Re-composed URL:"
        Set Label_Justification_Mode to JMode_Top
        Set Label_Col_Offset to 0
    End_Object

    Object oUrlAsPath is a Form
        Set Size to 14 318
        Set Location to 198 25
        Set Label to "URL as path-name:  (to be used as subfolder path if storing the content of the URL)"
        Set Label_Justification_Mode to JMode_Top
        Set Label_Col_Offset to 0
    End_Object

    Object oRecomposedUrl2 is a Form
        Set Size to 14 318
        Set Location to 241 25
        Set Label to "URL recomposed from path-name:"
        Set Label_Justification_Mode to JMode_Top
        Set Label_Col_Offset to 0
    End_Object

//    Object oRunTransferTest is a Button
//        Set Size to 14 104
//        Set Location to 236 239
//        Set Label to "Go to HTML parser"
//    
//        // fires when the button is clicked
//        Procedure OnClick
//            tUrl sUrl 
//            String sValue
//            Send DoParse
//            Get value of oUrl to sValue
//            Get Decompose of oUrlFunctions sValue to sUrl
//            Send Activate_oTestStandardHttpRequest_URL sUrl
//        End_Procedure
//    
//    End_Object

    Object oLaunchBrowser is a Button
        Set Size to 14 69
        Set Location to 36 274
        Set Label to "Launch browser"
    
        // fires when the button is clicked
        Procedure OnClick
            String sValue
            Send DoParse
            Get value of oUrl to sValue
            Send ShellExecuteDocument of oFileFunctions sValue
        End_Procedure
    
    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 10 50
        Set Location to 213 33
        Set Label to 'Note that protocol, user name, password, type and port are not represented in the URL as pathname'
        Set peAnchors to anBottomLeft
    End_Object

//    Object oScraperBtn is a Button
//        Set Size to 14 62
//        Set Location to 236 169
//        Set Label to "HTML Scraper"
//        
//        Object oScraper is a cHtmlScraper
//        End_Object
//    
//        Procedure OnClick
//            String sUrl
//            tHtmlDocument stDoc
//            Boolean bOk
//            Send DoParse
//            Get value of oUrl to sUrl
//            Get FetchPageSimple of oScraper sUrl (&stDoc) to bOk
//            If bOk begin
//                Send Add_Document of oParsedHtmlDocuments stDoc
//                Send Activate_oParsedHtmlDocuments
//            End
//            Else Send Info_Box "Document could not be fetched" "Http request error"
//        End_Procedure
//    
//    End_Object
//
    Procedure DoParse
        String sValue
        tUrl sUrl 
        Get value of oUrl to sValue
        Get Decompose of oUrlFunctions sValue to sUrl
        Send FillGrid of oGrid sUrl
        Get Compose of oUrlFunctions sUrl to sValue
        Set Value of oRecomposedUrl to sValue
        Get UrlToFileName of oUrlFunctions sValue to sValue
        Set Value of oUrlAsPath to sValue
        Get FileNameToUrl of oUrlFunctions sValue to sValue
        Set Value of oRecomposedUrl2 to sValue
    End_Procedure
End_Object
