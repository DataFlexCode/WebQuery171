Use Windows.pkg
Use DFClient.pkg
Use cFTPTransferSture.pkg
Use Win\GridFunctions.pkg
Use Win\ConfirmationFunctions.pkg
Use FileFunctions.pkg

Use TestProjects\TestFTPTransferEnterValuePanel.dg

Class _Form_TestFTPTransferView is a Form
    Procedure Construct_Object
        Forward Send Construct_Object
        Set Label_Col_Offset to 0
        Set Label_Justification_Mode to JMode_Top
    End_Procedure
End_Class

Deferred_View Activate_oTestFTPTransferView for ;
Object oTestFTPTransferView is a dbView

    Set Border_Style to Border_Normal
    Set Size to 391 651
    Set Location to 2 2
    Set Label to "cFTPTransferSture.pkg tester"
    On_Key kCancel Send Close_Panel
    
    Object oFTP is a cFTPTransferSture
        Procedure OnTransferStatus Integer iBytes Integer iFileSize
            Showln "OnTransferStatus " iBytes " " iFileSize
        End_Procedure
        Set psRemoteHost to "ftp.dataaccess.com"
    End_Object

    Object oGridInternetFlags is a GridSture
        Set Location to 12 9
    
        Set Size to 234 417
    
        Set Line_Width to 4 0
        Set Form_Width    0 to 27
        Set Header_Label  0 to ""
        Set Form_Width 1 to 85
        Set Header_Label  1 to "Flag"
        Set Form_Width 2 to 52
        Set Header_Label  2 to "Value"
        Set Form_Datatype 2 to 0
        Set Form_Width 3 to 238
        Set Header_Label  3 to "Description"
        Set pbSelectToggle1stColumn to True
        Set _pbSelectToggle1stColumn to False
 
        
        Procedure AddFlag Integer iFlagValue String sFlagSymbol String sDescription
            Integer iBase
            Get Item_Count to iBase
            Send AddCheckBoxItem of oGridFunctions Self False
            Send Add_Item MSG_NONE sFlagSymbol
            Send Add_Item MSG_NONE iFlagValue
            Send Add_Item MSG_NONE sDescription
        End_Procedure
        
        Procedure Set FlagValue Integer iFlagValue
            Integer iRow iMax iBitValue iBase
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase 
                Get Value (iBase+2) to iBitValue
                Set Select_State iBase to ((iBitValue iand iFlagValue)<>0)
            Loop
        End_Procedure
        
        Function FlagValue Returns Integer
            Integer iRow iMax iFlagValue iBitValue iBase
            Get RowCount of oGridFunctions Self to iMax
            Decrement iMax
            Move 0 to iFlagValue
            For iRow from 0 to iMax
                Get RowBaseItem of oGridFunctions Self iRow to iBase 
                Get Value (iBase+2) to iBitValue
                If (Select_State(Self,iBase)) Begin
                    Move (iFlagValue+iBitValue) to iFlagValue
                End
            Loop
            Function_Return iFlagValue
        End_Function
        
        On_Key kClear Send Test
        
        Send AddFlag ifReload                "ifReload"                "retrieve the original item"
        Send AddFlag ifNoCacheWrite          "ifNoCacheWrite"          "don't write this item to the cache"
        Send AddFlag ifMakePersistent        "ifMakePersistent"        "make this item persistent in cache"
        Send AddFlag ifFromCache             "ifFromCache"             "use offline semantics"
        Send AddFlag ifSecure                "ifSecure"                "use PCT/SSL if applicable (HTTP)"
        Send AddFlag ifKeepConnection        "ifKeepConnection"        "use keep-alive semantics"
        Send AddFlag ifNoAutoRedirect        "ifNoAutoRedirect"        "don't handle redirections automatically"
        Send AddFlag ifReadPrefetch          "ifReadPrefetch"          "do background read prefetch"
        Send AddFlag ifNoCookies             "ifNoCookies"             "no automatic cookie handling"
        Send AddFlag ifNoAuth                "ifNoAuth"                "no automatic authentication handling"
        Send AddFlag ifCacheIfNetFail        "ifCacheIfNetFail"        "return cache file if net request fails"
        Send AddFlag ifIgnoreRedirectToHttp  "ifIgnoreRedirectToHttp"  "ex: https:// to http://"
        Send AddFlag IfIgnoreRedirectToHttps "IfIgnoreRedirectToHttps" "ex: http:// to https://"
        Send AddFlag IfIgnoreCertDateInvalid "IfIgnoreCertDateInvalid" "expired X509 Cert."
        Send AddFlag IfIgnoreCertCnInvalid   "IfIgnoreCertCnInvalid"   "bad common name in X509 Cert."
        Send AddFlag ifResynchronize         "ifResynchronize"         "asking wininet to update an item if it is newer"
        Send AddFlag ifHyperlink             "ifHyperlink"             "asking wininet to do hyperlinking semantic which works right for scripts"
        Send AddFlag ifNoUi                  "ifNoUi"                  "no cookie popup"
        Send AddFlag ifPragmaNocache         "ifPragmaNocache"         'asking wininet to add "pragma: no-cache"'
        Send AddFlag ifCacheAsync            "ifCacheAsync"            "ok to perform lazy cache-write"
        Send AddFlag ifFormsSubmit           "ifFormsSubmit"           "this is a forms submit"
        Send AddFlag ifNeedFile              "ifNeedFile"              "need a file for this request"
        Send SetAlternatingRowColors of oGridFunctions Self clBlue
        Send SetEntryState of oGridFunctions Self False

    End_Object

    Object oRemoteHost is a _Form_TestFTPTransferView
        Set Label to "psRemoteHost (Hostname or the IP Address of the remote server)"
        Set Size to 13 100
        Set Location to 28 436
    End_Object
    Object oRemotePort is a _Form_TestFTPTransferView
        Set Label to "piRemotePort (Port to connect to on RemoteHost)"
        Set Size to 13 100
        Set Location to 52 436
        Set Form_Datatype to 0
    End_Object
    Object oUserName is a _Form_TestFTPTransferView
        Set Label to "psUserName (Login name)"
        Set Size to 13 100
        Set Location to 77 436
    End_Object
    Object oPassword is a _Form_TestFTPTransferView
        Set Label to "psPassword (Password to use to log on)"
        Set Size to 13 100
        Set Location to 101 436
    End_Object
    Object oProxy is a _Form_TestFTPTransferView
        Set Label to "psProxy (Name of the Proxy server used, if any)"
        Set Size to 13 100
        Set Location to 125 436
    End_Object
    Object oBufferSize is a _Form_TestFTPTransferView
        Set Label to "piBufferSize (Size of the file transfer buffer)"
        Set Size to 13 100
        Set Location to 149 436
        Set Form_Datatype to 0
    End_Object
    Object oAgent is a _Form_TestFTPTransferView
        Set Label to "psAgent (Name of the application)"
        Set Size to 13 100
        Set Location to 1488 448
    End_Object

    Object oPassiveMode is a CheckBox
        Set Size to 10 50
        Set Location to 170 438
        Set Label to 'pbPassiveMode (Connect to FTP server using passive mode)'
    End_Object

    Object oTransferType is a RadioGroup
        Set Location to 185 437
        Set Size to 26 209
        Set Label to 'peTransferType'
    
        Object oRadio1 is a Radio
            Set Label to "ttAscii"
            Set Size to 10 33
            Set Location to 12 23
        End_Object
    
        Object oRadio2 is a Radio
            Set Label to "ttBinary"
            Set Size to 10 37
            Set Location to 12 72
        End_Object
    
        Object oRadio3 is a Radio
            Set Label to "un-defined (error)"
            Set Size to 10 75
            Set Location to 12 119
        End_Object
        
        Procedure Set xValue Integer iValue
            If (iValue=ttAscii) Begin
                Set Current_Radio to 0
            End
            Else If (iValue=ttBinary) Begin
                Set Current_Radio to 1
            End
            Else Begin
                Set Current_Radio to 2
            End
        End_Procedure
        
        Function xValue Returns Integer
            Integer iRadio
            Get Current_Radio to iRadio
            If (iRadio=0) Function_Return ttAscii
            If (iRadio=1) Function_Return ttBinary
            Function_Return -1
        End_Function
    
    End_Object
    
    Register_Function _pbConnected Returns Boolean

    Object oConnectBtn is a Button
        Set Size to 20 67
        Set Location to 221 469
        Set Label to 'FTP connect'
        Procedure OnClick
            Integer iRval
            If (_pbConnected(oSessionGroup)) Begin
                Send Info_Box "Session is already connected"
            End
            Else Begin
                Send UpdateFTPTransfer
                Get Connect of oFTP to iRval
                If (iRval<>0) Begin
                    Set _pbConnected of oSessionGroup to True
                    Send DisplayFTPTransfer
                End
                Else Begin
                    Send Info_Box "Could not connect"
                End
            End
        End_Procedure
    End_Object
    
    Object oDisconnectBtn is a Button
        Set Size to 20 67
        Set Location to 221 543
        Set Label to 'FTP disconnect'
        Procedure OnClick
            Integer iRval
            If (_pbConnected(oSessionGroup)) Begin
                Get Disconnect of oFTP to iRval
                If (iRval<>0) Begin
                    Set _pbConnected of oSessionGroup to False
                    Send DisplayFTPTransfer
                End
            End
            Else Begin
                Send Info_Box "Session already not connected"
            End
        End_Procedure
    End_Object

    Object oSessionGroup is a Group
        Set Size to 138 637
        Set Location to 249 8
        Set Label to 'FTP Session'
        Property Boolean _pbConnected False

        Object oCurrentDirectory is a Form
            Set Size to 13 562
            Set Location to 10 62
            Set Label to "Remote folder:"
            Set Label_Justification_Mode to JMode_Right
            Set Label_Col_Offset to 0
            Set Enabled_State to False
        End_Object

        Object oGridFolders is a GridSture
            Set Location to 27 9
        
            Set Size to 100 269
        
            Set Line_Width to 2 0 // size and Line_width MUST be set before any column properties
            Set Form_Width 0 to 158
            Set Header_Label  0 to "Subfolders"
            Set Form_Width 1 to 98
            Set Header_Label  1 to "Flags"
            Set GridLine_Mode to Grid_Visible_None
            
            Procedure HandleCreateFolder
                Integer iRval
                String sSubFolder
                Get EnterValue of oTestFTPTransferEnterValuePanel "Create remote folder:" "Enter remote folder name:" "" to sSubFolder
                If (sSubFolder<>"" and sSubFolder<>"." and sSubFolder<>"..") Begin
                    Send UpdateFTPTransfer
                    Get CreateFTPdirectory of oFTP sSubFolder to iRval
                    If (iRval<>0) Begin
                        Send DisplayFTPTransfer
                    End
                    Else Begin
                        Send Info_Box "Could not create remote folder"
                    End
                End
            End_Procedure
            
            Procedure HandleDeleteFolder
                Integer iRval
                Integer iBase
                Boolean bConfirm
                String sSubFolder
                Get BaseItem of oGridFunctions Self to iBase
                Get Value iBase to sSubFolder
                If (sSubFolder<>"." and sSubFolder<>".." and sSubFolder<>"") Begin
                    Get YesNo of oConfirmationFunctions "Delete folder?" sSubFolder False to bConfirm
                    If (bConfirm) Begin
                        Send UpdateFTPTransfer
                        Get RemoveFTPdirectory of oFTP sSubFolder to iRval
                        If (iRval<>0) Begin
                            Send DisplayFTPTransfer
                        End
                        Else Begin
                            Send Info_Box "Could not delete remote folder"
                        End
                    End
                End
            End_Procedure
            
            Send AddRightClickMenuItem "Create folder" "" "" MSG_HandleCreateFolder
            Send AddRightClickMenuItem "Delete folder" "" "" MSG_HandleDeleteFolder

            Procedure FillGrid tFTPDirectoryItem[] aFolders
                Integer iMax iIndex
                Set Dynamic_Update_State to False
                Send Delete_Data
                Move (SizeOfArray(aFolders)-1) to iMax
                For iIndex from 0 to iMax
                    Send Add_Item MSG_NONE aFolders[iIndex].sFileName
                    Send Add_Item MSG_NONE (FlagsAsString(oFTP,aFolders[iIndex]))
                Loop
                Send SetEntryState of oGridFunctions Self False
                Set Dynamic_Update_State to True
            End_Procedure
            
            Procedure OnMouseDoubleClick Integer iItem
                Integer iBase iRval
                String sFolder
                Get ItemBaseItem of oGridFunctions Self iItem to iBase
                Get Value iBase to sFolder
                Send UpdateFTPTransfer
                Get ChangeDirectory of oFTP sFolder to iRval
                If (iRval<>0) Begin
                    Send DisplayFTPTransfer
                End
                Else Begin
                    Send Info_Box ("Could not change directory ("+sFolder+")")
                End
            End_Procedure
        End_Object

        Object oGridFiles is a GridSture
            Set Location to 27 303
        
            Set Size to 100 321
        
            Set Line_Width to 3 0 // size and Line_width MUST be set before any column properties
        
            Set Form_Width 0 to 177
            Set Header_Label  0 to "Files"
            Set Form_Width    1 to 47
            Set Header_Label  1 to "Size"
            Set Form_Datatype 1 to 0
            Set Form_Width 2 to 85
            Set Header_Label  2 to "Flags"
            Set GridLine_Mode to Grid_Visible_None
