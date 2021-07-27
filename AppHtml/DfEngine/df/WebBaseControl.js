

df.WebBaseControl = function WebBaseControl(sName, oParent){
    df.WebBaseControl.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "piColumnIndex", 0);
    this.prop(df.tInt, "piColumnSpan", 1);
    
    this.prop(df.tBool, "pbShowLabel", true);
    this.prop(df.tString, "psLabel", "");
    this.prop(df.tInt, "peLabelPosition", 0);
    this.prop(df.tInt, "peLabelAlign", -1);
    this.prop(df.tInt, "piLabelOffset", -1);
    this.prop(df.tString, "psLabelColor", "");
    
    this.prop(df.tString, "psTooltip", "");
    
    this.prop(df.tBool, "pbFillHeight", false);
    this.prop(df.tInt, "piHeight", -1);
    
    this.event("OnFocus", df.cCallModeDefault);
    this.event("OnBlur", df.cCallModeDefault);
        
    //  @privates
    this._eInner = null;
    this._eLbl = null;
    this._eControlWrp = null;
    this._eControl = null;
    
    this._sControlId = df.dom.genDomId();
    
    //  Configure super classes
    this._bFocusAble = true;
    this._bHasFocus = false;
    this._sBaseClass = "WebControl";
    
};
df.defineClass("df.WebBaseControl", "df.WebBaseUIObject", {

openHtml : function(aHtml){
    //  Outermost div for positioning by parent, inner div for margins / paddings
    aHtml.push('<div class="', this.genClass(), '"');
    if(this.psHtmlId){
        aHtml.push(' id="', this.psHtmlId, '"');
    }
    aHtml.push(' style=" ',  (this.pbRender ? '' : 'display: none;'), (this.pbVisible ? '' : 'visibility: hidden;'), '"');
    aHtml.push('>');
    
    //  Optionally label
    if(this.pbShowLabel){
        aHtml.push('<div class="WebCon_Inner"><label for="', this._sControlId, '">&nbsp;</label>');
    }else{
        aHtml.push('<div class="WebCon_Inner">');
    }
    
    //  Wrapper div for positioning of control
    aHtml.push('<div>');
},

closeHtml : function(aHtml){
    aHtml.push('</div></div></div>');
},

/*
render : function(){
    return df.WebBaseControl.base.render.call(this);
},
*/
afterRender : function(){
    //  Get references
    this._eInner = df.dom.query(this._eElem, "div.WebCon_Inner");
    this._eControlWrp = df.dom.query(this._eElem, "div.WebCon_Inner > div");
    if(this.pbShowLabel){
        this._eLbl = df.dom.query(this._eElem, "div > label");
    }
    
    df.WebBaseControl.base.afterRender.call(this);
    if(this._eLbl){
        df.events.addDomListener("click", this._eLbl, this.onLblClick, this);
    }
    
    //  Call setters to apply properties
    this.set_psLabel(this.psLabel);
    
    this.posLabel();
    this.set_psLabelColor(this.psLabelColor);
    this.set_peLabelAlign(this.peLabelAlign);
    
    this.set_psTooltip(this.psTooltip);
    
    this.sizeHeight(-1);
    
},

/*
Handler for the click event on the label. It calls the focus method to pass the focus to the 
control. This is done manually here to emulate this behavior for controls with an artificial focus.

@param  oEvent      DOM Event Object.
@private
*/
onLblClick : function(oEvent){
    this.focus();
},



set_psLabel : function(sVal){
    if(this._eLbl){
        df.dom.setText(this._eLbl, sVal);
    }
},

set_pbShowLabel : function(bVal){
    this.pbShowLabel = bVal;
    
    this.posLabel();
},

set_psLabelColor : function(sVal){
    if(this._eLbl){
        this._eLbl.style.color = sVal;
    }
},

set_peLabelAlign : function(iVal){
    if(this._eLbl){
        this._eLbl.style.textAlign = (iVal === df.ciAlignLeft ? "left" : (iVal === df.ciAlignCenter ? "center" : (iVal === df.ciAlignRight ? "right" : "")));
    }   
},

set_piLabelOffset : function(iVal){
    this.piLabelOffset = iVal;
    
    this.posLabel();
},

set_peLabelPosition : function(iVal){
    this.peLabelPosition = iVal;
    
    this.posLabel();
},

set_psTooltip : function(sVal){
    if(this._eControl){
        this._eControl.title = sVal;
    }
},

set_piColumnIndex : function(iVal){
    if(this.piColumnIndex !== iVal){
        this.piColumnIndex = iVal;
        
        if(this._oParent && this._oParent.position){
            this._oParent.position();
            this._oParent.sizeChanged();
        }
    }
},

set_piColumnSpan : function(iVal){
    if(this.piColumnSpan !== iVal){
        this.piColumnSpan = iVal;
        
        if(this._oParent && this._oParent.position){
            this._oParent.position();
            this._oParent.sizeChanged();
        }
    }
},

set_psTextColor : function(sVal){
    if(this._eControl){
        this._eControl.style.color = sVal || '';
    }
},

set_psBackgroundColor : function(sVal){
    if(this._eControl){
        this._eControl.style.backgroundColor = sVal || '';
        this._eControl.style.backgroundImage = (sVal ? 'none' :'');
    }
},

set_piMinHeight : function(iVal){
    if(this._eControl){
        if(this.piMinHeight !== iVal){
            this.piMinHeight = iVal;
            if(!this.pbFillHeight){
                this.sizeHeight(-1);
            }
            
            // Call sizing sytem to recalculate sizes
            this.sizeChanged();
        }
    }
},

set_piHeight : function(iVal){
    if(this._eControl){
        if(this.piHeight !== iVal){
            this.piHeight = iVal;
            if(!this.pbFillHeight){
                this.sizeHeight(-1);
            }
            
            // Call sizing sytem to recalculate sizes
            this.sizeChanged();
        }
    }
},

sizeHeight : function(iExtHeight){
    var iHeight = -1;
    
    //  Determine which height to use
    if(this.pbFillHeight){
        iHeight = iExtHeight;
    }else{
        if(this.piHeight > 0){
            iHeight = this.piHeight;
        }
    }
    
    //  Respect minimal height
    if(iHeight < this.piMinHeight){
        iHeight = this.piMinHeight;
    }
    
    //  Update the height
    this.setHeight(iHeight);
    
    //  Return the final height
    if(iHeight > 0){
        return iHeight;
    }
},

setHeight : function(iHeight){
    if(this._eControl){
        //  If a negative value is given we should size 'naturally'
        if(iHeight > 0){
            //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
            if(this.peLabelPosition === df.ciLabelTop){
                iHeight -= this._eLbl.offsetHeight;
            }
            
            //  Substract the wrapping elements
            iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControl);
            
            //  Set the height
            this._eControl.style.height = iHeight + "px";
        }else{
            this._eControl.style.height = "";
        }
    
    }
},

posLabel : function(){
    var iPos = this.peLabelPosition, sClass, sOffset, iOffset = this.piLabelOffset, iMargin, sMargin, oStyle;
    
    if(this._eElem){
        //  Remove all label classes
        df.dom.removeClass(this._eInner, "WebCon_HasLabel WebCon_TopLabel WebCon_RightLabel WebCon_LeftLabel");
        if(!this.pbShowLabel){
            //  Remove from the DOM
            if(this._eLbl){
                df.events.removeDomListener("click", this._eLbl, this.onLblClick);
                this._eLbl.parentNode.removeChild(this._eLbl);
                this._eLbl = null;
            }
            
            this._eControlWrp.style.marginLeft = "";
            this._eControlWrp.style.marginTop = "";
            this._eControlWrp.style.marginRight = "";
        }else{
            //  Add to the DOM 
            if(!this._eLbl){
                this._eLbl = df.dom.create('<label for="', this._sControlId, '">&nbsp;</label>');
                
                this.set_psLabel(this.psLabel);
                this.set_psLabelColor(this.psLabelColor);
                this.set_peLabelAlign(this.peLabelAlign);
                
                this._eInner.insertBefore(this._eLbl, this._eInner.firstChild);
                
                df.events.addDomListener("click", this._eLbl, this.onLblClick, this);
            }
            df.dom.addClass(this._eInner, "WebCon_HasLabel");
            
            //  If there is no positions et explicitly we detect it (so we assume where the style sheet wants the label based on the margin it sets)
            if(this.peLabelPosition < 0){
                oStyle = df.sys.gui.getCurrentStyle(this._eLbl);
                
                iPos = (oStyle.marginLeft > 0 ? df.ciLabelLeft : (oStyle.marginRight > 0 ? df.ciLabelRight : df.ciLabelLeft));
            }
            
            //  Determine the classname and the required margin
            switch(iPos){
                case df.ciLabelLeft:
                    sClass = "WebCon_LeftLabel";
                    iMargin = (iOffset > 0 ? iOffset + df.sys.gui.getHorizBoxDiff(this._eLbl) : 0);
                    break;
                case df.ciLabelTop:
                    sClass = "WebCon_TopLabel";
                    iMargin = (iOffset > 0 ? iOffset + df.sys.gui.getVertBoxDiff(this._eLbl) : 0);
                    break;
                case df.ciLabelRight:
                    sClass = "WebCon_RightLabel";
                    iMargin = (iOffset > 0 ? iOffset + df.sys.gui.getHorizBoxDiff(this._eLbl) : 0);
                    break;
            }
            
            sOffset = (iOffset > 0 ? iOffset + "px" : "");
            sMargin = (iMargin > 0 ? iMargin + "px" : "");
              
            //  Make space
            this._eControlWrp.style.marginLeft = (iPos === df.ciLabelLeft ? sMargin : "");
            this._eControlWrp.style.marginTop = (iPos === df.ciLabelTop ? sMargin : "");
            this._eControlWrp.style.marginRight = (iPos === df.ciLabelRight ? sMargin : "");
            
            this._eLbl.style.width = (iPos === df.ciLabelLeft ||  iPos === df.ciLabelRight ? sOffset : "");
            this._eLbl.style.height = (iPos === df.ciLabelTop ? sOffset : "");
            
            //  Set CSS class on the inner div
            df.dom.addClass(this._eInner, sClass);
            
        }
    }
},

getTooltipElem : function(){
    return this._eControlWrp;
},

// - - - - - - - - - Focus Handling - - - - - - - - - 
focus : function(){
    if(this._bFocusAble && this.pbEnabled && this._eControl && this._eControl.focus){
        this._eControl.focus();
        
        return true;
    }
    
    return false;
},

attachFocusEvents : function(){
    //  We are attaching a DOM capture listener so we know when we get the focus
    if(window.addEventListener){
        df.events.addDomCaptureListener("focus", this._eElem, this.onFocus, this);
        df.events.addDomCaptureListener("blur", this._eElem, this.onBlur, this);
    }else{
        df.events.addDomListener("focusin", this._eElem, this.onFocus, this);
        df.events.addDomListener("focusout", this._eElem, this.onBlur, this);
    }
},

onFocus : function(oEvent){
    df.WebBaseControl.base.onFocus.call(this, oEvent);
    
    if(this._eElem){
        df.dom.addClass(this._eElem, "WebCon_Focus");
    }
    
    this.fire("OnFocus");
    
    this._bHasFocus = true;
},

onBlur : function(oEvent){
    df.WebBaseControl.base.onBlur.call(this, oEvent);
    
    if(this._eElem){
        df.dom.removeClass(this._eElem, "WebCon_Focus");
    }
    
    this.fire("OnBlur");
    
    this._bHasFocus = false;
}
});