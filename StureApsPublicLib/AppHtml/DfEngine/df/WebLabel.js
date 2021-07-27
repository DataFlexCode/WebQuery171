

df.WebLabel = function WebLabel(oDef, oParent){
    df.WebLabel.base.constructor.call(this, oDef, oParent);
    
    //  Properties
    this.prop(df.tString, "psCaption", "");
    this.prop(df.tInt, "peAlign", 0);
    this.prop(df.tBool, "pbShowBorder", false);
    
    //  Configure super classes
    this.pbShowLabel = false;
    
    //  @privates
    this._bFocusAble = false;
    this._sControlClass = "WebLabel";
};
df.defineClass("df.WebLabel", "df.WebBaseControl", {

openHtml : function(aHtml){
    df.WebLabel.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebLabel_content">&nbsp;</div>');
},

closeHtml : function(aHtml){
    df.WebLabel.base.closeHtml.call(this, aHtml);
},

afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div.WebLabel_content");

    df.WebLabel.base.afterRender.call(this);
    
    this.set_peAlign(this.peAlign);
    this.set_psCaption(this.psCaption);
    this.set_pbShowBorder(this.pbShowBorder);
},

set_psCaption : function(sVal){
    if(this._eControl){
        df.dom.setText(this._eControl, sVal);
        
        if(sVal !== this.psCaption){
            this.sizeChanged();
        }
    }
},

set_pbShowBorder : function(bVal){
    if(this._eControl){
        if(bVal){
            df.dom.addClass(this._eControl, "WebLabel_border");
        }else{
            df.dom.removeClass(this._eControl, "WebLabel_border");
        }
        
        if(this.pbShowBorder !== bVal){
            this.sizeChanged();
        }
    }
},

set_peAlign : function(iVal){
    if(this._eControl){
        this._eControl.style.textAlign = (iVal === df.ciAlignLeft ? "left" : (iVal === df.ciAlignCenter ? "center" : (iVal === df.ciAlignRight ? "right" : "")));
    }
}

});