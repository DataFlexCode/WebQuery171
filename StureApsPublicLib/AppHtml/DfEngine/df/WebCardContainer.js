/*
Class:
    df.WebCardContainer
Extends:
    df.WebBaseControl

This class is the client-side representation of the cWebCardContainer and is responsible for rendering 
this tab dialog. It can only contain cWebTabPage objects as children.
    
Revision:
    2011/10/13  (HW, DAW) 
        Initial version.
    2012/10/02  (HW, DAW)
        Split into WebCardContainer and WebTabContainer.
*/
df.WebCardContainer = function WebCardContainer(sName, oParent){
    df.WebCardContainer.base.constructor.call(this, sName, oParent);
    
    //  Web Properties
    this.prop(df.tBool, "pbFillHeight", false);
    this.prop(df.tInt, "piMinHeight", 0);
    this.prop(df.tInt, "piHeight", 0);
    
    this.prop(df.tBool, "pbShowBorder", false);
    this.prop(df.tBool, "pbShowCaption", false);
    
    this.prop(df.tString, "psCurrentCard", "");
    this.addSync("psCurrentCard");
    
    //  Events
    this.event("OnCardChange", df.cCallModeWait);
    
    //@privates
    this._iHeightSet = null;
    this._aCards = [];
    this._eHead = null;
    this._oCurrent = null;
    this._bRendered = false;
    
    //  Configure super classes
    this._bWrapDiv = true;
    this._bRenderChildren = true;
    this._sControlClass = "WebCardContainer";
    this._sCardClass = "WebCC";
};
df.defineClass("df.WebCardContainer", "df.WebBaseControl",{

// - - - - Rendering - - - - 

openHtml : function(aHtml){
    var i;
    
    df.WebCardContainer.base.openHtml.call(this, aHtml);
    
    //  Generate header HTML
    aHtml.push('<div class="', this._sCardClass, '_LabelSpacer" style="', (this.pbShowCaption ? '' : 'display: none'), '"><label></label></div>');
    aHtml.push('<div class="', this._sCardClass, '_Head">');
    
    for(i = 0; i < this._aCards.length; i++){
        this._aCards[i].tabButtonHtml(aHtml);
    }
    
    aHtml.push('<div style="clear: both"></div></div>');
    
    //  Generate body HTML
    aHtml.push('<div class="', this._sCardClass, '_Body ', (this.pbShowBorder ? 'WebCC_BodyBorder' : 'WebCC_BodyNoBorder') , (this.pbShowCaption ? ' WebCC_HasCaption' : '') ,'" style="overflow: hidden">');
},

closeHtml : function(aHtml){
    aHtml.push('</div>');
    
    df.WebCardContainer.base.closeHtml.call(this, aHtml);
},

afterRender : function(){
    var i, oTab, aButtons, oSelectTab = this._oCurrent;
    
    this._eHead = df.dom.query(this._eElem, 'div.' + this._sCardClass + '_Head');
    this._eLabelSpacer = df.dom.query(this._eElem, 'div.' + this._sCardClass + '_LabelSpacer');
    this._eLabel = df.dom.query(this._eElem, 'div.' + this._sCardClass + '_LabelSpacer > label');
    
    //  Get references to the button elements
    aButtons = df.dom.query(this._eElem, 'div.' + this._sCardClass + '_Head > div.WebTab_Btn', true);
    
    //  Pass references to the button elements to the corresponding tab pages
    for(i = 0; i < this._aCards.length; i++){
        oTab = this._aCards[i];
        
        if(!oSelectTab && oTab.canShow()){
            oSelectTab = oTab;
        }
        if(i < aButtons.length){
            oTab._eBtn = aButtons[i];
        }
    }
    
    df.WebCardContainer.base.afterRender.call(this);
    
    //  Display the current tab
    this.showCard(oSelectTab, true);

    
    this._bRendered = true;
},

renderChildren : function(eRenderTo){
    eRenderTo = this._eControl = df.dom.query(this._eElem, 'div.' + this._sCardClass + '_Body');
    
    df.WebCardContainer.base.renderChildren.call(this, eRenderTo);
},

/*
Augmenting the addChild method to filter out tabs.

@private
*/
addChild : function(oChild){
    if(oChild instanceof df.WebCard){
        this._aCards.push(oChild);
    }else if(oChild instanceof df.WebBaseUIObject){
        throw new df.Error(999, "WebCardContainer objects cannot have controls as direct children '{{0}}'. Consider placing them within a WebCard.", this, [ (oChild.getLongName() || 'oWebApp') ]);
    }    
    
    
    df.WebBaseContainer.base.addChild.call(this, oChild);
},

/*
Override the bubbling afterShow message and only send it to the currently shown card.
*/
afterShow : function(){
    if(this._oCurrent){
        this._oCurrent.afterShow();
    }
},

/*
Override the bubbling afterHide message and only send it to the currently shown card.
*/
afterHide : function(){
    if(this._oCurrent){
        this._oCurrent.afterHide();
    }
},


// - - - - Sizing  - - - - 

/*
This method determines the natural height of the card container. It does this by visiting all the 
cards and calling their getRequiredHeight method which returns height required by the 
components inside that card.

@return The natural height needed (based on the highest card).
*/
getNaturalHeight : function(){
    var iHeight = 0, i, iTab;
    
    //  Determine highest tab page
    for(i = 0; i < this._aCards.length; i++){
        if(this._aCards[i].pbRender){
            iTab = this._aCards[i].getRequiredHeight();
            if(iTab > iHeight){
                iHeight = iTab;
            }
        }
    }
    
    //  Take the height that we loze
    iHeight += this.getHeightDiff();
    
    return iHeight;
},

/*
The sizeHeight method is called by the WebBaseContainer and WebBaseControl to size the control. We 
override the default implementation because the WebCardContainer has special logic when sizing 
'naturally'. Other controls have the natural size determined by their CSS but the we need to 
determine it based on the controls embedded inside the WebCards.

@param  iExtHeight  The height determined by the container (-1 means suite yourself).
@return The height that is actually applied.
*/
sizeHeight : function(iExtHeight){
    var iHeight = -1;
        
    //  Determine which height to use
    if(this.pbFillHeight){
        iHeight = iExtHeight;
    }else{
        if(this.piHeight > 0){
            iHeight = this.piHeight;
        }else{
            iHeight = this.getNaturalHeight();
        }
    }
    
    //  Respect minimal height
    if(iHeight < this.piMinHeight){
        iHeight = this.piMinHeight;
    }
    
    //  Update the height
    this.setHeight(iHeight);
    
    //  Return the final height
    if(iHeight > 0){
        return iHeight;
    }
},

/*
The setHeight method is called by the sizeHeight method to actually apply the determined height. We 
do this by setting the height on the body element.

@param  iHeight     The height in pixels.
*/
setHeight : function(iHeight){
    if(this._eControl){
        //  If a negative value is given we should size 'naturally'
        if(iHeight > 0){
            //  If the label is on top we reduce that (note that this means that piMinHeight and piHeight are including the label)
            if(this.peLabelPosition === df.ciLabelTop){
                iHeight -= this._eLbl.offsetHeight;
            }
            
            //  Reduce the header and borders, paddings and margins
            iHeight -= this.getHeightDiff();
        
            //  Set the height on the body element
            this._eControl.style.height = iHeight + "px";
        }
    }
},

/*
The resize method is called when the view / application resizes and during initialization. We call 
the resize methods of the WebCards.

@private
*/
resize : function(){
    var i;
    
    if(this._eElem && this._bRendered){
        //  Resize the tabpages
        for(i = 0; i < this._aCards.length; i++){
            if(this._aCards[i]._eElem){
                this._aCards[i].resizeHorizontal();
                this._aCards[i].resizeVertical();
            }
        }
        
        //  A resize can also mean that the tab page size changed, if pbFillHeight is true sizeHeight will be called by container, if not we force it here!
        if(!this.pbFillHeight){
            this.sizeHeight(-1);
        }
    }
},

/*
This method determines the height that is lost. For the tab panel this is the space that the buttons 
take.

@return The amount of pixels that can't be used by the content.
@private
*/
getHeightDiff : function(){
    var iHeight = 0;
    
    if(this._eHead){
        iHeight += this._eHead.clientHeight;
        iHeight += df.sys.gui.getVertBoxDiff(this._eHead, 1);  //  Outside difference
    }
    
    if(this.pbShowCaption && this._eLabelSpacer){
        iHeight += this._eLabelSpacer.clientHeight;
        iHeight += df.sys.gui.getVertBoxDiff(this._eHead, 1);  //  Outside difference
    }
    
    
    if(this._eControl){
        iHeight += df.sys.gui.getVertBoxDiff(this._eControl);
        iHeight += df.sys.gui.getVertBoxDiff(this._eInner);
        iHeight += df.sys.gui.getVertBoxDiff(this._eControlWrp);
    }
    
    return iHeight;
},

/*
The getMinHeight function is called by the column layout resize system implemented in 
WebBaseContainer. It determines the minimal height that the control needs to render itself. The 
WebCardContainer uses the getNaturalHeight method to determine the required height and respects the 
piMinHeight property.

@return The minimal height needed in pixels.
*/
getMinHeight : function(){
    var iHeight = 0;
    
    //  If we have a static height then that is the required height
    // if(this.piHeight > 0){
        // return this.piHeight;
    // }

    //  Give child containers a chance to resize
    this.resize();
    
    //  Determine natural height
    iHeight = this.getNaturalHeight();
    
    //  Respect piMinHeight
    if(iHeight < this.piMinHeight){
        iHeight = this.piMinHeight;
    }
    
    return iHeight;
},


// - - - - Focus  - - - - 

/*
We attach the focus events to the header of the tab container because that is the part that takes 
the focus.

@private
*/
attachFocusEvents : function(){
    //  We are attaching a DOM capture listener so we know when we get the focus
    if(window.addEventListener){
        df.events.addDomCaptureListener("focus", this._eHead, this.onFocus, this);
        df.events.addDomCaptureListener("blur", this._eHead, this.onBlur, this);
    }else{
        df.events.addDomListener("focusin", this._eHead, this.onFocus, this);
        df.events.addDomListener("focusout", this._eHead, this.onBlur, this);
    }
},

/*
Pass the focus on to the children like a container.
*/
focus : function(bOptSelect){
    var i;
    
    for(i = 0; i < this._aChildren.length; i++){
        if(this._aChildren[i].focus){
            if(this._aChildren[i].focus(bOptSelect)){
                return true;
            }
        }
    }
    
    return false;
},

/*
Make sure that we only forward focus events if we don't already have the focus. Also cancel the blur 
timeout.

@param  oEvent  Event object.
@private
*/
onFocus : function(oEvent){
    if(!this._bHasFocus){
        df.WebCardContainer.base.onFocus.call(this, oEvent);
    }
    
    this._bLozingFocus = false;
},

/*
Since the focus can change within the control we only forward the blur after a small timeout. If 
focus events occur within this timeout we know that the control still has the focus so we don't 
perform the blur.

@param  oEvent  Event object.
@private
*/
onBlur : function(oEvent){
    var that = this;
    
    this._bLozingFocus = true;
    
    setTimeout(function(){
        if(that._bLozingFocus){
            df.WebCardContainer.base.onBlur.call(that, oEvent);
            
            that._bLozingFocus = false;
        }
    }, 100);
},


// - - - - Generic - - - - 

/*
This method loops over the tabs and makes sure all of them are hidden and the right one is shown.

@private
*/
showCard : function(oDisplay, bOptFirst){
    var i, oTab;
    if(this.pbEnabled || bOptFirst){
        if(oDisplay && oDisplay.canShow()){
            //  Fire cardchange event if needed
            if(!bOptFirst && oDisplay !== this._oCurrent){
                this.fireCardChange(oDisplay._sName, (this._oCurrent && this._oCurrent._sName) || "");
            }
            
            //  Visit all tabs showing / hiding them
            if(this._eElem){
                for(i = 0; i < this._aCards.length; i++){
                    oTab = this._aCards[i];
                    
                    if(oTab === oDisplay){
                        oTab._show(!!bOptFirst);
                        
                        df.dom.setText(this._eLabel, oTab.psCaption);
                    }else{
                        oTab._hide(!!bOptFirst);
                    }
                }
            }
            
            //  Trigger afterHide
            if(!bOptFirst && this._oCurrent){
                this._oCurrent.afterHide();
            }
            
            this._oCurrent = oDisplay;
            
            //  Trigger afterShow
            if(!bOptFirst){
                this._oCurrent.afterShow();
            }
        }
    }
},

fireCardChange : function(sTo, sFrom){
    this.fire('OnCardChange', [ sTo, sFrom ]);
},

hideCard : function(oHide){
    var i, oTab, oLast = null, bFound = false;
    if(oHide === this._oCurrent){
        //  Find the next tab to display
        for(i = 0; i < this._aCards.length; i++){
            oTab = this._aCards[i];
            
            if(oTab.canShow()){
                if(bFound){
                    this.showCard(oTab);
                    return;
                }
                oLast = oTab;
            }
            
            if(oTab === oHide){
                bFound = true;
            }
        }
        
        this.showCard(oLast);
    }
},

nextCard : function(){
    var i, bFound = false, oTab;
    
    for(i = 0; i < this._aCards.length; i++){
        oTab = this._aCards[i];
        
        if(!bFound){
            bFound = (oTab === this._oCurrent);
        }else{
            if(oTab.canShow()){
                this.showCard(oTab);
                return;
            }
        }
    }
},

previousCard : function(){
    var i, bFound = false, oTab;
    
    for(i = this._aCards.length - 1; i >= 0; i--){
        oTab = this._aCards[i];
        
        if(!bFound){
            bFound = (oTab === this._oCurrent);
        }else{
            if(oTab.canShow()){
                this.showCard(oTab);
                return;
            }
        }
    }
},

get_psCurrentCard : function(){
    return (this._oCurrent && this._oCurrent.getLongName()) || "";
},

set_pbShowBorder : function(bVal){
    if(this._eControl){
        if(bVal){
            df.dom.addClass(this._eControl, "WebCC_BodyBorder");
            df.dom.removeClass(this._eControl, "WebCC_BodyNoBorder");
        }else{
            df.dom.addClass(this._eControl, "WebCC_BodyNoBorder");
            df.dom.removeClass(this._eControl, "WebCC_BodyBorder");
        }
        
        this.sizeChanged();
    }
},

set_pbShowCaption : function(bVal){
    if(this._eLabel){
        this._eLabelSpacer.style.display = (bVal ? '' : 'none');
        
        if(bVal){
            df.dom.addClass(this._eControl, "WebCC_HasCaption");
        }else{
            df.dom.removeClass(this._eControl, "WebCC_HasCaption");
        }
        
        this.sizeChanged();
    }
}

});