//            Set Header_Visible_State to False

            Procedure HandleDownloadFile
                Integer iBase iRval
                String sFile sLocalFolder sLocalFile
                Get BaseItem of oGridFunctions Self to iBase
                Get Value iBase to sFile
                Get VdfFolderPath of oFileFunctions VDF_FILELIST to sLocalFolder
                Get BrowseFileSaveAs of oFileFunctions "Save file as" sLocalFolder "" sFile to sLocalFile
                If (sLocalFile<>"") Begin
                    Send UpdateFTPTransfer
                    Get DownloadFile of oFTP sFile sLocalFile to iRval
                    If (iRval<>0) Begin
                        Send DisplayFTPTransfer
                    End
                    Else Begin
                        Send Info_Box "File could not be downloaded"
                    End
                End
            End_Procedure
            
            Procedure HandleUploadFile
                Integer iRval
                String sLocalFile sRemoteFile
                Get BrowseFileOpen of oFileFunctions "Select file to upload" "" "" to sLocalFile
                If (sLocalFile<>"") Begin
                    Get PathToFileName of oFileFunctions sLocalFile to sRemoteFile
                    Send UpdateFTPTransfer
                    Get UploadFile of oFTP sLocalFile sRemoteFile to iRval
                    If (iRval<>0) Begin
                        Send DisplayFTPTransfer
                    End
                    Else Begin
                        Send Info_Box "File could not be uploaded"
                    End
                    
                End
            End_Procedure

            Procedure HandleRenameFile
                Integer iRval iBase
                String sFileName sNewFileName
                Get BaseItem of oGridFunctions Self to iBase
                Get Value iBase to sFileName
                Get EnterValue of oTestFTPTransferEnterValuePanel "Rename file" "Enter new name for file:" sFileName to sNewFileName
                If (sNewFileName<>"") Begin
                    Send UpdateFTPTransfer
                    Get RenameFTPFile of oFTP sFileName sNewFileName to iRval
                    If (iRval<>0) Begin
                        Send DisplayFTPTransfer
                    End
                    Else Begin
                        Send Info_Box "File could not be renamed"
                    End
                End
            End_Procedure
                    
            Procedure HandleDeleteFile
                Integer iRval iBase
                Boolean bConfirm
                String sFileName
                Get BaseItem of oGridFunctions Self to iBase
                Get Value iBase to sFileName
                If (sFileName<>"." and sFileName<>".." and sFileName<>"") Begin
                    Get YesNo of oConfirmationFunctions sFileName "Delete remote file?" False to bConfirm
                    If (bConfirm) Begin
                        Send UpdateFTPTransfer
                        Get DeleteFTPFile of oFTP sFileName to iRval
                        If (iRval<>0) Begin
                            Send DisplayFTPTransfer
                        End
                        Else Begin
                            Send Info_Box "Could not delete remote file"
                        End
                    End
                End
            End_Procedure

            Send AddRightClickMenuItem "Download file" "" "" MSG_HandleDownloadFile
            Send AddRightClickMenuItem "Upload file" "" "" MSG_HandleUploadFile
            Send AddRightClickMenuItem "Rename file" "" "" MSG_HandleRenameFile
            Send AddRightClickMenuItem "Delete file" "" "" MSG_HandleDeleteFile
            
            Procedure FillGrid tFTPDirectoryItem[] aFiles
                Integer iMax iIndex
                Set Dynamic_Update_State to False
                Send Delete_Data
                Move (SizeOfArray(aFiles)-1) to iMax
                For iIndex from 0 to iMax
                    Send Add_Item MSG_NONE aFiles[iIndex].sFileName
                    Send Add_Item MSG_NONE aFiles[iIndex].iFileSize
                    Send Add_Item MSG_NONE (FlagsAsString(oFTP,aFiles[iIndex]))
                Loop
                Send SetEntryState of oGridFunctions Self False
                Set Dynamic_Update_State to True
            End_Procedure
        
            Procedure OnMouseDoubleClick Integer iItem
                Send HandleDownloadFile
