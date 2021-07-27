/*
Class:
    df.WebWindow
Extends:
    df.WebBaseContainer

This class contains the functionality to render a floating window. This window can be modal and 
resizable. It also supports being dragged around. When being dragged or resized an empty ghost 
window will be used that is partly transparent. Other than providing a nice look it improves the 
performance/smoothness by reducing the amount of involved DOM elements with the operation. Note that 
real modality doesn't exist in JavaScript and is faked using a (partially) invisible mask blocking 
clicks to the background and disabling of the tab indexes. Optionally it can be non-floating in the 
case of a view within this framework. 
    
Revision:
    2011/07/11  (HW, DAW) 
        Initial version.
*/
df.WebWindow = function WebWindow(sName, oParent){
    df.WebWindow.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCaption", "");
    
    this.prop(df.tBool, "pbResizable", true);
    this.prop(df.tBool, "pbShowClose", true);
    
    this.prop(df.tInt, "piMinWidth", 0);
    this.prop(df.tInt, "piMinHeight", 0);
    this.prop(df.tInt, "piLeft", 0);
    this.prop(df.tInt, "piTop", 0);
    
    this.pbFloating = false;
    this.pbModal = false;
    
    // @privates
    this._eLbl = null;
    this._aModalHiddenPlugins = null;
    this._aHiddenPlugins = null;
    
    //  Configure super classes
    this._bWrapDiv = false;
    this._sBaseClass = "WebWindow";
    
    this._bRendered = false;
    this._bHasLeft = false;
    this._bHasTop = false;
    
    this._eRenderTo = null;
    this._eMask = null;
    this._oPrevFocus = null;
};
df.defineClass("df.WebWindow", "df.WebBaseContainer", {

create : function(){
    this._bHasLeft = (this.piLeft > 0);
    this._bHasTop = (this.piTop > 0);
},

openHtml : function(aHtml){
    //  Manually generate wrapper div (due to inheritance structure)
    aHtml.push('<div class="', this.genClass(), '"');
    if(this.psHtmlId){
        aHtml.push(' id="', this.psHtmlId, '"');
    }
    
    // ToDo: Consider removing this before release
    aHtml.push(' data-dfobj="', this.getLongName(), '"');
    
    aHtml.push(' style=" ',  (this.pbRender ? '' : 'display: none;'), (this.pbVisible ? '' : 'visibility: hidden;'), '"');
    aHtml.push('>');
    
    
    if(!this.pbFloating){
        //  Optionally label
        aHtml.push('<div class="WebCon_Inner">');
        
        if(this.psCaption){
            aHtml.push('<label class="WebWin_title">&nbsp;</label>');
        }
    
        //  Wrapper div for positioning of control
        aHtml.push('<div><div class="WebContainer">');
    }else{
        aHtml.push(
            '<div class="WebWin_top_l">',
                '<div class="WebWin_top_r">',
                    '<div class="WebWin_top_c">',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="WebWin_main_l">',
                '<div class="WebWin_main_r">',
                    '<div class="WebWin_header">',
                        '<div class="WebWin_header">',
                            '<div class="WebWin_header_r">',
                                '<div class="WebWin_header_c">',
                                    '<label class="WebWin_title">&nbsp;</label>',
                                    '<div class="WebWin_controls">'
        );
    
        if(this.pbShowClose){
            aHtml.push('<div class="WebWin_close" tabindex="0"></div>');
        }
        
        aHtml.push(    
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>',

            '<div class="WebWin_main_c">',
                '<div class="WebContainer">'
        );
    }
    
    //  Generate form if we inherit from webview, ugly but it needs to be here..
    // if(this instanceof df.WebView){
        // aHtml.push('<form name="', this._sName, '" autocomplete="off">');
    // }
    
    df.WebWindow.base.openHtml.call(this, aHtml);
},

closeHtml : function(aHtml){
    df.WebWindow.base.closeHtml.call(this, aHtml);
    
    //  Generate form if we inherit from webview, ugly but it needs to be here..
    // if(this instanceof df.WebView){
        // aHtml.push('</form>');
    // }
    
    if(!this.pbFloating){
        aHtml.push('</div></div></div></div>');
    }else{
        aHtml.push( '</div>',
                '</div>',
            '</div>',
             '<div class="WebWin_bottom_l">',
                '<div class="WebWin_bottom_r">',
                    '<div class="WebWin_bottom_c">',
                    '</div>',
                    '<div class="WebWin_resizer">',
                    '</div>',
                '</div>',
            '</div>',
            '</div>'
        );
    }
    
    
},

afterRender : function(){
    //  Get references to generated elements
    if(this.pbFloating){
        this._eLbl = df.dom.query(this._eElem, "label.WebWin_title");
    
        this._eHeader = df.dom.query(this._eElem, "div.WebWin_header");
        this._eHeaderContent = df.dom.query(this._eElem, "WebWin_header_c");
        this._eControlWrap = df.dom.query(this._eElem, "div.WebWin_main_c");
        this._eMainRight = df.dom.query(this._eElem, "div.WebWin_main_r");
        this._eMainLeft = df.dom.query(this._eElem, "div.WebWin_main_l");
        this._eTopLeft = df.dom.query(this._eElem, "div.WebWin_top_l");
        this._eTopRight = df.dom.query(this._eElem, "div.WebWin_top_r");
        this._eTopContent = df.dom.query(this._eElem, "div.WebWin_top_c");
        this._eBottomLeft = df.dom.query(this._eElem, "div.WebWin_bottom_l");
        this._eBottomRight = df.dom.query(this._eElem, "div.WebWin_bottom_r");
        this._eResizer = df.dom.query(this._eElem, "div.WebWin_resizer");
        this._eBottomContent = df.dom.query(this._eElem, "div.WebWin_bottom_c");
        
        if(this.pbShowClose){
            this._eCloseBtn = df.dom.query(this._eElem, "div.WebWin_close");
        }
    }else{
        this._eInner = df.dom.query(this._eElem, "div.WebCon_Inner");
        this._eLbl = df.dom.query(this._eElem, "label.WebWin_title");
    }
        
    //  Call super
    df.WebWindow.base.afterRender.call(this);
    
    this.set_psCaption(this.psCaption);
    
    if(this.pbFloating){
        //  Calculate & apply start height & width if needed
        this.set_piWidth(this.piWidth);
        if(this.piHeight <= 0){
            this.prepareSize();
            this.piHeight = this._iWantedHeight;
        }
        this.set_piHeight(this.piHeight);
    
        //  Drag
        df.events.addDomListener("mousedown", this._eHeader, this.onStartDrag, this);
        
        //  Resizable
        df.events.addDomListener("mousedown", this._eMainRight, this.onStartResize, this);
        df.events.addDomListener("mousedown", this._eMainLeft, this.onStartResize, this);
        df.events.addDomListener("mousedown", this._eTopLeft, this.onStartResize, this);
        df.events.addDomListener("mousedown", this._eBottomLeft, this.onStartResize, this);
                
        //  Buttons
        if(this.pbShowClose){
            df.events.addDomListener("mousedown", this._eCloseBtn, function(oEvent){ oEvent.stop(); });
            df.events.addDomListener("click", this._eCloseBtn, this.onCloseClick, this);
        }
        
        //  Focus
        df.events.addDomListener("click", this._eElem, this.onFocusEvent, this);
        df.events.addDomListener("focus", this._eElem, this.onFocusEvent, this);
        df.events.addDomListener("scroll", this._eControlWrap, this.onFocusEvent, this);
        
        // df.dom.disableTextSelection(this._eElem);
        
        // this._eElem.style.visibility = 'visible';
    }
    
    df.events.addDomKeyListener(this._eElem, this.onKey, this);
},

genClass : function(){
    this._sBaseClass = (this.pbFloating ? "WebWindow" + (this.pbResizable ? " WebWin_Resizable" : "") : "");
    return df.WebWindow.base.genClass.call(this);
},

_show : function(eRenderTo){
    var eElem, bRender = !this._eElem, eViewPort, that = this;
    
    //  Render to DOM elements if that didn't happen before
    if(bRender){
        eElem = this.render();
        df.dom.addClass(eElem, "WebWin_Hidden");
    }
    
    //  Insert as first child (hidden)
    if(this.pbFloating && this.pbModal){
        eViewPort = this.getWebApp()._eViewPort || document.body;
    
        //  When modal we assume that we should give back the focus so we remember where the focus was
        this._oPrevFocus = this.getWebApp()._oCurrentObj;
        
        if(this._eElem.parentNode){
            this._eElem.parentNode.removeChild(this._eElem);
        }
        
        //  Disable tab indexes (to prevent focus from going behind modal dialog
        df.sys.gui.disableTabIndexes(document.body);
        //  Hide plugins (internet explorer has problems putting plugins like adobe reader to the background)
        this._aModalHiddenPlugins = df.sys.gui.hidePlugins(document.body);
        
        //  Display mask
        this._eMask = df.dom.create('<div class="WebWindow_Mask">&nbsp;</div>');
        
        //  Insert into the DOM 
        eViewPort.appendChild(this._eMask);
        eViewPort.appendChild(this._eElem);

        this._eRenderTo = this._eMask;
        
    }else{
        //  Insert into the DOM (if needed)
        if(this._eElem.parentNode !== eRenderTo){
            eRenderTo.appendChild(this._eElem);
            this._eRenderTo = eRenderTo;
        }
    }
    
    //  Remove "hidden" class
    df.dom.removeClass(this._eElem, "WebWin_Hidden");
    
    //  Restore plugins that where hidden (IE FIX)
    if(this._aHiddenPlugins){
        df.sys.gui.restorePlugins(this._aHiddenPlugins);
        this._aHiddenPlugins = null;
    }
    
    //  We still need to call the afterRender method if we freshly rendered
    if(bRender){
        this.afterRender();
    }
    
    //  Calculate start position (centered)
    if(!this._bHasTop){
        this.piTop = this.getViewportHeight() / 2 - (this.piHeight || this._eElem.clientHeight) / 2;
    }
    if(!this._bHasLeft){
        this.piLeft = this.getViewportWidth() / 2 - (this.piWidth || this._eElem.clientWidth) / 2;
    }
    this._eElem.style.top = parseInt(this.piTop, 10) + 'px';
    this._eElem.style.left = parseInt(this.piLeft, 10) + 'px';
    
    //  Make sure sizes are correct and then unhide
    this._bRendered = true;
    //  Trigger afterShow
    this.afterShow();
    
    if(this._bStandalone){
        this.resize();
    }
    
    //  Give focus to first element
    this.focus(true);
    
    //  Set a small timeout so the framework will resize controls
    setTimeout(function(){
        var oWebApp = that.getWebApp();
        
        if(oWebApp && that._bRendered){
            //  Add visible CSS class
            df.dom.addClass(that._eElem, "WebWin_Visible");
            
            //  Fire event
            oWebApp.OnShowWindow.fire(oWebApp, {
                oWindow : that,
                eElem : that._eElem,
                bModal : that.pbModal
            });
        }
    }, 10);
},

_hide : function(){
    var that = this, oWebApp = this.getWebApp(), bCanceled;
    
    if(this._bRendered){
        if(this.pbFloating && this.pbModal){
            //  Restore tab index
            df.sys.gui.restoreTabIndexes(document.body);
            if(this._aModalHiddenPlugins){
                df.sys.gui.restorePlugins(this._aModalHiddenPlugins);
                this._aModalHiddenPlugins = null;
            }
            
            
            //  Remove Mask
            this._eMask.parentNode.removeChild(this._eMask);
            
            //  When modal we assume that we need to return the focus somewhere
            if(this._oPrevFocus){
                this._oPrevFocus.focus();
            }
            
            this._eRenderTo = null;
        }
        
        df.dom.addClass(this._eElem, "WebWin_Hidden");
        df.dom.removeClass(this._eElem, "WebWin_Visible");
        
        //  Internet Explorer has problems hiding plugins so we do it for it
        this._aHiddenPlugins = df.sys.gui.hidePlugins(this._eElem);
        
        //  Fire webapp event
        if(oWebApp){
            bCanceled = !oWebApp.OnHideWindow.fire(oWebApp, {
                oWindow : this,
                eElem : this._eElem,
                bModal : this.pbModal
            });
        }
        
        
    }
    
    this._bRendered = false;  
    //  Trigger afterHide
    this.afterHide();
    
    //  Remove window from DOM
    if(this._bStandalone){
        //  If the OnHideWindow event was stopped we wait with the removal of the element so an animation or so can be performed, else we do it immediately to not disturb anything
        if(bCanceled){
            setTimeout(function(){
                if(that._eElem && that._eElem.parentNode){
                    that._eElem.parentNode.removeChild(that._eElem);
                }
            }, 5000);
        }else{
            if(this._eElem && this._eElem.parentNode){
                this._eElem.parentNode.removeChild(this._eElem);
            }
        }
    }
},

/* - - - - - - - - - Public API - - - - - - - - - - */

set_piWidth : function(iVal){
    var sWidth;
    
    if(this.pbFloating){
        iVal = (iVal > this.piMinWidth ? iVal : this.piMinWidth);
        this.piWidth = iVal;
        
        if(this.pbFloating){
            sWidth = (iVal > 0 ? parseInt(iVal, 10) + 'px' : '');
        
            if(this._eControlWrap){
                this._eControlWrap.style.width = sWidth;
                this._eHeader.style.width = sWidth;
            }
        }else{
            sWidth = (iVal > 0 ? parseInt(iVal, 10) + 'px' : '');
        
            if(this._eElem){
                this._eElem.style.width = sWidth;
            }
        }
    }else{
        df.WebWindow.base.set_piWidth.call(this, iVal);
    }
},

set_piHeight : function(iVal){
    if(this.pbFloating){
        iVal = (iVal > this.piMinHeight ? iVal : this.piMinHeight);
        this.piHeight = iVal;
        
        if(this._eElem){    
            this.setOuterHeight(iVal);
        }
    }else{
        df.WebWindow.base.set_piHeight.call(this, iVal);
    }
},

set_piTop : function(iVal){
    this._bHasTop = true;
    
    if(this._eElem){
        this._eElem.style.top = parseInt(iVal, 10) + 'px';
    }
},

set_piLeft : function(iVal){
    this._bHasLeft = true;
    
    if(this._eElem){
        this._eElem.style.left = parseInt(iVal, 10) + 'px';
    }
},

set_psCaption : function(sVal){
    if(this._eElem){
        if(sVal){
            if(!this._eLbl){
                this._eLbl = df.dom.create('<label class="WebWin_title">&nbsp;</label>');
                
                if(this.pbFloating){
                    this._eHeaderContent.insertBefore(this._eLbl, this._eHeaderContent.firstChild);
                }else{
                    this._eInner.insertBefore(this._eLbl, this._eInner.firstChild);
                }
            }
        
            df.dom.setText(this._eLbl, sVal);
        }else{
            if(this._eLbl){
                this._eLbl.parentNode.removeChild(this._eLbl);
                this._eLbl = null;
            }
        }
    }
},

set_pbResizable : function(bVal){
    if(this._eElem){
        df.dom.toggleClass(this._eElem, "WebWin_Resizable", bVal);
    }
},

/* - - - - - - - - Resizing & Dragging - - - - - - - */

createGhost : function(){
    var eGhost, eGhostContent, eGhostHeader, oSize, aHtml = [], sOrigId;
    
    //  Generate HTML
    sOrigId = this.psHtmlId;
    this.psHtmlId = "";
    
    this._bWrapDiv = false;
    this.openHtml(aHtml);
    this.closeHtml(aHtml);
    this._bWrapDiv = true;
    
    this.psHtmlId = sOrigId;
    
    //  Create ghost
    
    eGhost = df.dom.create(aHtml.join(''));
    eGhost.className = this.genClass() + " WebWin_ghost";
    this._eElem.parentNode.appendChild(eGhost);
    //eGhost.innerHTML = aHtml.join('');
    df.dom.disableTextSelection(eGhost);
    
    //  Set ghost content properties
    eGhostContent = df.dom.query(eGhost, ".WebWin_main_c");
    eGhostHeader = df.dom.query(eGhost, ".WebWin_header");
    oSize = df.sys.gui.getSize(this._eControlWrap);
    eGhostHeader.style.width =  oSize.width + 'px';
    eGhostContent.style.width =  oSize.width + 'px';
    eGhostContent.style.height = oSize.height + 'px';  
    eGhost.style.top = this.piTop + 'px';
    eGhost.style.left = this.piLeft + 'px';
    
    return eGhost;
},

onStartDrag : function(oEvent){
    var eMask, eGhost, oSize, iTopLim, iLeftLim, iDragOffsetTop, iDragOffsetLeft, aHiddenPlugins = null;
    
    eMask = df.gui.dragMask();
    eMask.style.cursor = "move";
    
    //  Get drag offset
    iDragOffsetTop = oEvent.getMouseY() - this.piTop;
    iDragOffsetLeft = oEvent.getMouseX() - this.piLeft;
    
    //  Determine size, we take in account that some designs have the close button sticking out
    oSize = df.sys.gui.getSize(this._eElem);
    if(this._eCloseBtn){
        if(this._eCloseBtn.offsetLeft + this._eCloseBtn.offsetWidth > oSize.width){
            oSize.width = this._eCloseBtn.offsetLeft + this._eCloseBtn.offsetWidth;
        }
    }
    
    iLeftLim = this.getViewportWidth() - oSize.width - 1;
    iTopLim = this.getViewportHeight() - oSize.height - 1;

    function onDrag(oEvent){
        this.piTop = oEvent.getMouseY() - iDragOffsetTop;
        this.piLeft = oEvent.getMouseX() - iDragOffsetLeft;
        
        this.piTop = (this.piTop <= 0 ? 1 : (this.piTop >= iTopLim ? iTopLim : this.piTop));
        this.piLeft = (this.piLeft <= 0 ? 1 : (this.piLeft >= iLeftLim ? iLeftLim : this.piLeft));
        
        if(eGhost){
            eGhost.style.top = this.piTop + 'px';
            eGhost.style.left = this.piLeft + 'px';
        }else{
            eGhost = this.createGhost();
            aHiddenPlugins = df.sys.gui.hidePlugins(this._eElem);
            
            this._eElem.style.display = "none";
        }
    }
    
    function onStopDrag(oEvent){
        df.events.removeDomListener("mouseup", eMask, onStopDrag);
        df.events.removeDomListener("mouseup", window, onStopDrag);
        //df.events.removeDomListener("mouseout", eMask, onStopDrag);
        df.events.removeDomListener("mousemove", eMask, onDrag);
        
        eMask.parentNode.removeChild(eMask);
        if(eGhost){
            this._eElem.parentNode.removeChild(eGhost);
        }
        
        this._eElem.style.top = this.piTop + 'px';
        this._eElem.style.left = this.piLeft + 'px';
        this._eElem.style.display = "";
        
        this.resize();
        this.bringFront();
        
        if(aHiddenPlugins){
            df.sys.gui.restorePlugins(aHiddenPlugins);
        }
    }
    
    //  Add eventlisteners
    df.events.addDomListener("mouseup", eMask, onStopDrag, this);
    df.events.addDomListener("mouseup", window, onStopDrag, this);
    //df.events.addDomListener("mouseout", eMask, onStopDrag, this);
    df.events.addDomListener("mousemove", eMask, onDrag, this);
},

onStartResize : function(oEvent){
    if(this.pbResizable){
        var eTar = oEvent.getTarget();

        if(eTar === this._eMainRight){
            this.resizeDrag(oEvent, true, false, false, false, "e-resize");
            oEvent.stop();
        }else if(eTar === this._eMainLeft){
            this.resizeDrag(oEvent, true, true, false, false, "e-resize");
            oEvent.stop();
        }else if(eTar === this._eTopRight){
            this.resizeDrag(oEvent, true, false, true, true, "ne-resize");
            oEvent.stop();
        }else if(eTar === this._eTopLeft){
            this.resizeDrag(oEvent, true, true, true, true, "nw-resize");
            oEvent.stop();
        }else if(eTar === this._eTopContent){
            this.resizeDrag(oEvent, false, false, true, true, "n-resize");
            oEvent.stop();
        }else if(eTar === this._eBottomRight || eTar === this._eResizer){
            this.resizeDrag(oEvent, true, false, true, false, "nw-resize");
            oEvent.stop();
        }else if(eTar === this._eBottomLeft){
            this.resizeDrag(oEvent, true, true, true, false, "ne-resize");
            oEvent.stop();
        }else if(eTar === this._eBottomContent){
            this.resizeDrag(oEvent, false, false, true, false, "n-resize");
            oEvent.stop();
        }
    }
},

resizeDrag : function(oEvent, bWidth, bLeft, bHeight, bTop, sCursor){
    var eMask, eGhost, eGhostContent, eGhostHeader, oSize, iStartWidth, iStartLeft, iStartMouseX, iStartHeight, iStartMouseY, iStartTop, iMarginRight = 0, aHiddenPlugins;
    
    eMask = df.gui.dragMask();
    eMask.style.cursor = sCursor;
    aHiddenPlugins = df.sys.gui.hidePlugins(this._eElem);    
    
    oSize = df.sys.gui.getSize(this._eControlWrap);
    iStartWidth = oSize.width;
    iStartMouseX = oEvent.getMouseX();
    iStartLeft = this.piLeft;
    
    iStartHeight = oSize.height;
    iStartMouseY = oEvent.getMouseY();
    iStartTop = this.piTop;
    
    this.piHeight = (this.piHeight > 0 ? this.piHeight : this._eControlWrap.clientHeight);
    
    //  Some designs have the close button sticking out, we need to take a margin for those designs to prevent scrollbars
    if(this._eCloseBtn){
        if(this._eCloseBtn.offsetLeft + this._eCloseBtn.offsetWidth > oSize.width){
            iMarginRight = (this._eCloseBtn.offsetLeft + this._eCloseBtn.offsetWidth) - oSize.width;
        }
    }
    
    function onResize(oEvent){
        if(!eGhost){
            eGhost = this.createGhost();
            eGhostContent = df.dom.query(eGhost, ".WebWin_main_c");
            eGhostHeader = df.dom.query(eGhost, ".WebWin_header");
            //this._eElem.style.display = "none";
        }
    
        if(bWidth){
            if(bLeft){
                this.piWidth = iStartWidth - (oEvent.getMouseX() - iStartMouseX);
                this.piWidth = (this.piWidth > this.piMinWidth ? this.piWidth : this.piMinWidth);
                this.piLeft = iStartLeft - (this.piWidth - iStartWidth);
            }else{
                this.piWidth = iStartWidth + (oEvent.getMouseX() - iStartMouseX);
                this.piWidth = (this.piWidth > this.piMinWidth ? this.piWidth : this.piMinWidth);
                
                //  Resprect the right margin
                if(this.piWidth + this.piLeft > this.getViewportWidth() - iMarginRight){
                    this.piWidth = this.getViewportWidth() - iMarginRight - this.piLeft;
                }
            }
            
            
            eGhost.style.left = this.piLeft + "px";
            eGhostContent.style.width = this.piWidth + "px";
            eGhostHeader.style.width = this.piWidth + "px";

        }
        if(bHeight){
            if(bTop){
                this.piHeight = iStartHeight - (oEvent.getMouseY() - iStartMouseY);
                this.piHeight = (this.piHeight > this.piMinHeight ? this.piHeight : this.piMinHeight);
                this.piTop = iStartTop - (this.piHeight - iStartHeight);
            }else{
                this.piHeight = iStartHeight + (oEvent.getMouseY() - iStartMouseY);
                this.piHeight = (this.piHeight > this.piMinHeight ? this.piHeight : this.piMinHeight);
            }
            
            
            eGhost.style.top = this.piTop + "px";
            eGhostContent.style.height = this.piHeight + "px";
        }
        
        
        
    }
    
    function onStopResize(oEvent){
        df.events.removeDomListener("mouseup", eMask, onStopResize);
        df.events.removeDomListener("mouseup", window, onStopResize);
        df.events.removeDomListener("mousemove", eMask, onResize);

        eMask.parentNode.removeChild(eMask);
        if(eGhost){
            this._eElem.parentNode.removeChild(eGhost);
        }
        
        if(aHiddenPlugins){
            df.sys.gui.restorePlugins(aHiddenPlugins);
        }
                
        this._eControlWrap.style.width = this.piWidth + "px";
        this._eHeader.style.width = this.piWidth + "px";
        this._eElem.style.left = this.piLeft + "px";
		this._eElem.style.top = this.piTop + "px";
        this._eElem.style.display = "";
		this.setOuterHeight(this.piHeight);
        this.resize();
        this.bringFront();
    }
    
    df.events.addDomListener("mousemove", eMask, onResize, this);
    df.events.addDomListener("mouseup", window, onStopResize, this);
    df.events.addDomListener("mouseup", eMask, onStopResize, this);
},

/* - - - - - - - - Supportive - - - - - - - */

getViewportElem : function(){
    if(this.pbFloating && this.pbModal){
        return document.body;
    }
    return this._eRenderTo;
},

onFocusEvent : function(oEvent){
    this.bringFront();
},

bringFront : function(){
    //  We need to make sure that we don't get the focus after onClose has closed the dialog :S
    if(this._bRendered){
        //  bring to front
        if(this._eElem.nextSibling){
            this._eElem.parentNode.appendChild(this._eElem);
        }
        
        if(!this._bStandalone){
            this.getWebApp().windowFocus(this);
        }
    }
},

blur : function(){

},

/*
Closes the dialog is pbShowClose is set to true.
*/
doClose : function(){
    if(this.pbShowClose){
        this.hide();
    }
},

resize : function(){
    this.resizeHorizontal();
    this.resizeVertical();
   
    //  We have to 'fix' the size for a floating dialog else it won't behave well if the window is 
    //  resized. This is only done once when no width & height is set.
    if( this._eControlWrap && !this.piHeight && !this.piWidth && this.pbFloating){
        this.piHeight = this._eControlWrap.clientHeight;
        this.piWidth = this._eControlWrap.clientWidth;
        
        this._eControlWrap.style.width = this.piWidth + "px";
        this._eHeader.style.width = this.piWidth + "px";
        this._eControlWrap.style.height = this.piHeight + "px";
    }
},

resizeHorizontal : function(){
	if(!this.pbFloating){
		this.setOuterWidth(this.piWidth);
	}
	df.WebWindow.base.resizeHorizontal.call(this);
},

setOuterHeight : function(iHeight){
    if(!this.pbFloating){
        iHeight -= this.getHeightDiff(true, false, false, false);
        
        this._eContainer.style.height = iHeight + 'px';
    }else{
		if(iHeight > 0){
			this._eControlWrap.style.height = iHeight + 'px';
		
			iHeight -= this.getHeightDiff(true, false, false, false);
        
			this._eContainer.style.height = iHeight + 'px';
		}else{
			this._eControlWrap.style.height = '';
			this._eContainer.style.height = '';
        }
	}
},

/*
This method is called by the panel layout system to set the width of this panel. If 0 is passed then 
the panel is allowed to take all space available so we don't need to set it on the DOM elements. We 
override this method here because the HTML structure is different and this might be a floating 
window instead of a panel (which means that we can ignore this call).

@param  iWidth  The new panel width.
*/
setOuterWidth : function(iWidth){
    if(!this.pbFloating){
        this._eElem.style.width = (iWidth > 0 ? iWidth + "px" : "");
        
        df.WebWindow.base.setOuterWidth.call(this, iWidth);
    }
},

/*
This method determines the height that is lost. For the tab panel this is the space that the buttons 
take.

@return The amount of pixels that can't be used by the content.
@private
*/
getHeightDiff : function(bOut, bIn, bContentOut, bContentIn){
    var iHeight = df.WebWindow.base.getHeightDiff.call(this, bOut, bIn, bContentOut, bContentIn);

    if(!this.pbFloating && this._eLbl){
        if(bOut){
            iHeight += this._eLbl.clientHeight;
            iHeight += df.sys.gui.getVertBoxDiff(this._eLbl, 1);
            
            iHeight += df.sys.gui.getVertBoxDiff(this._eInner, 0);
        }
    }
    
    return iHeight;
},

/*
Determines the available width for moving and resizing the window.

@return Viewport width in pixels.
*/
getViewportWidth : function(){
    if(this.pbModal){
        return df.sys.gui.getViewportWidth();
    }
    return this.getViewportElem().clientWidth;
},

/*
Determines the available height for moving and resizing the window.

@return Viewport width in pixels.
*/
getViewportHeight : function(){
    if(this.pbModal){
        return df.sys.gui.getViewportHeight();
    }
    return this.getViewportElem().clientHeight;
},

sizeChanged : function(){
    if(!this.pbFloating && this._oParent && this._oParent.resize){
        this._oParent.resize();
    }else{    
        this.resize();
    }
    
    if(this.getWebApp()){
        this.getWebApp().notifyLayoutChange(this);
    }
},

/*
This method handles the onclick event of the close button. It calls the doClose method has the logic for handling a close initiated by the client.

@param  oEvent  The event object with event details.
@private
*/
onCloseClick : function(oEvent){
    this.doClose();
},

/*
This method handles the keypress event of the window. It will initiate actions that belong to the pressed key if needed.

@param  oEvent  The event object with event details.
@private
*/
onKey : function(oEvent){
    if(oEvent.matchKey(df.settings.formKeys.escape) && this.pbFloating){
        this.doClose();
    }
}
});
