/*
Class:
    df.WebForm
Extends:
    df.WebBaseForm

This is the client-side representation of the WebForm class. It generates the HTML for the input 
element and possibly a prompt button.
    
Revision:
    2011/08/01  (HW, DAW) 
        Initial version.
*/
df.WebForm = function WebForm(oDef, oParent){
    df.WebForm.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tBool, "pbPromptButton", false);
    this.prop(df.tBool, "pbPassword", false);

    //  Events
    this.event("OnPrompt", df.cCallModeWait);
        
       // @privates
    this._eWrap = null;
    this._ePrompt = null;
    
    //  Configure super classes
    this._sControlClass = "WebForm";
};
/*
This class is the implementation of the client-side part of the WebForm data entry object. It can 
render itself to HTML and implements the published properties from the server. It has special prompt 
button functionality.
*/
df.defineClass("df.WebForm", "df.WebBaseForm",{

/*
This method generates the HTML for input element. The input element has two wrappers for styling it 
and making space for the prompt button. The HTML for the prompt button is available by default and 
is made visible when needed.

@param  aHtml   String builder array to which HTML can be added.

@private
*/
openHtml : function(aHtml){
    df.WebForm.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebFrm_Wrapper"><span class="WebFrm_Prompt"></span><div class="WebFrm_PromptSpacer"><input type="', (this.pbPassword ? 'password' : 'text'), '" name="', this._sName, '" value="" id="', this._sControlId, '">'); 
},

/*
This method generates the closing HTML closing the tags opened by the openHtml. This allows 
subclasses to insert HTML inside the WebFrm_PromptSpacer div.

@param  aHtml   String builder array to which HTML can be added.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div></div>'); 
    
    df.WebForm.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and gets references, attaches event handlers and sets property 
values.

@private
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "div.WebFrm_Wrapper input");
    this._ePrompt = df.dom.query(this._eElem, "div.WebFrm_Wrapper span.WebFrm_Prompt");
    this._eWrap = df.dom.query(this._eElem, "div.WebFrm_Wrapper");
    
    df.WebForm.base.afterRender.call(this);
    
    //  Attach event handlers
    df.events.addDomListener("click", this._ePrompt, this.onPromptClick, this);
    
    //  Set properties
    this.set_piMaxLength(this.piMaxLength);
    this.set_pbPromptButton(this.pbPromptButton);
},

/*
This setter switches the field between an input type=password and a input type=text field.

@param  bVal    The new value.
@private
*/
set_pbPassword : function(bVal){
    if(this._eControl){
        if(df.sys.isIE && df.sys.iVersion < 9){   // For IE8 and older we need to clone the DOM element before we can switch it
            var eNew = this._eControl.cloneNode(false);
            eNew.type = (bVal ? 'password' : 'text');
            this._eControl.parentNode.replaceChild(eNew,this._eControl);
            this._eControl = eNew;
        }else{  //  Modern browser support simply setting the type
            this._eControl.type = (bVal ? 'password' : 'text');
        }
    }
},

/*
This setter sets the background color of the field. The background color is applied to the wrapper 
div element.

@param  sVal    The bew value.
@private
*/
set_psBackgroundColor : function(sVal){
    if(this._eWrap){
        this._eWrap.style.backgroundColor = sVal || '';
    }
},

/*
This setter hides / shows the prompt button. That is done by removing / setting setting the 
"WebFrm_HasPrompt" CSS class on the wrapper div element.

@param  bVal    The new value.
*/
set_pbPromptButton : function(bVal){
    if(this._eWrap && this._ePrompt){
        df.dom.toggleClass(this._eWrap, "WebFrm_HasPrompt", bVal);
    }
},

/*
Setter for piMaxLength that sets the maximum field length to the input control.

@param  iVal    New value.
*/
set_piMaxLength : function(iVal){
    if(this._eControl){
        if(this.peDataType === df.ciTypeText && !this.psMask){
            this._eControl.maxLength = (iVal > 0 ? iVal : 0);
        }else{
            this._eControl.maxLength = 1024;
        }
    }
},

/*
This method handles the onclick event of the prompt button DOM element and fires the OnPrompt event.

@param  oEvent  The event object (see df.events.DOMEvent).
@private
*/
onPromptClick : function(oEvent){
    if(this.pbEnabled){
        this.focus();
        if(this.firePrompt()){
            oEvent.stop();
        }
    }
},

/*
We override this method because the form has an extra wrapper of which the Box Difference needs to 
be taken into account.

@private
*/
setHeight : function(iHeight){
    if(iHeight > 0){
        //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
        if(this.peLabelPosition === df.ciLabelTop){
            iHeight -= this._eLbl.offsetHeight;
        }
        
        //  Substract the wrapping elements
        iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
        iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);
        iHeight -= df.sys.gui.getVertBoxDiff(this._eWrap);
        
        //  Set the height
        this._eControl.style.height = iHeight + "px";
    }else{
        this._eControl.style.height = "";
    }
},

/*
This method augments the onKey event handler to add support for the prompt key. 

@param  oEvent  Event object.
*/
onKey : function(oEvent){
    df.WebForm.base.onKey.call(this, oEvent);

    if(oEvent.matchKey(df.settings.formKeys.prompt)){ 
        if(this.firePrompt()){      // F4:  lookup
            oEvent.stop();
        }
    }
},

/*
Fires the OnPrompt event.

@return True if handled.
@private
*/
firePrompt : function(){
    if(this.pbPromptButton){
        return this.fire("OnPrompt");
    }
},

/*
Override the focus function to add text selection.

@param  bOptSelect   If true the text will be selected.
*/
focus : function(bOptSelect){
    if(this._bFocusAble && this.pbEnabled && this._eControl && this._eControl.focus){
        try{ // FIX: Catch errors that occur in Internet Explorer 8
            this._eControl.focus();
            
            //  Select the text when bOptSelect is true
            if(bOptSelect){
                this._eControl.select();
            }
        }catch(oErr){
        
        }
        
        return true;
    }
    
    return false;
},

/*
Augments the onFocus event with functionality that remembers the caret position determined by the 
browser and sets it again if it has changed during the event (which might happen on masked fields).

@param  oEvent  The event object.
@private
*/
onFocus : function(oEvent){
    var iCarPos, iNewCarPos, iRight, iSelection, bSelectAll;
    
    //  Determine initial values
    iCarPos = df.dom.getCaretPosition(this._eControl);
    iRight = this._eControl.value.length - iCarPos;
    
    iSelection = df.dom.getSelectionLength(this._eControl);
    bSelectAll = iSelection >= this._eControl.value.length; 
    
    //  Perform onFocus
    df.WebForm.base.onFocus.call(this, oEvent);
    
    //  Determine new situation
    iNewCarPos = df.dom.getCaretPosition(this._eControl);
    
    if(iCarPos !== iNewCarPos){    
        //  For numeric fields we count from the right
        if(this.peDataType === df.ciTypeBCD){
            iCarPos = this._eControl.value.length - iRight;
        }
        
        // Update if changed
        df.dom.setCaretPosition(this._eControl, iCarPos);
        
    }
    
    //  Reselect if all text was selected
    if(bSelectAll){
        this._eControl.select();
    }
}

});