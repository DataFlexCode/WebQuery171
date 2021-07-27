/*
Class:
    df.WebColumnLink
Mixin:
    df.WebColumn_mixin (df.WebColumnLinkBase)
Extends:
    df.WebBaseDEO

Implementation of the link column that renders a link instead of the value of which the OnClick can
be handled on the server.
    
Revision:
    2013/07/12  (HW, DAW) 
        Initial version.
*/

//  Generate base class that uses the WebColumn_mixin and WebBaseDEO.
df.WebColumnLinkBase = df.mixin("df.WebColumn_mixin", "df.WebBaseDEO");

/* 
WebColumnLink class that adds an OnClick event fired when a cell is clicked. It also renders like a 
link (blue, underline, cursor hand).
*/
df.WebColumnLink = function WebColumnLink(sName, oParent){
    df.WebColumnLink.base.constructor.call(this, sName, oParent);
    
    this.event("OnClick", df.cCallModeDefault); //  Keep this as default because usually there will be a OnRowChange right behind it
    
    //  Configure super classes
    this._sControlClass = "WebColLink";
    this._sCellClass = "WebColLink";
    this._bCellEdit = false;
};
df.defineClass("df.WebColumnLink", "df.WebColumnLinkBase", {

/* 
Augment openHtml to render the anchor that will be displayed when the cell is selected (so it acts
as the control).

@param  aHtml   String builder array to add HTML to.
*/
openHtml : function(aHtml){
    df.WebColumnLink.base.openHtml.call(this, aHtml);
    
    aHtml.push('<a href="#">');
},

/*
Augment closeHtml to render the anchor.

@param  aHtml   String builder array to add HTML to.
*/
closeHtml : function(aHtml){
    aHtml.push('</a>');
    
    df.WebColumnLink.base.closeHtml.call(this, aHtml);
},

/* 
Augment the afterRender function to get a reference to our anchor that acts as the control.
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "a");
    
    df.WebColumnLink.base.afterRender.call(this);
},

// - - - - - - - - - DEO Implemnetation - - - - - - - - - 
/*
This method reads the current value from the user interface. It will be overridden by the different 
type of Data Entry Objects. The default implementation reads the value property of the control DOM 
element.

@return The currently displayed value.
@private
*/
getControlValue : function(){
    return this.psValue;
},

// - - - - - - - - - WebColumn Stuff - - - - - - - - - - -

/* 
Override the cellClick to trigger the OnClick if an achor is clicked.

@param  oEvent  Event object.
@param  sRowId  RowId of the clicked row.
@param  sVal    Value of the clicked cell.
*/
cellClick : function(oEvent, sRowId, sVal){
    if(oEvent.getTarget().tagName === "A"){
        this.fire("OnClick", [ sRowId, sVal ]);
        
        return true;
    }
    
    return false;
},

/*
Augment the cellHtml to add the anchor element.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/

cellHtml : function(tCell){
    return ('<a href="#">' + df.WebColumnLink.base.cellHtml.call(this, tCell) + '</a>');
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

    if(oEvent.matchKey(df.settings.formKeys.submit)){
        this.cellClick(oEvent, this._oParent.psCurrentRowId, this.psValue);
    }else{
        df.WebColumnLink.base.onKey.call(this, oEvent);
    }
}

});