
df.WebPanel = function WebPanel(sName, oParent){
    df.WebPanel.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "peRegion", 0);
    this.prop(df.tBool, "pbResizable", false);
    
    //@privates
    this._eDivider = null;
    
    //  Configure super classes
    
    this._bWrapDiv = true;
    this._sControlClass = "WebPanel";
};
df.defineClass("df.WebPanel", "df.WebBaseContainer",{

afterRender : function(){
    df.WebPanel.base.afterRender.call(this);
    
    this.set_pbResizable(this.pbResizable);
},

set_pbResizable : function(bVal){
    if(this._eElem){
        if(bVal && this.peRegion !== df.ciRegionCenter){
            //  Create divider if not there
            if(!this._eDivider){
                this._eDivider = df.dom.create('<div class="' + (this.peRegion === df.ciRegionLeft || this.peRegion === df.ciRegionRight ? 'WebPanel_DividerVertical' : 'WebPanel_DividerHorizontal') + '"></div>');
                this._eElem.appendChild(this._eDivider);
                df.events.addDomListener("mousedown", this._eDivider, this.onResize, this);
                
                if(this.peRegion === df.ciRegionLeft){
                    this._eDivider.style.right = "0px";
                }else if(this.peRegion === df.ciRegionRight){
                    this._eDivider.style.left = "0px";
                }else if(this.peRegion === df.ciRegionBottom){
                    this._eDivider.style.top = "0px";
                }else if(this.peRegion === df.ciRegionTop){
                    this._eDivider.style.bottom = "0px";
                }
            }
        
        }else{
            if(this._eDivider){
                df.events.removeDomListener("mousedown", this._eDivider, this.onResize);
                this._eElem.removeChild(this._eDivider);
                this._eDivider = null;
            }
        }
    }
},

onResize : function(oEvent){
    var eMask, eGhost, iCurLeft, iStartLeft, iMin = 0, iMax = 0, iCurTop, iStartTop, iStartMouseY, iStartMouseX;
    
    eGhost = df.dom.create('<div class="' + (this.peRegion === df.ciRegionLeft || this.peRegion === df.ciRegionRight ? 'WebPanel_DividerVertical_Ghost' : 'WebPanel_DividerHorizontal_Ghost') + '"></div>');
    
    eMask = eMask = df.gui.dragMask();
    
    if(this.peRegion === df.ciRegionTop || this.peRegion === df.ciRegionBottom){  //  Horizontal
        eMask.style.cursor = "n-resize";
        
        //  Determine start position
        if(this.peRegion === df.ciRegionTop){
            iCurTop = this._eElem.clientHeight;
            
            iMin = (this.piMinHeight > 2 ? this.piMinHeight : 2);
            iMax = iCurTop + this._oParent._eMainArea.clientHeight;
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinHeight > 0){
                iMax = iMax - this._oParent._oRegionCenter.piMinHeight;
            }
        }else{  //  Bottom
            iCurTop = this._oParent._eMainArea.clientHeight;
            if(this._oParent._eRegionTop){
                iCurTop += this._oParent._eRegionTop.clientHeight;
                
                iMin = this._oParent._eRegionTop.clientHeight;
            }
            
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinHeight > 0){
                iMin += this._oParent._oRegionCenter.piMinHeight;
            }
            iMax = iCurTop + this._eElem.clientHeight - (this.piMinHeight > 0 ? this.piMinHeight : 0) - 10;
        }
        
        //  Configure ghost slider
        eGhost.style.top = iCurTop + "px";
                
        this._oParent._eMainArea.parentNode.appendChild(eGhost);
    }else{ //   Vertical
        eMask.style.cursor = "e-resize";
        
        //  Determine start position
        if(this.peRegion === df.ciRegionLeft){
            iCurLeft = this._eElem.clientWidth;
            
            iMin = (this.piMinWidth > 2 ? this.piMinWidth : 2);
            
            iMax = iCurLeft + this._oParent._eRegionCenter.clientWidth;
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinWidth > 0){
                iMax = iMax - this._oParent._oRegionCenter.piMinWidth;
            }else{
                iMax = iMax - 4;
            }
        }else{  //  Right
            iCurLeft = this._oParent._eMainArea.clientWidth - this._eElem.clientWidth;
            
             if(this._oParent._eRegionLeft){
                iMin = this._oParent._eRegionLeft.clientWidth;
            }
            
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinWidth > 0){
                iMin += this._oParent._oRegionCenter.piMinWidth;
            }
            iMax = iCurLeft + this._eElem.clientWidth - (this.piMinWidth > 0 ? this.piMinWidth : 0) - 10;
        }
        
        //  Configure ghost divider
        eGhost.style.left = iCurLeft + "px";
                
        this._oParent._eMainArea.appendChild(eGhost);
        
    }
    
    iStartLeft = iCurLeft;
    iStartTop = iCurTop;
    iStartMouseX = oEvent.getMouseX();
    iStartMouseY = oEvent.getMouseY();
    
    function onResize(oEvent){
        
        if(this.peRegion === df.ciRegionTop || this.peRegion === df.ciRegionBottom){
            iCurTop = iStartTop - (iStartMouseY - oEvent.getMouseY());
            
            iCurTop = (iCurTop < iMax ? (iCurTop > iMin ? iCurTop : iMin) : iMax);
            eGhost.style.top = iCurTop + "px";
        }else{
            iCurLeft = iStartLeft - (iStartMouseX - oEvent.getMouseX());
            iCurLeft = (iCurLeft < iMax ? (iCurLeft > iMin ? iCurLeft : iMin) : iMax);
            
            eGhost.style.left = iCurLeft + "px";
        }        
    }
    
    function onStopResize(oEvent){
        df.events.removeDomListener("mouseup", eMask, onStopResize);
        df.events.removeDomListener("mouseup", window, onStopResize);
        df.events.removeDomListener("mousemove", eMask, onResize);

        eMask.parentNode.removeChild(eMask);
        if(eGhost){
            eGhost.parentNode.removeChild(eGhost);
        }
        
        if(this.peRegion === df.ciRegionTop){
            this.piHeight = iCurTop;
            this._eElem.style.height = this.piHeight + "px";
        }else if(this.peRegion === df.ciRegionBottom){
            this.piHeight = this._eElem.clientHeight + (iStartTop - iCurTop);
            this._eElem.style.height = this.piHeight + "px";
        }else if(this.peRegion === df.ciRegionLeft){
            this.piWidth = iCurLeft;
            this._eElem.style.width = this.piWidth + "px";
        }else if(this.peRegion === df.ciRegionRight){
            this.piWidth = this._eElem.clientWidth + (iStartLeft - iCurLeft);
            this._eElem.style.width = this.piWidth + "px";
        }
        
        
        this.sizeChanged();
    }
    
    df.events.addDomListener("mousemove", eMask, onResize, this);
    df.events.addDomListener("mouseup", window, onStopResize, this);
    df.events.addDomListener("mouseup", eMask, onStopResize, this);
    
	oEvent.stop();
}

});