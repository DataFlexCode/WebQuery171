/*
Class:
    df.WebBaseFileUpload
Extends:
    df.WebBaseControl

This class contains the core implementation of file upload using HTML5 with a fallback to HTML4. Its 
subclasses provide the different UI and API options that can be used by the developer. This class 
contains the implementation of the progress dialog (that can be turned on / off using pbShowDialog) 
which can be overridden by implementing the different display… methods. The class supports 
multi-file uploads for HTML5 browsers and drag & drop support. The drag & drop support works using 
the global namespace df.dragdrop that is implemented in this file. If further drag & drop support 
will be implemented within the framework this namespace will need to be expanded and moved to a 
generic library file.
    
Revision:
    2012/12/18  (HW, DAW) 
        Initial version.
    2013/09/10  (HW, DAW)
        Refactored from WebFileUploader into WebBaseFileUpload with WebFileUploadForm and 
        WebFileUploadButton sub-classes.
*/



/*  
The dragdrop library provides a generic implementation to support drag and drop. It currently only 
supports dropping and has a pretty generic interface. Controls can add themselves as drop handlers 
using df.dragdrop.addHandler and remove themselves using df.dragdrop.remHandler. If something is 
dragged onto the screen the getDropDetails method is called on the control. The control should 
return an object with drop details in the following format:
{
    sDropContent : "",          //  Text displayed inside the dropzone
    sDropClass : "",            //  Extra CSS Classname for the dropzone
    oRect : BoundingClientRect  //  Bounding Rectangle to position the dropzone
}

If null is returned the control is ignored and will not get a drop zone. For all other handler 
controls a dropzone is displayed. If the user drops on one of these dropzones the handleDrop method 
is called on the control.
*/
df.dragdrop = {
    _aHandlers : [],
    _bInDrag : false,
    
    onDragEnter : function(oEvent){
        var eMask, eMaskWrp, oDropDetails, i, aZones = [], eZone, tHideTimeout = null;
        
        if(this._bInDrag){
            return;
        }
        this._bInDrag = true;
        
        //  Generate overall dragmask
        eMaskWrp = df.dom.create('<div class="WebDropMask"><div class="WebDropMask_Mask"></div></div>');
        document.body.appendChild(eMaskWrp);
        eMask = eMaskWrp.firstChild;
        
        //  Generate dropzones
        for(i = 0; i < this._aHandlers.length; i++){
            oDropDetails = this._aHandlers[i].getDropDetails();
            
            if(oDropDetails){
                oDropDetails.oObj = this._aHandlers[i];
                oDropDetails.eZone = eZone = df.dom.create('<div class="WebDropZone ' + oDropDetails.sDropClass + '"><div>' + oDropDetails.sDropContent + '</div></div>');
                eZone.style.width = oDropDetails.oRect.width + "px";
                eZone.style.height = oDropDetails.oRect.height + "px";
                eZone.style.left = oDropDetails.oRect.left + "px";
                eZone.style.top = oDropDetails.oRect.top + "px";
                aZones.push(oDropDetails);
                
                eMaskWrp.appendChild(eZone);
            }
        }
        
        //  Called to finish the drop (dragged of screen / dropped)
        function dragStop(){
            var i;
            
            this._bInDrag = false;
            
            //  Remove & destroy drop zones
            for(i = 0; i < aZones.length; i++){
                aZones[i].eZone.parentNode.removeChild(aZones[i].eZone);
                aZones[i].eZone = null;
            }
            aZones = null;
        
            //  Remove handlers
            df.events.removeDomListener("dragleave", eMaskWrp, onDragLeave);
            df.events.removeDomListener("dragenter", eMaskWrp, onDragOver);
            df.events.removeDomListener("dragover", eMaskWrp, onDragOver);
            df.events.removeDomListener("drop", eMaskWrp, onDragDrop);
        
            eMaskWrp.parentNode.removeChild(eMaskWrp);
            eMask = null;
            eMaskWrp = null;
        }
        
        //  Called when the cursor moves while dragging, updates the cursor and clears the hide timeout
        function onDragOver(oEvent){
            var eElem = oEvent.getTarget();
            
            if(eElem !== eMask){
                oEvent.e.dataTransfer.dropEffect = "copy";
            }else{
                oEvent.e.dataTransfer.dropEffect = "none";
            }
        
            oEvent.stop();
            
            if(tHideTimeout){
                clearTimeout(tHideTimeout);
                tHideTimeout = null;
            }
        }
        
        //  Called when the cursor leaves an element while dragging. Sets a timeout to stop the drag.
        function onDragLeave(oEvent){
            var that = this;
            
            oEvent.stop();
            
            if(tHideTimeout){
                clearTimeout(tHideTimeout);
                tHideTimeout = null;
            }
            tHideTimeout = setTimeout(function(){            
                dragStop.call(that);
            }, 200);
        }
        
        //  Called when the drop is made. Figures out the drop zone and calls the handleDrop function.
        function onDragDrop(oEvent){
            var i, eElem = oEvent.getTarget();
            
            oEvent.stop();
            
            //  Search for dropzope element
            while(eElem.className.indexOf("WebDropZone") < 0 && eElem && eElem !== eMaskWrp){
                eElem = eElem.parentNode;
            }
            
            //  Notify drop receiver
            if(eElem){
                for(i = 0; i < aZones.length; i++){
                    if(aZones[i].eZone === eElem){
                        aZones[i].oObj.handleDrop(oEvent);
                        break;
                    }
                }
            }
            
            //  Stop drag display
            dragStop.call(this);
            
        }
        df.events.addDomListener("dragleave", eMaskWrp, onDragLeave, this);
        df.events.addDomListener("dragenter", eMaskWrp, onDragOver, this);
        df.events.addDomListener("dragover", eMaskWrp, onDragOver, this);
        df.events.addDomListener("drop", eMaskWrp, onDragDrop, this);
        oEvent.e.dataTransfer.dropEffect = "none";
    },
    
    addHandler : function(oObj){
        this._aHandlers.push(oObj);
    },
    
    remHandler : function(oObj){
        var i;
        
        for(i = 0; i < this._aHandlers.length; i++){
            if(this._aHandlers[i] === oObj){
                this._aHandlers.splice(i, 1);
                i--;
            }
        }
    }

};

