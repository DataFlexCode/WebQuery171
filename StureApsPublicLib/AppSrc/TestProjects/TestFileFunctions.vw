use DfAllEnt.pkg
Use FileFunctions.pkg
Use Win\GridFunctions.pkg
Use StringFunctions.pkg
Use Windows.pkg
Use dfTreeVw.pkg
Use Win\cFileDataGridClass.pkg
Use Win\ConfirmationFunctions.pkg

Use TemporaryTables.pkg

Activate_View Activate_oFileFunctionsTestView for oFileFunctionsTestView
Object oFileFunctionsTestView is a View
    Set Size to 273 566
    Set Location to 41 15
    Set Label to "Test oFileFunctions object in FileFunctions.pkg"
    Set Border_Style to Border_Thick
    Set piMinSize to 273 566
    on_key kCancel send close_panel

    Object oTabDialog is a TabDialog
        Set Size to 253 533
        Set Location to 10 13
        Set peAnchors to anAll

If (Lowercase(LicenseName(oVdfRuntimeFunctions)) contains "sture") Begin
        Object oTabPage1 is a TabPage
            Set Label to "Various functions"

            Object oButtonBrowseFileOpen is a Button
                Set Size to 14 70
                Set Location to 35 84
                Set Label to "Browse file (open)"
            
                Procedure OnClick
                    String sFile sStartFolder
                    Get WinFolderPath of oFileFunctions CSIDL_PERSONAL to sStartFolder
                    Get BrowseFileOpen of oFileFunctions "Find yourself a nice file and open it" sStartFolder "Text files|*.txt|XML files|*.xml|All files|*.*" to sFile
                    Set Value of oFormBrowseFileOpen to sFile // If the return value is blank, the user cancelled the selection
                End_Procedure
            End_Object

            Object oFormBrowseFileOpen is a Form
                Set Size to 14 279
                Set Location to 35 159
                Set peAnchors to anTopLeftRight
                Set Enabled_State to False
            End_Object

            Object oButtonBrowseFileSave is a Button
                Set Size to 14 70
                Set Location to 59 84
                Set Label to "Browse file (save)"
            
                Procedure OnClick
                    String sFile sStartFolder
                    Get WinFolderPath of oFileFunctions CSIDL_PERSONAL to sStartFolder
                    Get BrowseFileSaveAs of oFileFunctions "Find yourself a nice file and save it" sStartFolder "Text files|*.txt|XML files|*.xml|All files|*.*" "MyFileName.txt" to sFile
                    Set Value of oFormBrowseFileSave to sFile // If the return value is blank, the user cancelled the selection
                End_Procedure
            End_Object

            Object oFormBrowseFileSave is a Form
                Set Size to 14 279
                Set Location to 59 159
                Set peAnchors to anTopLeftRight
                Set Enabled_State to False
            End_Object

            Object oButtonBrowseFolder is a Button
                Set Size to 14 70
                Set Location to 82 84
                Set Label to "Browse folder"

                Procedure OnClick
                    String sFolder
                    Get value of oFormBrowseFolder to sFolder
                    Get BrowseFolder of oFileFunctions "I wish the panel was resizable" sFolder to sFolder
                    Set value of oFormBrowseFolder to sFolder // If the return value is blank, the user cancelled the selection
                End_Procedure

            End_Object

            Object oFormBrowseFolder is a Form
                Set Size to 14 279
                Set Location to 82 159
                Set peAnchors to anTopLeftRight
                Set Enabled_State to False
            End_Object

            Object oButtonValidDrives is a Button
                Set Size to 14 70
                Set Location to 106 84
                Set Label to "Valid drives"

                Procedure OnClick
                    Set value of oFormValidDrives to (ValidDriveLetters(oFileFunctions))
                End_Procedure
            End_Object
            
            Object oFormValidDrives is a Form
                Set Size to 14 279
                Set Location to 106 159
                Set peAnchors to anTopLeftRight
                Set Enabled_State to False
            End_Object

            Object oTempFolderPath is a Form
                Set Size to 14 279
                Set Location to 129 159
                Set peAnchors to anTopLeftRight
                Set Enabled_State to False
                Set label to "Windows temp folder:"
                Set Label_Col_Offset to 0
                Set Value to (UserTempFolder(oFileFunctions))                
                Set Label_Justification_Mode to JMode_Right
            End_Object

            Object oFileToStructCopyTestBtn is a Button
                Set Size to 14 157
                Set Location to 194 84
                Set Label to 'File-To-Struct copy and verify content'
            
                Procedure OnClick
                    Integer iGrb
                    Boolean bContinue
                    String sPathSource sPathTarget
                    tFileInChops strFileStruct
                    Get BrowseFileOpen of oFileFunctions "Read file to struct" "" "" to sPathSource
                    If (sPathSource<>"") Begin
                        Get SplitFile of oFileFunctions sPathSource (&strFileStruct) 8192 to bContinue
                        If bContinue Begin
                            Get BrowseFileSaveAs of oFileFunctions "Save file as" "" "" "" to sPathTarget
                            If (sPathTarget<>"") Begin
                                Get JoinFile of oFileFunctions sPathTarget strFileStruct to bContinue
                                If (bContinue) Begin
                                    If (AreFilesIdentical(oFileFunctions,sPathSource,sPathTarget,True)) Begin
                                        Send Info_Box "FileToStruct and StructToFile works as expected" "Hurray"
                                        If (YesNo(oConfirmationFunctions,"Delete the copied file? ("+sPathTarget+")","",True)) Begin
                                            Get DeleteFileNew of oFileFunctions sPathTarget False to iGrb
                                        End
                                    End
                                    Else Begin
                                        Send Info_Box "Files are not identical" "Alas"
                                    End
                                End 
                                Else Begin
                                    Error 999 "Could not save file"
                                End
                            End
                        End
                        Else Begin
                            Error 999 "Could not read file"
                        End
                    End
                End_Procedure
            
            End_Object

            Object oOpenMultibleFilesTestBtn is a Button
                Set Size to 14 95
                Set Location to 194 246
                Set Label to 'Open file multi select'
            
                Procedure OnClick
                    Integer iMax iIndex
                    Boolean bSelect
                    String sFolder
                    String[] aSelectedFiles
                    Get VdfFolderPath of oFileFunctions VDF_APPSRC to sFolder
                    Get BrowseFileOpenMultiSelect of oFileFunctions "Multi-select files" sFolder "*" (&aSelectedFiles) to bSelect
                    If (bSelect) Begin
                        Move (SizeOfArray(aSelectedFiles)-1) to iMax
                        For iIndex from 0 to iMax
                            Showln aSelectedFiles[iIndex]
                        Loop
                    End
                    Else Begin
                        Send Info_Box "User cancelled"
                    End
                End_Procedure
            
            End_Object

