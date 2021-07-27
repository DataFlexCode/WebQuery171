 /*
Class:
    df.WebColumnImage
Mixin:
    df.WebColumn_mixin (df.WebColumnImageBase)
Extends:
    df.WebBaseDEO

This column type can show one or multiple images in a list / grid of which the onclick can be 
handled on the server. The images are dynamically determined for each row.
    
Revision:
    2013/07/12  (HW, DAW) 
        Initial version.
*/

// Define base class based on WebColumn_mixin inheriting from WebBaseDEO
df.WebColumnImageBase = df.mixin("df.WebColumn_mixin", "df.WebBaseDEO");


/* 
Image column showing one or more images inside a column.
*/
df.WebColumnImage = function WebColumnImage(sName, oParent){
    df.WebColumnImage.base.constructor.call(this, sName, oParent);
    
    this.event("OnClick", df.cCallModeDefault); //  Keep this as default because usually there will be a OnRowChange right behind it
    
    this.prop(df.tBool, "pbImageByCSS", false);
    this.prop(df.tBool, "pbDynamic", false);
    
    this.prop(df.tString, "psImageUrl", "");
    this.prop(df.tString, "psImageCSSClass", "");
    
    this.prop(df.tInt, "piImageWidth", 0);
    this.prop(df.tInt, "piImageHeight", 0);
    
    this._sControlClass = "";
    this._sCellClass = "WebColBtn";
    this._bCellEdit = false;
};
df.defineClass("df.WebColumnImage", "df.WebColumnImageBase", {

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

/* 
Setter for psImageUrl that updates the entire list so the new image will be shown.

@param  sVal    New value.
*/
set_psImageUrl : function(sVal){
    this.psImageUrl = sVal;
    
    this._oParent.redraw();
},

// - - - - - - - - - DEO Implementation - - - - - - - - - 
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
Implements the cellClick that is sent to the column by the grid / list when a cell is clicked. It 
checks if (and which) image is clicked and fires the OnClick event to the server.

@param  oEvent  Event object.
@param  sRowId  RowId of the clicked row.
@param  sVal    Value of the clicked cell.
*/
cellClick : function(oEvent, sRowId, sVal){
    var eImg = oEvent.getTarget();
    
    if(eImg.tagName === "IMG" && eImg.hasAttribute("data-dfimg")){
        this.fire("OnClick", [ eImg.getAttribute("data-dfimg"), sRowId ]);
        
        return true;
    }
    
    return false;
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  sVal    The value in server format.
@return The HTML representing the display value.
*/
cellHtml : function(tCell){
    var i, aImages, aHtml = [], sStyle = "";
    
    if(this.piImageWidth > 0){
        sStyle += "width: " + this.piImageWidth + "px";
    }
    if(this.piImageHeight > 0){
        sStyle += "height: " + this.piImageHeight + "px";
    }
    
    if(this.pbDynamic){
        aImages = tCell.aOptions;
        
        for(i = 0; i < aImages.length; i++){
            if(aImages[i]){
                if(this.pbImageByCSS){
                    aHtml.push('<span style="', sStyle, '" class="', aImages[i], '" data-dfimg="', aImages[i], '"></span>');
                }else{
                    aHtml.push('<img style="', sStyle, '" src="', aImages[i], '" data-dfimg="', aImages[i], '">');
                }
            }
        }
    }else{
        if(this.pbImageByCSS){
            aHtml.push('<span style="', sStyle, '" class="', this.psImageCSSClass, '" data-dfimg="', this.psImageUrl, '"></span>');
        }else{
            aHtml.push('<img style="', sStyle, '" src="', this.psImageUrl, '" data-dfimg="', this.psImageUrl, '">');
        }
    }
    
    return aHtml.join('');
}

});
