Use Win\cComWebBrowserSture.pkg
Use XmlBuilder.pkg
Use RgbFunctions.pkg

Use Windows.pkg
Use FileFunctions.pkg
Use DFPostMessage.pkg

Activate_View Activate_oWebBrowserTestView for oWebBrowserTestView
Object oWebBrowserTestView is a dbView

    Set Border_Style to Border_Thick
    Set Size to 264 473
    Set Location to 2 2
    Set Maximize_Icon to True
    Set Label to "Win\cComWebBrowserSture.pkg"

    Object oTabs is a TabDialog
        Set Size to 254 463
        Set Location to 5 5
        Set peAnchors to anAll
            
        Property String psCurrentImagePath

        Object oTab1 is a TabPage
            Set Label to "First test"
            
            Object oBrowser is a cComWebBrowserSture
                Set Size to 225 312
                Set Location to 9 138
                Set peAnchors to anAll
//                Set Border_Style to Border_None
                
                Function BodyColor Returns String
                    Integer iColor
                    String sColor
                    Move (GetSysColor(COLOR_BTNFACE)) to iColor // implied color of the container
                    Get ToHTML of oRgbFunctions iColor to sColor
                    Function_Return sColor
                End_Function
                    
                Procedure InsertDocument
                    Send BeginDocument
                    Send AddOpenElement "html"
                        Send AddOpenElement "head"
                            Send AddElement "title" "i'm the title"
                            Send AddElement "script" ""
                                Send AddAttribute "id" "myscript"
                            // Remove vertical scrollbar when not needed and remove also the border around the browser component itself:
                            Send AddElement "style" ("html, body {overflow:auto;border-style:none;border-width:0px;border:none;outline:none;background-color:"+BodyColor(Self)+";}")
                        Send CloseElement // head
                        Send AddOpenElement "body"
                                Send AddAttribute "id" "mybody"
                            Send AddElement "p" "hello world" 
                                Send AddAttribute "id" "myp"
                            Send AddElement "input" ""
                                Send AddAttribute "value" "it's me"
                                Send AddAttribute "id" "myinput"
                                Send AddAttribute "style" "display:block"
                            Send AddElement "input" ""
                                Send AddAttribute "checked" "true"
                                Send AddAttribute "type" "checkbox"
                                Send AddAttribute "id" "mycheckbox"
                                Send AddAttribute "style" "display:block"
                            Send AddElement "button" "My button"
                                Send AddAttribute "type" "button"
                                Send AddAttribute "style" "display:block;margin-top:20px"
                                Send AddAttribute "id" "mybutton"
                            Send AddElement "div" "This is a div element"
                                Send AddAttribute "id" "mydiv"
                                Send AddAttribute "style" "margin-top:20px;background-color:#d0e4fe;"
                                Send AddAttribute "class" "class1 class2"
                                Send AddAttribute "data-hugo" "lhjg‘kgj‘kgj‘kjg‘kjg"
        //                        Send AddAttribute "onclick" "alert('CLICK');"
                        Send CloseElement // body
                    Send CloseElement // html
                    Send EndDocument
                End_Procedure
                
                Procedure OnCreate
                    Forward Send OnCreate
                    Send DFPostMessage (RefProc(InsertDocument)) Self
                End_Procedure
            
            End_Object
        
            Object oButton1 is a Button
                Set Size to 14 123
                Set Location to 9 5
                Set Label to 'Reset document'
            
                Procedure OnClick
                    Send InsertDocument of oBrowser
                End_Procedure
            
            End_Object
        
            Object oButton2 is a Button
                Set Size to 14 123
                Set Location to 27 5
                Set Label to 'Get value of the input element'
            
                Procedure OnClick
                    Handle hMyInput
                    String sValue
                    Get ElementHandleByID of oBrowser "myinput" to hMyInput
                    If (hMyInput) Begin
                         Get ComGetAttribute of hMyInput "value" 2 to sValue
                         Send Info_Box ("DataFlex says: "+sValue)
                         Send ComSetAttribute of hMyInput "value" (Uppercase(sValue)) 2 
                         
                         Send DestroyElementHandle of oBrowser hMyInput
                    End
                    Else Begin
                        Send Info_Box "Not found"
                    End
                End_Procedure
            
            End_Object
        
            Object oButton3 is a Button
                Set Size to 14 123
                Set Location to 45 5
                Set Label to 'Execute JavaScript in browser'
            
                Procedure OnClick
                    Handle hMyScript
                    String sValue
                    Get ElementHandleByID of oBrowser "myscript" to hMyScript
                    If (hMyScript) Begin
                        Move "alert('javascript says hello');" to sValue
                        Send ComSetAttribute of hMyScript "text" sValue 2
                        Send DestroyElementHandle of oBrowser hMyScript
                    End
                    Else Begin
                        Send Info_Box "Not found"
                    End
                End_Procedure
            
            End_Object
            
            Object oButton4 is a Button
                Set Size to 14 123
                Set Location to 63 5
                Set Label to 'Add some event listeners'
                
                Procedure OnButtonClick Integer iEventID Handle hElement
                    String sElemendID
                    Get ComId of hElement to sElemendID
                    Showln sElemendID ": click" 
                End_Procedure
                
                Procedure OnMouseOver Integer iEventID  Integer hElement
                    String sValue sDataHugo sElemendID
                    Get ComId of hElement to sElemendID
                    Get ComClassName of hElement "class" to sValue
                    Get ComGetAttribute of hElement "data-hugo" 2 to sDataHugo
                    Showln sElemendID ": mouseover (class: " sValue ") " sDataHugo
                End_Procedure
                
                Procedure OnDivBeforeCopy Integer iEventID Handle hElement
                    String sElemendID
                    Get ComId of hElement to sElemendID
                    Showln sElemendID ": beforecopy" 
                End_Procedure
            
                Procedure OnClick
                    Handle hButton
                    String sValue
                    Get ElementHandleByID of oBrowser "mybutton" to hButton
                    If (hButton) Begin
                        Send AddEventListener of oBrowser hButton EVENTID_OnClick (RefProc(OnButtonClick)) Self False
                        Send AddEventListener of oBrowser hButton EVENTID_OnMouseOver (RefProc(OnMouseOver)) Self False
                        Send Info_Box "Now click the button in the browser and watch the 'Output Window'"
                    End
                    Else Begin
                        Send Info_Box "Button element not found"
                    End
                    
                    Get ElementHandleByID of oBrowser "mydiv" to hButton
                    If (hButton) Begin
                        Send AddEventListener of oBrowser hButton EVENTID_OnBeforecopy (RefProc(OnDivBeforeCopy)) Self False
                        Send AddEventListener of oBrowser hButton EVENTID_OnMouseOver (RefProc(OnMouseOver)) Self False
                    End
                    
                End_Procedure
            End_Object
            
            Object oButton5 is a Button
                Set Size to 14 123
                Set Location to 81 5
                Set Label to 'Add all event listeners'
                
                Property Handle phLastElement 0
                Property Integer piLastEvenetID -1
                Property Boolean pbDoingPlusses False
                
                Procedure UniversalEventHandler Integer iEventID Handle hElement
                    String sElementID sEvent
                    
                    If (hElement=phLastElement(Self) and iEventID=piLastEvenetID(Self)) Begin
                        If (not(pbDoingPlusses(Self))) Begin
                            Showln ""
                        End
                        Show "+"
                        Set pbDoingPlusses to True
                    End
                    Else Begin
                        Showln ""
                        Set phLastElement to hElement
                        Set piLastEvenetID to iEventID
                        Get ComId of hElement to sElementID
                        Get EventIDtoString of oBrowser iEventID to sEvent
                        Show sElementID ": on" sEvent
                        Set pbDoingPlusses to False
                    End
                End_Procedure
                
                Procedure AddAllListeners String sElementID
                    Integer iEventID
                    Handle hElement
                    Get ElementHandleByID of oBrowser sElementID to hElement
                    For iEventID from 0 to (EVENTID_MAX-1)
                        Send AddEventListener of oBrowser hElement iEventID (RefProc(UniversalEventHandler)) Self False
                    Loop
                End_Procedure
                
                Procedure OnClick
                    Send AddAllListeners "mybody"
                    Send AddAllListeners "myp"
                    Send AddAllListeners "myinput"
                    Send AddAllListeners "mycheckbox"
                    Send AddAllListeners "mybutton"
                    Send AddAllListeners "mydiv"
                End_Procedure
            End_Object
            
            Object oButton6 is a Button
                Set Size to 14 123
                Set Location to 99 5
                Set Label to 'Set top-margin of checkbox'
                
                Procedure OnClick
                    Handle hCheckbox hoCSSStyleDeclaration
                    String sValue
                    Get ElementHandleByID of oBrowser "mycheckbox" to hCheckbox
                    If (hCheckbox) Begin
                        Get CSSStyleDeclarationObject of hCheckbox to hoCSSStyleDeclaration
                        Set ComMarginTop of hoCSSStyleDeclaration to "20px"
                        Send Destroy of hoCSSStyleDeclaration
                    End
                    Else Begin
                        Send Info_Box "Checkbox element not found"
                    End
                    
                End_Procedure
            End_Object
            
            Object oButton7 is a Button
                Set Size to 14 123
                Set Location to 117 5
                Set Label to 'Set innerHTML of div'
                
                // fires when the button is clicked
                Procedure OnClick
                    Handle hDiv hInnerHTMLBuilder
                    String sValue 
                    Variant vDocument
                    Get ElementHandleByID of oBrowser "mydiv" to hDiv
                    If (hDiv) Begin
                        Get NewInnerHTML of oBrowser to hInnerHTMLBuilder
                        Send AddElement of hInnerHTMLBuilder "h1" "hello"
                        Send AddElement of hInnerHTMLBuilder "p" "kfs‘dkf‘l k sl‘dfk l‘k "
                        Send UpdateElement of hInnerHTMLBuilder hDiv
                    End
                    Else Begin
                        Send Info_Box "DIV element not found"
                    End
                    
                End_Procedure
            End_Object

