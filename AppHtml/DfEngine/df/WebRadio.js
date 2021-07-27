/*
Class:
    df.WebRadio
Extends:
    df.WebBaseDEO

This is the client-side representation of the cWebRadio class. It renders a radio button using the 
input type="radio" HTML element. The psGroupName determines which radio's belong to each other so we 
can use it as the name. The psMasterName determines which radio is the master control which is the 
one that communicates to the server. All value related calls are forwarded to this master control 
which knows the other radio's.
    
Revision:
    2012/09/06  (HW, DAW) 
        Initial version.
*/
df.WebRadio = function WebRadio(sName, oParent){
    df.WebRadio.base.constructor.call(this, sName, oParent);
    
    //  Web properties
    this.prop(df.tString, "psMasterName", "");
    this.prop(df.tString, "psGroupName", "");
    this.prop(df.tString, "psRadioValue", "");
    this.prop(df.tString, "psCaption", "");
    
    //  Events
    this.event("OnSelect", df.cCallModeDefault);
            
    // @privates
    this._oMaster = null;
    this._aRadios = [];
    this._sPrevChangeVal = null;
    this._iPrevSelected = null;
    this._eCaption = null;
    
    //  Configure super classes
    this._sControlClass = "WebRadio";
};
df.defineClass("df.WebRadio", "df.WebBaseDEO", {

// - - - - - - - - - - - RENDERING - - - - - - - - - - - 
/*
Augments openHtml and adds the radio element.

@param  aHtml   Array string builder to add HTML to.
@private
*/
openHtml : function(aHtml){
    df.WebRadio.base.openHtml.call(this, aHtml);
    
    aHtml.push('<input type="radio" name="', this.psGroupName, '" id="', this._sControlId, '"><label class="WebRadio_Caption" for="', this._sControlId, '"></label><div style="clear: both"></div>'); 
},

/*
Augments afterRender to get a reference to the DOM element.

@private
*/
afterRender : function(){
    var oWebApp = this.getWebApp();

    //  Get references
    this._eControl = df.dom.query(this._eElem, "input");
    this._eCaption = df.dom.query(this._eElem, "label.WebRadio_Caption");
    
    this.set_psCaption(this.psCaption);
    this.set_psRadioValue(this.psRadioValue);
    
    //  Find master and register
    if(this.psMasterName){
        this._oMaster = oWebApp.findObj(this.psMasterName);
        this._oMaster.registerRadio(this);
        
        this.unSync('psValue');
        this.unSync('pbChanged');
    }else{
        this.registerRadio(this);
    }
    
    //  Call super
    df.WebRadio.base.afterRender.call(this);
    
    df.events.addDomListener("click", this._eControl, this.onClick, this);
},

// - - - - - - - - - - - PUBLIC API - - - - - - - - - - - 
/*
Augment the getter for pbChanged and forward it to the master radio.

@return True if the value is changed.
*/
get_pbChanged : function(){
    if(this._oMaster){
        return this._oMaster.get_pbChanged();
    }
    return df.WebRadio.base.get_pbChanged.call(this);
},

/*
Augment the setter for psValue and forward it to the master radio.

@param  sVal    The new value.
*/
set_psValue : function(sVal){
    var i;
    
    if(this._oMaster){
        this._oMaster.set_psValue(sVal);
    }else{
        df.WebRadio.base.set_psValue.call(this, sVal);
        
        //  Update _iPrevSelected
        for(i = 0; i < this._aRadios.length; i++){
            if(this._aRadios[i]._eControl.checked){
                this._iPrevSelected = i;
                break;
            }
        }
    }
},

/*
Augment the getter for psValue and forward it to the master radio.

@return The current value.
*/
get_psValue : function(){
    if(this._oMaster){
        return this._oMaster.get_psValue();
    }
    return df.WebRadio.base.get_psValue.call(this);
},

/*
Update the DOM with the new psRadioValue value so that direct DOM access will work properly.

@param  sVal    The new value.
*/
set_psRadioValue : function(sVal){
    if(this._eControl){
        this._eControl.value = sVal;
    }
},

/*
Update the DOM with the new caption. If the caption really changed we trigger a resize using sizeChanged.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    if(this._eCaption){
        df.dom.setText(this._eCaption, sVal);
        
        if(this.psCaption !== sVal){
            this.sizeChanged();
        }
    }
},

/*
Overrides setter for psTextColor so the color is set on the caption.

@param  sVal    The new value.
@private
*/
set_psTextColor : function(sVal){
    if(this._eCaption){
        this._eCaption.style.color = sVal || '';
    }
},

// - - - - - - - - - - - SUPPORTIVE - - - - - - - - - - - 

/*
This method is called by the WebBaseDEO logic when the value needs to be read from the user 
interface. The checkbox overrides the default behavior and returns psChecked or psUnchecked 
depending on the state of the checkbox element.

@return The currently displayed value.
@private
*/
getControlValue : function(){
    var i;
    
    if(this._oMaster){
        return this._oMaster.getControlValue();
    }
    for(i = 0; i < this._aRadios.length; i++){
        if(this._aRadios[i]._eControl.checked){
            return this._aRadios[i].psRadioValue;
        }
    }
    
    return this.psValue;

},

/*
This method is called by the WebBaseDEO logic when the user interface needs to be updated with a new 
value. When sVal is equal to psChecked we display the checkbox as checked.

@param  sVal    The new value to display.
*/
setControlValue : function(sVal){
    var i;
    
    if(this._oMaster){
        return this._oMaster.setControlValue(sVal);
    }
    
    if(!(this._aRadios[this._iPrevSelected] && this._aRadios[this._iPrevSelected]._eControl.checked && this._aRadios[this._iPrevSelected].psRadioValue === sVal)){
        for(i = 0; i < this._aRadios.length; i++){
            if(this._aRadios[i].psRadioValue === sVal){
                this._aRadios[i]._eControl.checked = true;
                return;
            }
        }
    }
},

/*
This method is called by the slave radio controls to register them.

@param  oRadio  The slave radio control.
@private
*/
registerRadio : function(oRadio){
    this._aRadios.push(oRadio);
},

/*
This method overrides the fireChange method because radio controls are a special case. The call is 
forwarded to the master radio which will trigger the OnChange event on all the radios in the group. 
The OnSelect event is triggered on the radio control that is now the selected one.

@private
*/
fireChange : function(){
    var sNewVal, i;
    
    //  The master handles this
    if(this._oMaster){
        return this._oMaster.fireChange();
    }
    
    //  Check the new value
    this.updateTypeVal();
    sNewVal = this.getServerVal();
    
    //  Fire events (OnChange on every radio and OnSelect on the selected one)
    for(i = 0; i < this._aRadios.length; i++){
        if(this._sPrevChangeVal !== sNewVal){
            this._aRadios[i].fire('OnChange', [ sNewVal , this._sPrevChangeVal]);
        }
        
        if(this._aRadios[i]._eControl.checked && i !== this._iPrevSelected){
            this._aRadios[i].fire('OnSelect');
            this._iPrevSelected = i;
        }
    }
    
    //  Remember the value
    this._sPrevChangeVal = sNewVal;
},

/*
Event handler for the click event that triggers the check for the onchange event.

@param  oEvent  Event details object.
@private
*/ 
onClick : function(oEvent){
    this.fireChange();
}

});