df.dom.ready(function(){
    df.events.addDomListener("dragenter", document.body, df.dragdrop.onDragEnter, df.dragdrop);
});




df.WebBaseFileUpload = function WebBaseFileUpload(sName, oParent){
    df.WebBaseFileUpload.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbMultiFile", false);
    this.prop(df.tBool, "pbAutoStart", true);
    this.prop(df.tBool, "pbAllowCancel", true);
    this.prop(df.tBool, "pbNotifyIndividualFile", false);
    this.prop(df.tBool, "pbShowDialog", true);
    
    this.prop(df.tString, "psDragAreaObj", "");
    
    this._bHTML5 = (window.File && window.FileList && window.FileReader);
    
    this._oDragArea = null;
    this._eDragArea = null;
    
    this._oDialog = null;
    this._oTotalPrg = null;
    this._oFilePrg = null;
    this._oRemLbl = null;
    this._oFileLbl = null;
    
    this._bCanceled = false;
    
    this.event("OnUploadFinished", df.cCallModeWait);
};
df.defineClass("df.WebBaseFileUpload", "df.WebBaseControl",{


fileHtml : function(aHtml){
    if(this._bHTML5){
        aHtml.push('<input type="file" name="', this._sName, '" id="', this._sControlId, '"', (this.pbMultiFile ? ' multiple' : ''), '>');
    }else{
        aHtml.push('<form>');
        aHtml.push('<input type="file" name="file" id="', this._sControlId, '">');
        aHtml.push('<input type="hidden" name="hash" value="">');
        aHtml.push('<input type="hidden" name="v" value="html4">');
        aHtml.push('</form>');
    }
},

afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "input");
    this._eForm = df.dom.query(this._eElem, "form");
    
    df.WebBaseFileUpload.base.afterRender.call(this);
    
    df.events.addDomListener("change", this._eControl, this.onFileChange, this);
},

afterShow : function(){
    df.WebBaseFileUpload.base.afterShow.call(this);
    
    df.dragdrop.addHandler(this);
},

afterHide : function(){
    df.WebBaseFileUpload.base.afterHide.call(this);
    
    df.dragdrop.remHandler(this);
},

