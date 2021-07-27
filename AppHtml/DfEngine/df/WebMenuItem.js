/*
Class:
    df.WebMenuItem
Extends:
    df.WebBaseUIObject

This is the client-side representation of the WebMenuItem class that renders the HTML for the menu 
item. 
    
Revision:
    2011/10/04  (HW, DAW) 
        Initial version.
*/

df.WebMenuItem = function WebMenuItem(oDef, oParent){
    df.WebMenuItem.base.constructor.call(this, oDef, oParent);
    
    this.prop(df.tString, "psCaption", "");
    this.prop(df.tString, "psTextColor", "");
    this.prop(df.tBool, "pbBeginGroup", false);
    this.prop(df.tString, "psImage", "");
    this.prop(df.tString, "psToolTip", "");
    
    this.event("OnClick", df.cCallModeWait);
    this.prop(df.tString, "psLoadViewOnClick", "");
    
    // @privates
    this._eSubMenu = null;
    this._eIcon = null;
    this._eWrap = null;
    this._bChildMenu = false;
    
    this._bRenderChildren = true;
    this._bWrapDiv = false;
    this._sControlClass = "WebMenuItem";
    this._tHideTimout = null;
    this._bSubShown = false;
};
/*
This class represents a menu item inside a menu or a toolbar. It belongs to the server-side 
cWebMenuItem class and implements its functionality on the client. It has support for icons a 
caption and sub menus. The submenu's are shown when hovering the element and hidden after a timeout 
(or a click). The CSS (class: WebMenuItem & WebMenuBar & WebToolBar) heavily determines the looks of 
the control.

@code
<li class="WebUIObj WebMenuItem">
    <div title="Order Entry View">
        <span class="WebItm_Icon" style="background-image: url(&quot;Images/Order.png&quot;);">&nbsp;</span>
        <a href="javascript: df.sys.nothing();">Order Entry View</a>
    </div>
</li>
@code
*/
df.defineClass("df.WebMenuItem", "df.WebBaseUIObject",{

//  - - - Rendering - - -

/*
The WebMenuItem generates its own HTML and doesn't use the wrapper DIV from the superclass. The ul 
element for the submenu is optional.

@param  aHtml   String builder array to add the HTML to.

@private
*/
openHtml : function(aHtml){
    df.WebMenuItem.base.openHtml.call(this, aHtml);
    
    aHtml.push('<li class="', this.genClass(), '"');
    aHtml.push(' style=" ',  (this.pbRender ? '' : 'display: none;'), (this.pbVisible ? '' : 'visibility: hidden;'), '"');
    aHtml.push('><div><span class="WebItm_Icon">&nbsp;</span><a href="javascript: df.sys.nothing();">nbsp;</a></div>');
    
    if(this._bChildMenu){
        aHtml.push('<ul style="display: none">');
    }
},

/*
Properly close the opened HTML elements.

@param  aHtml   String builder array to add the HTML to.

@private
*/
closeHtml : function(aHtml){
    if(this._bChildMenu){
        aHtml.push('</ul>');
    }
    aHtml.push('</li>');
    
    df.WebMenuItem.base.closeHtml.call(this, aHtml);
},

/*
This initializer method allows us to do properly initialize the DOM elements after they are added. 
We get references to generated elements, attach listeners and call the setters.

@private
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "a");
    this._eIcon = df.dom.query(this._eElem, "div > span.WebItm_Icon");
    
    df.WebMenuItem.base.afterRender.call(this);
    
    //  Attach listeners
    df.events.addDomListener("click", this._eElem, this.onItemClick, this);
    
    if(this._bChildMenu){
        df.events.addDomListener("mouseover", this._eElem, this.onMouseOver, this);
        df.events.addDomListener("mouseout", this._eElem, this.onMouseOut, this);
    }
    
    df.dom.disableTextSelection(this._eElem);
    
    //  Call setters
    this.set_psCaption(this.psCaption);
    this.set_pbBeginGroup(this.pbBeginGroup);
    this.set_psImage(this.psImage);
    this.set_psToolTip(this.psToolTip);
    
},

/*
We need to augment the renderChildren method because the children need to be added to the ul 
element.

@private
*/
renderChildren : function(eContainer){
    //  Get a reference to the UL of the submenu
    this._eSubMenu = df.dom.query(this._eElem, "ul");
    
    //  Tell base to render children in the submenu
    df.WebMenuItem.base.renderChildren.call(this, this._eSubMenu);
},



//  - - - Event handlers - - -

/*
This method handles the onclick event of li DOM element. If the control is enabled this means that 
we fire the OnClick event and hide the menu.

@param  oEvent  DOM Event object (see: df.events.DOMEvent)
@private
*/
onItemClick : function(oEvent){
    if(this.pbEnabled){
        this.fire('OnClick', [], function(oEvent){
            //  Determine if a view needs to be loaded
            if(!oEvent.bCancelled){
                if(this.psLoadViewOnClick){
                    this.getWebApp().showView(this.psLoadViewOnClick);
                }
            }
            
            this.getWebApp().returnFocus();
        });
        
        this.getWebApp().returnFocus();
        if(this._oParent instanceof df.WebMenuItem){
            this._oParent.hideSub(true);
        }
    }
    
    //  Stop the event to make sure that we don't bubble to parent menu items
    oEvent.stop();
},

/*
When the item is hovered we display the submenu.

@param  oEvent  DOM Event object (see: df.events.DOMEvent)
@private
*/
onMouseOver : function(oEvent){
    if(this.pbEnabled){
        this.showSub();
    }
},

/*
When the mouse pointer leaves the item (or one of its submenu's) we start the timeout to hide the 
submenu.

@param  oEvent  DOM Event object (see: df.events.DOMEvent)
@private
*/
onMouseOut : function(oEvent){
    var that = this;
    
    this._tHideTimout = setTimeout(function(){
        that._tHideTimout = null;
        that.hideSub();
    }, 500);
},

//  - - - Public API - - - 

/*
This method directly hides the submenu (if there is one available).

@param  bParent     If true this method calls its parent as well.
*/
hideSub : function(bParent){
    if(this._eSubMenu){
        //  Cancel timer and set properties
        if(this._tHideTimout){
            clearTimeout(this._tHideTimout);
            this._tHideTimout = null;
        }
        this._bSubShown = false;
        
        //  Update style
        df.dom.removeClass(this._eElem, "WebItm_Expanded");
        this._eSubMenu.style.display = "none";
        
        //  Bubble up to parent
        if(bParent){
            if(this._oParent instanceof df.WebMenuItem){
                this._oParent.hideSub(true);
            }
        }
    }
},

/*
This method shows the submenu. Note that this will directly close submenu's of sibling menu items.
*/
showSub : function(){
    if(this._eSubMenu){
        if(this._tHideTimout){
            clearTimeout(this._tHideTimout);
            this._tHideTimout = null;
        }
        if(!this._bSubShown){
            this.hideSiblings();
        }
        
        this._bSubShown = true;
        
        df.dom.addClass(this._eElem, "WebItm_Expanded");
        this._eSubMenu.style.display = "block";
    }
},

/*
This method makes sure that this item is shown when being used in a menu. It will also show the 
submenu of the current item. It does this by going up in the menu structure and making sure the 
items are expanded. Note that this method ignores the enabled state. The menu will be hidden as 
soon as it is hovered with the mouse.
*/
show : function(){
    var oItem = this;
    
    while(oItem && oItem instanceof df.WebMenuItem){
        oItem.showSub();
        
        oItem = oItem._oParent;
    }
},

/*
This method hides the submenu and bubbles up in the menu structure hiding all items. It doesn't hide 
when the item is hovered by the mouse.
*/
hide : function(){
    var oItem = this;
    
    while(oItem && oItem instanceof df.WebMenuItem){
        if(!oItem._tHideTimout){
            oItem.hideSub();
        }
        
        oItem = oItem._oParent;
    }
},

/*
This method hides the submenu's of sibling menu items.
*/
hideSiblings : function(){
    var i, aSiblings;
    
    if(this._oParent){
        aSiblings = this._oParent._aChildren || [];
    
        for(i = 0; i < aSiblings.length; i++){
            if(aSiblings[i] instanceof df.WebMenuItem){
                aSiblings[i].hideSub();
            }
        }
    }
},

//  - - - Setters - - - 

/*
This setter method updates the DOM with the new caption.

@param  sVal   The new value.
@private
*/
set_psCaption : function(sVal){
    if(this._eControl){
        //  Replace the first occurence of & (which is used to indicate keyboard shortcuts in windows)
        sVal = sVal.replace("&", "");
        
        df.dom.setText(this._eControl, sVal);
    }
},

/*
This setter method updates the DOM with the new tooltip.

@param  sVal   The new value.
@private
*/
set_psToolTip : function(sVal){
    if(this._eControl){
        this._eElem.title = sVal;
        // this._eControl.title = sVal;
        // this._eIcon.title = sVal;
    }
},

/*
This setter method adds or removes the CSS class that shows the group line.

@param  bVal   The new value.
@private
*/
set_pbBeginGroup : function(bVal){
    if(this._eElem){
        if(bVal){
            df.dom.addClass(this._eElem, "WebItm_BgnGroup");
        }else{
            df.dom.removeClass(this._eElem, "WebItm_BgnGroup");
        }
    }
},

/*
This setter method updates the background-image style property of the icon element.

@param  sVal   The new value.
@private
*/
set_psImage : function(sVal){
    if(this._eElem){
        if(sVal){
            df.dom.addClass(this._eElem, "WebItm_HasIcon");
        }else{
            df.dom.removeClass(this._eElem, "WebItm_HasIcon");
        }
    
        this._eIcon.style.backgroundImage = (sVal ? "url('" + sVal + "')" : "");
    }
},

//  - - - Control / container stuff - - - 

/*
This method augments the method that generates the full CSS classname and adds the 'WebItm_HasSub' 
class when sub items are available.

@param  sVal   The new value.
@private
*/
genClass : function(){
    var sClass = df.WebMenuItem.base.genClass.call(this);
    
    if(this._bChildMenu){
        sClass += " WebItm_HasSub";
    }
    
    return sClass;
},

/*
We need to know if there are child menu items.

@private
*/
addChild : function(oChild){
    if(oChild instanceof df.WebMenuItem){
        this._bChildMenu = true;
    }
    df.WebMenuItem.base.addChild.call(this, oChild);
}
});