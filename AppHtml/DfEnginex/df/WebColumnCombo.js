/*
Class:
    df.WebColumnCombo
Mixin:
    df.WebColumn_mixin (df.WebColumnComboBase)
Extends:
    df.WebCombo


    
Revision:
    2012/01/18  (HW, DAW) 
        Initial version.
*/

//  Generate new base class using mixin and WebCombo
df.WebColumnComboBase = df.mixin("df.WebColumn_mixin", "df.WebCombo");

df.WebColumnCombo = function WebColumnCombo(sName, oParent){
    df.WebColumnCombo.base.constructor.call(this, sName, oParent);
    
    //  Configure super class
    this._sCellClass = "WebColCombo";
};
df.defineClass("df.WebColumnCombo", "df.WebColumnComboBase",{


/*
Triggered after rendering and attached event handles to the DOM.

@private
*/
afterRender : function(){
    df.WebColumnCombo.base.afterRender.call(this);
    
    df.events.addDomListener("keypress", this._eControl, this.onKeyPress, this);
},



/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/
cellHtml : function(tCell){
    var i, sVal = tCell.sValue, tVal;
    
    for(i = 0; i < this._aValues.length; i++){
        if(this._aValues[i].sV === sVal){
            return this._aValues[i].sD;
        }
    }
    
    tVal = this.serverToType(sVal);
    sVal = this.typeToDisplay(tVal);
    
    return (sVal !== '' ? sVal : '&nbsp;');
},

/*
Listens to the keypress event.

@param  oEvent  The event object.
@return True.
@private
*/
onKeyPress : function(oEvent){
    var that = this;
    
    // ToDo: No forward send here??
    
    //  Fix for FireFox where we temporary disable the control to make sure that the value does not change when changing rows.
    if(df.sys.isMoz){
        if(oEvent.matchKey(df.settings.listKeys.scrollUp) || oEvent.matchKey(df.settings.listKeys.scrollDown)){
            this._eControl.disabled = true;
            
            setTimeout(function(){
                that._eControl.disabled = !that.pbEnabled;
            }, 20);
        }
    }
}

});