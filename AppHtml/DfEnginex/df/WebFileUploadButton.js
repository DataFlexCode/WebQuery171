
df.WebFileUploadButton = function WebFileUploadButton(sName, oParent){
    df.WebFileUploadButton.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCaption", "Select file(s)");
    
    this._sControlClass = "WebButton WebUploadBtn";
};
df.defineClass("df.WebFileUploadButton", "df.WebBaseFileUpload",{

openHtml : function(aHtml){
    df.WebFileUploadButton.base.openHtml.call(this, aHtml);
    

    
    
    aHtml.push('<div class="WebFUB_Wrp">');
    aHtml.push('<button tabindex="-1" id="', this._sControlId, '"', (!this.pbEnabled ? ' disabled="disabled"' : ''), '></button>'); 
    
    
    this.fileHtml(aHtml);
    aHtml.push('</div>');
},

afterRender : function(){
    this._eButton = df.dom.query(this._eElem, "button");
    
    df.WebFileUploadButton.base.afterRender.call(this);
    
    
    this.set_psCaption(this.psCaption);
},




/*
Setter method for psCaption which is the text shown on the button.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    if(this._eButton){
        df.dom.setText(this._eButton, sVal);
    }
},

/*
Augments the setter method of pbEnabled and disables the button by setting the disabled attribute of 
the button HTML element.

@param  bVal    The new value.
*/
set_pbEnabled : function(bVal){
    df.WebButton.base.set_pbEnabled.call(this, bVal);
    
    if(this._eButton){
        this._eButton.disabled = !bVal;
    }
}

});