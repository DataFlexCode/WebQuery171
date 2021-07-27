/*
Class:
    df.WebColumnCheckbox
Extends:
    df.WebCombo


    
Revision:
    2012/01/23  (HW, DAW) 
        Initial version.
*/
df.WebColumnCheckbox = function WebColumnCheckbox(sName, oParent){
    df.WebColumnCheckbox.base.constructor.call(this, sName, oParent);
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
    this._sCellClass = "WebColCheckbox";
    
    //  Configure super class
    this._sControlClass = "WebCheckbox WebCheckboxColumn";
};
df.defineClass("df.WebColumnCheckbox", "df.WebCheckbox",{

/*
We augment the set_psValue method and pass on the new value to the grid so that it can update the 
current row its value. The default setter of psValue is also called so when this is the currently 
edited cell the value is also properly reflected.

@param  sVal    The new value in the server format.
*/
set_psValue : function(sVal){
    df.WebColumnCheckbox.base.set_psValue.call(this, sVal);
    
    if(this._oParent instanceof df.WebGrid){
        this._oParent.updateCurrentCell(this, sVal);
    }
},

/*
Overrides the setter for psCaption so that the caption will not be shown when switching to edit 
mode. Instead we notify the list of our new caption and make it redraw its header.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    this.psCaption = sVal;
    
    this._oParent.updateHeader();
},

/*
Setting pbRender means that the list should redraw itself completely. 

@param  bVal    The new value of pbRender.
*/
set_pbRender : function(bVal){
    var bCS = (this.pbRender !== bVal);
    
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
    
    df.WebColumnCheckbox.base.set_pbEnabled.call(this, bVal);
    
    if(bCS){
        this.pbEnabled = bVal;
    
        this._oParent.redraw();
    }
},

/*
We augment the onKey event handler and call the onKey handler of the grid first so that the grid 
keys overrule the default form keys (especially ctrl – end & ctrl – home which go to the last & 
first row instead of doing a find). The grids onKey handler returns true if nothing happened and 
false if something happened (this confirms with the default event system).

@param  oEvent  The event object.
*/
onKey : function(oEvent){
    oEvent.e.cancelBubble = true;

    if(this._oParent.onKeyDown(oEvent)){
        df.WebColumnCheckbox.base.onKey.call(this, oEvent);
    }
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  sVal    The value in server format.
@return The HTML representing the display value.
*/
cellHtml : function(sVal){
    var aHtml = [];
    
    aHtml.push('<div class="', this.genClass(), '"><div class="WebCon_Inner"><div><input type="checkbox"');

    if(sVal === this.psChecked){
        aHtml.push(' onclick="this.checked = true" checked="checked"');
    }else{
        aHtml.push(' onclick="this.checked = false"');
    }
    
    if(!this.pbEnabled){
        aHtml.push(' disabled="disabled"');
    }
    
    aHtml.push('></div></div></div>');
    
    return aHtml.join('');
}

}); 