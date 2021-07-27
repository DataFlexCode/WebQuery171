/*
Class:
    df.WebBaseUIObject
Extends:
    df.WebObject

The WebBaseUIObject is a central class in the inheritance structure of the webapp framework. It 
defines the interface/API for all objects having a user interface. All control classes inherit this 
interface. There is a standardized API for initializing the control by generating the HTML and later 
on attaching the events. Central methods are openHtml, closeHtml, render and afterRender. Properties 
that are standard for all controls are psCSSClass, psHtmlId, pbVisible, pbRender and pbEnabled.
    
Revision:
    2011/07/02  (HW, DAW) 
        Initial version.
*/

df.WebBaseUIObject = function WebBaseUIObject(sName, oParent){
    df.WebBaseUIObject.base.constructor.call(this, sName, oParent);
    
    //  Public properties for all UI Objects
    this.prop(df.tString, "psCSSClass", "");
    this.prop(df.tString, "psHtmlId", "");
    
    this.prop(df.tString, "psTextColor", "");
    this.prop(df.tString, "psBackgroundColor", "");
    
    this.prop(df.tBool, "pbRender", true);
    this.prop(df.tBool, "pbVisible", true);
    this.prop(df.tBool, "pbEnabled", true);
    
    //@privates
    this._eElem = null;                 //  Outermost DOM element
    
    this._bWrapDiv = false;             //  Enables generation of the wrapping DIV element
    this._bRenderChildren = false;      //  Enables rendering of child components (some controls support children)
    
    this._bFocusAble = false;           //  Determines if this control is capable of having the focus
    
    this._sControlClass = "";           //  CSS Class of the final control class
    this._sBaseClass = "WebUIObj";      //  CSS Class of the 'base' class
};
df.defineClass("df.WebBaseUIObject", "df.WebObject",{

// - - - - - - - Rendering API - - - - - - -

/*
This function is responsible for generating the opening HTML during initialization. It is called by 
the framework and an array is passed as string builder. It will add its HTML to this string. The 
closeHtml function is responsible for closing the opened HTML tags. It is common practice that sub 
classes add their HTML before or after doing a forward send.

@param aHtml     Array that is used as string builder.
*/
openHtml : function(aHtml){
    if(this._bWrapDiv){
        aHtml.push('<div class="', this.genClass(), '"');
        if(this.psHtmlId){
            aHtml.push(' id="', this.psHtmlId, '"');
        }
        
        // ToDo: Remove this before release
        aHtml.push(' data-dfobj="', this.getLongName(), '"' ); 
        
        aHtml.push(' tabindex="-1" style=" ',  (this.pbRender ? '' : 'display: none;'), (this.pbVisible ? '' : 'visibility: hidden;'), '"');
        aHtml.push('>');
    }

},

/*
This function is responsible for generating the HTML that closes the elements that are left open by 
the openHtml function. It is common practice that sub classes add their HTML before or after doing a 
forward send.

@param aHtml     Array that is used as string builder.
*/
closeHtml : function(aHtml){
    if(this._bWrapDiv){
        aHtml.push('</div>');
    }
},

/*
Main function of the rendering process. It calls openHtml, closeHtml and genets the DOM elements for 
them. If needed it will call renderChildren to render nested controls.

@return Reference to the outermost DOM element.
*/
render : function(){
    var aHtml = [];
    
    this.openHtml(aHtml);
    this.closeHtml(aHtml);
    
    this._eElem = df.dom.create(aHtml.join(""));
    
    if(this._bRenderChildren){
        this.renderChildren();
    }
    
    return this._eElem;
},

/*
This function is part of the initialization process and is called after the DOM elements are 
created. Its main purpose is to get the needed references to the DOM elements, attach focus events 
and do further initialization (call setters for example). Most of the subclasses will augment this 
method for their initialization. If needed it calls the afterRenderChildren method to initialize 
nested controls.
*/
afterRender : function(){
    if(this._bRenderChildren){
        this.afterRenderChildren();
    }
        
    this.attachFocusEvents();
        
    //  Apply properties
    this.set_psTextColor(this.psTextColor);
    this.set_psBackgroundColor(this.psBackgroundColor);
},

/*
This function is called after this control is shown. It recursively calls its children if 
_bRenderChildren is true. It is triggered by the webapp, views, card container and the pbRender 
setter. It is meant to be augmented by controls when they need to execute special code when this 
happens.
*/
afterShow : function(){
    var i;
    
    if(this._bRenderChildren){
        for(i = 0; i < this._aChildren.length; i++){
            if(this._aChildren[i] instanceof df.WebBaseUIObject && this._aChildren[i].pbRender){
                this._aChildren[i].afterShow();
            }
        }
    }
},

/*
This function is called after this control is hidden. It recursively calls its children if 
_bRenderChildren is true. It is triggered by the webapp, views, card container and the pbRender 
setter. It is meant to be augmented by controls when they need to execute special code when this 
happens.
*/
afterHide : function(){
    var i;
    
    if(this._bRenderChildren){
        for(i = 0; i < this._aChildren.length; i++){
            if(this._aChildren[i] instanceof df.WebBaseUIObject && this._aChildren[i].pbRender){
                this._aChildren[i].afterHide();
            }
        }
    }
},


attachFocusEvents : function(){

},

renderChildren : function(eContainer){
    var i, eChild, oChild;
    
    eContainer = eContainer || this._eElem;

    //  Call children and append them to ourselves
    for(i = 0; i < this._aChildren.length; i++){
        oChild = this._aChildren[i];
        
        //  Check if we can actually render the object
        if(oChild instanceof df.WebBaseUIObject){
            eChild = oChild.render();
            
            if(eChild){
                eContainer.appendChild(eChild);
            }
        }
    }
    
},

afterRenderChildren : function(){
    var i;
    //  Call children
    for(i = 0; i < this._aChildren.length; i++){
        if(this._aChildren[i] instanceof df.WebBaseUIObject){
            this._aChildren[i].afterRender();
        }
    }
},

/*
This method generates the CSS classname that is applied to the outermost DOM element of this 
control. It combines _sBaseClass, _sControlClass, psCSSClass and pbEnabled. Subclasses that want to 
add more CSS classes will augment this method. It is called during initialization and when the 
psCSSClass is set.

Note: Changes made here should also be made in WebAppPreviewer.js!

@return String containing the CSS Classes.
@private
*/
genClass : function(){
    return this._sBaseClass + " " + this._sControlClass + (this.pbEnabled ? " Web_Enabled" : " Web_Disabled") + ( this.psCSSClass ? " " + this.psCSSClass : "");
},

// - - - - - - - Setters & Getters - - - - - - -

set_psTextColor : function(sVal){
    if(this._eElem){
        this._eElem.style.color = sVal || '';
    }
},

set_psBackgroundColor : function(sVal){
    if(this._eElem){
        this._eElem.style.backgroundColor = sVal || '';
    }
},

set_pbVisible : function(bVal){
    if(this._eElem){
        this._eElem.style.visibility = (bVal ? '' : 'hidden');
    }
},

set_pbRender : function(bVal){
    if(this._eElem){
        this._eElem.style.display = (bVal ? '' : 'none');
        
        if(this.pbRender !== bVal){
            this.pbRender = bVal;
            
            //  Trigger after hide / show
            if(this.pbRender){
                this.afterShow();
            }else{
                this.afterHide();
            }
            
            //  The parent panel to recalculate its sizes
            if(this._oParent){
                if(this._oParent.position){
                    this._oParent.position();
                }
                if(this._oParent.sizeChanged){
                    this._oParent.sizeChanged();
                }
            }
        }
    }
},

set_pbEnabled : function(bVal){
    if(this._eElem && bVal !== this.pbEnabled){        
        if(bVal){
            df.dom.removeClass(this._eElem, "Web_Disabled");
            df.dom.addClass(this._eElem, "Web_Enabled");
        }else{
            df.dom.addClass(this._eElem, "Web_Disabled");
            df.dom.removeClass(this._eElem, "Web_Enabled");
        }
    }
},

set_psCSSClass : function(sVal){
    this.psCSSClass = sVal;
    
    if(this._eElem){
        this._eElem.className = this.genClass();
    }
},

set_psHtmlId : function(sVal){
    if(this._eElem){
        this._eElem.id = sVal;
    }
},

// - - - - - - - Supportive - - - - - - -

/*
This method is called by the server to pass the focus to this control.

@client-action
*/
svrFocus : function(){
    this.focus();
},

onFocus : function(oEvent){
    this.getWebApp().objFocus(this);
},

focus : function(){
    if(this._bFocusAble && this.pbEnabled && this._eElem && this._eElem.focus){
        this._eElem.focus();
        
        return true;
    }
    
    return false;
},

onBlur : function(oEvent){
    this.getWebApp().objBlur(this);
},

/*
This method is called by setters or by child controls when the size has changes which mean that 
everything might need to resize. We try to resize from the parent down but if no parent is available 
we start at this level.

@private
*/
sizeChanged : function(){
    var oObj = this;
    
    //  Find view or webapp (we always want to start a resize there)
    while(oObj._oParent && !(oObj instanceof df.WebView || oObj instanceof df.WebApp)){
        oObj = oObj._oParent;
    }
    
    if(oObj && oObj.resize){
        oObj.resize();
    }
},

fireSubmit : function(){
    return (this._oParent && this._oParent.fireSubmit && this._oParent.fireSubmit());
}

});