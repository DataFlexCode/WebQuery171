/*
This file includes the DataFlex Engine by generating the include statements for both the JavaScript 
and CSS.

Revision:
    2012/07/16  (HW, DAW) 
        Initial version.
*/
var df = (function(){  
    var aScripts, sRoot = "", bMinified, bShowBuffer, sPreloadTheme, sIncludePath, sVersionId;
    
    //  Note: The following line is parsed and checked by the studio
    sVersionId = "18.0.1.20";
    
    //  Determine current include location
    aScripts = document.getElementsByTagName("script");
    sIncludePath = aScripts[aScripts.length - 1].src;
    if(sIncludePath.indexOf('DfEngine/df-include.js') > 0){
        sRoot = sIncludePath.substr(0, sIncludePath.indexOf('DfEngine/df-include.js'));
    }
    
    //  Determine include variables
    sRoot = (typeof(sDfRootPath) === "string" && sDfRootPath) || sRoot;   //  Path to include files relative to
    bMinified = !((typeof(bDfDebug) === "boolean" && bDfDebug) || document.location.href.toLowerCase().indexOf('dfdebug=true') > 0); //  Minified or full version
    bShowBuffer = ((typeof(bDfShowBuffer) === "boolean" && bDfShowBuffer) || document.location.href.toLowerCase().indexOf('dfshowbuffer=true') > 0); //  Include buffer debuggin tools
    sPreloadTheme = (typeof(sDfPreloadTheme) === "string" && sDfPreloadTheme) || null;  //  Preload a theme or not
        
    
    //  Include CSS (optionally preload a theme)
    document.write('<link href="' + sRoot + 'DfEngine/system.css" rel="stylesheet" type="text/css" />');
    if(sPreloadTheme){
        document.write('<link href="' + sRoot + 'CssThemes/' + sPreloadTheme + '/theme.css" rel="stylesheet" type="text/css" />');
        document.write('<link href="' + sRoot + 'CssStyle/application.css" rel="stylesheet" type="text/css" />');
    }


    //  Switch between full and minified
    if(bMinified){
        document.write('<script src="' + sRoot + 'DfEngine/df-min.js"></script>');
    }else{
        document.write('<script src="' + sRoot + 'DfEngine/df.js"></script>');

        document.write('<script src="' + sRoot + 'DfEngine/df/settings.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/events.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/dom.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/sys.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/sys/json.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/sys/vt.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/ajax/HttpRequest.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/ajax/JSONCall.js"></script>');

        // Helper classes
        document.write('<script src="' + sRoot + 'DfEngine/df/ServerAction.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/DatePicker.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/InfoBalloon.js"></script>');

        // Web Object classes
        document.write('<script src="' + sRoot + 'DfEngine/df/WebObject.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseUIObject.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseContainer.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseControl.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseDEO.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseForm.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebBaseFileUpload.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebPanel.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebApp.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebWindow.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebView.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebModalDialog.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebButton.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebLabel.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebForm.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebDateForm.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebCheckbox.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebEdit.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebCombo.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebList.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebGrid.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumn_mixin.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumn.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnCombo.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnCheckbox.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnDate.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnButton.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnImage.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebColumnLink.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebCommandBar.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebMenuBar.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebToolBar.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebMenuItem.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebCardContainer.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebCard.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebTabContainer.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebTabPage.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebDatePicker.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebTreeView.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebIFrame.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebImage.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebHtmlBox.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebRadio.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebSlider.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebSpacer.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebHorizontalLine.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebTimer.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebSuggestionForm.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebProgressBar.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebFileUploadButton.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebFileUploadForm.js"></script>');
        document.write('<script src="' + sRoot + 'DfEngine/df/WebGroup.js"></script>');
    }
    
    if(bShowBuffer){
        //  Debugging things
        document.write('<script src="' + sRoot + 'DfEngine/DebugBuffer.js"></script>');
    }
    
    return {
        psVersionId : sVersionId
    };
}());