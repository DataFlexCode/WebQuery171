/*
Class:
    df.WebView
Extends:
    df.WebWindow

This class represents a view within in Visual DataFlex Web Application. It inherits from WebWindow 
but it doesn't have the be a floating window. This inheritance structure is chosen because of the 
WebModalDialog class that inherits from WebView and the possible future support of MDI.

The WebView is managed by the df.WebApp class which maintains a set of views. It has support for 
handling a DDO structure and is a scope in the synchronized properties system. This means that only 
synchronized properties from the current view and optionally its invoking view will be synchronized 
within a single call.
    
Revision:
    2011/07/11  (HW, DAW) 
        Initial version.
*/
df.WebView = function WebView(sName, oParent){
    df.WebView.base.constructor.call(this, sName, oParent);
    
    //  Web Properties
    this.prop(df.tBool, "pbFillHeight", false);
    this.prop(df.tBool, "pbClearDDOsAfterHide", false);
    this.prop(df.tBool, "pbDDHotKeys", true);
    
    //  Events
    this.event("OnSubmit", df.cCallModeWait);
    this.event("OnShow", df.cCallModeWait);
    this.event("OnHide", df.cCallModeDefault); // Note that OnHide must be a default call because it is usually followed by an OnShow that should not be cancelled
    
    //  @privates
    this._eForm = null;
    
    this._oDDData = null;
    
    this._sControlClass = "WebView";
};
df.defineClass("df.WebView", "df.WebWindow",{

afterRender : function(){
    this._eForm = df.dom.query(this._eElem, "form");
    
    df.WebView.base.afterRender.call(this);
    
    // df.events.addDomKeyListener(this._eElem, this.onKey, this);
},

_show : function(eRenderTo){
    this.fire("OnShow");
    
    df.WebView.base._show.call(this,eRenderTo);
},

_hide : function(){
    if(this._bRendered){
        this.fire("OnHide", [], function(oEvent){
            //  Clear the DDO state if needed, note that this doesn't clear the DEO state
            if(this.pbClearDDOsAfterHide){
                this._oDDData = { sView : this._sName, sCS : "", aDDOs : [] };
            }
        }, this);
    }

    df.WebView.base._hide.call(this);
},

show : function(){
    if(this._bStandalone){
        this._show();
    }else{
        this.getWebApp().showView(this._sName);
    }
},

hide : function(){
    if(this._bStandalone){
        this._hide(true);
    }else{
        this.getWebApp().hideView(this._sName);
    }
},

destroy : function(){
    if(this._eElem){
        this._eElem.parentNode.removeChild(this._eElem);
        this._eElem = null;
    }
},

/*
This method implements the action method that is called from the server. It will close the view.
*/
closePanel : function(){
    this.close();
},

/*
Override the resize method and only forward the call if we are actually rendered.
*/
resize : function(){
    if(this._bRendered){
        df.WebView.base.resize.call(this);
    }
},

/*
This method handles the keypress event of the window. It will initiate actions that belong to the pressed key if needed.

@param  oEvent  The event object with event details.
@private
*/
onKey : function(oEvent){
    if(oEvent.matchKey(df.settings.formKeys.submit)){ 
        if(this.fire('OnSubmit')){
            oEvent.stop();
        }
    }else{
        df.WebView.base.onKey.call(this, oEvent);
    }
},

fireSubmit : function(){
    return this.fire('OnSubmit');
},

set_pbFillHeight : function(bVal){
    this.pbFillHeight = bVal;
    this.sizeChanged();
}

});