//                Integer iBase iRval
//                String sFile sLocalFolder sLocalFile
//                Get ItemBaseItem of oGridFunctions Self iItem to iBase
//                Get Value iBase to sFile
//                Get VdfFolderPath of oFileFunctions VDF_FILELIST to sLocalFolder
//                Get BrowseFileSaveAs of oFileFunctions "Save file as" sLocalFolder "" sFile to sLocalFile
//                If (sLocalFolder<>"") Begin
//                    Get DownloadFile of oFTP sFile sLocalFile to iRval
//                    If (iRval<>0) Begin
//                         Send Info_Box ("File saved: "+sLocalFile)
//                    End
//                    Else Begin
//                        Send Info_Box "File could not be downloaded"
//                    End
//                End
            End_Procedure
        End_Object

        Object oTextBox2 is a TextBox
            Set Size to 10 36
            Set Location to 127 45
            Set Label to 'Right click the grid to ACTUALLY create and delete folders'
        End_Object

        Object oTextBox3 is a TextBox
            Set Size to 10 50
            Set Location to 127 371
            Set Label to 'Right click the grid to ACTUALLY upload, delete and rename files'
        End_Object
        
        Procedure UpdateSessionDisplay
            String sCurrentDirectory
            tFTPDirectoryList strList
            If (_pbConnected(Self)) Begin
                Get CurrentDirectory of oFTP to sCurrentDirectory
                Set Value of oCurrentDirectory to sCurrentDirectory
                Get DirectoryListSture of oFTP "*" to strList
                Send FillGrid of oGridFolders strList.aFolders
                Send FillGrid of oGridFiles strList.aFiles
            End
            Else Begin
                Set Value of oCurrentDirectory to ""
                Send Delete_Data of oGridFolders
                Send Delete_Data of oGridFiles
            End
        End_Procedure
    End_Object
    
    Procedure UpdateFTPTransfer                                   
        Set peTransferFlags of oFTP to (FlagValue(oGridInternetFlags))
        Set psRemoteHost of oFTP to (Value(oRemoteHost))
        Set piRemotePort of oFTP to (Value(oRemotePort))
        Set psUserName   of oFTP to (Value(oUserName))
        Set psPassword   of oFTP to (Value(oPassword))
        Set psProxy      of oFTP to (Value(oProxy))
        Set piBufferSize of oFTP to (Value(oBufferSize))
        Set psAgent      of oFTP to (Value(oAgent))
        Set pbPassiveMode of oFTP to (Checked_State(oPassiveMode))
        Set peTransferType of oFTP to (xValue(oTransferType))
    End_Procedure
    
    Procedure DisplayFTPTransfer
        Set FlagValue of oGridInternetFlags to (peTransferFlags(oFTP))
        Set Value of oRemoteHost to (psRemoteHost(oFTP)) // Hostname or the IP Address of the remote server
        Set Value of oRemotePort to (piRemotePort(oFTP)) // Port to connect to on RemoteHost               
        Set Value of oUserName   to (psUserName(oFTP))   // Login name                                     
        Set Value of oPassword   to (psPassword(oFTP))   // Password to use to log on                      
        Set Value of oProxy      to (psProxy(oFTP))      // Name of the Proxy server used, if any          
        Set Value of oBufferSize to (piBufferSize(oFTP)) // Size of the file transfer buffer               
        Set Value of oAgent      to (psAgent(oFTP))      // Name of the application                        
        Set Checked_State of oPassiveMode to (pbPassiveMode(oFTP))
        Set xValue of oTransferType to (peTransferType(oFTP))
        Send UpdateSessionDisplay of oSessionGroup
    End_Procedure

    Procedure Test // Calling this should not alter the content of the display
        Send UpdateFTPTransfer
        Send DisplayFTPTransfer
    End_Procedure

    Object oTextBox1 is a TextBox
        Set Size to 10 50
        Set Location to 2 10
        Set Label to 'peTransferFlags:        (The selected flags are added together and passed as peTransferFlags to the cFTPTransfer object)'
    End_Object
    
    Send DisplayFTPTransfer
            
Cd_End_Object