//            Object oDiskfree is a Form
//                Set Label to "Disk free (temp folder):"
//                Set Size to 13 100
//                Set Location to 152 159
//                Set peAnchors to anTopLeftRight
//                Set Enabled_State to False
//                Set Label_Col_Offset to 0
//                Set Label_Justification_Mode to JMode_Right
//                Procedure Init
//                    String sPath
//                    Get Value of oTempFolderPath to sPath
//                    Diskfree sPath to sPath
//                    Set Value to sPath
//                End_Procedure
//                Send Init
//            End_Object

        End_Object
End
        
        Object oTabPage2 is a TabPage
            Set Label to "VDF folders"
            Object oFolderGrid is a GridSture
                Set Location to 7 15
                Set Size to 196 489
                
                Send AddColumn of oGridFunctions "Parameter" (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,40,0)) 150
                Send AddColumn of oGridFunctions "Value" (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,40,0)) 250
                Send ApplyToGrid of oGridFunctions Self True
                Set Size to 196 489
                
                //Set Line_Width to 2 0
            
                Set GridLine_Mode to Grid_Visible_None
                Set peAnchors to anAll
                //Set Select_Mode to No_Select
                 Function VdfFolderName Integer iFolderId Returns String
                    If (iFolderId=VDF_ROOT)     Function_Return "VDF root"
                    If (iFolderId=VDF_HTML)     Function_Return "HTML root"
                    If (iFolderId=VDF_FILELIST) Function_Return "Data folder"
                    If (iFolderId=VDF_PROGRAM)  Function_Return "VDF program"
                    Function_Return ""
                End_Function
        
                Procedure AddFolder Integer iWinFolderId
                    Send Add_Item MSG_NONE (VdfFolderName(Self,iWinFolderId))
                    Send Add_Item MSG_NONE (VdfFolderPath(oFileFunctions,iWinFolderId))
                End_Procedure
        
                Procedure DoFillGrid
                    Integer iFolderId
                    Send delete_data
                    Send AddFolder VDF_ROOT 
                    Send AddFolder VDF_HTML 
                    Send AddFolder VDF_FILELIST
                    Send AddFolder VDF_PROGRAM 
                    Send SetEntryState of oGridFunctions Self False
                End_Procedure // DoFillGrid
                
                Function CurrentFolder Returns String
                    Integer iBase
                    String sRval
                    If (Item_Count(Self)) Begin
                        Get BaseItem of oGridFunctions Self to iBase
                        Get value (iBase+1) to sRval
                    End
                    Else Move "" to sRval
                    Function_Return sRval
                End_Function
                
                Procedure ExploreCurrentFolder
                    String sFolder
                    Get CurrentFolder to sFolder
                    If (sFolder<>"") Send ExploreFolder of oFileFunctions sFolder
                End_Procedure
                
                On_Key kEnter Send ExploreCurrentFolder
                Procedure Mouse_Click Integer iWindowNumber Integer iPosition
                    Send ExploreCurrentFolder
                End_Procedure
            End_Object
            
            Object oUpdateGridBtn is a Button
                Set Size to 14 60
                Set Location to 209 379
                Set Label to "Read folders"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send DoFillGrid of oFolderGrid
                End_Procedure // OnClick
            End_Object

            Object oExplBtn is a Button
                Set Size to 14 60
                Set Location to 209 445
                Set Label to "Explore folder"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send ExploreCurrentFolder of oFolderGrid
                End_Procedure            
            End_Object
        End_Object

        Object oTabPage3 is a TabPage
            Set Label to "Windows folders"
            Object oFolderGrid is a GridSture
                Set Location to 7 15
                Set Size to 196 489
                
                Send AddColumn of oGridFunctions "Parameter" (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,40,0)) 150
                Send AddColumn of oGridFunctions "Value" (BasicFieldType(DatabaseDescriptionObj,BFT_STRING,40,0)) 250
                Send ApplyToGrid of oGridFunctions Self True
                Set Size to 196 489
                
                //Set Line_Width to 2 0
            
                Set GridLine_Mode to Grid_Visible_None
                Set peAnchors to anAll
                //Set Select_Mode to No_Select
                                
                Function WinFolderName Integer iWinFolderId Returns String
                    //If (iWinFolderId=CSIDL_FLAG_CREATE) Function_Return "CSIDL_FLAG_CREATE"
                    If (iWinFolderId=CSIDL_ADMINTOOLS) Function_Return "CSIDL_ADMINTOOLS"
                    If (iWinFolderId=CSIDL_ALTSTARTUP) Function_Return "CSIDL_ALTSTARTUP"
                    If (iWinFolderId=CSIDL_APPDATA) Function_Return "CSIDL_APPDATA"
                    If (iWinFolderId=CSIDL_BITBUCKET) Function_Return "CSIDL_BITBUCKET"
                    If (iWinFolderId=CSIDL_COMMON_ADMINTOOLS) Function_Return "CSIDL_COMMON_ADMINTOOLS"
                    If (iWinFolderId=CSIDL_COMMON_ALTSTARTUP) Function_Return "CSIDL_COMMON_ALTSTARTUP"
                    If (iWinFolderId=CSIDL_COMMON_APPDATA) Function_Return "CSIDL_COMMON_APPDATA"
                    If (iWinFolderId=CSIDL_COMMON_DESKTOPDIRECTORY) Function_Return "CSIDL_COMMON_DESKTOPDIRECTORY"
                    If (iWinFolderId=CSIDL_COMMON_DOCUMENTS) Function_Return "CSIDL_COMMON_DOCUMENTS"
                    If (iWinFolderId=CSIDL_COMMON_FAVORITES) Function_Return "CSIDL_COMMON_FAVORITES"
                    If (iWinFolderId=CSIDL_COMMON_PROGRAMS) Function_Return "CSIDL_COMMON_PROGRAMS"
                    If (iWinFolderId=CSIDL_COMMON_STARTMENU) Function_Return "CSIDL_COMMON_STARTMENU"
                    If (iWinFolderId=CSIDL_COMMON_STARTUP) Function_Return "CSIDL_COMMON_STARTUP"
                    If (iWinFolderId=CSIDL_COMMON_TEMPLATES) Function_Return "CSIDL_COMMON_TEMPLATES"
                    If (iWinFolderId=CSIDL_CONTROLS) Function_Return "CSIDL_CONTROLS"
                    If (iWinFolderId=CSIDL_COOKIES) Function_Return "CSIDL_COOKIES"
                    If (iWinFolderId=CSIDL_DESKTOP) Function_Return "CSIDL_DESKTOP"
                    If (iWinFolderId=CSIDL_DESKTOPDIRECTORY) Function_Return "CSIDL_DESKTOPDIRECTORY"
                    If (iWinFolderId=CSIDL_DRIVES) Function_Return "CSIDL_DRIVES"
                    If (iWinFolderId=CSIDL_FAVORITES) Function_Return "CSIDL_FAVORITES"
                    If (iWinFolderId=CSIDL_FONTS) Function_Return "CSIDL_FONTS"
                    If (iWinFolderId=CSIDL_HISTORY) Function_Return "CSIDL_HISTORY"
                    If (iWinFolderId=CSIDL_INTERNET) Function_Return "CSIDL_INTERNET"
                    If (iWinFolderId=CSIDL_INTERNET_CACHE) Function_Return "CSIDL_INTERNET_CACHE"
                    If (iWinFolderId=CSIDL_LOCAL_APPDATA) Function_Return "CSIDL_LOCAL_APPDATA"
                    If (iWinFolderId=CSIDL_MYPICTURES) Function_Return "CSIDL_MYPICTURES"
                    If (iWinFolderId=CSIDL_NETHOOD) Function_Return "CSIDL_NETHOOD"
                    If (iWinFolderId=CSIDL_NETWORK) Function_Return "CSIDL_NETWORK"
                    If (iWinFolderId=CSIDL_PERSONAL) Function_Return "CSIDL_PERSONAL"
                    If (iWinFolderId=CSIDL_PRINTERS) Function_Return "CSIDL_PRINTERS"
                    If (iWinFolderId=CSIDL_PRINTHOOD) Function_Return "CSIDL_PRINTHOOD"
                    If (iWinFolderId=CSIDL_PROFILE) Function_Return "CSIDL_PROFILE"
                    If (iWinFolderId=CSIDL_PROGRAM_FILES) Function_Return "CSIDL_PROGRAM_FILES"
                    If (iWinFolderId=CSIDL_PROGRAM_FILES_COMMON) Function_Return "CSIDL_PROGRAM_FILES_COMMON"
                    If (iWinFolderId=CSIDL_PROGRAM_FILES_COMMONX86) Function_Return "CSIDL_PROGRAM_FILES_COMMONX86"
                    If (iWinFolderId=CSIDL_PROGRAMS) Function_Return "CSIDL_PROGRAMS"
                    If (iWinFolderId=CSIDL_RECENT) Function_Return "CSIDL_RECENT"
                    If (iWinFolderId=CSIDL_SENDTO) Function_Return "CSIDL_SENDTO"
                    If (iWinFolderId=CSIDL_STARTMENU) Function_Return "CSIDL_STARTMENU"
                    If (iWinFolderId=CSIDL_STARTUP) Function_Return "CSIDL_STARTUP"
                    If (iWinFolderId=CSIDL_SYSTEM) Function_Return "CSIDL_SYSTEM"
                    If (iWinFolderId=CSIDL_SYSTEMX86) Function_Return "CSIDL_SYSTEMX86"
                    If (iWinFolderId=CSIDL_TEMPLATES) Function_Return "CSIDL_TEMPLATES"
                    If (iWinFolderId=CSIDL_WINDOWS) Function_Return "CSIDL_WINDOWS" 
                    // Some of the folders below this line apparantly only makes sense for Vista+ or IE6+
                    If (iWinFolderId=CSIDL_CDBURN_AREA) Function_Return "CSIDL_CDBURN_AREA"
                    If (iWinFolderId=CSIDL_COMMON_MUSIC) Function_Return "CSIDL_COMMON_MUSIC"
                    If (iWinFolderId=CSIDL_COMMON_PICTURES) Function_Return "CSIDL_COMMON_PICTURES"
                    If (iWinFolderId=CSIDL_COMMON_VIDEO) Function_Return "CSIDL_COMMON_VIDEO"
                    If (iWinFolderId=CSIDL_COMPUTERSNEARME) Function_Return "CSIDL_COMPUTERSNEARME"
                    If (iWinFolderId=CSIDL_CONNECTIONS) Function_Return "CSIDL_CONNECTIONS"
                    If (iWinFolderId=CSIDL_MYDOCUMENTS) Function_Return "CSIDL_MYDOCUMENTS"
                    If (iWinFolderId=CSIDL_MYMUSIC) Function_Return "CSIDL_MYMUSIC"
                    If (iWinFolderId=CSIDL_MYVIDEO) Function_Return "CSIDL_MYVIDEO"
                    If (iWinFolderId=CSIDL_PHOTOALBUMS) Function_Return "CSIDL_PHOTOALBUMS"
                    If (iWinFolderId=CSIDL_PLAYLISTS) Function_Return "CSIDL_PLAYLISTS"
                    If (iWinFolderId=CSIDL_RESOURCES) Function_Return "CSIDL_RESOURCES"
                    If (iWinFolderId=CSIDL_SAMPLE_MUSIC) Function_Return "CSIDL_SAMPLE_MUSIC"
                    If (iWinFolderId=CSIDL_SAMPLE_PLAYLISTS) Function_Return "CSIDL_SAMPLE_PLAYLISTS"
                    If (iWinFolderId=CSIDL_SAMPLE_PICTURES) Function_Return "CSIDL_SAMPLE_PICTURES"
                    If (iWinFolderId=CSIDL_SAMPLE_VIDEOS) Function_Return "CSIDL_SAMPLE_VIDEOS"
                    Function_Return ""
                End_Function
        
                Procedure AddFolder Integer iWinFolderId
                    Send Add_Item MSG_NONE (WinFolderName(Self,iWinFolderId))
                    Send Add_Item MSG_NONE (WinFolderPath(oFileFunctions,iWinFolderId))
                End_Procedure
        
                Procedure DoFillGrid
                    Integer iFolderId
                    Set Dynamic_Update_State to False
                    Send delete_data                                                                                                             
                    Send AddFolder CSIDL_ADMINTOOLS              
                    Send AddFolder CSIDL_ALTSTARTUP             
                    Send AddFolder CSIDL_APPDATA                
                    Send AddFolder CSIDL_BITBUCKET              
                    Send AddFolder CSIDL_COMMON_ADMINTOOLS      
                    Send AddFolder CSIDL_COMMON_ALTSTARTUP      
                    Send AddFolder CSIDL_COMMON_APPDATA         
                    Send AddFolder CSIDL_COMMON_DESKTOPDIRECTORY
                    Send AddFolder CSIDL_COMMON_DOCUMENTS       
                    Send AddFolder CSIDL_COMMON_FAVORITES       
                    Send AddFolder CSIDL_COMMON_PROGRAMS        
                    Send AddFolder CSIDL_COMMON_STARTMENU       
                    Send AddFolder CSIDL_COMMON_STARTUP         
                    Send AddFolder CSIDL_COMMON_TEMPLATES       
                    Send AddFolder CSIDL_CONTROLS               
                    Send AddFolder CSIDL_COOKIES                
                    Send AddFolder CSIDL_DESKTOP                
                    Send AddFolder CSIDL_DESKTOPDIRECTORY       
                    Send AddFolder CSIDL_DRIVES                 
                    Send AddFolder CSIDL_FAVORITES              
                    Send AddFolder CSIDL_FONTS                  
                    Send AddFolder CSIDL_HISTORY                
                    Send AddFolder CSIDL_INTERNET               
                    Send AddFolder CSIDL_INTERNET_CACHE         
                    Send AddFolder CSIDL_LOCAL_APPDATA          
                    Send AddFolder CSIDL_MYPICTURES             
                    Send AddFolder CSIDL_NETHOOD                
                    Send AddFolder CSIDL_NETWORK                
                    Send AddFolder CSIDL_PERSONAL               
                    Send AddFolder CSIDL_PRINTERS               
                    Send AddFolder CSIDL_PRINTHOOD              
                    Send AddFolder CSIDL_PROFILE                
                    Send AddFolder CSIDL_PROGRAM_FILES          
                    Send AddFolder CSIDL_PROGRAM_FILES_COMMON   
                    Send AddFolder CSIDL_PROGRAM_FILES_COMMONX86
                    Send AddFolder CSIDL_PROGRAMS               
                    Send AddFolder CSIDL_RECENT                 
                    Send AddFolder CSIDL_SENDTO                 
                    Send AddFolder CSIDL_STARTMENU              
                    Send AddFolder CSIDL_STARTUP                
                    Send AddFolder CSIDL_SYSTEM                 
                    Send AddFolder CSIDL_SYSTEMX86              
                    Send AddFolder CSIDL_TEMPLATES              
                    Send AddFolder CSIDL_WINDOWS
                    Send AddFolder CSIDL_CDBURN_AREA     
                    Send AddFolder CSIDL_COMMON_MUSIC    
                    Send AddFolder CSIDL_COMMON_PICTURES 
                    Send AddFolder CSIDL_COMMON_VIDEO    
                    Send AddFolder CSIDL_COMPUTERSNEARME 
                    Send AddFolder CSIDL_CONNECTIONS     
                    Send AddFolder CSIDL_MYDOCUMENTS     
                    Send AddFolder CSIDL_MYMUSIC         
                    Send AddFolder CSIDL_MYVIDEO         
                    Send AddFolder CSIDL_PHOTOALBUMS     
                    Send AddFolder CSIDL_PLAYLISTS       
                    Send AddFolder CSIDL_RESOURCES       
                    Send AddFolder CSIDL_SAMPLE_MUSIC    
                    Send AddFolder CSIDL_SAMPLE_PLAYLISTS
                    Send AddFolder CSIDL_SAMPLE_PICTURES 
                    Send AddFolder CSIDL_SAMPLE_VIDEOS   
                    Send SetEntryState of oGridFunctions Self False
                    Set Dynamic_Update_State to True
                End_Procedure // DoFillGrid
                
                Function CurrentFolder Returns String
                    Integer iBase
                    String sRval
                    If (Item_Count(Self)) Begin
                        Get BaseItem of oGridFunctions Self to iBase
                        Get value (iBase+1) to sRval
                    End
                    Else Move "" to sRval
                    Function_Return sRval
                End_Function
                Procedure ExploreCurrentFolder
                    String sFolder
                    Get CurrentFolder to sFolder
                    If (sFolder<>"") begin
                        Send ExploreFolder of oFileFunctions sFolder
                    End
                End_Procedure
                Procedure CmdCurrentFolder
                    String sFolder
                    Get CurrentFolder to sFolder
                    If (sFolder<>"") begin
                        Send ShellCommandLine of oFileFunctions sFolder
                    End
                End_Procedure
                
                On_Key kEnter Send ExploreCurrentFolder
                Procedure Mouse_Click Integer iWindowNumber Integer iPosition
                    Send ExploreCurrentFolder
                End_Procedure
            End_Object
            
            Object oUpdateGridBtn is a Button
                Set Size to 14 60
                Set Location to 208 312
                Set Label to "Get folders"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send DoFillGrid of oFolderGrid
                End_Procedure // OnClick
            End_Object
            
            Object oExplBtn is a Button
                Set Size to 14 60
                Set Location to 208 378
                Set Label to "Explore folder"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send ExploreCurrentFolder of oFolderGrid
                End_Procedure            
            End_Object
            
            Object oCommandLineBtn is a Button
                Set Size to 14 60
                Set Location to 208 444
                Set Label to "Command line"
                Set peAnchors to anBottomRight
                Procedure OnClick
                    Send CmdCurrentFolder of oFolderGrid
                End_Procedure            
            End_Object
        End_Object

        Object oTabPage4 is a TabPage
            Set Label to "Read folder"

            Object oCurrentFolder is a Form
                Set Size to 14 285
                Set Location to 4 67
                Set Label to "Current folder:"
                Set Label_Col_Offset to 50
                Set Enabled_State to False
                Set peAnchors to anTopLeftRight
            End_Object

            Object oFolderGrid is a cFileDataGrid
                Set Location to 21 10
                Set Size to 203 500
                Procedure OnFolderDisplay String sFolder
                    Set Value of oCurrentFolder to sFolder
                End_Procedure
            End_Object

            Object oUpdateGridBtnFolder is a Button
                Set Location to 4 363
                Set Label to "Select folder"
                Set peAnchors to anTopRight
                Procedure OnClick
                    String sFolder
                    Get BrowseFolder of oFileFunctions "Read content of" "" to sFolder
                    If (sFolder<>"") Begin
                        Send FillGridFromFolder of oFolderGrid sFolder
                    End
                End_Procedure // OnClick
            End_Object
            
            Object oUpdateGridBtnArray is a Button
                Set Size to 14 89
                Set Location to 4 421
                Set Label to "Select folder (array)"
                Set peAnchors to anTopRight
                Procedure OnClick
                    tFileData[] aFileData
                    String sFolder
                    Get BrowseFolder of oFileFunctions "Read content of" "" to sFolder
                    If (sFolder<>"") Begin
                        Send ReadFolderRecursive of oFileFunctions sFolder "*" (&aFileData) 0 2
                        Send FillGridFromArray of oFolderGrid aFileData
                        Send Info_Box "OBS! Folder data has been read into an array structure and it is this structure that is being displayed. To avoid potentially reading the whole disk, a maximum subfolder level of 2 has been applied" "Notification"
                    End
                End_Procedure // OnClick
            End_Object

            Object oTextBox1 is a TextBox
                Set Size to 10 50    
                Set Location to 225 12
                Set Label to 'The main purpose is demonstrating the reliability of the calls to the oFileFunctions object. Although the cFileDataGrid class can be used for other projects.'
                Set peAnchors to anBottomLeft
            End_Object

        End_Object

