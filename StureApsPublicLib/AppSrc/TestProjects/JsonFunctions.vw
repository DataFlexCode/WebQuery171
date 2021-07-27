// This view demonstrates use of the JsonObj object.


Use Windows.pkg
Use DFClient.pkg
Use cTextEdit.pkg
Use DfTreeVw.pkg

Use JsonFunctions.pkg
Use FileFunctions.pkg
Use DateFunctions.pkg

/JsonExample1 // Sample JSON
{"menu": {
  "id": "file",
  "value": "File",
  "popup": {
    "menuitem": [
      {"value": "New", "onclick": "CreateNewDoc()"},
      {"value": "Open", "onclick": "OpenDoc()"},
      {"value": "Close", "onclick": "CloseDoc()"}
    ]
  }
}}
/JsonExample2
{"widget": {
    "debug": "on",
    "window": {
        "title": "Sample Konfabulator Widget", "name": "main_window", "width": 500, "height": 500
    },    "image": { 
        "src": "Images/Sun.png",
        "name": "sun1", "hOffset": 250, "vOffset": 250, "alignment": "center"
    },    "text": {
        "data": "Click Here",
        "size": 36,
        "style": "bold", "name": "text1", "hOffset": 250, "vOffset": 100, "alignment": "center",
        "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;"
    }
}}
/JsonExample3
{"web-app": {
  "servlet": [   
    {
      "servlet-name": "cofaxCDS",
      "servlet-class": "org.cofax.cds.CDSServlet",
      "init-param": {
        "configGlossary:installationAt": "Philadelphia, PA",
        "configGlossary:adminEmail": "ksm@pobox.com",
        "configGlossary:poweredBy": "Cofax",
        "configGlossary:poweredByIcon": "/images/cofax.gif",
        "configGlossary:staticPath": "/content/static",
        "templateProcessorClass": "org.cofax.WysiwygTemplate",
        "templateLoaderClass": "org.cofax.FilesTemplateLoader",
        "templatePath": "templates",
        "templateOverridePath": "",
        "defaultListTemplate": "listTemplate.htm",
        "defaultFileTemplate": "articleTemplate.htm",
        "useJSP": false,
        "jspListTemplate": "listTemplate.jsp",
        "jspFileTemplate": "articleTemplate.jsp",
        "cachePackageTagsTrack": 200,
        "cachePackageTagsStore": 200,
        "cachePackageTagsRefresh": 60,
        "cacheTemplatesTrack": 100,
        "cacheTemplatesStore": 50,
        "cacheTemplatesRefresh": 15,
        "cachePagesTrack": 200,
        "cachePagesStore": 100,
        "cachePagesRefresh": 10,
        "cachePagesDirtyRead": 10,
        "searchEngineListTemplate": "forSearchEnginesList.htm",
        "searchEngineFileTemplate": "forSearchEngines.htm",
        "searchEngineRobotsDb": "WEB-INF/robots.db",
        "useDataStore": true,
        "dataStoreClass": "org.cofax.SqlDataStore",
        "redirectionClass": "org.cofax.SqlRedirection",
        "dataStoreName": "cofax",
        "dataStoreDriver": "com.microsoft.jdbc.sqlserver.SQLServerDriver",
        "dataStoreUrl": "jdbc:microsoft:sqlserver://LOCALHOST:1433;DatabaseName=goon",
        "dataStoreUser": "sa",
        "dataStorePassword": "dataStoreTestQuery",
        "dataStoreTestQuery": "SET NOCOUNT ON;select test='test';",
        "dataStoreLogFile": "/usr/local/tomcat/logs/datastore.log",
        "dataStoreInitConns": 10,
        "dataStoreMaxConns": 100,
        "dataStoreConnUsageLimit": 100,
        "dataStoreLogLevel": "debug",
        "maxUrlLength": 500}},
    {
      "servlet-name": "cofaxEmail",
      "servlet-class": "org.cofax.cds.EmailServlet",
      "init-param": {
      "mailHost": "mail1",
      "mailHostOverride": "mail2"}},
    {
      "servlet-name": "cofaxAdmin",
      "servlet-class": "org.cofax.cds.AdminServlet"},
 
    {
      "servlet-name": "fileServlet",
      "servlet-class": "org.cofax.cds.FileServlet"},
    {
      "servlet-name": "cofaxTools",
      "servlet-class": "org.cofax.cms.CofaxToolsServlet",
      "init-param": {
        "templatePath": "toolstemplates/",
        "log": 1,
        "logLocation": "/usr/local/tomcat/logs/CofaxTools.log",
        "logMaxSize": "",
        "dataLog": 1,
        "dataLogLocation": "/usr/local/tomcat/logs/dataLog.log",
        "dataLogMaxSize": "",
        "removePageCache": "/content/admin/remove?cache=pages&id=",
        "removeTemplateCache": "/content/admin/remove?cache=templates&id=",
        "fileTransferFolder": "/usr/local/tomcat/webapps/content/fileTransferFolder",
        "lookInContext": 1,
        "adminGroupID": 4,
        "betaServer": true}}],
  "servlet-mapping": {
    "cofaxCDS": "/",
    "cofaxEmail": "/cofaxutil/aemail/*",
    "cofaxAdmin": "/admin/*",
    "fileServlet": "/static/*",
    "cofaxTools": "/tools/*"},
 
  "taglib": {
    "taglib-uri": "cofax.tld",
    "taglib-location": "/WEB-INF/tlds/cofax.tld"}}}
