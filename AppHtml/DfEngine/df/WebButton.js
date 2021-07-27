/*
Class:
    df.WebButton
Extends:
    df.WebBaseControl

This class is the client-side implementation of the cWebButton. It renders a button using the 
<button html element. The OnClick is usually implemented on the server. Special support is available 
for showing a waiting dialog when the call is being sent (pbShowWaitDialog and pbWaitMessage).
    
Revision:
    2011/08/02  (HW, DAW) 
        Initial version.
*/
df.WebButton = function WebButton(oDef, oParent){
    df.WebButton.base.constructor.call(this, oDef, oParent);
    
    //  Web Properties
    this.prop(df.tString, "psCaption", "");
    this.prop(df.tString, "psTextColor", "");
    this.prop(df.tString, "psWaitMessage", "");
    this.prop(df.tBool, "pbShowWaitDialog", false);
    
    //  Events
    this.event("OnClick", df.cCallModeWait);
    
    //  Configure super classes
    this.pbShowLabel = false;
    
    // @privates
    this._sControlClass = "WebButton";
};
df.defineClass("df.WebButton", "df.WebBaseControl",{

/*
This method generates the HTML for the button.

@param  aHtml   Array used as string builder for the HTML.
@private
*/
openHtml : function(aHtml){
    df.WebButton.base.openHtml.call(this, aHtml);
    
    aHtml.push('<button id="', this._sControlId, '"', (!this.pbEnabled ? ' disabled="disabled"' : ''), '></button>'); 
},

/*
This method is called after the HTML is added to the DOM and provides a hook for doing additional implementation. It gets references to the DOM elements, adds event handlers and executes setters t

@private
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "button");
    
    df.WebButton.base.afterRender.call(this);
    
    //  Attach listeners
    df.events.addDomListener("click", this._eControl, this.onBtnClick, this);
    
    //  Call setters
    this.set_psCaption(this.psCaption);
    this.set_pbShowWaitDialog(this.pbShowWaitDialog);
},

/*
Event handler for the OnClick event of the button. It fires the OnClick event of the framework which 
is usually handled on the server.

@param  oEvent  Event object (df.events.DOMEvent).
@private
*/
onBtnClick : function(oEvent){
    if(this.pbEnabled){
        this.fire('OnClick', [], function(oEvent){
            //  Determine if a view needs to be loaded
            if(!oEvent.bCancelled){
                if(this.psLoadViewOnClick){
                    this.getWebApp().showView(this.psLoadViewOnClick);
                }
            }
        });
        oEvent.stop();
    }
},

/*
Setter method for psCaption which is the text shown on the button.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    if(this._eControl){
        df.dom.setText(this._eControl, sVal);
    }
},

/*
Augments the setter method of pbEnabled and disables the button by setting the disabled attribute of 
the button HTML element.

@param  bVal    The new value.
*/
set_pbEnabled : function(bVal){
    df.WebButton.base.set_pbEnabled.call(this, bVal);
    
    if(this._eControl){
        this._eControl.disabled = !bVal;
    }
},

/*
The setter method for pbShowWaitDialog which changes the action mode of the 'OnClick' from 
df.cCallModeWait to df.cCalModeProgress so that the framework will display the waiting dialog 
during the server call.

@param  bVal    The new value.
*/
set_pbShowWaitDialog : function(bVal){
    if(bVal){
        this.setActionMode("OnClick", df.cCallModeProgress);
    }else{
        this.setActionMode("OnClick", df.cCallModeWait);
    }
}

});