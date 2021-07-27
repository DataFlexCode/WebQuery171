/*
After the DOM is initialized we execute the method containing the debugbuffer functionality. By 
wrapping it in a single method it has no footprint so no conflicts will occur. It generates its 
own HTML and when activated it will set a timeout that shows the buffer values per form.
*/
df.dom.ready(function(){
    var eMainDiv, eContentDiv, bDebugEnabled = false, eCss;
    
    eCss = df.dom.createCSSElem("DfEngine/debugbuffer.css");
    document.getElementsByTagName("head")[0].appendChild(eCss);
    
    //  Create elements
    eMainDiv = document.createElement("div");
    eMainDiv.id = "debugBuffer";
    eMainDiv.innerHTML = '<div id="debugToggle">Show</div><div id="bufferwindow" style="display: none;">asdas</div>';
    document.body.appendChild(eMainDiv);
    
    eContentDiv = document.getElementById('bufferwindow');
    aHtml = [];
    
    //  Update the displayed table
    function displayBufferValues(){
        aHtml = ['<table class="debugTable">'];
        
        visitControls(oWebApp, 0);
        if(oWebApp._oCurrentView){
            visitControls(oWebApp._oCurrentView, 1);
        }
        
        aHtml.push('</table>');
        eContentDiv.innerHTML = aHtml.join("");
        
        
        //  Set timeout for the next update
        if(bDebugEnabled){
            setTimeout(displayBufferValues, 1500);
        }
    }
    
    
    function visitControls(oControl, iLevel){
        var i;
        
        if(oControl instanceof df.WebBaseDEO || oControl instanceof df.WebList){
            aHtml.push('<tr><td>');
            
            //  Indent
            for(i = 0; i < iLevel; i++){
                aHtml.push('&nbsp;&nbsp;');
            }
            
            aHtml.push(oControl._sName, '</td><td>', df.sys.ref.getConstructorName(oControl), '</td>');
            
            if(oControl instanceof df.WebBaseDEO){
                aHtml.push('<td>', oControl.get('pbChanged'), '</td><td style="width: 100px; overflow: hidden; white-space:nowrap;">', oControl.get('psValue'), '</td>');
            }else{
                aHtml.push('<td>&nbsp;</td><td style="width: 100px; overflow: hidden; white-space:nowrap;">&nbsp;</td>');
            }
            
            aHtml.push('</tr>');
        }
        
        
        
        iLevel++;
        for(i = 0; i < oControl._aChildren.length; i++){
            visitControls(oControl._aChildren[i], iLevel);
        }
    }
    
    //  Toggle on or of
    function toggleDebugWindow(){
        if(bDebugEnabled){
            eMainDiv.className = "";
            eContentDiv.style.display = "none";
            bDebugEnabled = false;
            df.dom.setText(document.getElementById("debugToggle"), "Show");
        }else{
            eMainDiv.className = "visible";
            eContentDiv.style.display = "";
            bDebugEnabled = true;
            df.dom.setText(document.getElementById("debugToggle"), "Hide");
            displayBufferValues();
        }
    }
    
    df.events.addDomListener("click", document.getElementById('debugToggle'), toggleDebugWindow);
});