getDropDetails : function(){
    var oDragObj, eDragElem, oWebApp = this.getWebApp();
    
    if(this.pbEnabled){
        oDragObj = oWebApp.findObj(this.psDragAreaObj);
        
        if(oDragObj instanceof df.WebBaseUIObject){
            if(oDragObj === oWebApp){
                eDragElem = this.getWebApp()._eViewPort || document.body;
            }else{
                eDragElem = oDragObj._eElem;
            }
            
            if(eDragElem){
                return {
                    sDropContent : "Drop files!",
                    sDropClass : "",
                    oRect : eDragElem.getBoundingClientRect()
                };
            }
        }
    }
    return null;
},

handleDrop : function(oEvent){
    var aFiles;
        
    aFiles = (oEvent.e.dataTransfer && oEvent.e.dataTransfer.files) || null;
    if(aFiles && aFiles.length > 0){
        oEvent.stop();
        this.initFiles(aFiles);
    }
},

onFileChange : function(oEvent){
    var sFileName; 
    
    if(this._bHTML5){
        //  Check if selected and get file from control
        if(this._eControl.files.length > 0){
            this.initFiles(this._eControl.files);
        }
    }else{
        //  Check if selected and get file name from control
        sFileName = this._eControl.value;
        if(sFileName){
            //  Get filename
            if(sFileName.lastIndexOf("\\") > 0){
                sFileName = sFileName.substr(sFileName.lastIndexOf("\\") + 1);
            }
            //this.selectFile(sFileName, 0, "");
            this.initFiles([{ name : sFileName, size : 0, type : "" }]);
        }
    }
    oEvent.stop();
},

initFiles : function(aFiles){
    var i;

    this._aFiles = [];
    
    //  Seed internal data structure
    for(i = 0; i < (this.pbMultiFile ? aFiles.length : 1); i++){
        this._aFiles.push({
            bFinished : false,
            sResourceId : null,
            oFile : aFiles[i]
        });
    }

    //  Start processing if needed
    if(this.pbAutoStart){
        this.startUpload();
    }
},

/*
@client-action
*/
startUpload : function(){
    var i, aRows = [], oCurrent;
    
    if(this._aFiles.length > 0){
        
        this._iTotal = 0;
        this._iLoaded = 0;
        
        for(i = 0; i < this._aFiles.length; i++){
            oCurrent = this._aFiles[i];
            
            aRows.push([ i, oCurrent.oFile.name, oCurrent.oFile.size, oCurrent.oFile.type ]);
            
            this._iTotal += oCurrent.oFile.size;
        }
        
        this.displayStartWorking();
        
        
        //  Send call to initialize upload
        this.serverAction("DoStartUpload", [ ],  df.sys.vt.serialize(aRows));
        
    }else{
        alert("Not ready!");
    }
},

/* 
@client-action
*/
processUpload : function(){
    var i, aRows = df.sys.vt.deserialize(this._tActionData, [[df.tString]]);
    
    //  Get resource id's out of action data
    for(i = 0; i < aRows.length; i++){
        if(aRows[i].length >= 2 && this._aFiles[aRows[i][0]]){
            this._aFiles[aRows[i][0]].sResourceId = aRows[i][1];
        }else{
            alert("Received invalid data!");
        }
    }
    
    //  Filter out cancelled files & init stats
    this._iTotal = 0;
    this._iLoaded = 0;
    for(i = 0; i < this._aFiles.length; i++){
        if(!this._aFiles[i].sResourceId){
            this._aFiles.splice(i, 1);
            i--;
        }else{
            this._iTotal += this._aFiles[i].oFile.size;
        }
    }
    
    if(this._aFiles.length > 0){
        this._bCanceled = false;
        
        if(this._bHTML5){
            this.uploadFilesHtml5();
        }else{
            this.uploadFileHtml4(this._aFiles[0]);
        }
    }else{
        alert("All files are cancelled!");
    }
},

