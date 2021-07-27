Use Windows.pkg
Use DFClient.pkg
Use VdfRuntime.pkg
Use dfTreeVw.pkg
Use Win\GridFunctions.pkg
Use FileFunctions.pkg

Deferred_View Activate_oVdfRuntime for ;
Object oVdfRuntime is a dbView

    Set Border_Style to Border_Thick
    Set Size to 307 478
    Set Location to 4 1
    Set piMinSize to 233 401
    Set Maximize_Icon to True
    Set Label to "List Runtimes and Web Applications (VdfRuntime.pkg)"
    
    Object oListRuntimes is a List
        Set Size to 122 112
        Set Location to 25 9
    
        Procedure DoFillList
            Integer iMax iIndex
            
            Send Delete_Data
            Move (SizeOfArray(gaRuntimes)-1) to iMax
            For iIndex from 0 to iMax
                Send Add_Item MSG_NONE gaRuntimes[iIndex].sVdfVersion
                Set Aux_Value iIndex to iIndex
            Loop
            Send OnChange
        End_Procedure
    
    
        Procedure OnChange
            Integer iCurrent
            Get Current_Item to iCurrent // item number of current item
            Send DoFillGrid of oGridRuntimes (Aux_Value(Self,iCurrent))
        End_Procedure
    
    End_Object
    
    Object oGridRuntimes is a Grid
        Set Location to 25 132
    
        Set Size to 123 337
    
        Set Line_Width to 2 0
    
        Set Form_Width 0 to 73
        Set Header_Label 0 to "Parameter"
    
        Set Form_Width 1 to 253
        Set Header_Label 1 to "Value"
        Set peAnchors to anTopLeftRight
        Set Select_Mode to No_Select
        
            Procedure _AddRow String sName String sValue
                Send Add_Item MSG_None sName
                Send Add_Item MSG_None sValue
            End_Procedure
        
        Procedure DoFillGrid Integer iRuntimeIndex
            Set Dynamic_Update_State to False
            Send Delete_Data
            
            Send _AddRow "VDF version"        gaRuntimes[iRuntimeIndex].sVdfVersion
            Send _AddRow "Root folder"        gaRuntimes[iRuntimeIndex].sRootFolder
            Send _AddRow "Default path"       gaRuntimes[iRuntimeIndex].sDfPath
            Send _AddRow "Registry key"       gaRuntimes[iRuntimeIndex].sRegistryKey
            Send _AddRow "Collate sequence"   gaRuntimes[iRuntimeIndex].sCollateLanguage
            Send _AddRow ""                   "--- Webapp server parameters ---"
            Send _AddRow "EnableSlaveNode"    gaRuntimes[iRuntimeIndex].WAS_bEnableSlaveNode   
            Send _AddRow "GracefulTerminate"  gaRuntimes[iRuntimeIndex].WAS_iGracefulTerminate 
            Send _AddRow "Listen"             gaRuntimes[iRuntimeIndex].WAS_iListen            
            Send _AddRow "MaxSessions"        gaRuntimes[iRuntimeIndex].WAS_iMaxSessions       
            Send _AddRow "MessageTimeout"     gaRuntimes[iRuntimeIndex].WAS_iMessageTimeout    
            Send _AddRow "Product Class"      gaRuntimes[iRuntimeIndex].WAS_sProductClass      
            Send _AddRow "RefreshInterval"    gaRuntimes[iRuntimeIndex].WAS_iRefreshInterval   
            Send _AddRow "Registration Code"  gaRuntimes[iRuntimeIndex].WAS_sRegCode           
            Send _AddRow "Registration Name"  gaRuntimes[iRuntimeIndex].WAS_sRegName           
            Send _AddRow "Serial Number"      gaRuntimes[iRuntimeIndex].WAS_sRegNumber         
            Send _AddRow "Users"              gaRuntimes[iRuntimeIndex].WAS_sUsers             
            Send _AddRow "TransactionTimeout" gaRuntimes[iRuntimeIndex].WAS_iTransactionTimeout

            Send SetEntryState of oGridFunctions Self False 
            Set Dynamic_Update_State to True
        End_Procedure
            
    End_Object

    Object oListWebApps is a List
        Set Size to 122 112
        Set Location to 170 9
        Set peAnchors to anTopBottomLeft
    
        Procedure DoFillList
            Integer iMax iIndex
            String sLabel
            Send Delete_Data
            Move (SizeOfArray(gaWebApplications)-1) to iMax
            For iIndex from 0 to iMax
                Move gaWebApplications[iIndex].sName to sLabel
                Move (sLabel+" (") to sLabel
                Move (sLabel+gaRuntimes[gaWebApplications[iIndex].iRuntimeIndex].sVdfVersion) to sLabel
                Move (sLabel+")") to sLabel
                Send Add_Item MSG_NONE sLabel
                Set Aux_Value iIndex to iIndex
            Loop
            Send OnChange
        End_Procedure
        
        Procedure OnChange
            Integer iCurrent
            Get Current_Item to iCurrent // item number of current item
            Send DoFillgrid of oGridWebApps (Aux_Value(Self,iCurrent))
        End_Procedure
        
        Function CurrentWebAppIndex Returns Integer
            Integer iWebAppIndex
            If (Item_Count(Self)>0) Begin
                Get Aux_Value (Current_Item(Self)) to iWebAppIndex
                Function_Return iWebAppIndex
            End
            Function_Return -1
        End_Function
    
    End_Object

    Object oGridWebApps is a Grid
    
        Set Size to 102 337
        Set Location to 170 132
    
        Set Line_Width to 2 0
    
        Set Form_Width 0 to 73
        Set Header_Label 0 to "Parameter"
    
        Set Form_Width 1 to 252
        Set Header_Label 1 to "Value"
        Set peAnchors to anAll
        Set Select_Mode to No_Select
        
            Procedure _AddRow String sName String sValue
                Send Add_Item MSG_None sName
                Send Add_Item MSG_None sValue
            End_Procedure
        
        Procedure DoFillGrid Integer iWebAppIndex
            tVdfRuntime[] aRuntimes
            
            Set Dynamic_Update_State to False
            Send Delete_Data
            Send RereadWebApplication of oVdfRuntimeFunctions iWebAppIndex
            
            Send _AddRow "VdfVer"            gaWebApplications[iWebAppIndex].sVdfVersion
            Send _AddRow "Name"              gaWebApplications[iWebAppIndex].sName
            Send _AddRow "Disable"           gaWebApplications[iWebAppIndex].bDisable
            Send _AddRow "Registry key"      gaWebApplications[iWebAppIndex].sRegistryKey
            Send _AddRow "LogAccess"         gaWebApplications[iWebAppIndex].bLogAccess        
            Send _AddRow "LogFile"           gaWebApplications[iWebAppIndex].sLogFile          
            Send _AddRow "MaxLogEntries"     gaWebApplications[iWebAppIndex].iMaxLogEntries    
            Send _AddRow "MinPool"           gaWebApplications[iWebAppIndex].iMinPool          
            Send _AddRow "MaxPool"           gaWebApplications[iWebAppIndex].iMaxPool          
            Send _AddRow "OperationMode"     gaWebApplications[iWebAppIndex].sOperationMode    
            Send _AddRow "ProgramParameters" gaWebApplications[iWebAppIndex].sProgramParameters
            Send _AddRow "ProgramPath"       gaWebApplications[iWebAppIndex].sProgramPath                   
            Send _AddRow "PurgePoolInterval" gaWebApplications[iWebAppIndex].iPurgePoolInterval
            Send _AddRow "UseConnectorPool"  gaWebApplications[iWebAppIndex].bUseConnectorPool 
            Send _AddRow "Data path"         gaWebApplications[iWebAppIndex].sDataPath

            Send SetEntryState of oGridFunctions Self False 
            Set Dynamic_Update_State to True
            Send ShadeButtons gaWebApplications[iWebAppIndex].bDisable
        End_Procedure
        
    End_Object

    Object oStartBtn is a Button
        Set Location to 277 218
        Set Label to "Start"
        Set peAnchors to anBottomLeft
        Set Enabled_State to False
        Procedure OnClick
            Integer iWebAppIndex
            tVdfWebApplication stWebApp
            Get CurrentWebAppIndex of oListWebApps to iWebAppIndex 
            Get WebApplication of oVdfRuntimeFunctions iWebAppIndex to stWebApp
            If (stWebApp.bDisable) Begin
                Set WebAppRunState of oVdfRuntimeFunctions iWebAppIndex to True
            End
            Else Begin
                Error 831 "Web application already running"
            End
            Send DoFillGrid of oGridWebApps iWebAppIndex
        End_Procedure
    End_Object

    Object oStopBtn is a Button
        Set Location to 277 166
        Set Label to "Stop"
        Set peAnchors to anBottomLeft
        Set Enabled_State to False
        Procedure OnClick
            Integer iWebAppIndex
            tVdfWebApplication stWebApp
            Get CurrentWebAppIndex of oListWebApps to iWebAppIndex 
            Get WebApplication of oVdfRuntimeFunctions iWebAppIndex to stWebApp
            If (not(stWebApp.bDisable)) Begin
                Set WebAppRunState of oVdfRuntimeFunctions iWebAppIndex to False
            End
            Else Begin
                Error 832 "Web application already stopped"
            End
            Send DoFillGrid of oGridWebApps iWebAppIndex
        End_Procedure
    End_Object
    
    Procedure ShadeButtons Integer iDisabled
        Set Enabled_State of oStartBtn to (iDisabled=1)
        Set Enabled_State of oStopBtn to (iDisabled=0)        
    End_Procedure
    
    Object oDetectBtn is a Button
        Set Size to 14 79
        Set Location to 277 391
        Set Label to "Reread from registry "
        Set peAnchors to anBottomRight
        Procedure OnClick
            Send RereadWebApplications of oVdfRuntimeFunctions
            Send Refill
        End_Procedure
    End_Object

