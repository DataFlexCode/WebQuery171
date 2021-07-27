/*
Class:
    df.WebDatePicker
Extends:
    df.WebBaseDEO

This is the client-side representation of the cWebDatePicker class. It renders a datepicker control 
directly into the form. This datepicker will behave like a data entry object and display its value 
by highlighting the date it in the datepicker. The datepicker is rendered by the df.DatePicker 
class which is instantiated as sub object (_oPicker).

Revision:
    2012/04/02  (HW, DAW) 
        Initial version.
*/
df.WebDatePicker = function WebDatePicker(oDef, oParent){
    df.WebDatePicker.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tBool, "pbShowWeekNr", true);
    this.prop(df.tBool, "pbShowToday", true);
    this.prop(df.tInt, "piStartWeekAt", 1);
    
    this.event("OnDateClick", df.cCallModeWait);
    
    // @privates
    
    //  Create date picker instance
    this._oPicker = null;
    this._ePicker = null;
    
    this._sControlClass = "WebDatePicker";
};
df.defineClass("df.WebDatePicker", "df.WebBaseDEO",{

/*
This method forwards the open html call to the date picker object. It inserts html for the anchor 
element that will keep the focus.

@param  aHtml   Stringbuilder array to which the HTML can be added.
@private
*/
openHtml : function(aHtml){
    //  Create date picker
    if(!this._oPicker){
        this._oPicker = new df.DatePicker();
        this._oPicker._oParent = this;
    }

    df.WebDatePicker.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebDatePicker_FocusHolder" tabindex="0">');
    
    this._oPicker.openHtml(aHtml);
},

/*
This method forwards the closing html call to the date picker object.

@param  aHtml   Stringbuilder array to which the HTML can be added.
@private
*/
closeHtml : function(aHtml){
    this._oPicker.closeHtml(aHtml);
    
    df.WebDatePicker.base.closeHtml.call(this, aHtml);
    
    aHtml.push('</div>');
},

/*
This method forwards the after rendering call to the date picker object. It gets references to DOM
elements and attach event handlers.

@private
*/
afterRender : function(){
    //  Get reference to wrapper and focus elements
    this._ePicker = df.dom.query(this._eElem, "div.WebDP");
    this._eFocus = df.dom.query(this._eElem, "div.WebDatePicker_FocusHolder");

    df.WebDatePicker.base.afterRender.call(this);
    
    this.set_pbEnabled(this.pbEnabled); //  WebBaseUIObject doesn't call it any more
    
    //  Pass elements & afterRender to picker object. 
    this._oPicker._eElem = this._ePicker;
    this._oPicker._eFocus = this._eFocus;
    this._oPicker.afterRender();
    this._oPicker.onChange.addListener(this.onChange, this);
    this._oPicker.onDateClick.addListener(this.onDateClick, this);
    
    //  Add DOM listeners
    df.events.addDomListener("focus", this._eFocus, this.onFocus, this);
    df.events.addDomListener("blur", this._eFocus, this.onBlur, this);
},

/*
Augment the render call to pass the initial property values to the picker object.

@private
*/
render : function(){
    // Create date picker instance
    if(!this._oPicker){
        this._oPicker = new df.DatePicker();
        this._oPicker._oParent = this;
        this._oPicker._eFocus = this._eFocus;
    }

    //  Set initial values on the picker
    this._oPicker.pbShowWeekNr  = this.pbShowWeekNr;
    this._oPicker.pbShowToday   = this.pbShowToday;
    this._oPicker.piStartWeekAt = this.piStartWeekAt;
    
    if(this.psMask){
        this._oPicker.psMask = this.psMask;
    }else{
        this._oPicker.psMask = this.getWebApp().psDateFormat;
    }
    
    return df.WebDatePicker.base.render.call(this);
},

/*
Override the refreshDisplay method to update the date picker with the new value. Note that 
peDataType should be set the 'date' type.

@param  tVal    Type specific value (should be a date).
@private
*/
refreshDisplay : function(tVal){
    if(this._oPicker && (this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime)){
        this._oPicker.setSelectedDate(tVal, true, false);
    }
},

/*
Override the updateTypeVal method which reads the value from the display and sets it to the type 
specific property (this._tValue). Note that peDataType should be set the 'date' type.

@private
*/
updateTypeVal : function(){
    if(this._oPicker && (this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime)){
        this._tValue = this._oPicker.getSelectedDate();
    }
},

/*
Augment the setter of pbEnabled and disable the focus by setting the tab index.

@private
*/
set_pbEnabled : function(bVal){
    df.WebDateForm.base.set_pbEnabled.call(this, bVal);
    
    if(this._eFocus){
        this._eFocus.tabIndex = (bVal ? 0 : -1);
    }
},

onDateClick : function(oEvent){
    this.fire("OnDateClick", [ this.get('psValue') ]);
},

// - - - - - - - Focus - - - - - - -

/*
We override the focus method and make it give the focus to the hidden focus holder element.

@return True if the List can take the focus.
*/
focus : function(){
    if(this._bFocusAble && this.pbEnabled && this._eFocus){
        this._eFocus.focus();
        this._bLozingFocus = false;
        return true;
    }
    return false;
},

/*
Override the onFocus method and manually display the calendar as focused. The onBlur will remove the 
focus after a timeout (since the onBlur also fires when performing an action within the control). So 
we have set _bLozingFocus to false to make sure that this doesn't happen when the timer fires.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onFocus : function(oEvent){
    if(this._bFocusAble && this.pbEnabled && this._eFocus){
        this.getWebApp().objFocus(this);
        
        if(this._eElem){
            df.dom.addClass(this._eElem, "WebCon_Focus");
        }
        if(this._oPicker && this._oPicker._eElem){
            df.dom.addClass(this._oPicker._eElem, "WebCon_Focus");
        }  
        
        this._bHasFocus = true;
        this._bLozingFocus = false;
    }
},

/*
Override the onBlur method and manually display the calendar as blurred. We do this after a short 
timeout because the onBlur also fires when performing an action within the calendar. So onFocus can 
cancel the blur action when being fired within this timeout.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onBlur : function(oEvent){
    var that = this;
    
    this._bLozingFocus = true;

    setTimeout(function(){
        if(that._bLozingFocus){
            df.WebDatePicker.base.onBlur.call(that, oEvent);
            
            if(that._oPicker && that._oPicker._eElem){
                df.dom.removeClass(that._oPicker._eElem, "WebCon_Focus");
            }  
            
            that._bLozingFocus = false;
        }
    }, 100);
}

});




