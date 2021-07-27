/*
Class:
    df.WebColumn_mixin
Extends:
    Object
    
This class is used as a mixin for all the different column types. It has the basic column 
functionality and defined the interface to which the List & Grid will be talking. It has basic logic 
for generating the cell content and makes sure the grid redraws when properties are changed. 
    
Revision:
    2011/12/01  (HW, DAW) 
        Initial version.
    2013/08/15  (HW, DAW)
        Refactored into the new mixin system to reduce overhead as more column types will be added.
*/
df.WebColumn_mixin = function WebColumn_mixin(sName, oParent){
    this.getBase("df.WebColumn_mixin").constructor.call(this, sName, oParent);
    
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
    this._bCellEdit = true;
    
    this._bIsColumn = true;
    //  Configure super class
    
};
df.defineClass("df.WebColumn_mixin", {

/*
We augment the set_psValue method and pass on the new value to the grid so that it can update the 
current row its value. The default setter of psValue is also called so when this is the currently 
edited cell the value is also properly reflected.

@param  sVal    The new value in the server format.
*/
set_psValue : function(sVal){
    this.getBase("df.WebColumn_mixin").set_psValue.call(this, sVal);
    
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
    
    this.getBase("df.WebColumn_mixin").set_pbRender.call(this, bVal);
    
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
    
    this.getBase("df.WebColumn_mixin").set_pbEnabled.call(this, bVal);
    
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

set_psCSSClass : function(sVal){
    var bCS = (this.psCSSClass !== sVal);

    this.getBase("df.WebColumn_mixin").set_psCSSClass.call(this, sVal);
    
    if(bCS){
        this.psCSSClass = sVal;
    
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
    if(this._oParent.onKeyDown(oEvent)){
        this.getBase("df.WebColumn_mixin").onKey.call(this, oEvent);
    }else{
        oEvent.e.cancelBubble = true;
    }
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/
cellHtml : function(tCell){
    var tVal, sVal;
    
    tVal = this.serverToType(tCell.sValue);
    sVal = this.typeToDisplay(tVal);
    
    return (sVal !== '' ? sVal : '&nbsp;');
},

/* 
Triggered by the List / Grid when a cell of this column is clicked. It doesn’t have to be the 
selected cell. 

@param  oEvent  Event object.
@param  sRowId  RowId of the clicked row.
@param  sVal    Value of the clicked cell.
*/
cellClick : function(oEvent, sRowId, sVal){
    
},

/* 
Triggered by the grid when a cell of this column switches to edit mode. This might be because the 
cell is now selected but also because it was scrolled of the screen and is now rendered again.
*/
cellEdit : function(){

},

/* 
Triggered by the grid when a cell switches from edit mode. This might be because a different cell 
will be edited but also because a row is scrolled off the screen. 
*/
cellUnEdit : function(){

},

/* 
Determines which element should be used to position a tooltip next to. We usually want to get the 
tooltip at the cell of this column in the selected row.

@return Element to position tooltip next to.
*/
getTooltipElem : function(){
    var eElem = this._oParent.getColCell(this);
    
    if(!eElem){
        eElem = this._oParent.getColHead(this);
    }
    
    return eElem;
},

/* 
Determine which element should be used to position error messages next to. This is the same as the 
tooltip element.

@return Element to position error next to.
*/
getErrorElem : function(){
    return this.getTooltipElem();
}

});