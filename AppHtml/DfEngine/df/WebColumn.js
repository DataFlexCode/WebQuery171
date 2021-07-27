/*
Class:
    df.WebColumn
Extends:
    df.WebForm

This is the client-side representation of the cWebColumn control. The cWebColumn control is 
the default column for the cWebList & cWebGrid controls and should only be used as a nested object 
for those classes. It extends the input form and adds the functionality needed to let it function 
within the grid or list.
    
Revision:
    2011/12/01  (HW, DAW) 
        Initial version.
*/
df.WebColumn = function WebColumn(sName, oParent){
    df.WebColumn.base.constructor.call(this, sName, oParent);
    
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
    this._sCellClass = "WebCol";
    
    //  Configure super class
    
};
df.defineClass("df.WebColumn", "df.WebForm",{

/*
We augment the set_psValue method and pass on the new value to the grid so that it can update the 
current row its value. The default setter of psValue is also called so when this is the currently 
edited cell the value is also properly reflected.

@param  sVal    The new value in the server format.
*/
set_psValue : function(sVal){
    df.WebColumn.base.set_psValue.call(this, sVal);
    
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
    
    df.WebColumn.base.set_pbRender.call(this, bVal);
    
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
    
    df.WebColumn.base.set_pbEnabled.call(this, bVal);
    
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
We augment the onKey event handler and call the onKey handler of the grid first so that the grid 
keys overrule the default form keys (especially ctrl – end & ctrl – home which go to the last & 
first row instead of doing a find). The grids onKey handler returns true if nothing happened and 
false if something happened (this confirms with the default event system).

@param  oEvent  The event object.
*/
onKey : function(oEvent){
    oEvent.e.cancelBubble = true;

    if(this._oParent.onKeyDown(oEvent)){
        df.WebColumn.base.onKey.call(this, oEvent);
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
    var tVal;
    
    tVal = this.serverToType(sVal);
    sVal = this.typeToDisplay(tVal);
    
    return (sVal !== '' ? sVal : '&nbsp;');
},


getTooltipElem : function(){
    var eElem = this._oParent.getColCell(this);
    
    if(!eElem){
        eElem = this._oParent.getColHead(this);
    }
    
    return eElem;
},

getErrorElem : function(){
    return this.getTooltipElem();
}

});