displayStartWorking : function(){
    var oDialog, oMainPnl, oLbl, oFileLbl, oRemLbl, oSpacer, oTotalPrg, oFilePrg, oBtnPnl, oCancelBtn, oLabel;
    
    if(this.pbShowDialog){
        if(this._bHTML5){
            this._oDialog = oDialog = new df.WebModalDialog(null, this);
            oDialog.psCaption = "Uploading files...";
            oDialog.pbShowClose = this.pbAllowCancel;
            oDialog.piMinWidth = 500;
            oDialog.OnEscape.addListener(this.onCancel, this);
            
            oMainPnl = new df.WebPanel(null, oDialog);
            oMainPnl.peRegion = df.ciRegionCenter;
            oMainPnl.piColumnCount = 10;
            oDialog.addChild(oMainPnl);
            
            oLbl = new df.WebLabel(null, oMainPnl);
            oLbl.psCaption = "File:";
            oLbl.piColumnSpan = 2;
            oLbl.peAlign = df.ciAlignRight;
            oMainPnl.addChild(oLbl);
            
            this._oFileLbl = oFileLbl = new df.WebLabel(null, oMainPnl);
            oFileLbl.psCaption = "...";
            oFileLbl.piColumnSpan = 0;
            oFileLbl.piColumnIndex = 2;
            oMainPnl.addChild(oFileLbl);
            
            oLbl = new df.WebLabel(null, oMainPnl);
            oLbl.psCaption = "Remaining:";
            oLbl.piColumnSpan = 2;
            oLbl.peAlign = df.ciAlignRight;
            oMainPnl.addChild(oLbl);
            
            this._oRemLbl = oRemLbl = new df.WebLabel(null, oMainPnl);
            oRemLbl.psCaption = this._aFiles.length +  " files (" + df.sys.data.markupDataSize(this._iTotal) + ")";
            oRemLbl.piColumnSpan = 0;
            oRemLbl.piColumnIndex = 2;
            oMainPnl.addChild(oRemLbl);
            
            oSpacer = new df.WebSpacer(null, oMainPnl);
            oMainPnl.addChild(oSpacer);
            
            if(this.pbMultiFile){
                this._oTotalPrg = oTotalPrg = new df.WebProgressBar(null, oMainPnl);
                oTotalPrg.piMaxValue = (this._iTotal > 0 ? this._iTotal : this._aFiles.length);
                oMainPnl.addChild(oTotalPrg);
            }
            
            this._oFilePrg = oFilePrg = new df.WebProgressBar(null, oMainPnl);
            oMainPnl.addChild(oFilePrg);
            
            if(this.pbAllowCancel){
                oBtnPnl = new df.WebPanel(null, oDialog);
                oBtnPnl.peRegion = df.ciRegionBottom;
                oBtnPnl.piColumnCount = 6;
                oDialog.addChild(oBtnPnl);
                
                this._oCancelButton = oCancelBtn = new df.WebButton(null, oBtnPnl);
                oCancelBtn.psCaption = "Cancel";
                oCancelBtn.piColumnIndex = 5;
                oCancelBtn.OnClick.addListener(this.onCancel, this);
                oBtnPnl.addChild(oCancelBtn);
            }
            
            oDialog.show();
                
            this.getWebApp().ready(function(){
                oDialog.resize();
                if(oCancelBtn){
                    oCancelBtn.focus();
                }
            });
        }else{
            this._oDialog = oDialog = new df.WebModalDialog(null, this);
            oDialog.psCaption = "";
            oDialog.pbResizable = false;
            oDialog.pbShowClose = this.pbAllowCancel;
            
            oDialog.OnEscape.addListener(this.onCancel, this);
            
            oLabel = new df.WebLabel(null, oDialog);
            oLabel.psCaption = "Uploading files...";
            oLabel.psCSSClass = "WebMsgBoxProgress";
            oDialog.addChild(oLabel);
            
            oDialog.show();
        }
    }
},

onCancel : function(oEvent){
    this.cancel();
},