If (Lowercase(LicenseName(oVdfRuntimeFunctions)) contains "sture") Begin
        Object oTabPage5 is a TabPage
            Set Label to "Create/delete folder"

            Object oCurrentFolder is a Form
                Set Size to 13 322
                Set Location to 27 87
                Set Label to "Test root folder"
                Set Enabled_State to False
            End_Object
            Object oSubFolder is a Form
                Set Size to 13 270
                Set Location to 45 87
                Set Label to "Subfolder"
                Set Value to "Subfolder1\Subfolder2"
            End_Object

            Object oCreateBtn is a Button
                Set Location to 44 361
                Set Label to "Create folder"
                Procedure OnClick
                    Boolean bSuccess
                    Get CreateFolderMultiLevel of oFileFunctions (Value(oCurrentFolder)) (Value(oSubFolder)) to bSuccess
                    Send Info_Box (If(bSuccess,"Success","Failure")) "Create folder result"
                    Send RefreshGrid of oFolderGrid
                End_Procedure
            End_Object

            Object oDeleteBtn is a Button
                Set Location to 44 414
                Set Label to "Delete folder"
                Procedure OnClick
                    Boolean bSuccess
                    String sFolder
                    Get AppendPath of oFileFunctions (Value(oCurrentFolder)) (Value(oSubFolder)) to sFolder
                    Get DeleteFolderNew of oFileFunctions sFolder to bSuccess
                    Send Info_Box (If(bSuccess,"Success","Failure")) "Delete folder result"
                    Send RefreshGrid of oFolderGrid
                End_Procedure
            End_Object

            Object oUpdateGridBtn is a Button
                Set Location to 26 413
                Set Label to "Select folder"
                Set peAnchors to anTopRight
                Procedure OnClick
                    String sFolder
                    
                    Get BrowseFolder of oFileFunctions "Read content of" "" to sFolder
                    If (sFolder<>"") Begin
                        Send FillGridFromFolder of oFolderGrid sFolder
                    End
                End_Procedure // OnClick
                
            End_Object

            Object oFolderGrid is a cFileDataGrid
                Set Location to 75 6
                Set Size to 137 514
                Procedure OnFolderDisplay String sFolder
                    Set Value of oCurrentFolder to sFolder
                End_Procedure
            End_Object

        End_Object // oTabPage5
End
    End_Object
End_Object
