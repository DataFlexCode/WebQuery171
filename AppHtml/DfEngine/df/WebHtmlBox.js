/*
Class:
    df.WebHtmlBox
Extends:
    df.WebBaseControl

This is the client-side representation of the WebHtmlBox class. The WebHtmlBox control can be used 
to insert a random piece of HTML into the system. It tries to put the HTML inside the control 
rendering flow. This means that it will squeeze itself into the column layout. It can have a dynamic 
or a static height and scrollbars and / or a border.
    
Revision:
    2012/06/18  (HW, DAW) 
        Initial version.
*/
df.WebHtmlBox = function WebHtmlBox(oDef, oParent){
    df.WebHtmlBox.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tBool, "pbScroll", true);
    this.prop(df.tString, "psHtml", "");
    this.prop(df.tInt, "piHeight", 0);
    this.prop(df.tInt, "piMinHeight", 0);
    this.prop(df.tBool, "pbShowBorder", false);
    
    //  @privates
    
    //  Configure super classes
    this._sControlClass = "WebHtmlBox";
    this._bFocusAble = false;
};
df.defineClass("df.WebHtmlBox", "df.WebBaseControl",{

/*
This method augments the html generation and adds the div.WebHtml_Wrp element.

@param  aHtml   String builder array containing html.

@private
*/
openHtml : function(aHtml){
    df.WebHtmlBox.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebHtml_Wrp">'); 
},

/*
This method augments the html generation and closes the div.WebHtml_Wrp element.

@param  aHtml   String builder array containing html.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div>');
    
    df.WebHtmlBox.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and is used the get references to DOM elements, attach event 
listeners and do other initialization.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div.WebHtml_Wrp");
    
    df.WebHtmlBox.base.afterRender.call(this);
    
    this.set_piHeight(this.piHeight);
    this.set_pbShowBorder(this.pbShowBorder);
    
    df.events.addDomListener("click", this._eControl, this.onHtmlClick, this);
    
    this.updateHtml(this.psHtml);
},

// - - - - - - Public API - - - - - -

/*
Updates the HTML that is shown inside the box. It doesn't perform any checking and if not rendered 
yet it will update psHtml so that it will be set when rendering.

@param  sHtml   String with HTML.
@client-action
*/
updateHtml : function(sHtml){
    if(this._eControl){
        this._eControl.innerHTML = sHtml;
    }
    
    this.psHtml = sHtml;
},

/*
The setter of pbScroll enables or disabled the scrollbar. Note that no vertical scrollbar will be 
displayed unless the a fixed height is set. A fixed height means that piHeight is set or 
pbFillHeight is true. 

@param  bVal    The new value.
*/
set_pbScroll : function(bVal){
    if(this._eControl){
        this._eControl.style.overflowY = (this.pbFillHeight || this.piHeight > 0 ? (bVal ? "auto" : "hidden") : "visible");    // There should be a fixed height else setting this makes no sense
        this._eControl.style.overflowX = (bVal ? "auto" : "hidden");
    }
},

/*
This method determines if the image is shown with a border and background. It does this by removing 
or adding the "WebHtml_Box" CSS class.

@param  bVal    The new value.
*/
set_pbShowBorder : function(bVal){
    if(this._eControl){
        if(bVal){
            df.dom.addClass(this._eControl, "WebHtml_Box");
        }else{
            df.dom.removeClass(this._eControl, "WebHtml_Box");
        }
    }
},

/*

@param  iVal    The new value.
*/
set_piHeight : function(iVal){
    if(this._eControl){
        df.WebHtmlBox.base.set_piHeight.call(this, iVal);
    
        //  Update pbScroll since it depends on piHeight
        this.piHeight = iVal;
        this.set_pbScroll(this.pbScroll);
    }
},

set_psHtml : function(sVal){
    this.updateHtml(sVal);
},

// - - - - - - Rendering - - - - - -

set_pbFillHeight : function(bVal){
    df.WebHtmlBox.base.set_pbFillHeight.call(this, bVal);
    
    this.pbFillHeight = bVal;
    this.set_pbScroll(this.pbScroll);
},

// - - - - - - Supportive - - - - - -
/*
This method handles the onclick event on the div containing the HTML. It will determine which child 
element was actually clicked and then bubble up in the structure to see if a data-serverOnClick 
attribute was set to define a onclick handler. If it finds one it will fire the OnClick event with 
the value of data-serverOnClick and data-OnClickParam as parameters.

@param  oEvent  The event object with event details.
@private
*/
onHtmlClick : function(oEvent){
    var eElem = oEvent.getTarget();
    
    while(eElem && eElem !== this._eControl){
        if(eElem.getAttribute('data-ServerOnClick')){
            this.fire('OnClick', [ eElem.getAttribute('data-ServerOnClick'), eElem.getAttribute('data-OnClickParam') ]);
        }
        eElem = eElem.parentNode;
    }
}

});