displayProgress : function(iFile, iFiles, iFileLoaded, iFileTotal, iTotalLoaded, iTotal){
    var iRem, iBytesRem;
    
    if(this.pbShowDialog){
        this._oFileLbl.set("psCaption", this._aFiles[iFile].oFile.name);
        
        iRem = iFiles - (iFile + 1);
        iBytesRem = iTotal - iTotalLoaded;
        
        this._oRemLbl.set("psCaption", (iRem > 0 ? (iRem.toString() + " files (" + df.sys.data.markupDataSize(iBytesRem) + ")") : df.sys.data.markupDataSize(iBytesRem)));
        
        if(this.pbMultiFile){
            this._oTotalPrg.set("piMaxValue", iTotal);
            this._oTotalPrg.set("piValue", iTotalLoaded);
        }

        
        this._oFilePrg.set("piMaxValue", iFileTotal);
        this._oFilePrg.set("piValue", iFileLoaded);
    }
    
    //df.debug("iFile:" + iFile + ", iFiles:" + iFiles + ", iFileLoaded:" + iFileLoaded + ", iFileTotal:" + iFileTotal + ", iTotalLoaded:" + iTotalLoaded + ", iTotal:" + iTotal );
},

displayFinishWorking : function(){
    if(this.pbShowDialog){
        if(this._bHTML5){
            this._oFilePrg.set("piValue",  this._oFilePrg.get("piMaxValue"));
            
            if(this.pbMultiFile){
                this._oTotalPrg.set("piValue",  this._oTotalPrg.get("piMaxValue"));
            }
            this._oRemLbl.set("psCaption", "0 KB");
        }
    }
},

displayFinished : function(bSuccess){
    if(this.pbShowDialog && this._oDialog){
        this._oDialog.hide();
        this._oDialog.destroy();
        this._oDialog.OnEscape.removeListener(this.onCancel);
        this._oDialog = null;
        
        if(this._oCancelButton){
            this._oCancelButton.OnClick.removeListener(this.onCancelClick);
            this._oCancelButton = null;
        }
        if(this._bHTML5){
            this._oTotalPrg = null;
            this._oFilePrg = null;
            this._oRemLbl = null;
            this._oFileLbl = null;
        }
    }
},

cancel : function(){
    var i;
    
    this._bCanceled = true;
    
    if(this._bHTML5){
        this._aFiles = [];
        
        if(this._oRequest){
            this._oRequest.abort();
        }
        
        this.displayFinished(false);
    }else{
        //  Untested
        if(this._eIFrame){
            this._eIFrame.src = "";
        }
        
        this.displayFinished(false);
    }
},

uploadFilesHtml5 : function(){
    var i, bLast = true, oFile = null, iIndex;
    
    if(this._bCanceled){
        return;
    }
    
    //  Determine next file to upload and check if that is the last file
    for(i = 0; i < this._aFiles.length; i++){
        if(!this._aFiles[i].bFinished){
            if(!oFile){
                oFile = this._aFiles[i];
                iIndex = i;
            }else{
                bLast = false;
                break;
            }
        }
    }
    
    this.uploadFileHtml5(oFile, iIndex, function(bSuccess){
        var i;
        
        
        if(bSuccess){
            if(bLast){
                this.displayFinishWorking();
            }
            
            if(this.pbNotifyIndividualFile){
                this.serverAction("DoFileFinished", [ oFile.oFile.name, oFile.sResourceId ]);
            }else{
                if(bLast){
                    for(i = 0; i < this._aFiles.length; i++){
                        this.serverAction("DoFileFinished", [ this._aFiles[i].oFile.name, this._aFiles[i].sResourceId ]);
                    }
                }
            }
            
            if(bLast){
                this.fire("OnUploadFinished", [], function(oEvent){
                    this.displayFinished(true);
                });
            }else{
                this.uploadFilesHtml5();
            }
        }else{
            this.displayFinished(false);
        }
    });
},

