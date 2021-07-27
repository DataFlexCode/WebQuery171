/*
Class:
    df.WebIFrame
Extends:
    df.WebBaseControl

This is the client-side representation of the cWebIFrame class. It is capable of rendering an IFrame 
using the IFrame element. The psUrl property allows to set and update the URL being shown within the 
IFrame. Its main usage will be to display reports and other external components within a dataflex 
web applications.
    
Revision:
    2012/12/17  (HW, DAW) 
        Initial version.
*/
df.WebIFrame = function WebIFrame(sName, oParent){
    df.WebIFrame.base.constructor.call(this, sName, oParent);
    
    //  Public properties
    this.prop(df.tString, "psUrl", "");
    
    this.prop(df.tInt, "piHeight", 0);
    this.prop(df.tInt, "piMinHeight", 0);
    
    this.prop(df.tBool, "pbShowBorder", true);
    
    //  Private properties
    this._eWrapper = null;
    
    this._sControlClass = "WebIFrame";
};
df.defineClass("df.WebIFrame", "df.WebBaseControl", {

/*
Augments the openHtml method to generate the HTML for rendering the IFrame.

@param  aHtml   Array string builder to add HTML to.
@private
*/
openHtml : function(aHtml){
    var sName;
    
    df.WebIFrame.base.openHtml.call(this, aHtml);
    
    sName = "df_webiframe_" + df.dom.piDomCounter++;
    
    aHtml.push('<div class="WebIFrm_Wrp"><iframe name="', sName, '" scrolling="auto" frameborder="no"></iframe></div>');
},

/*
Augments the afterRender method to get references to the generated elements and execute setter 
methods to further initialize the control.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "iframe");
    this._eWrapper = df.dom.query(this._eElem, "div.WebIFrm_Wrp");
    
    df.WebIFrame.base.afterRender.call(this);
    
    this.set_pbShowBorder(this.pbShowBorder);
    this.set_psUrl(this.psUrl);
},

/*
Setter method for the psUrl property. Updating this property will navigate the iframe to this URL.

@param  sVal    The new value.
*/
set_psUrl : function(sVal){
    if(this._eControl){
        this._eControl.src = sVal;
    }
},

/*
This method determines if the iframe is shown with a border and background. It does this by removing 
or adding the "WebIFrm_Box" CSS class.

@param  bVal    The new value.
*/
set_pbShowBorder : function(bVal){
    if(this._eWrapper){
        df.dom.toggleClass(this._eWrapper, "WebIFrm_Box", bVal);
    }
},

/*
Override the setHeight method with a custom implementation for this IFrame. It sets the height of the wrapper so that the IFrame element can have a height of 100%. The pixel calculation is also adjusted for this.

@param  iHeight     The height for this component.
*/
setHeight : function(iHeight){
    if(this._eControl){
        //  If a negative value is given we should size 'naturally'
        if(iHeight > 0){
            //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
            if(this.peLabelPosition === df.ciLabelTop){
                iHeight -= this._eLbl.offsetHeight;
            }
            
            //  Substract the wrapping elements
            iHeight -= df.sys.gui.getVertBoxDiff(this._eInner);
            iHeight -= df.sys.gui.getVertBoxDiff(this._eControlWrp);
            // iHeight -= df.sys.gui.getVertBoxDiff(this._eControl);
            
            iHeight -= df.sys.gui.getVertBoxDiff(this._eWrapper);
            
            //  Set the height
            this._eWrapper.style.height = iHeight + "px";
        }else{
            this._eWrapper.style.height = "80px";
        }
    
    }
}

});
