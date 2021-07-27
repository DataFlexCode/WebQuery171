
df.WebCommandBar = function WebCommandBar(oDef, oParent){
    df.WebCommandBar.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tInt, "peRegion", df.ciTopRegion);
    
    // @privates
    this._eSizer = null;
    
    //  Configure super classes
    this._bWrapDiv = true;
    this._bRenderChildren = true;
    this._sControlClass = "WebCommandBar";
};
df.defineClass("df.WebCommandBar", "df.WebBaseUIObject",{

openHtml : function(aHtml){
    df.WebCommandBar.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebCmd_Sizer">');
},
closeHtml : function(aHtml){
    aHtml.push('</div>');
    
    df.WebCommandBar.base.closeHtml.call(this, aHtml);
},


renderChildren : function(eContainer){
    var i, eChild, oChild, eToolWrap;
        
    this._eSizer = df.dom.query(this._eElem, "div.WebCmd_Sizer");
    
    //  Call children and append them to ourselves
    for(i = 0; i < this._aChildren.length; i++){
        oChild = this._aChildren[i];
        
        //  Check if we can actually render the object
        if(oChild instanceof df.WebBaseUIObject){
            eChild = oChild.render();
            
            if(oChild instanceof df.WebToolBar){
                if(!eToolWrap){
                    eToolWrap = df.dom.create('<div class="WebCmd_ToolWrap"></div>');
                    this._eSizer.appendChild(eToolWrap);
                }
                eToolWrap.appendChild(eChild);
            }else{
                eToolWrap = null;
                this._eSizer.appendChild(eChild);
            }
        }
    }
    
    
    //this._eSizer.appendChild(df.dom.create('<div style="clear: both"></div>'));
},

prepareSize : function(){
    this._bStretch = false;
    
    if(this._eSizer){
        this._iWantedHeight = this._eSizer.scrollHeight; // Changed to scrollheight for IE issue
    }
    
    return this._iWantedHeight;
},

setOuterHeight : function(iHeight){
    if(this._eElem){
        this._eElem.style.height = iHeight + "px";
    }
}

});