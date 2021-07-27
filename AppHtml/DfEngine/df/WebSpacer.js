/*
Class:
    df.WebSpacer
Extends:
    df.WebBaseControl

This is the client-side representation of the cWebSpacer class. The WebSpacer control is meant to 
add whitespace to between controls in the column layout flow. While this could be done with other 
controls this is the official supported way to do it.
    
Revision:
    2012/08/30  (HW, DAW) 
        Initial version.
*/
df.WebSpacer = function(sName, oParent){
    df.WebSpacer.base.constructor.call(this, sName, oParent);

    this.prop(df.tInt, "piHeight", 0);
    this.prop(df.tInt, "piMinHeight", 0);
    
    this._sControlClass = "WebSpacer";
    this._bFocusAble = false;
};
df.defineClass("df.WebSpacer", "df.WebBaseControl",{

/*
This method augments the html generation and adds the div.WebSpacer_Spacer element.

@param  aHtml   String builder array containing html.

@private
*/
openHtml : function(aHtml){
    df.WebSpacer.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebSpacer_Spacer">'); 
},

/*
This method augments the html generation and closes the div.WebSpacer_Spacer element.

@param  aHtml   String builder array containing html.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div>');
    
    df.WebSpacer.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and is used the get references to DOM elements, attach event 
listeners and do other initialization.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div.WebSpacer_Spacer");
    
    df.WebSpacer.base.afterRender.call(this);
}

});