/JsonExample4
{"menu": {
    "header": "SVG Viewer",
    "items": [
        {"id": "Open"},
        {"id": "OpenNew", "label": "Open New"},
        null,
        {"id": "ZoomIn", "label": "Zoom In"},
        {"id": "ZoomOut", "label": "Zoom Out"},
        {"id": "OriginalView", "label": "Original View"},
        null,
        {"id": "Quality"},
        {"id": "Pause"},
        {"id": "Mute"},
        null,
        {"id": "Find", "label": "Find..."},
        {"id": "FindAgain", "label": "Find Again"},
        {"id": "Copy"},
        {"id": "CopyAgain", "label": "Copy Again"},
        {"id": "CopySVG", "label": "Copy SVG"},
        {"id": "ViewSVG", "label": "View SVG"},
        {"id": "ViewSource", "label": "View Source"},
        {"id": "SaveAs", "label": "Save As"},
        null,
        {"id": "Help"},
        {"id": "About", "label": "About Adobe CVG Viewer..."}
    ]
}}
/*

Activate_View Activate_oJsonFunctionsView for oJsonFunctionsView
Object oJsonFunctionsView is a View
    
    Set Border_Style to Border_Thick
    Set Size to 251 432
    Set Location to 8 8
    Set Label to "Parse JSON string into tJsonNode and back (JsonFunctions.pkg)"
    Set piMinSize to 273 460
    Set Maximize_Icon to True
    On_Key kCancel Send close_panel

    Property tJsonNode pstCurrentDoc
    
    Object oTabDialog is a TabDialog
        Set Size to 221 415
        Set Location to 5 8
        Set peAnchors to anAll

        Object oTabPage1 is a TabPage
            Set Label to "Input"

            Object oSampleSelector is a ComboForm
                Set Size to 14 143
                Set Location to 6 249
                Set Label to "Type your own JSON test document or select one of the pre-defined:"
                Set Label_Col_Offset to 0
                Set Entry_State to False
                Set Combo_Sort_State to False
                Set Label_Justification_Mode to JMode_Right
            
                Procedure Combo_Fill_List
                    Send Combo_Add_Item ""
                    Send Combo_Add_Item "Simple 1"
                    Send Combo_Add_Item "Simple 2"
                    Send Combo_Add_Item "Large 3"
                    Send Combo_Add_Item "Simple 4"
                    Send Combo_Add_Item "Manually built 5"
                    Send Combo_Add_Item "Manually built 6"
                    Send Combo_Add_Item "Manually built 7"
                    Send Combo_Add_Item "Read ini file 8"
                End_Procedure
                
                // A JSON in-memory object is held in a variable of type tJsonNode. The tJsonNode is defined
                // this way (recursively):
                //
                //      Struct tJsonNode
                //          Integer iType           // JNT_OBJECT JNT_ARRAY JNT_STRING JNT_NUMBER JNT_TRUE JNT_FALSE JNT_NULL
                //          String  sName           // Only if parent node type is JNT_OBJECT
                //          String  sValue          // Only filled in if iType is not JNT_OBJECT or JNT_ARRAY
                //          tJsonNode[] aChildNodes // Only used if iType is JNT_OBJECT or JNT_ARRAY
                //      End_Struct
                //
                // In order to build such a object you should familiarize yourself with these methods
                // of the JsonObj object:
                //
                //      procedure AppendChildValue
                //      procedure CallBackAppendedNode
                //      procedure AppendChildValueAtCursor
                //
                // Here comes three examples all building the same JSON value that you see here:
                //
                //     {"menu": {
                //        "id": "file",
                //        "value": "File",
                //           "popup": {
                //            "menuitem": [
                //               {"value": "New", "onclick": "CreateNewDoc()"},
                //               {"value": "Open", "onclick": "OpenDoc()"},
                //               {"value": "Close", "onclick": "CloseDoc()"}
                //            ]
                //         }
                //     }}
                //
                //
            
                // Method 1: Building a JSON object using the AppendChildValue procedure only. I don't 
                // know why you'd want to do it like this. But you can.
                Procedure Method1
                    String sJson
                    tJsonNode stDoc
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc) "menu" ""
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0]) "id" "file"
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0]) "value" "File:"
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc.aChildNodes[0]) "popup" ""
                    Send AppendChildValue of oJsonFunctions JNT_ARRAY  (&stDoc.aChildNodes[0].aChildNodes[2]) "menuitem" ""
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0]) "" ""
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[0]) "value" "New"
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[0]) "onclick" "CreateNewDoc()"
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0]) "" ""
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[1]) "value" "Open"
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[1]) "onclick" "OpenDoc()"
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0]) "" ""
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[2]) "value" "Close"
                    Send AppendChildValue of oJsonFunctions JNT_STRING (&stDoc.aChildNodes[0].aChildNodes[2].aChildNodes[0].aChildNodes[2]) "onclick" "CloseDoc()"
                    
                    Send DocToString of oJsonFunctions stDoc (&sJson) True
                    Send DisplayTextValue sJson
                End_Procedure
                
                    Procedure Method2Level5_1 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "value" "New"
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "onclick" "CreateNewDoc()"
                    End_Procedure

                    Procedure Method2Level5_2 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "value" "Open"
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "onclick" "OpenDoc()"
                    End_Procedure

                    Procedure Method2Level5_3 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "value" "Close"
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "onclick" "CloseDoc()"
                    End_Procedure

                    Procedure Method2Level4 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stNode) "" ""
                        Send CallBackAppendedNode of oJsonFunctions (&stNode) MSG_Method2Level5_1 Self
                        Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stNode) "" ""
                        Send CallBackAppendedNode of oJsonFunctions (&stNode) MSG_Method2Level5_2 Self
                        Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stNode) "" ""
                        Send CallBackAppendedNode of oJsonFunctions (&stNode) MSG_Method2Level5_3 Self
                    End_Procedure
                
                    Procedure Method2Level3 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_ARRAY  (&stNode) "menuitem" ""
                        Send CallBackAppendedNode of oJsonFunctions (&stNode) MSG_Method2Level4 Self
                    End_Procedure
                    
                    Procedure Method2Level2 tJsonNode ByRef stNode
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "id" "file"
                        Send AppendChildValue of oJsonFunctions JNT_STRING (&stNode) "value" "File:"
                        Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stNode) "popup" ""
                        Send CallBackAppendedNode of oJsonFunctions (&stNode) MSG_Method2Level3 Self
                    End_Procedure
                
                // Method 2: Building a JSON object using the AppendChildValue and CallBackAppendedNode procedures. A
                // callback function is used to build each level of the JSON object. It's very good for letting
                // different procedures handle their own parts of the document. And in a most efficient way too.
                Procedure Method2
                    String sJson
                    tJsonNode stDoc
                    Send AppendChildValue of oJsonFunctions JNT_OBJECT (&stDoc) "menu" ""
                    Send CallBackAppendedNode of oJsonFunctions (&stDoc) MSG_Method2Level2 Self
                    
                    Send DocToString of oJsonFunctions stDoc (&sJson) True
                    Send DisplayTextValue sJson
                End_Procedure
                
                // Method 3: Building a JSON object using a cursor. This is good when you want to add data in
                // multiple levels handled by one procedure. Methods 2 and 3 may be used in any desired mix (as
                // may method 1, but never mind that).
                Procedure Method3
                    String sJson
                    tJsonNode stDoc
                    tJsonCursor stCursor
                    
                    // The cursor is implicitly updated when adding JNT_OBJECT or JNT_ARRAY type nodes.
                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_OBJECT (&stDoc) "menu" ""
                        Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "id" "file"
                        Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "value" "File:"
                        Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_OBJECT (&stDoc) "popup" ""
                            Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_ARRAY  (&stDoc) "menuitem" ""
                                Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_OBJECT (&stDoc) "" ""
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "value" "New"
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "onclick" "CreateNewDoc()"
                                    Send PopCursor of oJsonFunctions (&stCursor) // Pop cursor one level
                                Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_OBJECT (&stDoc) "" ""
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "value" "Open"
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "onclick" "OpenDoc()"
                                    Send PopCursor of oJsonFunctions (&stCursor)
                                Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_OBJECT (&stDoc) "" ""
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "value" "Close"
                                    Send AppendChildValueAtCursor of oJsonFunctions (&stCursor) JNT_STRING (&stDoc) "onclick" "CloseDoc()"
                                    Send PopCursor of oJsonFunctions (&stCursor)
                    
                    Send DocToString of oJsonFunctions stDoc (&sJson) True
                    Send DisplayTextValue sJson
                End_Procedure
                
                Procedure ReadIniFile
                    String sJson sFileName
                    Boolean bSuccess
                    tJsonNode stDoc
                    
                    Get BrowseFileOpen of oFileFunctions "Select INI file" "c:\" "*.ini|*.ini" to sFileName
                    If (sFileName<>"") Begin
                        Get IniFileToDoc of oJsonFunctions sFileName (&stDoc) to bSuccess
                        If (bSuccess) Begin
                            Send DocToString of oJsonFunctions stDoc (&sJson) True
                            Send DisplayTextValue sJson
                        End
                        Else Send Info_Box ("Could not parse "+sFileName) "Sort of an error"
                    End
                End_Procedure
                
                Procedure OnChange
                    String sValue 
                    
                    Get Value to sValue // the current selected item
                    Move (Right(sValue,1)) to sValue
                    If (sValue="1") Send DisplayImage JsonExample1.N // Get sample JSON from image
                    If (sValue="2") Send DisplayImage JsonExample2.N
                    If (sValue="3") Send DisplayImage JsonExample3.N
                    If (sValue="4") Send DisplayImage JsonExample4.N
                    
                    If (sValue="5") Send Method1
                    If (sValue="6") Send Method2
                    If (sValue="7") Send Method3
                    If (sValue="8") Send ReadIniFile
                  End_Procedure
            End_Object
            
            Object oInputText is a cTextEdit
                Set Size to 137 383
                Set Location to 24 11
                Set peAnchors to anAll
            End_Object
            
            Object oBigButton is a Button
                Set Size to 14 210
                Set Location to 166 99
                Set Label to "Parse string (and fill in the other tabs)"
                Set peAnchors to anBottomLeftRight
            
                // fires when the button is clicked
                Procedure OnClick
                    tSystemTimeMS strMS
                    Number nMiliseconds
                    Get SystemTimeMilliSeconds of oDateFunctions to strMS
                    Send ParseDocument
                    Get SystemTimeMilliSecondsElapsed of oDateFunctions strMS to nMiliseconds
                    Send Info_Box ("Everything done in "+String(nMiliseconds)+"ms") "Done"
                End_Procedure
            End_Object
            
            Procedure DisplayImage Integer iImg
                Integer iChannel
                String sTextValue sLine
                Boolean bSeqEof
                
                Move "" to sTextValue
                
                Get Seq_New_Channel to iChannel
                Direct_Input channel iChannel ("image: "+String(iImg))
                Move (SeqEof) to bSeqEof
                While (not(bSeqEof))
                    Readln channel iChannel sLine
                    Move (SeqEol) to bSeqEof
                    If (not(bSeqEof)) Begin
                        Move (sTextValue+sLine+character(13)) to sTextValue
                    End
                Loop
                Send Seq_Release_Channel iChannel
                Set value of oInputText to sTextValue
            End_Procedure
            
            Procedure DisplayTextValue String sTextValue
                Set value of oInputText to sTextValue                
            End_Procedure

        End_Object

        Object oTabPage2 is a TabPage
            Set Label to "JSON TreeView"

            Object oTreeView is a TreeView
                Set Size to 147 390
                Set Location to 19 9
                Set peAnchors to anAll
                
                Procedure AddBranch Handle hParent tJsonNode[] aNodes
                    Integer iIndex iMax iType
                    Handle hChild
                    String sLabel
                    Move (SizeOfArray(aNodes)-1) to iMax
                    For iIndex from 0 to iMax
                        If (aNodes[iIndex].sName<>"") Move (aNodes[iIndex].sName+": ") to sLabel
                        Else Move "" to sLabel
                        Move aNodes[iIndex].iType to iType
                        If (iType=JNT_OBJECT) Move (sLabel*"(Object)") to sLabel
                        If (iType=JNT_ARRAY)  Move (sLabel*"(Array)") to sLabel
                        If (iType=JNT_STRING) Move (sLabel*aNodes[iIndex].sValue*"(String)") to sLabel
                        If (iType=JNT_NUMBER) Move (sLabel*aNodes[iIndex].sValue*"(Number)") to sLabel
                        If (iType=JNT_TRUE)   Move (sLabel*"true (Bool)") to sLabel
                        If (iType=JNT_FALSE)  Move (sLabel*"false (Bool)") to sLabel
                        If (iType=JNT_NULL)   Move (sLabel*"null") to sLabel
                        
                        Get AddTreeItem sLabel hParent 0 0 0 to hChild
                        
                        If (iType=JNT_OBJECT or iType=JNT_ARRAY) Send AddBranch hChild aNodes[iIndex].aChildNodes
                    Loop
                End_Procedure
                
                Procedure OnCreateTree
                    tJsonNode stDoc
                    Handle hRoot
                    
                    Send DoDeleteItem 0
                    Get pstCurrentDoc to stDoc
                    
                    Get AddTreeItem "(Object)" 0 0 0 0 to hRoot
                    Send AddBranch hRoot stDoc.aChildNodes
                    
                    Send DoExpandAll 0
                    Set CurrentTreeItem to (RootItem(Self))            
                End_Procedure
                
            End_Object
            Procedure FillTreeView
                Send OnCreateTree of oTreeView
            End_Procedure

            Object oPathSearch is a Button
                Set Location to 172 338
                Set Label to "Search"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send DoSearch
                End_Procedure
            End_Object
            Object oPathValue is a Form
                Set Size to 14 184
                Set Location to 173 65
                Set Label to "Select objects:"
                Set Label_Col_Offset to 50
                Set peAnchors to anBottomLeftRight
                On_Key kEnter Send DoSearch
            End_Object
            Object oTextBox1 is a TextBox
                Set Size to 10 32
                Set Location to 188 65
                Set Label to 'Wildcards * and ? are allowed. Use / as a separator.'
                Set peAnchors to anBottomRight
            End_Object
            Object oTextBox2 is a TextBox
                Set Size to 10 32
                Set Location to 187 279
                Set Label to '-1 one means no limit'
                Set peAnchors to anBottomRight
            End_Object
            Object oMaxRecursion is a ComboForm
                Set Size to 14 38
                Set Location to 173 292
                Set Label to "Scan depth:"
                Set Label_Col_Offset to 0
                Set peAnchors to anBottomRight
                Set Combo_Sort_State to False
                Set Entry_State to False
                Set Label_Justification_Mode to JMode_Right
                
                Procedure Combo_Fill_List
                    // Fill the combo list with Send Combo_Add_Item
                    Send Combo_Add_Item "-1"
                    Send Combo_Add_Item "0"
                    Send Combo_Add_Item "1"
                    Send Combo_Add_Item "2"
                    Send Combo_Add_Item "3"
                    Send Combo_Add_Item "4"
                    Send Combo_Add_Item "5"
                    Send Combo_Add_Item "6"
                    Send Combo_Add_Item "7"
                    Send Combo_Add_Item "8"
                    Send Combo_Add_Item "9"
                    Send Combo_Add_Item "10"
                    Set Value to "0"                    
                End_Procedure
            End_Object

            Procedure DoSearch
                Integer iMaxRecursion iMax iIndex
                String sPath
                tSystemTimeMS strStart strStop
                tJsonNode stDoc stNode
                tJsonCursor[] aCursors
                Get value of oPathValue to sPath
                Get value of oMaxRecursion to iMaxRecursion
                Get pstCurrentDoc to stDoc

                Showln ("Result searching '"+sPath+"', depth "+String(iMaxRecursion))

                Get SystemTimeMilliSeconds of oDateFunctions to strStart
                Get NodeCollection of oJsonFunctions stDoc sPath iMaxRecursion to aCursors
                Get SystemTimeMilliSeconds of oDateFunctions to strStop
                Move (SizeOfArray(aCursors)-1) to iMax

                Showln ("completed in "+String(SystemTimeMilliSecondsElapsed(oDateFunctions,strStart,strStop))+"ms")
                
                For iIndex from 0 to iMax
                    Showln "Value found at " (CursorToString(oJsonFunctions,aCursors[iIndex],stDoc)) ":"
                    Get NodeAtCursor of oJsonFunctions stDoc aCursors[iIndex] to stNode
                    If (stNode.iType=JNT_ARRAY) Begin
                        Showln "    [array]"
                    End
                    Else If (stNode.iType=JNT_OBJECT) Begin
                        Showln "    {object}" 
                    End
                    Else Begin
                        Showln "    " stNode.sValue
                    End
                    
                Loop
                Showln "*** END OF LIST ***"
            End_Procedure
        End_Object
        
        Object oTabPage3 is a TabPage
            Set Label to "String output (formatted)"
            Object oOutputText is a cTextEdit
                Set Size to 193 383
                Set Location to 7 12
                Set peAnchors to anAll
            End_Object
            
        End_Object
        
        Object oTabPage4 is a TabPage
            Set Label to "String output (un-formatted)"
            Object oOutputTextRaw is a cTextEdit
                Set Size to 194 383
                Set Location to 6 13
                Set peAnchors to anAll
            End_Object
        End_Object
    End_Object
    
    Procedure ParseDocument
        Boolean bSuccess
        String sValue
        tJsonNode stDoc
        Get value of oInputText to sValue
        // Parse input string
        Get StringToDoc of oJsonFunctions (&sValue) (&stDoc) to bSuccess
        
        Set pstCurrentDoc to stDoc
        Send FillTreeView of oTabPage2
        
        // Doc to string 1
        Send DocToString of oJsonFunctions stDoc (&sValue) True // True => formatted
        Set value of oOutputText to sValue
        
        // Doc to string 2
        Send DocToString of oJsonFunctions stDoc (&sValue) False // False => unformatted
        Set value of oOutputTextRaw to sValue
        
    End_Procedure

End_Object
