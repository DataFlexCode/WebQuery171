/*
Class:
    df.WebCheckbox
Extends:
    df.WebBaseDEO

This is the client-side representation of the cWebCheckbox class. It displays a checkbox using the 
<input type="checkbox" element.
    
Revision:
    2012/01/09  (HW, DAW) 
        Initial version.
*/
df.WebCheckbox = function WebCheckbox(sName, oParent){
    df.WebCheckbox.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psChecked", "1");
    this.prop(df.tString, "psUnchecked", "0");
    this.prop(df.tString, "psCaption", "");
    
    this.pbServerOnChange = false;
    this.psClientOnChange = "";
    
    // @privates
    this._eCaption = null;
    
    //  Configure super classes
    this._sControlClass = "WebCheckbox";
};
df.defineClass("df.WebCheckbox", "df.WebBaseDEO",{

/*
Augments openHtml and adds the checkbox element.

@param  aHtml   Array string builder to add HTML to.
@private
*/
openHtml : function(aHtml){
    df.WebCheckbox.base.openHtml.call(this, aHtml);
    
    aHtml.push('<input type="checkbox" id="', this._sControlId, '"><label class="WebCheckbox_Caption" for="', this._sControlId, '"></label><div style="clear: both"></div>'); 
},

/*
Augments afterRender to get a reference to the DOM element.

@private
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "input");
    this._eCaption = df.dom.query(this._eElem, "label.WebCheckbox_Caption");
    
    this.set_psCaption(this.psCaption);
    
    //  Call super
    df.WebCheckbox.base.afterRender.call(this);
    
    df.events.addDomListener("click", this._eControl, this.onClick, this);
},

/*
This method is called by the WebBaseDEO logic when the value needs to be read from the user 
interface. The checkbox overrides the default behavior and returns psChecked or psUnchecked 
depending on the state of the checkbox element.

@return The currently displayed value.
@private
*/
getControlValue : function(){
    if(this._eControl){
        if(this._eControl.checked){
            return this.psChecked;
        }
        return this.psUnchecked;
    }
    
    return this.psValue;
},

/*
This method is called by the WebBaseDEO logic when the user interface needs to be updated with a new 
value. When sVal is equal to psChecked we display the checkbox as checked.

@param  sVal    The new value to display.
*/
setControlValue : function(sVal){
    if(this._eControl){
        this._eControl.checked = (sVal === this.psChecked);
    }
},

/*
Augment the setter for psValue and store the new current vale for the OnChange check. We execute 
get_psValue here because the checkbox can change the value when it is set.

@param  sVal    The new value.
*/
set_psValue : function(sVal){
    df.WebCheckbox.base.set_psValue.call(this, sVal);
    
    //  FIX: Initial value issue
    this._sPrevChangeVal = this.get_psValue();
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

/*
This function inverts the value if the control is enabled. Is called by the grid.
*/
tick : function(){
    if(this._eControl && this.pbEnabled){
        this._eControl.checked = !this._eControl.checked;
        
        this.fireChange();
    }   
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