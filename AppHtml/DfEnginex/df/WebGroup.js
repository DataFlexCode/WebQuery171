/*
Class:
    df.WebGroup
Mixin:
    df.WebBaseContainer_mixin
Extends:
    df.WebBaseControl

This class is the client-side representation of the WebGroup class. It is the first class that is 
both a container and a control at the same time and uses WebBaseContainer as a mixin.

Revision:
    2013/11/11  (HW, DAW)
        Refactored into a mixin to support the new WebGroup.
*/

//  Use the WebBaseContainer_mixin and inherit from WebBaseControl
df.WebGroupBase = df.mixin("df.WebBaseContainer_mixin", "df.WebBaseControl");

df.WebGroup = function(sName, oParent){
    df.WebGroup.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCaption", "");
    this.prop(df.tBool, "pbShowBorder", true);
    
    // @privates
    this._eCaption = null;
    
    // Configure super classes
    this._sBaseClass = "WebControl";
    this._sControlClass = "WebGroup";
};
df.defineClass("df.WebGroup", "df.WebGroupBase", {

/* 
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 
The WebGroup generates a label and the WebContainer div.

@param  aHtml   String array used as string builder.
@private
*/
wrpOpenHtml : function(aHtml){
    aHtml.push('<label class="WebGrp_Caption"></label>');
    aHtml.push('<div class="WebContainer">');
},


/* 
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 
The WebGroup generates a label and the WebContainer div.

@param  aHtml   String array used as string builder.
@private
*/
wrpCloseHtml : function(aHtml){
    aHtml.push('</div>');
},

/* 
Augment the afterRender to get a reference to the label element showing the caption.

@private
*/
afterRender : function(){
    this._eCaption = df.dom.query(this._eElem, "label.WebGrp_Caption");
    this._eControl = df.dom.query(this._eElem, "div.WebCon_Inner > div");
    
    // this._eContainer = df.dom.create('<div class="WebContainer"></div>');
    // this._eContainer.appendChild(df.dom.query(this._eElem, ".WebCon_Sizer"));
    // df.dom.query(this._eElem, "div.WebCon_Inner > div").appendChild(this._eContainer);
    
    df.WebGroup.base.afterRender.call(this);
    
    df.dom.setText(this._eCaption, this.psCaption);   //  Update caption immediately
},

/* 
Augment the genClass function to add classes indicating wether a caption and / or a border is shown.

@private
*/
genClass : function(){
    var sClass = df.WebGroup.base.genClass.call(this);
    
    if(this.psCaption){
        sClass += " WebGrp_HasCaption";
    }
    if(this.pbShowBorder){
        sClass += " WebGrp_HasBorder";
    }
    
    return sClass;
},

/* 
Setter method that updates the caption (including the CSS classname on the outer element indicating 
if the is a caption).

@param  sVal    New caption.
*/
set_psCaption : function(sVal){
    if(this._eCaption){
        df.dom.toggleClass(this._eElem, "WebGrp_HasCaption", !!sVal);
        
        df.dom.setText(this._eCaption, sVal);
        
        this.sizeChanged();
    }
},

/* 
Setter method that shows / hides the border by changing the CSS classname set on the outermost 
element.

@param  bVal    New value.
*/
set_pbShowBorder : function(bVal){
    if(this._eElem){
        df.dom.toggleClass(this._eElem, "WebGrp_HasBorder", bVal);
        
        this.sizeChanged();
    }
},

/* 
Override the setHeight and set the height on the container div which will properly stretch the 
control and will make the container sizing logic function properly.

@param  iHeight     The full height of the control (outermost element).
@private
*/
setHeight : function(iHeight){
    if(this._eContainer){
        if(iHeight > 0){
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControl);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);
            
            this._eContainer.style.height = iHeight + "px";
        }else{
            this._eContainer.style.height = "";
        }
    }
},

set_psBackgroundColor : function(sVal){
	if(this._eInner){
        this._eInner.style.backgroundColor = sVal || '';
    }
}


});