/*
Class:
    df.WebToolBar
Extends:
    df.WebBaseUIObject

The WebToolBar is a control that renders a toolbar inside a commandbar. Regular menu items can be 
used within the toolbar that have an icon and / or a caption.
    
Revision:
    2011/09/27  (HW, DAW) 
        Initial version.
*/

df.WebToolBar = function WebToolBar(oDef, oParent){
    df.WebToolBar.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tBool, "pbShowCaption", false);
    
    // @privates
    this._eControl = null;
    
    this._bWrapDiv = true;
    this._bRenderChildren = true;
    this._sControlClass = "WebToolBar";
};
df.defineClass("df.WebToolBar", "df.WebBaseUIObject",{

openHtml : function(aHtml){
    df.WebToolBar.base.openHtml.call(this, aHtml);
    
    aHtml.push('<ul>');
},

closeHtml : function(aHtml){
    aHtml.push('</ul>');
    aHtml.push('<div style="clear: both;"></div>');
    
    df.WebToolBar.base.closeHtml.call(this, aHtml);
},

renderChildren : function(eContainer){
    //  Get a reference to the UL element
    this._eControl = df.dom.query(this._eElem, "ul");
    
    //  Render children inside UL element
    df.WebToolBar.base.renderChildren.call(this, this._eControl);
},

afterRender : function(){
    df.WebToolBar.base.afterRender.call(this);
    
    this.set_pbShowCaption(this.pbShowCaption);
},


/*
This setter method adds or removes the CSS class that shows caption.

@param  bVal   The new value.
@private
*/
set_pbShowCaption : function(bVal){
    if(this._eControl){
        df.dom.toggleClass(this._eControl, "WebTlb_HideCaption", !bVal);
    }
}

});