//    Object oTestBtn2 is a Button
//        Set Location to 277 376
//        Set Label to "Test"
//        Set peAnchors to anBottomLeft
//    
//        // fires when the button is clicked
//        Procedure OnClick
//            Integer iMax iIndex
//            String sUsrFolder
//            Move (SizeOfArray(gaRuntimes)-1) to iMax
//            For iIndex from 0 to iMax
//                tFileData[] aFileData
//                Get AppendPath of oFileFunctions gaRuntimes[iIndex].sRootFolder "Usr" to sUsrFolder
//                Send ReadFolderRecursive of oFileFunctions sUsrFolder "*" (&aFileData) 1 999
//            Loop
//        End_Procedure
//    
//    End_Object

    Object oTextBox1 is a TextBox
        Set Size to 9 111
        Set Location to 8 8
        Set Label to 'Runtimes installed on this computer'
        Set FontWeight to fw_Bold
        Set FontPointHeight to 12
    End_Object

    Object oTextBox2 is a TextBox
        Set Size to 9 109
        Set Location to 156 10
        Set Label to 'Webapps running on this computer'
        Set FontWeight to fw_Bold
        Set FontPointHeight to 12
    End_Object

    Object oTextBox3 is a TextBox
        Set Size to 10 32
        Set Location to 293 116
        Set Label to "Program needs to be run 'as administrator' to actually start and stop the selected webapp"
        Set peAnchors to anBottomLeft
    End_Object

    Procedure Refill
        Send DoFillList of oListRuntimes // message must be sent to fill the list
        Send DoFillList of oListWebApps // message must be sent to fill the list
    End_Procedure
    Send Refill

Cd_End_Object
