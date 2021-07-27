<%
    Option Explicit
    
'   
'   This script is the default file streaming script of the Visual DataFlex Web Application 
'   framework. It works together with the oWebResourceManager which generates the download URL based 
'   on a local file path and some settings. The URL contains a hash key containing details needed by 
'   the oWebResourceManager to validate the download and return the local file path. This script 
'   will stream the file based on the path and extra settings (attach & fn).
'
'   Revision:
'       2012/12/18 (HW, DAW)
'           Created the initial version.
'
    
    Dim sSessionKey, sResource, sFilePath, sFileName, sDisplayFileName, sContentType, sStreamType
    Dim oFSO, oFile, oStream
    Dim i, iSize, iChunk
    Dim bIsIE
    Dim oWebResourceManager

    WebAppServerSession.PageScopedSession=True 

    Set oWebResourceManager = Server.CreateObject("WebAppServer.WebBusinessProcess.17.1")
    oWebResourceManager.Name = "oWebResourceManagerProxy"

    
    '   Determine if we want to show the 'save as' dialog (attachment) or show the file inside the browser window
    If (Request("attach") = "y") Then
        sStreamType = "attachment"
    Else
        sStreamType = "inline"
    End If
    
    
    '   Call webapp which will determine the file path
    sFilePath = oWebResourceManager.call("Get_FileDownload") 
    
    '   Throw error if nothing received
    If (sFilePath = "") Then
        Response.Status = "404 Invalid Resource"
        Response.End
    End If
    
    '   Determine if file exists
    Set oFSO = Server.CreateObject("Scripting.FileSystemObject")
    If (oFSO.FileExists(sFilePath)) Then
        Set oFile = oFSO.GetFile(sFilePath)
        
        If (Request("fn") <> "") Then
            sFileName = Request("fn")
        Else
            sFileName = oFile.Name
        End If
        
        '   Determine mime type based on file extension (guess)
        Select Case (LCase(Right(sFileName, 4)))
            Case ".png"
                sContentType = "image/png"
            Case ".jpg"
                sContentType = "image/jpeg"
            Case "jpeg"
                sContentType = "image/jpeg"
            Case ".gif"
                sContentType = "image/gif"
            Case ".tiff"
                sContentType = "image/tiff"
            Case ".bmp"
                sContentType = "image/bmp"
            Case ".svg"
                sContentType = "image/svg+xml"
            Case ".pdf"
                sContentType = "application/pdf"
            Case ".xml"
                sContentType = "application/xml"
            Case ".doc"
                sContentType = "application/msword"
            Case Else
                sContentType = "application/octet-stream"
        End Select    
	
        ' bIsIE = InStr( Request.ServerVariables("HTTP_USER_AGENT"),"MSIE")
        ' If bIsIE then
            'sFileName = Replace(sFileName," ","%20") 
        ' End If
    
    
        '   Open the stream and read the file
        Set oStream = Server.CreateObject("ADODB.Stream")
        oStream.Open
        oStream.Type = 1 ' Binary
        oStream.LoadFromFile sFilePath
        iSize = oStream.Size  
        
        '   Configure header
        Response.Buffer = true    
        Response.ContentType = sContentType 'oPublisher.call("Get_ContentType", iFileId)
        Response.AddHeader "Content-Disposition",  sStreamType & ";filename=""" & sFileName & """"
        Response.AddHeader "Content-Length", iSize
                
        '   Upload the file in chunck and check whether the browser is still contected
        iChunk = 1048576 '1MB
        For i = 1 To (iSize \ iChunk)
            If Not Response.IsClientConnected Then Exit For
            Response.BinaryWrite oStream.Read(iChunk)
            Response.Flush
        Next

        '   Upload the last bit op de stream
        If (iSize Mod iChunk) > 0 Then
            If Response.IsClientConnected Then
                Response.BinaryWrite oStream.Read(iSize Mod iChunk)
                Response.Flush
            End If
        End If
    
        '   Close the stream and clean up
        oStream.Close
        Set oStream = Nothing
        Set oFile = Nothing
        
        '   Tell the webapp that dowload is finished
        oWebResourceManager.call "Msg_FileDownloadFinished", sFilePath
    Else
        Response.Status = "404 File Not Found"
        Response.End
    End If
    
    Set oFSO = Nothing
    Set oWebResourceManager = Nothing
        
%>
