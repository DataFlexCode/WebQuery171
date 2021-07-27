/*
Class:
    df.WebColumnCombo
Extends:
    df.WebCombo


    
Revision:
    2012/01/18  (HW, DAW) 
        Initial version.
*/
df.WebColumnCombo = function WebColumnCombo(sName, oParent){
    df.WebColumnCombo.base.constructor.call(this, sName, oParent);
    //  Assertions
    if(!(oParent && oParent instanceof df.WebList)){
        throw new df.Error(999, "WebColumn object '{{0}}' should be placed inside a WebList object. Consider wrapping your column with a list or grid object.", this, [ this.getLongName() ]);
    }
    
    //  Properties
    this.prop(df.tBool, "pbSortable", false);
    this.prop(df.tInt, "piWidth", 0);
    this.prop(df.tString, "psCaption", "");
    
    //  Events
    this.event("OnHeaderClick", df.cCallModeDefault);
    
    //  @privates
    this._sCellClass = "WebColCombo";
    
    //  Configure super class
    
};
df.defineClass("df.WebColumnCombo", "df.WebCombo",{


/*
Triggered after rendering and attached event handles to the DOM.

@private
*/
afterRender : function(){
    df.WebColumnCombo.base.afterRender.call(this);
    
    df.events.addDomListener("keypress", this._eControl, this.onKeyPress, this);
},

/*
We augment the set_psValue method and pass on the new value to the grid so that it can update the 
current row its value. The default setter of psValue is also called so when this is the currently 
edited cell the value is also properly reflected.

@param  sVal    The new value in the server format.
*/
set_psValue : function(sVal){
    df.WebColumnCombo.base.set_psValue.call(this, sVal);
    
    if(this._oParent instanceof df.WebGrid){
        this._oParent.updateCurrentCell(this, sVal);
    }
},

/*
Setting pbRender means that the list should redraw itself completely. 

@param  bVal    The new value of pbRender.
*/
set_pbRender : function(bVal){
    var bCS = (this.pbRender !== bVal);
    
    df.WebColumnCombo.base.set_pbRender.call(this, bVal);
    
    if(bCS){
        this.pbRender = bVal;
    
        this._oParent.redraw();
    }
},


/*
Setting pbEnabled means that the list should redraw itself completely. 

@param  bVal    The new value of pbRender.
*/
set_pbEnabled : function(bVal){
    var bCS = (this.pbEnabled !== bVal);
    
    df.WebColumnCombo.base.set_pbEnabled.call(this, bVal);
    
    if(bCS){
        this.pbEnabled = bVal;
    
        this._oParent.redraw();
    }
},

/*
Setter for psCaption that notifies the list of the new caption and makes it redraw the header.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    this.psCaption = sVal;
    
    this._oParent.updateHeader();
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  sVal    The value in server format.
@return The HTML representing the display value.
*/
cellHtml : function(sVal){
    var i, tVal;
    
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