/*
Class:
    df.WebImage
Extends:
    df.WebBaseControl

This is the client-side representation of the WebImage class. It renders the image (container) and 
can show images based on a URL or with base64 encoded data. It has support for different display 
modes like stretch and center and can show scrollbars.
    
Revision:
    2012/06/01  (HW, DAW) 
        Initial version.
*/
df.WebImage = function WebImage(oDef, oParent){
    df.WebImage.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tString, "psUrl", "");
    this.prop(df.tBool, "pbScroll", false);
    this.prop(df.tInt, "pePosition", df.cwiActual);
    this.prop(df.tBool, "pbShowBorder", false);
    
    this.OnClick = df.events.JSHandler();
    this.pbServerOnClick = false;
    this.psClientOnClick = "";
           
    // @privates
    this._sControlClass = "WebImage";
    this._eImg = null;
    
    this._sUrl = null;
};
df.defineClass("df.WebImage", "df.WebBaseControl",{

/*
This method augments the html generation and adds the div.WebImg_Wrp element and the img element.

@param  aHtml   String builder array containing html.

@private
*/
openHtml : function(aHtml){
    df.WebImage.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebImg_Wrp"><img>'); 
},

/*
This method augments the html generation and closes the div.WebImg_Wrp element.

@param  aHtml   String builder array containing html.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div>');

    df.WebImage.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and is used the get references to DOM elements, attach event 
listeners and do other initialization.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div.WebImg_Wrp");
    this._eImg = df.dom.query(this._eElem, "div.WebImg_Wrp > img");
    
    df.WebImage.base.afterRender.call(this);
    
    df.events.addDomListener("click", this._eControl, this.onClick, this);
    df.events.addDomListener("load", this._eImg, this.onImageLoaded, this);
    
    this.set_pePosition(this.pePosition);
    this.set_pbShowBorder(this.pbShowBorder);
    this.set_piHeight(this.piHeight);
    this.updateImage();
},

// - - - - - - Public API - - - - - -

/*
The setter of psUrl will update the image that is displayed. The updateImage method is called to 
actually update the image. The _sUrl property is cleared to make sure that we are not showing base64 
encoded images any more.

@param  sVal    The new value.
*/
set_psUrl : function(sVal){
    this.psUrl = sVal;
    this._sUrl = null;
    
    this.updateImage();
},

/*
The setter of pbScroll enables or disabled the scrollbar. If pePosition is set to stretch it will not 
enable the scrollbars and if pePosition is set to stretch horizontal it will only show the horizontal 
scrollbar (if needed).

@param  bVal    The new value.
*/
set_pbScroll : function(bVal){
    if(this._eControl){
        this._eControl.style.overflowY = (bVal && this.pePosition !== df.cwiStretch  ? "auto" : "hidden");
        this._eControl.style.overflowX = (bVal && this.pePosition !== df.cwiStretchHoriz && this.pePosition !== df.cwiStretch  ? "auto" : "hidden");
      }
},


/*
The mode determines how the image is positioned. It can be centered, stretched or left top aligned 
(actual). This setter method changes this behavior by manipulating CSS properties of the image 
element. The center image method is called to center the image (which is a calculated process) and 
the setter of pbScroll is called because it depends on the mode as well.

@param  iVal    New value.
*/
set_pePosition : function(iVal){
    if(this._eImg){
        this._eImg.style.width = (iVal === df.cwiStretch || iVal === df.cwiStretchHoriz ? "100%" : "");
        this._eImg.style.height = (iVal === df.cwiStretch ? "100%" : "");
        
        this._eImg.style.marginLeft = (iVal === df.cwiCenter ? "auto" : "");
        this._eImg.style.marginRight = (iVal === df.cwiCenter ? "auto" : "");
        this._eImg.style.display = "block";
        this._eImg.style.marginTop = "";        
        
        
        this.pePosition = iVal;
        this.set_pbScroll(this.pbScroll);
        this.centerImage();
    }
},

/*
This method determines if the image is shown with a border and background. It does this by removing 
or adding the "WebImg_Box" CSS class.

@param  bVal    The new value.
*/
set_pbShowBorder : function(bVal){
    if(this._eControl){
        df.dom.toggleClass(this._eControl, "WebImg_Box", bVal);
        
        if(this.pbShowBorder !== bVal){
            this.sizeChanged();
        }
    }
},

/*
Sets the tooltip on the image element. Both the alt and the title attributes are set to make it show 
as a tooltip in all browser.

@param  sVal    The new tooltip.
*/
set_psTooltip : function(sVal){
    if(this._eImg){
        this._eImg.alt = sVal;
        this._eImg.title = sVal;
    }
},

// - - - - - - Rendering - - - - - -

/*
This method is called by the server to update the displayed image with a base64 encoded image. The 
image is passed in the ActionData as an array of strings. The parameter specifies the mime type.

@param  sType   The mime type of the image.
@client-action
*/
updateBase64 : function(sType){
    var i, aStr = [], aData = this._aActionData;
    
    if(aData.length > 0){
        aStr.push("data:", sType, ";base64,");
    
        for(i = 0; i < aData[0].aValues.length; i++){
            aStr.push(aData[0].aValues[i]);
        }
        
        this._sUrl = aStr.join('');
        
        this.updateImage();
    }
},

/*
Updates the displayed image based on psUrl or _sUrl. If _sUrl is set it will use it.

@private
*/
updateImage : function(){
    if(this._eImg){
        if(this._sUrl){
            this._eImg.src = this._sUrl;
        }else{
            this._eImg.src = this.psUrl;
        }
        
        this.centerImage();
    }
},

/*
This method makes sure the image is centered if pePosition is set to cwiCenter. It does this by 
setting the marginTop if the image is smaller in height than the available space or it sets the 
scrollTop & scrollLeft if the image is bigger than the available space.

@private
*/
centerImage : function(){
    if(this._eImg && this.pePosition === df.cwiCenter){
        if(this._eImg.clientHeight < this._eControl.clientHeight){
            this._eImg.style.marginTop = Math.floor((this._eControl.clientHeight - this._eImg.clientHeight) / 2) + "px";
        }else{
            this._eImg.style.marginTop = "";
            this._eControl.scrollTop = Math.floor((this._eControl.scrollHeight - this._eControl.clientHeight) / 2);
        }
        this._eControl.scrollLeft = Math.floor((this._eControl.scrollWidth - this._eControl.clientWidth) / 2);
    }
},

/*
Overrides the resize method and calls the centerImage.

@private
*/
resize : function(){
    this.centerImage();
},

/*
Handles the onload event of the image element and centers this image.

@private
*/
onImageLoaded : function(oEvent){
    this.centerImage();
},

onClick : function(oEvent){
    if(this.fire('OnClick')){
        oEvent.stop();
    }
}

});