uploadFileHtml5 : function(oFile, iFile, fFinished){
    var that = this, oReq, oData;
    
    this.displayProgress(iFile, this._aFiles.length, 0, oFile.oFile.size, this._iLoaded, this._iTotal);
    
    //  Prepare request
    this._oRequest = oReq = new XMLHttpRequest();
    
    oReq.upload.addEventListener('progress', function(ev){
        var iTotal = that._iLoaded + ev.loaded;
        
        iTotal = (iTotal < that._iTotal ? iTotal : that._iTotal);
        that.displayProgress(iFile, that._aFiles.length, ev.loaded, ev.total, iTotal, that._iTotal);
    }, false);
    
    oReq.onreadystatechange = function(ev){
        try{
            if(oReq.readyState === df.ajax.REQUEST_STATE_COMPLETE){
                if(!that._bCanceled){
                    if(oReq.status === 200){
                        if(oReq.responseText.indexOf("!completed!") >= 0){
                            oFile.bFinished = true;
                            that._iLoaded += oFile.oFile.size;
                            fFinished.call(that, true);
                        }else{
                            throw new df.Error(999, "Received error '{{0}}' while uploading file.", this, [ oReq.responseText ]);
                        }
                    }else{

                        //  Throw errorr
                        throw new df.Error(999, "Received HTTP error '{{0}} {{1}}' while uploading file.", this, [ oReq.status, oReq.statusText ],  oReq.responseText);
                    }
                }
                
                this._oRequest = null;
            }
        }catch(oErr){
            //  Fix control state..
            fFinished.call(that, false);
            
            //  Handle error
            that.getWebApp().handleError(oErr);
            
            this._oRequest = null;
        }
        
    };
    oReq.open('POST', this.psUploadUrl, true);
    
    oData = new FormData();
    oData.append('file', oFile.oFile);
    oData.append('hash', oFile.sResourceId);
    oData.append('v', 'html5');
    oReq.send(oData);
    
},

uploadFileHtml4 : function(oFile){
    var eForm = this._eForm, eIFrame, eDiv, fHandler, sName;
    
    if(this._eControl.value){
        sName = "vdf_webfileuploader_" + df.dom.piDomCounter++;
    
        
    
        //  Create elements
        eDiv = df.dom.create('<div style="position: absolute; top: 0px; background-color: #DDDDEE; overflow: hidden; width: 1px; height: 1px;"></div>'); //
        this._eElem.appendChild(eDiv);
        eDiv.innerHTML = '<iframe name="' + sName + '" style="width: 0; height: 0; border: none;"></iframe>'; // 
        this._eIFrame = eIFrame = eDiv.firstChild;
        
        fHandler = function(oEvent){
            var sResultStr = "";
            
            try{
                df.events.removeDomListener("load", eIFrame, fHandler);
                
                if(!this._bCanceled){
                    // Message from server...
                    try{
                        if(eIFrame.contentWindow){
                            sResultStr = eIFrame.contentWindow.document.body.innerHTML;
                        }else if(eIFrame.document){
                            sResultStr = eIFrame.document.body.innerHTML;
                        }else if(eIFrame.contentDocument){
                            sResultStr = eIFrame.contentDocument.body.innerHTML;
                        }
                    }catch(oErr){
                        
                    }
                    
                    // Parse response string
                    
                    
                    if(sResultStr.indexOf("!completed!") >= 0){
                        //this._eControl.value = "";
                        eForm.reset();
                        this.serverAction("DoFileFinished", [ oFile.oFile.name, oFile.sResourceId ]);
                        
                        this.fire("OnUploadFinished", [], function(oEvent){
                            this.displayFinished(true);
                        });
                    }else{
                        if(sResultStr && sResultStr.indexOf("<") >= 0){
                            throw new df.Error(999, "Received error from server while uploading file.", this, [ ], sResultStr);
                        }else if(sResultStr){
                            throw new df.Error(999, "Received error '{{0}}' while uploading file.", this, [ sResultStr ]);
                        }else{
                            throw new df.Error(999, "Unable to upload file.", this, [ sResultStr ]);
                        }
                    }
                }
            }catch(oErr){
                //  Fix control state..
                this.displayFinished(false);
                
                //  Handle error
                this.getWebApp().handleError(oErr);
            }
            
            this._eIFrame = null;
            
            setTimeout(function(){
                eIFrame.parentNode.removeChild(eIFrame);
            }, 1500);
        };
        df.events.addDomListener("load", eIFrame, fHandler, this);
        
        
        //  Add hash
        eForm.hash.value = oFile.sResourceId;
        
        // Set properties of form...
        eForm.setAttribute("target", sName);
        eForm.setAttribute("action", this.psUploadUrl);
        eForm.setAttribute("method", "post");
        eForm.setAttribute("enctype", "multipart/form-data");
        eForm.setAttribute("encoding", "multipart/form-data");
     
        // Submit the form...
        eForm.submit();
       
    }
}

});