/*
Class:
    df.WebColumnButton
Mixin:
    df.WebColumn_mixin (df.WebColumnButtonBase)
Extends:
    df.WebBaseDEO

This column type can show one or multiple buttons in a list / grid of which the onclick can be 
handled on the server. The buttons are dynamically determined for each row.
    
Revision:
    2013/07/12  (HW, DAW) 
        Initial version.
*/

//  Generate base class using WebColumn_mixin inheriting from WebBaseDEO
df.WebColumnButtonBase = df.mixin("df.WebColumn_mixin", "df.WebBaseDEO");



df.WebColumnButton = function WebColumnButton(sName, oParent){
    df.WebColumnButton.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbDynamic", false);
    
    this.event("OnClick", df.cCallModeDefault); //  Keep this as default because usually there will be a OnRowChange right behind it
    
    
    this._sControlClass = "";
    this._sCellClass = "WebColBtn";
    this._bCellEdit = false;
};
df.defineClass("df.WebColumnButton", "df.WebColumnButtonBase", {

/* 
Augments the openHtml to add a div element that acts as the control. We'll add the buttons to this
div.

@param  aHtml   Array used a string builder to which the HTML is added.
*/
openHtml : function(aHtml){
    df.WebColumnButton.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div>');
},

/* 
Augments the closeHtml to add a div element that acts as the control.

@param  aHtml   Array used a string builder to which the HTML is added.
*/
closeHtml : function(aHtml){
    aHtml.push('</div>');
    
    df.WebColumnButton.base.closeHtml.call(this, aHtml);
},

/*
Augment afterRender to get a reference to the div element that will act as control.
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div");
    
    df.WebColumnButton.base.afterRender.call(this);
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

cellClick : function(oEvent, sRowId, sVal){
    var eBtn = oEvent.getTarget();
    
    if(eBtn.tagName === "BUTTON" && eBtn.hasAttribute("data-dfbtnid")){
        this.fire("OnClick", [ eBtn.getAttribute("data-dfbtnid"), sRowId ]);
        
        return true;
    }
    
    return false;
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/
cellHtml : function(tCell){
    var i, iBtns, aDetails, aButtons, aHtml = [];
    
    
    if(this.pbDynamic){
        
    
        aButtons = tCell.aOptions;
        
        for(i = 0; i < aButtons.length; i+=3){
            if(aButtons[i]){
                aHtml.push('<button data-dfbtnid="', aButtons[i], '" class="', aButtons[i + 1], '">', aButtons[i + 2], '</button>');
            }
        }
    }else{
        aHtml.push('<button data-dfbtnid="DEFAULT">', this.psButtonCaption, '</button>');
    }
    return aHtml.join('');
},

/*
Override the focus method as the focus needs to go to the the first button element.

@return True if the focus is taken.
*/
focus : function(){
    var eBtn;
    
    if(this._bFocusAble && this.pbEnabled && this._eControl && this._eControl.focus){
        eBtn = df.dom.query(this._eControl, "button");
        
        if(eBtn){
            eBtn.focus();
            
            return true;
        }
    }
    
    return false;
}

});