//            Object oButton8 is a Button
//                Set Location to 152 24
//                Set Label to 'Full screen'
//            
//                // fires when the button is clicked
//                Procedure OnClick
//                    Set ComFullScreen of oBrowser to True
//                    Set ComTheaterMode of oBrowser to True
//                    Set ComFullScreen of oBrowser to True
//                    Set ComToolBar of oBrowser to True
//                    Set ComVisible of oBrowser to False
//                End_Procedure
//            End_Object
//            
//            Object oButton9 is a Button
//                Set Location to 172 23
//                Set Label to 'Full screen 2'
//            
//                // fires when the button is clicked
//                Procedure OnClick
//                    Handle hIHTMLDocument2
//                    Variant vDocument
//                    Move (_oIHTMLDocument2(oBrowser)) to hIHTMLDocument2
//                    Get ComOpen of hIHTMLDocument2 "http://www.sture.dk/lk" "ghhgf" "fullscreen=yes,titlebar=no,toolbar=no,location=no,addressbar=no, statusbar= no, scrollbars=yes, resizable= no,width=2000,height=1300,left=0,top=0'" True to vDocument
////                    Send ComClose of hIHTMLDocument2
//                    
//                End_Procedure
//            End_Object
            
        End_Object 

        Object oTab2 is a TabPage
            Set Label to "Image viewer"

            Object oTabDialog1 is a TabDialog
                Set Size to 224 444
                Set Location to 6 7
                Set peAnchors to anAll

                Object oFolderTab is a TabPage
                    Set Label to 'Select folder'

                    Object oFolder is a Form
                        Set Size to 13 330
                        Set Location to 10 47
                        Set Enabled_State to False
                        Set Label to "Image folder:"
                        Set Label_Col_Offset to 0
                        Set Label_Justification_Mode to JMode_Right
                        Set peAnchors to anTopLeftRight
                        Set Value to (WinFolderPath(oFileFunctions,CSIDL_MYPICTURES))
                    End_Object

                    Object oButton is a Button
                        Set Location to 10 383
                        Set Label to 'Select'
                        Set peAnchors to anTopRight
                    
                        // fires when the button is clicked
                        Procedure OnClick
                            String sFolder
                            Get Value of oFolder to sFolder
                            Get BrowseFolder of oFileFunctions "Select image folder" sFolder to sFolder
                            If (sFolder<>"") Begin
                                Set Value of oFolder to sFolder
                                Send UpdateImageList of oBrowser2
                            End
                        End_Procedure
                    End_Object
                    
                    Object oBrowser2 is a cComWebBrowserSture
                        Set Size to 175 430
                        Set Location to 29 5
                        Set peAnchors to anAll
                        
                        Procedure OnDirectLinkClicked String sLink 
                            Set psCurrentImagePath to sLink
                            Send Request_Switch_To_Tab 1 0
                            Send NavicateToImage of oBrowser3 sLink
                        End_Procedure
                        
                        Procedure addImages String sFolder tFileData[] aFileData
                            Integer iMax iIndex
                            String sType sSrc
                           
                            Move (SizeOfArray(aFileData)-1) to iMax
                            For iIndex from 0 to iMax // iMax
                                Get PathToType of oFileFunctions aFileData[iIndex].sFileName to sType
                                If ("jpg png gif bmp" contains Lowercase(sType)) Begin
                                    
                                    Get AppendPath of oFileFunctions sFolder aFileData[iIndex].sFileName to sSrc
                                    
                                    Send AddOpenElement "span"
                                        Send AddAttribute "style" "width:500px;height:400px;margin:5px;background-color:#d0e4fe;"
                                        Send AddOpenElement "a"
                                            Send AddAttribute "href" (DirectLinkEncode(Self,sSrc))
                                         
                                            Send AddElement "img" ""
                                                Send AddAttribute "src" sSrc
                                                Send AddAttribute "width" "500"
                                                Send AddAttribute "height" "400"
                                        Send CloseElement // a
                                    Send CloseElement // span
                                End
                            Loop    
                        End_Procedure                        
                        
                        Procedure UpdateImageList
                            String sFolder
                            tFileData[] aFileData
                            Get Value of oFolder to sFolder
                            Send ReadFolder of oFileFunctions sFolder "*" (&aFileData) 1 // 1=files
                            
                            Send BeginDocument
                            Send AddOpenElement "html"
                                Send AddOpenElement "head"
                                    Send AddElement "title" "i'm the title"
                                    Send AddElement "script" ""
                                        Send AddAttribute "id" "myscript"
                                    // Remove vertical scrollbar when not needed and remove also the border around the browser component itself:
                                    Send AddElement "style" "html, body {overflow:auto;border-style:none;background-color:f0f0f0;}" 
                                Send CloseElement // head
                                Send AddOpenElement "body"
                                    Send addImages sFolder aFileData
                                Send CloseElement // body
                            Send CloseElement // html
                            Send EndDocument
                        End_Procedure
                    End_Object
                    
                    Boolean bJustOnceNow
                    Move False to bJustOnceNow
                    Procedure OnEnterArea Handle hoFrom
                        If (not(bJustOnceNow)) Begin
                            Move True to bJustOnceNow
                            Send UpdateImageList of oBrowser2
                        End
                    End_Procedure
                        
                End_Object // TabPage
                
                Object oImageTab is a TabPage
                    Set Label to 'View image'

                    Object oBrowser3 is a cComWebBrowserSture
                        Set Size to 175 430
                        Set Location to 29 5
                        Set peAnchors to anAll
                        
                        Procedure NavicateToImage String sPath
                            Send ComNavigate sPath 0 0 0 0
                        End_Procedure
                        
                        Procedure UpdateImageList
                            String sFolder
                            tFileData[] aFileData
                            Get Value of oFolder to sFolder
                            Send ReadFolder of oFileFunctions sFolder "*" (&aFileData) 1 // 1=files
                            
                            Send BeginDocument
                            Send AddOpenElement "html"
                                Send AddOpenElement "head"
                                    Send AddElement "title" "i'm the title"
                                    Send AddElement "script" ""
                                        Send AddAttribute "id" "myscript"
                                    // Remove vertical scrollbar when not needed and remove also the border around the browser component itself:
                                    Send AddElement "style" "html, body {overflow:auto;border-style:none;background-color:f0f0f0;}" 
                                Send CloseElement // head
                                Send AddOpenElement "body"
                                    Send addImages sFolder aFileData
                                Send CloseElement // body
                            Send CloseElement // html
                            Send EndDocument
                        End_Procedure
                    End_Object
                End_Object
            End_Object

        End_Object
    End_Object


    Procedure Popup
        Forward Send Popup
//        Send InsertDocument of oBrowser2
    End_Procedure
End_Object
