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
    
    this._aKeyHandlers = [];
    
    this._bShown = false;
    
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
    
    //  Add key listener if handlers are registered
    if(this._aKeyHandlers.length > 0){
        df.events.addDomListener("keydown", this._eElem, this.onKeyDownHandler, this);
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
    
    this._bShown = true;
    
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
    
    this._bShown = false;
    
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
        df.dom.toggleClass(this._eElem, "Web_Disabled", !bVal);
        df.dom.toggleClass(this._eElem, "Web_Enabled", bVal);
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
Registers a key handler for the provided key combination. The key handlers are stored in an array 
and are accessed when a key event occurs. An array of messages that need to be triggered on the 
server is stored with the key information.

@param  sServerMsg  String message name of server-side handler message.
@param  iKeyCode    Integer key code (event.keyCode).
@param  bShift      Idicates if shift needs to be pressed.
@param  bAlt        Indicates if alt needs to be pressed.
@param  bCtrl       Indicates if ctrl needs to be pressed.

@client-action
*/
addKeyHandler : function(sServerMsg, iKeyCode, bShift, bAlt, bCtrl){
    var i, oKH;
    
    //  Convert to JS type
    iKeyCode    = df.toInt(iKeyCode);
    bShift      = df.toBool(bShift);
    bAlt        = df.toBool(bAlt);
    bCtrl       = df.toBool(bCtrl);
    
    //  Check if no key handler is defined for this key
    oKH = this.findKeyHandler(iKeyCode, bShift, bAlt, bCtrl);
    
    if(oKH){
        //  Add to existing handler if message isn't already registered
        for(i = 0; i < oKH.aMsg.length; i++){
            if(oKH.aMsg[i] === sServerMsg){
                return;
            }
        }
        
        oKH.aMsg.push(sServerMsg);
    }else{
        //  Add key handler if not already added
        if(this._aKeyHandlers.length === 0 && this._eElem){
            df.events.addDomListener("keydown", this._eElem, this.onKeyDownHandler, this);
        }
        
        //  Register new key handler
        this._aKeyHandlers.push({ 
            iKey : iKeyCode, 
            aMsg : [ sServerMsg ],
            bShift : bShift,
            bAlt : bAlt,
            bCtrl : bCtrl
        });
    }
},

/* 
Removes a registered key handler based on the details used when it is added. 

@param  sServerMsg  String message name of server-side handler message.
@param  iKeyCode    Integer key code (event.keyCode).
@param  bShift      Idicates if shift needs to be pressed.
@param  bAlt        Indicates if alt needs to be pressed.
@param  bCtrl       Indicates if ctrl needs to be pressed.

@client-action
*/
removeKeyHandler : function(sServerMsg, iKeyCode, bShift, bAlt, bCtrl){
    var i, oKH;
    
    //  Convert to JS types
    iKeyCode    = df.toInt(iKeyCode);
    bShift      = df.toBool(bShift);
    bAlt        = df.toBool(bAlt);
    bCtrl       = df.toBool(bCtrl);
    
    //  Search key handler
    oKH = this.findKeyHandler(iKeyCode, bShift, bAlt, bCtrl);
    
    if(oKH){
        //  Remove message
        for(i = 0; i < oKH.aMsg.length; i++){
            if(oKH.aMsg[i] === sServerMsg){
                oKH.aMsg.splice(i, 1);
                i--;
            }
        }
        
        //  Remove entire handler no more messages
        if(!oKH.aMsg.length){
            this._aKeyHandlers.slice(oKH.iIndex, 1);
        }
    }
    
    //  Remove DOM handler if no more handlers
    if(this._aKeyHandlers.length === 0 && this._eElem){
        df.events.removeDomListener("keydown", this._eElem, this.onKeyDownHandler);
    }
},

/* 
Searches the array of key handlers for a specific key and returns the handler object. It adds an 
extra property iIndex to the object that contains the array index of the key handler.

@param  iKeyCode    Integer key code (event.keyCode).
@param  bShift      Idicates if shift needs to be pressed.
@param  bAlt        Indicates if alt needs to be pressed.
@param  bCtrl       Indicates if ctrl needs to be pressed.

@return Key handler object (null if none found).
@private
*/
findKeyHandler : function(iKeyCode, bShift, bAlt, bCtrl, iIndexOut){
    var i, oH;
    
    //  Loop all handlers to find specific handler
    for(i = 0; i < this._aKeyHandlers.length; i++){
        oH = this._aKeyHandlers[i];
        
        if(oH.iKey === iKeyCode && oH.bShift === bShift && oH.bAlt === bAlt && oH.bCtrl === bCtrl){
            oH.iIndex = i;
            
            return oH;
        }
    }
    
    return null;
},

/* 
Event handler for the onkey event. It searches for a key handler and if found it triggers the server 
actions that belong to it. 

@param  oEvent  Event object.
*/
onKeyDownHandler : function(oEvent){
    var oKH, i;
    
    //  Search handler
    oKH = this.findKeyHandler(oEvent.getKeyCode(), oEvent.getShiftKey(), oEvent.getAltKey(), oEvent.getCtrlKey());
        
    if(oKH){
        //  Perform server actions if found
        for(i = 0; i < oKH.aMsg.length; i++){
            this.serverAction(oKH.aMsg[i], [ oKH.iKey, df.fromBool(oKH.bShift), df.fromBool(oKH.bAlt), df.fromBool(oKH.bCtrl) ]);
        }
        oEvent.stop();
    }
},

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
    var oWebApp, oObj = this;
    
    //  Find view or webapp (we always want to start a resize there)
    while(oObj._oParent && !(oObj instanceof df.WebView || oObj instanceof df.WebApp)){
        oObj = oObj._oParent;
    }
    
    if(oObj && oObj.resize){
        oObj.resize();
    }
    
    if(this.getWebApp()){
        this.getWebApp().notifyLayoutChange(this);
    }
},

fireSubmit : function(){
    return (this._oParent && this._oParent.fireSubmit && this._oParent.fireSubmit());
}

});